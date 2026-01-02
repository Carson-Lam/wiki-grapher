import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Home(){
  const [page, setPage] = useState('');
  const [depth, setDepth] = useState(2);
  const [maxPages, setMaxPages] = useState('50');
  const navigate = useNavigate();

  const handleViz = async () => {
    if (!page.trim()) {
        alert('Please enter a wikipedia page name');
        return;
    }

    if (!maxPages || maxPages < 1 || !(Number.isInteger(Number(maxPages)))) {
        alert('Please enter a valid max pages value (Positive Integer)');
        return;
    }

    navigate(`/graph?page=${page}&depth=${depth}&max_pages=${maxPages}`);
  };

  return (
    <div id="container">
      <h1 id="title">
        W<p id="titleSub">IKIPEDI</p>A 
      </h1>
      <h4 id="subtitle">
        The Free Graph Visualizer
      </h4>

      <img id="logo"src="/assets/images/Wlogo.png" alt="Wikipedia Logo"/>

      <div id= "searchBar">
        <input 
          id= "inputBar"
          type="text" 
          placeholder="Enter Wikipedia page"
          value={page}
          onChange={(e)=>setPage(e.target.value)}
        />
        <button
          onClick={handleViz}
          id= "vizButton"
        >
          🔎︎
        </button>
      </div> 
      <div id="depthDiv">
        <label>Depth: {depth}</label>
        <input 
          type="range"
          min="1"
          max="3"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </div>
      <div id="pagesDiv">
        <label>Max Pages to Scrape: </label>
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
  );
}

export default Home;