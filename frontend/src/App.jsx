import {useState} from 'react';
import Graph from './Graph';

function App(){
  const [page, setPage] = useState('');
  const [depth, setDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(100);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViz = async () => {
    if (!page.trim()) {
      alert('Please enter a wikipedia page name');
      return;
    }
    setLoading(true);
    setError(null);
    setGraphData(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/scrape?page=${page}&depth=${depth}&max_pages=${maxPages}`
      );
      
      if (!response.ok){
        throw new Error('failed to fetch');
      }

      const data = await response.json();

      if (data.error){
        throw new Error(data.error);
      }

      console.log('Got data:', data);
      setGraphData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style ={{
        padding: '20px'
      }}>
      <h1>Wikipedia Graph Visualizer</h1>
      <input 
        type="text" 
        placeholder="Enter Wikipedia page"
        value={page}
        onChange={(e)=>setPage(e.target.value)}
        style={{ padding: '10px', width: '300px' }}
      />

      <div style={{ 
          marginTop: '20px' 
        }}>
        <label>Depth: {depth}</label>
        <input 
          type="range"
          min="1"
          max="5"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </div>

      <div style={{ 
          marginTop: '20px' 
        }}>
        <label>Max Pages to Scrape: {maxPages}</label>
        <input 
          type="range"
          min="10"
          max="300"
          step="10"
          value={maxPages}
          onChange={(e) => setMaxPages(parseInt(e.target.value))}
        />
      </div>

      <button
        onClick={handleViz}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Visualize
      </button>

      <p>
        You typed: {page}        
      </p>
      {loading && <p>Loading...</p>}
      {error && <p style ={{color: 'red'}}>Error: {error}</p>}
      {graphData && (
        <div>
          <p>Found {graphData.stats.total_nodes} nodes 
            and {graphData.stats.total_edges} edges
          </p>
          <Graph data = {graphData}/>
        </div>
      )}
    </div>
  )
}

export default App;