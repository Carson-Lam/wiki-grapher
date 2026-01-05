import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Graph from './Graph';

function GraphPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const page = searchParams.get('page');
    const depth = searchParams.get('depth');
    const maxPages = searchParams.get('max_pages');    

    useEffect(() => {
        const fetchGraph = async (isRetry = false) => {
            if (!isRetry) {
                setLoading(true);
                setError(null);
            }
            try {
                const response = await fetch(
                    `http://localhost:5000/api/scrape?page=${page}&depth=${depth}&max_pages=${Number(maxPages) || 1}`
                );

                const data = await response.json();
                
                // Catch attempt to duplicate case
                if (response.status === 429) {
                    if (!isRetry) setError('A scrape is already in progress. Aborting and Restarting scrape:');

                    setTimeout(() => {
                        fetchGraph(true); 
                    }, 2000);
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
                setLoading(false);
                setError(null);

            } catch (err) {
                setError(err.message);
                console.error('Error:', err);
                setLoading(false);

            }
        };
        if (page) {
            fetchGraph();
        }
    }, [page, depth, maxPages]);

    return (
        <div id="graphPageContainer">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                id="backButton"
            >
                ← Back to Home
            </button>
            {loading && <p id="loadingText">Loading graph data...</p>}
            {error && <p id="errorText">Error: {error}</p>}
            {graphData && (
                <div>
                    <Graph data={graphData} />
                </div>
            )}
        </div>
    );
}

export default GraphPage;
