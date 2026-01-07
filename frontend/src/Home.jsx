import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Graph from './Graph';
import toast from 'react-hot-toast';


function Home(){
  const [page, setPage] = useState('');
  const [depth, setDepth] = useState(2);
  const [maxPages, setMaxPages] = useState('50');
  const navigate = useNavigate();

  // Animated steps
  const stepsRef = useRef([]);

  // Search suggestions
  const searchTimeoutRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle search bar enter 
  const handleInputChange = (e) => {
    // value = value of parent event container (search bar)
    const value = e.target.value;
    setPage(value);

    // clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Search query too short
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return
    }
    
    // debouncing to prevent too many API calls
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      }
    }, 200);
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setPage(suggestion.title);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  // Steps animate on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.2, 
        rootMargin: '0px 0px -100px 0px'
      }
    );

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => {
      stepsRef.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  // Function to handle page input & send to graph page
  const handleViz = async () => {
    if (!page.trim()) {
        toast.error('Please enter a wikipedia page name');
        return;
    }

    if (!maxPages || maxPages < 1 || !(Number.isInteger(Number(maxPages)))) {
        toast.error('Please enter a valid max pages value!');
        return;
    }

    navigate(`/graph?page=${page}&depth=${depth}&max_pages=${maxPages}`);
  };

  // Hook to detect click outside parent element (search bar)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#searchBar')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  })

  return (
    <>
    <section id="heroSection">
      <div id="container">
        <h1 id="title">
          W<p id="titleSub">IKIGRAPHE</p>R
        </h1>
        <h4 id="subtitle">
          The Free Graph Visualizer
        </h4>

        <img id="logo"src="/assets/images/WlogoT.png" alt="Wikipedia Logo"/>

        <div id="searchBar">
          <input 
            id= "inputBar"
            type="text" 
            placeholder="Enter Wikipedia page"
            value={page}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowSuggestions(false);
                handleViz();
              }
              if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            autoComplete="off"
          />
          <button
            onClick={handleViz}
            id= "vizButton"
          >
            🔎︎
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-title">{suggestion.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="controls">
            <div className="control-group">
                <label>Depth: {depth}</label>
                <input 
                  type="range"
                  min="1"
                  max="3"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                />
            </div>
            <div className="control-group">
                <label>Max Pages to Scrape:</label>
                <input 
                  id= "pagesInput"
                  type="number"
                  min="1"
                  max="500"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                />
            </div>
        </div>    
      </div>
      <button 
        id="scrollIndicator"
        onClick={() => {
        window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
        }}
      >
        ▼ Scroll to explore
      </button>
    </section>

    {/* How It Works Section */}
    <section className="scroll-section how-it-works">
      <div className="section-container">
        <h2 className="section-title">How To Use</h2>
        <div className="steps">
          <div 
            className="step animate-on-scroll" 
            ref={(el) => (stepsRef.current[0] = el)}
          >
            <div className="step-icon">1</div>
            <h3>Enter Any Page</h3>
            <p>Start with any Wikipedia article that interests you. The visualizer will use this as the root of your knowledge graph.</p>
          </div>
          <div 
            className="step animate-on-scroll" 
            ref={(el) => (stepsRef.current[1] = el)}
          >
            <div className="step-icon">2</div>
            <h3>Build the Graph</h3>
            <p>Watch as the tool automatically discovers and maps connections between articles, creating a web of related knowledge.</p>
          </div>
          <div 
            className="step animate-on-scroll" 
            ref={(el) => (stepsRef.current[2] = el)}
          >
            <div className="step-icon">3</div>
            <h3>Customize & Explore</h3>
            <p>Adjust the depth and scope to control how far the graph extends. Interact with nodes to dive deeper.  <strong>
              Click</strong>, <strong>hover</strong>, and <strong>drag</strong> nodes around!
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="scroll-section features">
      <div className="section-container">
        <h2 className="section-title">Features</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3><span className="feature-icon">➔</span> Adjustable Depth and Page Controls</h3>
            <p>Control how many levels deep the graph explores. <span style = {{color: 'red'}}>Deeper graphs may take more time to build.</span></p>
          </div>
          <div className="feature-card">
            <h3><span className="feature-icon">➔</span> Real-time Graph controls</h3>
            <p>Using the <strong>options</strong> menu, adjust the depth or nodes of the graph shown. <span style = {{color: 'green'}}>More options coming.</span></p>
          </div>
          <div className="feature-card">
            <h3><span className="feature-icon">➔</span> Interactive Visualization</h3>
            <p>Pan, zoom, and interact with the graph. <strong>Click</strong> nodes to visit the article and <strong>hover</strong> nodes to see all of its connections in real-time.</p>
          </div>
          <div className="feature-card">
            <h3><span className="feature-icon">➔</span> Clean, Fast Interface</h3>
            <p>Built with performance in mind. Never any unnecessary clutter, ads, or frills.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Example Visualization Section */}
    <section className="scroll-section example">
      <div className="section-container">
        <h2 className="section-title">Example Visualization</h2>

        <div className="example-graph-container">
           <Graph 
            data={{
              edges: [
                { "source": "Dirk_Nowitzki", "target": "Dirk_Nowitzki"},
                { "source": "Dirk_Nowitzki", "target": "Dallas_Mavericks" },
                { "source": "Dirk_Nowitzki", "target": "National_Basketball_Association" },
                { "source": "Dirk_Nowitzki", "target": "W%C3%BCrzburg" },
                { "source": "Dirk_Nowitzki", "target": "NBA_draft" },
                { "source": "Dirk_Nowitzki", "target": "1998_NBA_draft" },
                { "source": "Dirk_Nowitzki", "target": "W%C3%BCrzburg" },
                { "source": "Dirk_Nowitzki", "target": "NBA_draft" },
                { "source": "Dirk_Nowitzki", "target": "Milwaukee_Bucks" },
                { "source": "Dirk_Nowitzki", "target": "Power_forward" },
                { "source": "Dirk_Nowitzki", "target": "DJK_W%C3%BCrzburg" },
                { "source": "Dirk_Nowitzki", "target": "1998%E2%80%9399_NBA_season" },
                { "source": "Dirk_Nowitzki", "target": "2018%E2%80%9319_NBA_season" },
                { "source": "Dirk_Nowitzki", "target": "List_of_NBA_champions" },
                { "source": "Dirk_Nowitzki", "target": "2011_NBA_Finals" },
                { "source": "Dirk_Nowitzki", "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award" },
                { "source": "Dirk_Nowitzki", "target": "NBA_Most_Valuable_Player_Award" },
                { "source": "Dirk_Nowitzki", "target": "2006%E2%80%9307_NBA_season" },
                { "source": "Dirk_Nowitzki", "target": "NBA_All-Star" },
                { "source": "Dirk_Nowitzki", "target": "2002_NBA_All-Star_Game" },
                { "source": "Dirk_Nowitzki", "target": "2012_NBA_All-Star_Game" },
                { "source": "Dirk_Nowitzki", "target": "2014_NBA_All-Star_Game" },
                { "source": "Dirk_Nowitzki", "target": "2015_NBA_All-Star_Game" },
                { "source": "Dirk_Nowitzki", "target": "2019_NBA_All-Star_Game" },
                { "source": "Dirk_Nowitzki", "target": "All-NBA_First_Team" },
                { "source": "Dirk_Nowitzki", "target": "2004%E2%80%9305_NBA_season" },
                { "source": "Dirk_Nowitzki", "target": "2008%E2%80%9309_NBA_season" },
                { "source": "Dallas_Mavericks", "target": "Dallas_Mavericks" },
                { "source": "Dallas_Mavericks", "target": "2011_NBA_Finals" },
                { "source": "Dallas_Mavericks", "target": "Dirk_Nowitzki" },
                { "source": "Dallas_Mavericks", "target": "National_Basketball_Association" },
                { "source": "Dallas_Mavericks", "target": "2018%E2%80%9319_NBA_season" },
                { "source": "Dallas_Mavericks", "target": "2006%E2%80%9307_NBA_season" },
                { "source": "Dallas_Mavericks", "target": "Milwaukee_Bucks" },
                { "source": "Dallas_Mavericks", "target": "2004%E2%80%9305_NBA_season" },
                { "source": "Dallas_Mavericks", "target": "1998%E2%80%9399_NBA_season" },
                { "source": "Dallas_Mavericks", "target": "2008%E2%80%9309_NBA_season" },
                { "source": "Dallas_Mavericks", "target": "2002_NBA_All-Star_Game" },
                { "source": "Dallas_Mavericks", "target": "2012_NBA_All-Star_Game" },
                { "source": "Dallas_Mavericks", "target": "2014_NBA_All-Star_Game" },
                { "source": "Dallas_Mavericks", "target": "2015_NBA_All-Star_Game" },
                { "source": "Dallas_Mavericks", "target": "2019_NBA_All-Star_Game" },
                { "source": "National_Basketball_Association","target": "National_Basketball_Association"},
                { "source": "National_Basketball_Association", "target": "List_of_NBA_champions" },
                { "source": "National_Basketball_Association", "target": "Milwaukee_Bucks" },
                { "source": "National_Basketball_Association", "target": "Dallas_Mavericks" },
                { "source": "National_Basketball_Association", "target": "2011_NBA_Finals" },
                { "source": "National_Basketball_Association", "target": "Dirk_Nowitzki" },
                { "source": "National_Basketball_Association", "target": "2018%E2%80%9319_NBA_season" },
                { "source": "National_Basketball_Association", "target": "NBA_Most_Valuable_Player_Award" },
                { "source": "National_Basketball_Association", "target": "2004%E2%80%9305_NBA_season" },
                { "source": "National_Basketball_Association", "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award" },
                { "source": "National_Basketball_Association", "target": "NBA_All-Star" },
                { "source": "W%C3%BCrzburg", "target": "W%C3%BCrzburg" },
                { "source": "W%C3%BCrzburg", "target": "Dirk_Nowitzki" },
                { "source": "NBA_draft", "target": "NBA_draft" },
                { "source": "NBA_draft", "target": "National_Basketball_Association" },
                { "source": "NBA_draft", "target": "1998_NBA_draft" },
                { "source": "NBA_draft", "target": "Milwaukee_Bucks" },
                { "source": "NBA_draft", "target": "NBA_Most_Valuable_Player_Award" },
                { "source": "NBA_draft", "target": "Dallas_Mavericks" },
                { "source": "1998_NBA_draft", "target": "1998_NBA_draft" },
                { "source": "1998_NBA_draft", "target": "Dirk_Nowitzki" },
                { "source": "1998_NBA_draft", "target": "Dallas_Mavericks" },
                { "source": "1998_NBA_draft", "target": "Milwaukee_Bucks" },
                { "source": "1998_NBA_draft", "target": "2011_NBA_Finals" },
                { "source": "1998_NBA_draft", "target": "DJK_W%C3%BCrzburg" },
                { "source": "Milwaukee_Bucks", "target": "Milwaukee_Bucks" },
                { "source": "Milwaukee_Bucks", "target": "2018%E2%80%9319_NBA_season" },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "1998_NBA_draft"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "2011_NBA_Finals"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "1998%E2%80%9399_NBA_season"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "2006%E2%80%9307_NBA_season"
                },
                {
                  "source": "Milwaukee_Bucks",
                  "target": "2008%E2%80%9309_NBA_season"
                },
                {
                  "source": "Power_forward",
                  "target": "Power_forward"
                },
                {
                  "source": "Power_forward",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "Power_forward",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "DJK_W%C3%BCrzburg",
                  "target": "DJK_W%C3%BCrzburg"
                },
                {
                  "source": "DJK_W%C3%BCrzburg",
                  "target": "W%C3%BCrzburg"
                },
                {
                  "source": "DJK_W%C3%BCrzburg",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "1998%E2%80%9399_NBA_season"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "1998_NBA_draft"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "1998%E2%80%9399_NBA_season",
                  "target": "All-NBA_First_Team"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "2018%E2%80%9319_NBA_season"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "2019_NBA_All-Star_Game"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2018%E2%80%9319_NBA_season",
                  "target": "1998_NBA_draft"
                },
                {
                  "source": "List_of_NBA_champions",
                  "target": "List_of_NBA_champions"
                },
                {
                  "source": "List_of_NBA_champions",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "List_of_NBA_champions",
                  "target": "2011_NBA_Finals"
                },
                {
                  "source": "List_of_NBA_champions",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "List_of_NBA_champions",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "List_of_NBA_champions",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2011_NBA_Finals",
                  "target": "2011_NBA_Finals"
                },
                {
                  "source": "2011_NBA_Finals",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2011_NBA_Finals",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2011_NBA_Finals",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2011_NBA_Finals",
                  "target": "Power_forward"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "2011_NBA_Finals"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "2008%E2%80%9309_NBA_season"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "1998%E2%80%9399_NBA_season"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "2004%E2%80%9305_NBA_season"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "2006%E2%80%9307_NBA_season"
                },
                {
                  "source": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "target": "2018%E2%80%9319_NBA_season"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "NBA_draft"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "1998%E2%80%9399_NBA_season"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "2004%E2%80%9305_NBA_season"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "2006%E2%80%9307_NBA_season"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "2008%E2%80%9309_NBA_season"
                },
                {
                  "source": "NBA_Most_Valuable_Player_Award",
                  "target": "2018%E2%80%9319_NBA_season"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "2006%E2%80%9307_NBA_season"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2006%E2%80%9307_NBA_season",
                  "target": "All-NBA_First_Team"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "2015_NBA_All-Star_Game"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "2019_NBA_All-Star_Game"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "2002_NBA_All-Star_Game"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "2012_NBA_All-Star_Game"
                },
                {
                  "source": "NBA_All-Star",
                  "target": "2014_NBA_All-Star_Game"
                },
                {
                  "source": "2002_NBA_All-Star_Game",
                  "target": "2002_NBA_All-Star_Game"
                },
                {
                  "source": "2002_NBA_All-Star_Game",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2002_NBA_All-Star_Game",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2002_NBA_All-Star_Game",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2012_NBA_All-Star_Game",
                  "target": "2012_NBA_All-Star_Game"
                },
                {
                  "source": "2012_NBA_All-Star_Game",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2012_NBA_All-Star_Game",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2012_NBA_All-Star_Game",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2014_NBA_All-Star_Game",
                  "target": "2014_NBA_All-Star_Game"
                },
                {
                  "source": "2014_NBA_All-Star_Game",
                  "target": "2015_NBA_All-Star_Game"
                },
                {
                  "source": "2014_NBA_All-Star_Game",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2014_NBA_All-Star_Game",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2014_NBA_All-Star_Game",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2014_NBA_All-Star_Game",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2015_NBA_All-Star_Game",
                  "target": "2015_NBA_All-Star_Game"
                },
                {
                  "source": "2015_NBA_All-Star_Game",
                  "target": "2014_NBA_All-Star_Game"
                },
                {
                  "source": "2015_NBA_All-Star_Game",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2015_NBA_All-Star_Game",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2015_NBA_All-Star_Game",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2015_NBA_All-Star_Game",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2019_NBA_All-Star_Game",
                  "target": "2019_NBA_All-Star_Game"
                },
                {
                  "source": "2019_NBA_All-Star_Game",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2019_NBA_All-Star_Game",
                  "target": "2018%E2%80%9319_NBA_season"
                },
                {
                  "source": "2019_NBA_All-Star_Game",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2019_NBA_All-Star_Game",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2019_NBA_All-Star_Game",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "1998%E2%80%9399_NBA_season"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "2004%E2%80%9305_NBA_season"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "2006%E2%80%9307_NBA_season"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "2008%E2%80%9309_NBA_season"
                },
                {
                  "source": "All-NBA_First_Team",
                  "target": "2018%E2%80%9319_NBA_season"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "2004%E2%80%9305_NBA_season"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "All-NBA_First_Team"
                },
                {
                  "source": "2004%E2%80%9305_NBA_season",
                  "target": "Dirk_Nowitzki"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "2008%E2%80%9309_NBA_season"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "National_Basketball_Association"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "Milwaukee_Bucks"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "Dallas_Mavericks"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "All-NBA_First_Team"
                },
                {
                  "source": "2008%E2%80%9309_NBA_season",
                  "target": "Dirk_Nowitzki"
                }
              ],
              nodes: [
                {
                  "depth": 0,
                  "id": "Dirk_Nowitzki",
                  "label": "Dirk_Nowitzki"
                },
                {
                  "depth": 1,
                  "id": "Dallas_Mavericks",
                  "label": "Dallas_Mavericks"
                },
                {
                  "depth": 1,
                  "id": "National_Basketball_Association",
                  "label": "National_Basketball_Association"
                },
                {
                  "depth": 1,
                  "id": "W%C3%BCrzburg",
                  "label": "W%C3%BCrzburg"
                },
                {
                  "depth": 1,
                  "id": "NBA_draft",
                  "label": "NBA_draft"
                },
                {
                  "depth": 1,
                  "id": "1998_NBA_draft",
                  "label": "1998_NBA_draft"
                },
                {
                  "depth": 1,
                  "id": "Milwaukee_Bucks",
                  "label": "Milwaukee_Bucks"
                },
                {
                  "depth": 1,
                  "id": "Power_forward",
                  "label": "Power_forward"
                },
                {
                  "depth": 1,
                  "id": "DJK_W%C3%BCrzburg",
                  "label": "DJK_W%C3%BCrzburg"
                },
                {
                  "depth": 1,
                  "id": "1998%E2%80%9399_NBA_season",
                  "label": "1998%E2%80%9399_NBA_season"
                },
                {
                  "depth": 1,
                  "id": "2018%E2%80%9319_NBA_season",
                  "label": "2018%E2%80%9319_NBA_season"
                },
                {
                  "depth": 1,
                  "id": "List_of_NBA_champions",
                  "label": "List_of_NBA_champions"
                },
                {
                  "depth": 1,
                  "id": "2011_NBA_Finals",
                  "label": "2011_NBA_Finals"
                },
                {
                  "depth": 1,
                  "id": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award",
                  "label": "Bill_Russell_NBA_Finals_Most_Valuable_Player_Award"
                },
                {
                  "depth": 1,
                  "id": "NBA_Most_Valuable_Player_Award",
                  "label": "NBA_Most_Valuable_Player_Award"
                },
                {
                  "depth": 1,
                  "id": "2006%E2%80%9307_NBA_season",
                  "label": "2006%E2%80%9307_NBA_season"
                },
                {
                  "depth": 1,
                  "id": "NBA_All-Star",
                  "label": "NBA_All-Star"
                },
                {
                  "depth": 1,
                  "id": "2002_NBA_All-Star_Game",
                  "label": "2002_NBA_All-Star_Game"
                },
                {
                  "depth": 1,
                  "id": "2012_NBA_All-Star_Game",
                  "label": "2012_NBA_All-Star_Game"
                },
                {
                  "depth": 1,
                  "id": "2014_NBA_All-Star_Game",
                  "label": "2014_NBA_All-Star_Game"
                },
                {
                  "depth": 1,
                  "id": "2015_NBA_All-Star_Game",
                  "label": "2015_NBA_All-Star_Game"
                },
                {
                  "depth": 1,
                  "id": "2019_NBA_All-Star_Game",
                  "label": "2019_NBA_All-Star_Game"
                },
                {
                  "depth": 1,
                  "id": "All-NBA_First_Team",
                  "label": "All-NBA_First_Team"
                },
                {
                  "depth": 1,
                  "id": "2004%E2%80%9305_NBA_season",
                  "label": "2004%E2%80%9305_NBA_season"
                },
                {
                  "depth": 1,
                  "id": "2008%E2%80%9309_NBA_season",
                  "label": "2008%E2%80%9309_NBA_season"
                }
              ]
            }} />
        </div>

        <p className="example-caption">A sample graph showing connections for "Dirk Nowitzki" with <strong>Depth 1</strong> and <strong>25 Nodes</strong></p>
      </div>
    </section>

    {/* About Section */}
    <section className="scroll-section about">
      <div className="about-content">
        <h2 className="section-title">About</h2>
        <p>
          WikigrapheR visualizes human knowledge by mapping Wikipedia's link structure.
           Built as a demonstration of data scrapers, graph traversal algorithms 
           and data visualization libraries using <strong>BeautifulSoup 4</strong>, <strong>D3</strong>, and <strong>more</strong>. Further implementation details  
           available on Github.
        </p>
        
        <div className="tech-stack">
          <span className="tech-badge">React</span>
          <span className="tech-badge">D3.js</span>
          <span className="tech-badge">Wikipedia API</span>
          <span className="tech-badge">Flask</span>
          <span className="tech-badge">BeautifulSoup 4</span>
        </div>

        <a href="https://github.com/carson-lam/wiki-grapher" className="cta-link">View on GitHub</a>
      </div>
    </section>

    {/* Footer */}
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="https://github.com/carson-lam/">GitHub</a>
          <a href="https://www.linkedin.com/in/lam-carson/">LinkedIn</a>
          <a href="https://chromewebstore.google.com/detail/dnhceagmmlgdhjidclcdjdojkboengol?utm_source=item-share-cb">WeatherMate</a>
        </div>
        <div className="footer-credits">
          <p>Carson Lam • Built with Wikipedia's API • Data licensed under CC BY-SA 3.0</p>
        </div>
      </div>
    </footer>
    </>
  );
}

export default Home;