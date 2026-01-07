from bs4 import BeautifulSoup
import requests
import re
import threading

scrape_lock = threading.Lock()
stop_scraping = False

def scrape_page(url):
    """
    Scrapes a single Wikipedia page and returns a list of linked pages.
    
    Args:
        url: Full Wikipedia URL (e.g., 'https://en.wikipedia.org/wiki/Fergana_(moth)')
    
    Returns:
        list: Page names that this page links to (e.g., ['Animal', 'Insect', 'Moth'])
    """

    headers = {
        'User-Agent': 'WikiGrapher/1.0 (Portfolio Project; lamcn51@example.com)'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []
    
    soup = BeautifulSoup(response.text, 'lxml')
    
    # Body and stop point handling
    # stop at either See Also/References
    # Get all body elements
    stop_element = soup.select_one('h2#See_also, h2#References')
    title = soup.find('h1', id='firstHeading')
    if not title:
        return []
    body = [title] + list(title.find_all_next(True))
    
    # Link storage
    seen_links = set()
    links = []
    
    # Helper to add unique links
    def add_unique_links(elements):

        # nonlocal link_id
        for element in elements:
            href = element.get('href')
            img = element.find('img')
            
            # Ensure link exists, has no image, is not internal, and unique
            if (href 
                and not img 
                and not re.match(r'^/wiki/(Wikipedia:|Talk:|Special:|File:|Help:|Category:)', href) 
                and href not in seen_links):
                seen_links.add(href)
                page_name = href.replace('/wiki/', '')
                links.append(page_name)
    
    # Iterate through scraped data
    for element in body:
        # Stop scraping at end of page
        if element == stop_element:
            break
        
        # Add links from paragraphs, lists, and image captions
        if element.name in ['p', 'figcaption', 'ul']:
            add_unique_links(element.find_all('a', href=re.compile('^/wiki/')))
        
        # Add links from tables
        if element.name == 'table':
            for row in element.find_all('tr'):
                add_unique_links(row.find_all('a', href=re.compile('^/wiki/')))
    
    return links 

def build_graph_bfs_streaming(start_page, max_pages=50, max_depth=None):
    """
    Build a graph using BFS, yielding nodes as they're scraped
    
    Args:
        start_page: Starting Wikipedia page name (e.g., 'Fergana_(moth)')
        max_pages: Maximum number of pages to scrape
        max_depth: Maximum depth to explore (None = no limit)
    
    Returns: YIELD block w type, node_dict, edges, progress, depth
    """
    # Stop scraping flag, manipulated by app.py stop path
    global stop_scraping
    stop_scraping = False

    if not scrape_lock.acquire(blocking=False):
        print(f"Another scrape is already in progress. Rejecting request for {start_page}")
        return None
    
    try:
        graph = {}
        visited = set()
        queue = [(start_page, 0)]
        nodes_dict = {}
        all_edges = []
        
        print(f"Starting BFS from {start_page}")
        
        while queue and len(visited) < max_pages:

            if stop_scraping:
                print("scraping aborted")
                return

            current_page, depth = queue.pop(0)
            
            if current_page in visited:
                continue
            
            if max_depth is not None and depth > max_depth:
                continue
            
            print(f"Scraping ({len(visited)+1}/{max_pages}): {current_page} (depth {depth})")

            links = [link for link in 
            scrape_page(f'https://en.wikipedia.org/wiki/{current_page}') if link.lower() != current_page.lower()]
            
            graph[current_page] = {
                'links': links,
                'depth': depth
            }
            visited.add(current_page)

            # Create node
            nodes_dict[current_page] = {
                'id': current_page,
                'label': current_page,
                'depth': depth
            }

            # Create edges for this node 
            new_edges = []

            # Forward edges: current -> targets (that exist in nodes_dict)
            for target in links:
                edge = {'source': current_page, 'target': target}
                new_edges.append(edge)
                all_edges.append(edge)

            # Backward edges: existing nodes -> current (if current was in their links)
            for existing_page in nodes_dict.keys():
                existing_links = graph.get(existing_page, {}).get('links', [])
                if current_page in existing_links:
                    edge = {'source': existing_page, 'target': current_page}
                    new_edges.append(edge)
                    all_edges.append(edge)

            # Use YIELD to return nodes, edges, and keep going
            yield {
                'type': 'node',
                'node': nodes_dict[current_page],
                'edges': new_edges,
                'progress': len(visited),
                'total': max_pages
            }
            
            # Only enqueue links for scraping if they are at depth
            if max_depth is None or depth < max_depth:
                for link in links:
                    if link not in visited and not any(l[0] == link for l in queue):
                        queue.append((link, depth + 1))
            else:
                print(f"  Reached max depth {max_depth}, not adding children to queue")
        
        # Completion signal
        print(f"Finished! Scraped {len(visited)} pages")
        yield {
            'type': 'complete',
            'stats': {
                'total_nodes': len(visited),
                'total_edges': sum(len(data['links']) for data in graph.values())
            }
        }
    finally:
        scrape_lock.release()
        print("Scrape lock released")
