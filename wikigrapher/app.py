from flask import Flask, jsonify, request
from flask_cors import CORS
from scraper import build_graph_bfs

app = Flask(__name__)
CORS(app) # React <--> flask communication

@app.route('/api/scrape', methods=['GET'])
def scrape():
    """
    API endpoint to scrape Wikipedia and return graph data.
    
    Query params:
        page: Wikipedia page name (e.g., 'Fergana_(moth)')
        depth: How many levels deep to scrape (default: 2)
        max_pages: Max total pages (default: 100)
    """

    # Get parameters
    page = request.args.get('page')
    depth = int(request.args.get('depth', 2)) # defaults to 2
    max_pages = int(request.args.get('max_pages', 100)) #defaults to 100 pages

    # Validate
    if not page:
        return jsonify({'error': 'Missing page parameter'}), 400
    
    try:
        graph = build_graph_bfs(page, max_pages=max_pages, max_depth=depth)

        nodes_dict = {}
        edges = []

        # Add scraped nodes
        for page_name, data in graph.items():
            nodes_dict[page_name]= {
                'id': page_name,
                'label': page_name,
                'depth': data['depth']
            }
        
        # Add edges and target nodes 
        for page_name, data in graph.items():
            for target in data['links']:
                target_depth = data['depth'] + 1

                # Only add target if within max_depth
                if target not in nodes_dict:
                    if target_depth <= depth:  # ← Check depth limit
                        nodes_dict[target] = {
                            'id': target,
                            'label': target,
                            'depth': target_depth
                        }
                
                # Only add edge if target is within depth
                if target in nodes_dict:  # ← Only if target was added
                    edges.append({
                        'source': page_name,
                        'target': target
                    })
        
        nodes = list(nodes_dict.values())

        return jsonify({
            'nodes': nodes,
            'edges': edges,
            'stats':{
                'total_nodes': len(nodes),
                'total_edges': len(edges)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    print("Try: http://localhost:5000/api/scrape?page=Fergana_(moth)&depth=2")
    app.run(debug=True, port=5000)

