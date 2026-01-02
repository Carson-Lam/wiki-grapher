import { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3-force';

function Graph({ data }) {
    const graphRef = useRef();
    const [maxNodesToShow, setMaxNodesToShow] = useState(300);
    const [filterDepth, setFilterDepth] = useState('all');
    const [graphData, setGraphData] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const totalAvailableNodes = data?.nodes?.length || 0;

    // ============================================
    // SECTION 1: PREPARE GRAPH DATA
    // ============================================
    // This runs whenever data, filters, or node limit changes
    // It transforms raw Wikipedia data into graph format
    useEffect(() => {
        if (!data) return;

        setMaxNodesToShow(Math.min(maxNodesToShow, totalAvailableNodes));

        // Color nodes by their depth (distance from starting page)
        const getNodeColor = (depth) => {
            const colors = {
                0: '#ff4444', // starting page
                1: '#4444ff', // 1 click away
                2: '#44ff44', // 2 clicks away
                3: '#ffaa44', // 3+ clicks away
            };
            return colors[depth] || '#888888';
        };

        // Apply depth filter if selected
        let filteredNodes = data.nodes;
        if (filterDepth !== 'all') {
            const maxDepth = parseInt(filterDepth);
            filteredNodes = data.nodes.filter(n => n.depth <= maxDepth);
        }

        // Limit number of nodes to show (for performance)
        const nodesToDisplay = filteredNodes.slice(0, maxNodesToShow);
        const nodeIds = new Set(nodesToDisplay.map(n => n.id));

        // Transform nodes: add display properties
        const nodes = nodesToDisplay.map(node => ({
            id: node.id,
            name: node.label.replace(/_/g, ' '),
            depth: node.depth,
            color: getNodeColor(node.depth),
            val: 70 - (node.depth * 20), // Center node is bigger
        }));

        // Transform links: only include links between visible nodes
        const links = data.edges
            .filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target) && edge.source !== edge.target)
            .map(edge => ({
                source: edge.source,
                target: edge.target,
            }));

        console.log(`Displaying ${nodes.length} nodes, ${links.length} links`);
        setGraphData({ nodes, links });

        // Apply custom forces after graph is initialized
        setTimeout(() => {
            if (graphRef.current) {
                // EXPANSION FORCE
                graphRef.current.d3Force('charge', d3.forceManyBody().strength(-200));
                graphRef.current.d3Force('link', d3.forceLink().distance(200).strength(0.5));
                graphRef.current.d3Force('collide', d3.forceCollide().radius(node => node.val * 1.1).strength(1));

                // CENTERING FORCE
                graphRef.current.d3Force('x', d3.forceX(0).strength(0.010));
                graphRef.current.d3Force('y', d3.forceY(0).strength(0.01));
            }
        }, 100);
    }, [data, maxNodesToShow, filterDepth]);

    // ============================================
    // SECTION 2: INTERACTION HANDLERS
    // ============================================
    // Click handler: open Wikipedia page in new tab
    const handleNodeClick = useCallback((node) => {
        const wikiUrl = `https://en.wikipedia.org/wiki/${node.id}`;
        window.open(wikiUrl, '_blank');
    }, []);

    // Hover handler: highlight node and its connections
    const handleNodeHover = useCallback((node) => {
        if (!graphData) return;
        
        if (node) {
            const neighbors = new Set();
            const links = new Set();
            
            // Find all connected nodes and links
            graphData.links.forEach(link => {
                if (link.source.id === node.id) {
                    neighbors.add(link.target.id);
                    links.add(link);
                }
                if (link.target.id === node.id) {
                    neighbors.add(link.source.id);
                    links.add(link);
                }
            });
            
            neighbors.add(node.id); // Include the hovered node itself
            setHighlightNodes(neighbors);
            setHighlightLinks(links);
        } else {
            // Clear highlights when not hovering
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
        }
    }, [graphData]);

    // ============================================
    // SECTION 3: CUSTOM RENDERING
    // ============================================
    // Custom node rendering: draw circles with labels
    const paintNode = useCallback((node, ctx, globalScale) => {
        const isHighlighted = highlightNodes.has(node.id);
        // const showLabel = globalScale > 1.2 || node.depth === 0 || isHighlighted; -- show labels when zoomed in or highlighted
        
        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = isHighlighted || highlightNodes.size === 0 ? 1 : 0.25;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = isHighlighted ? '#000' : '#fff';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw label 
        const fontSize = 15 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#333';
        ctx.globalAlpha = isHighlighted || highlightNodes.size === 0 ? 1 : 0.25;g
        ctx.fillText(node.name, node.x, node.y + node.val + 2);

    }, [highlightNodes]);

    // Custom link rendering: draw lines with arrows
    const paintLink = useCallback((link, ctx) => {
        const isHighlighted = highlightLinks.has(link);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = isHighlighted ? '#000000' : '#cccccc';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.globalAlpha = isHighlighted || highlightLinks.size === 0 ? 0.6 : 0.15;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw arrows
        if (isHighlighted) {
            const arrowSize = 10;
            const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
            
            // Position arrow at edge of target node
            const arrowX = link.target.x - Math.cos(angle) * (link.target.val + 5);
            const arrowY = link.target.y - Math.sin(angle) * (link.target.val + 5);
            
            ctx.save();
            ctx.translate(arrowX, arrowY);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, arrowSize / 2);
            ctx.lineTo(-arrowSize, -arrowSize / 2);
            ctx.closePath();
            ctx.fillStyle = isHighlighted ? '#000000' : '#999999';
            ctx.fill();
            ctx.restore();
        }
    }, [highlightLinks]);

    // ============================================
    // SECTION 4: RENDER UI
    // ============================================ 
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Control Panel */}
            <div style={{ 
                marginBottom: '20px', 
                padding: '20px', 
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>
                    Graph Controls
                </h3>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '20px',
                    marginBottom: '20px' 
                }}>
                    {/* Node Limit Control */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            color: '#555'
                        }}>
                            Max Nodes: {maxNodesToShow}
                        </label>
                        <input 
                            type="range"
                            min="1"
                            max={totalAvailableNodes}
                            step="1"
                            value={maxNodesToShow}
                            onChange={(e) => setMaxNodesToShow(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                            Total available: {totalAvailableNodes} nodes
                        </div>
                    </div>
                    
                    {/* Depth Filter Control */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600',
                            color: '#555'
                        }}>
                            Depth Filter
                        </label>
                        <select 
                            value={filterDepth}
                            onChange={(e) => setFilterDepth(e.target.value)}
                            style={{ 
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="all">Show All Depths</option>
                            <option value="0">Depth 0 Only</option>
                            <option value="1">Up to Depth 1</option>
                            <option value="2">Up to Depth 2</option>
                            <option value="3">Up to Depth 3</option>
                        </select>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '13px',
                    lineHeight: '1.8',
                    border: '1px solid #e8e8e8'
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                        How to use:
                    </div>
                    <div style={{ color: '#666' }}>
                        <strong>Click</strong> any node to open its Wikipedia page<br/>
                        <strong>Scroll</strong> to zoom in/out<br/>
                        <strong>Drag</strong> to pan around<br/>
                        <strong>Hover</strong> over nodes to highlight connections
                    </div>
                    <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid #f0f0f0',
                        fontSize: '12px'
                    }}>
                        <strong>Color Legend:</strong><br/>
                        <span style={{ color: '#ff4444' }}>●</span> Starting page • 
                        <span style={{ color: '#4444ff' }}> ●</span> 1 link away • 
                        <span style={{ color: '#44ff44' }}> ●</span> 2 links away • 
                        <span style={{ color: '#ffaa44' }}> ●</span> 3+ links away
                    </div>
                </div>
            </div>
            
            {/* Graph Canvas */}
            <div style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff'
            }}>
                {graphData && (
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={graphData}

                        nodeCanvasObject={paintNode}
                        linkCanvasObject={paintLink}

                        onNodeClick={handleNodeClick}
                        onNodeHover={handleNodeHover}

                        width={Math.min(window.innerWidth - 80, 1400)}
                        height={600}
                        backgroundColor="#fafafa"
                    />
                )}
            </div>
        </div>
    );
}

export default Graph;