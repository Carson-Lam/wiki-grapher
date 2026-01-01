import {useState} from 'react';

function App(){
  const [page, setPage] = useState('');
  const [depth, setDepth] = useState(2);
  const handleViz = () => {
    console.log('Fetching:', page, 'w/ depth:', depth);

  };

  return (
    <div style ={{padding: '20px'}}>
      <h1>Wikipedia Graph Visualizer</h1>
      <input 
        type="text" 
        placeholder="Enter Wikipedia page"
        value={page}
        onChange={(e)=>setPage(e.target.value)}
        style={{ padding: '10px', width: '300px' }}
      />

      <div style={{ marginTop: '20px' }}>
        <label>Depth: {depth}</label>
        <input 
          type="range"
          min="1"
          max="5"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
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
    </div>
  )
}

export default App;