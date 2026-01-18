from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
from scraper import build_graph_bfs_streaming, scrape_lock
import scraper
import requests

app = Flask(__name__)

# CORS For Localhost
# CORS(app)

# CORS For Deployment
CORS(app, origins=[
    'http://localhost:5173',  # Local dev, react url
    'https://wikigrapher.vercel.app',  # Vercel
    'https://*.vercel.app'  # Vercel Preview
])

@app.route('/') 
def working():
    return 'hello'

# Main scraping API endpoint
@app.route('/api/scrape', methods=['GET'])
def scrape():
    """
    API endpoint to scrape Wikipedia and stream graph data in real-time.
    """
    # Get Url params
    page = request.args.get('page')
    depth = int(request.args.get('depth', 2))
    max_pages = int(request.args.get('max_pages', 50))
    
    # Validate before creating generator
    if not page:
        return jsonify({'error': 'Missing page parameter'}), 400

    # Check if another scrape is in progress
    if scrape_lock.locked():
        def busy_response():
            yield f"data: {json.dumps({'type': 'busy', 'message': 'Another scrape is in progress'})}\n\n"
        return Response(busy_response(), mimetype='text/event-stream')

    # Generator function that takes built bfs node and yields it   
    def generate():
        try:
            for node_data in build_graph_bfs_streaming(page, max_pages=max_pages, max_depth=depth):
                yield f"data: {json.dumps(node_data)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

# Search Suggestions API endpoint
@app.route('/api/search', methods=['GET'])
def search_suggestions():
    """
    API endpoint to get wikipedia page suggestions for autocomplete.
    """
    query = request.args.get('q', '')

    if not query or len(query) < 2:
        return jsonify({'suggestions': []})
    try:
        url = 'https://en.wikipedia.org/w/api.php'
        params = {
            'action': 'opensearch',
            'search': query,
            'limit': 8,  # Number of suggestions
            'namespace': 0,  # Main articles
            'format': 'json'
        }

        headers = {
            'User-Agent': 'WikigrapheR/1.0 (Educational Project)'
        }

        response = requests.get(url, params = params, headers=headers, timeout = 10)
        data = response.json()

        # OpenSearch returns: [query, [titles], [descriptions], [urls]]
        # Take i-th element of 1, 2 and 3 
        suggestions = [
            {
                'title': data[1][i],
                # 'description': data[2][i] if i < len(data[2]) else '',
                # 'url': data[3][i] if i < len(data[3]) else ''
            }
            for i in range(len(data[1]))
        ]
        return jsonify({'suggestions': suggestions})
    except Exception as e:
        print(f"search error: {e}")
        return jsonify({'suggestions': []})    

# Stop scraping API endpoint, changes flag in scraper.py that stops scraping for loop
@app.route('/api/scrape/stop', methods=['GET'])
def stopScrape():
    scraper.stop_scraping = True
    return jsonify({'status': 'stopping'})

if __name__ == '__main__':
    # Dev prints
    # print("Starting Flask server on http://localhost:5000")
    # print("Try: http://localhost:5000/api/scrape?page=Fergana_(moth)&depth=2")
    app.run(debug=True, port=5000)
