import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

function Graph({ data }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !containerRef.current) return;

        const getNodeColor = (depth) => {
            const colors = {
                0: '#ff4444', // Red - starting page
                1: '#4444ff', // Blue - level 1
                2: '#44ff44', // Green - level 2
                3: '#ffaa44', // Orange - level 3
                4: '#ff44ff', // Purple - level 4
                5: '#44ffff', // Cyan - level 5
            };
            return colors[depth] || '#888888';
        };

        const nodes = data.nodes.map(node =>({
            id: node.id,
            // Replace _ in label w ' '
            label: node.label.replace(/_/g, ' ') ,
            color: getNodeColor(node.depth),
            size: node.depth === 0 ? 30 : 20,
            font: {size: node.depth === 0 ? 16 : 12},
        }));

        const edges = data.edges.map(edge => ({
            from: edge.source,
            to: edge.target,
            arrows: 'to',
        }));

        const network = new Network(
            containerRef.current,
            { nodes, edges},
            {
                physics:{
                    enabled: false
                },
            }
        );

        return () => network.destroy();
    }, [data]);

    return <div ref={containerRef} style={{height: '600px',border:'1px solid #ddd'}}/>;
}

export default Graph;