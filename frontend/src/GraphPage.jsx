import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Graph from './Graph';
import toast from 'react-hot-toast';


function GraphPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [graphData, setGraphData] = useState(null);
    const [screenMsg, setScreenMsg] = useState(null);

    const page = searchParams.get('page');
    const depth = searchParams.get('depth');
    const maxPages = searchParams.get('max_pages');    

    const toastIdRef = useRef(null);

    // Load graph
    useEffect(() => {
        // Unmount/back button cancellation
        let isCancelled = false;
        const fetchGraph = async () => {

            setScreenMsg(true);
            
            toastIdRef.current = toast.loading('Building graph...');

            try {
                // Unmount/back button cancellation
                if (isCancelled) return; 

                const response = await fetch(
                    `http://localhost:5000/api/scrape?page=${page}&depth=${depth}&max_pages=${Number(maxPages) || 1}`
                );
                const data = await response.json();
                

                // Catch duplicate scrape error, abort previous scrape, start scrape w fetchGraph() 
                if (response.status === 429) {
                    if (!isCancelled) {
                        toast.dismiss(toastIdRef.current);  
                        toast.success('Restarted graphing');
                    }

                    await fetch('http://localhost:5000/api/scrape/stop', {method: 'GET'})
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    if (!isCancelled) {
                        fetchGraph();
                    } 
                    return;
                } 

                if (!response.ok){
                    throw new Error('failed to fetch');
                }

                if (data.error){
                    throw new Error(data.error);
                }

                console.log('Got data:', data);
                setGraphData(data);
                setScreenMsg(false);
                toast.dismiss(toastIdRef.current);  
                toast.success('Graph completed!')

            } catch (err) {
                if (isCancelled) return;

                toast.dismiss(toastIdRef.current);  
                toast.error('Failed to fetch graph data: ', err);
                setScreenMsg('Error:', err);
                console.error('Error:', err);
            }
        };
        if (page) {
            fetchGraph();
        }
        
        // Cleanup toasts on unmount/backbutton cancellation
        return () => {
            isCancelled = true;
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
            fetch('http://localhost:5000/api/scrape/stop', {method: 'GET'})
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
                    fetch('http://localhost:5000/api/scrape/stop', {method: 'GET'});
                    navigate('/');
                }}
                id="backButton"
            >
                ← Back to Home
            </button>
            {screenMsg && <p id="screenText">Loading graph data...</p>}
            {graphData && (
                <div>
                    <Graph data={graphData} />
                </div>
            )}
        </div>
    );
}

export default GraphPage;
