import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import GraphPage from './GraphPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;