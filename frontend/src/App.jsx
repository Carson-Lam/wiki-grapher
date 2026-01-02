import {useState} from 'react';
import Graph from './Graph';

function App(){
  const [page, setPage] = useState('');
  const [depth, setDepth] = useState(2);
  const [maxPages, setMaxPages] = useState('50');
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViz = async () => {
    if (!page.trim()) {
      alert('Please enter a wikipedia page name');
      return;
    }

    if (!maxPages || maxPages < 1 || !(Number.isInteger(Number(maxPages)))) {
      alert('Please enter a valid max pages value (Positive Integer)');
      return;
    }

    setLoading(true);
    setError(null);
    setGraphData(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/scrape?page=${page}&depth=${depth}&max_pages=${Number(maxPages) || 1}`
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
          max="3"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Max Pages to Scrape: </label>
        <input 
          type="number"
          min="1"
          max="500"
          value={maxPages}
          onChange={(e) => setMaxPages(e.target.value)}
          style={{ 
            marginLeft: '10px',
            padding: '8px',
            width: '100px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
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