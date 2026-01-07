import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Graph from './Graph';
import toast from 'react-hot-toast';


function GraphPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [graphData, setGraphData] = useState(null);

    const page = searchParams.get('page');
    const depth = searchParams.get('depth');
    const maxPages = searchParams.get('max_pages');    

    const toastIdRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Load graph
    useEffect(() => {
        let isCancelled = false;
        let eventSourceRef = null;  
        
        const fetchGraph = async () => {
            // setScreenMsg(true);
            toastIdRef.current = toast.loading('Building graph...');
            
            eventSourceRef = new EventSource(
                `${API_URL}/api/scrape?page=${page}&depth=${depth}&max_pages=${Number(maxPages) || 1}`
            );
            
            let accumulatedNodes = [];
            let accumulatedEdges = [];
            
            eventSourceRef.onmessage = (event) => {
                if (isCancelled) {
                    eventSourceRef.close();
                    return;
                }
                
                const data = JSON.parse(event.data);
                
                if (data.error) {
                    eventSourceRef.close();
                    toast.dismiss(toastIdRef.current);
                    toast.error(data.error);
                    return;
                }
                
                // Handle duplicate scrape
                if (data.type === 'busy') {
                    eventSourceRef.close();
                    if (!isCancelled) {
                        toast.dismiss(toastIdRef.current);
                        toast.success('Restarting graph...');
                        
                        // Stop the previous scrape and retry
                        fetch('${API_URL}/api/scrape/stop', {method: 'GET'})
                        .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
                        .then(() => {
                            if (!isCancelled) {
                                fetchGraph(); 
                            }
                        });
                    }
                    return;
                }
                
                if (data.type === 'node') {
                    // Add new node and edges
                    accumulatedNodes.push(data.node);
                    accumulatedEdges.push(...data.edges);
                    
                    // Update graph in real-time
                    setGraphData({
                        nodes: [...accumulatedNodes],
                        edges: [...accumulatedEdges]
                    });
                    
                    // Update toast with progress
                    toast.loading(`Building graph... ${data.progress}/${data.total} nodes`, {
                        id: toastIdRef.current
                    });
                } else if (data.type === 'complete') {
                    eventSourceRef.close();
                    toast.dismiss(toastIdRef.current);
                    toast.success('Graph completed!');
                }
            };
            
            eventSourceRef.onerror = (error) => {
                console.log('EventSource error:', error);
                eventSourceRef.close();
                if (!isCancelled) {
                    toast.dismiss(toastIdRef.current);
                    toast.error('Connection lost');
                }
            };
        };
        
        if (page) {
            fetchGraph();
        }
        
        // Cleanup on unmount/back button
        return () => {
            isCancelled = true;
            if (eventSourceRef) {
                eventSourceRef.close();
            }
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
            fetch('${API_URL}/api/scrape/stop', {method: 'GET'});
        };
    }, [page, depth, maxPages]);

    // Warn user before reload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Chrome
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div id="graphPageContainer">
            {/* Back button */}
            <button 
                onClick={async () => { 
                    fetch('${API_URL}/api/scrape/stop', {method: 'GET'});
                    navigate('/');
                }}
                id="backButton"
            >
                <span className="arrow">◀</span>
                Back
            </button>
            {/* {screenMsg && <p id="screenText">Loading graph data...</p>} */}
            {graphData && (
                <div>
                    <Graph data={graphData} />
                </div>
            )}
            <button
                id="infoButton"
            >
            ?
            </button>
            <div id="infoContainer">
                <h3 className="optionsTitle"> How to use: </h3>
                <div>
                    <strong>Click</strong> to open Wikipedia page<br/>
                    <strong>Scroll</strong> to zoom in/out graph<br/>
                    <strong>Drag</strong> to pan around graph<br/>
                    <strong>Hover</strong> to highlight connections
                </div>
                <div>
                    <strong>Color Legend:</strong><br/>
                    <span style={{ color: '#1755d3ff', fontSize:"25px"}}>●</span> Starting page <br/>
                    <span style={{ color: '#7b8ceaff', fontSize:"25px"}}> ●</span> 1 link away  <br/>
                    <span style={{ color: '#95a98fff', fontSize:"25px"}}> ●</span> 2 links away <br/>
                    <span style={{ color: '#9a8f74', fontSize:"25px"}}> ●</span> 3+ links away<br/>
                </div>
            </div>
        </div>
    );
}

export default GraphPage;
