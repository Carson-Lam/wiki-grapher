import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import GraphPage from './GraphPage';
import './App.css';
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;