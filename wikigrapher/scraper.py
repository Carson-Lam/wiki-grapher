from bs4 import BeautifulSoup
import requests
import re

def scrape_page(url):
    """
    Scrapes a single Wikipedia page and returns a list of linked pages.
    
    Args:
        url: Full Wikipedia URL (e.g., 'https://en.wikipedia.org/wiki/Fergana_(moth)')
    
    Returns:
        list: Page names that this page links to (e.g., ['Animal', 'Insect', 'Moth'])
    """

    headers = {
        'User-Agent': 'WikiGrapher/1.0 (Educational Project; lamcn51@example.com)'
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


def build_graph_bfs(start_page, max_pages=50, max_depth=None):
    """
    Build a graph using BFS.
    
    Args:
        start_page: Starting Wikipedia page name (e.g., 'Fergana_(moth)')
        max_pages: Maximum number of pages to scrape
        max_depth: Maximum depth to explore (None = no limit)
    
    Returns:
        dict: Adjacency list with depth info
        {
            "Fergana_(moth)": {"links": ["Animal", "Insect"], "depth": 0},
            "Animal": {"links": [...], "depth": 1},
            ...
        }
    """
    graph = {}
    visited = set()
    queue = [(start_page, 0)]  # (page_name, depth)
    
    print(f"Starting BFS from {start_page}")
    
    while queue and len(visited) < max_pages:


        current_page, depth = queue.pop(0)
        
        # Skip if already visited 
        if current_page in visited:
            continue
        
        # Stop if max depth reached
        if max_depth is not None and depth > max_depth:
            continue
        
        print(f"Scraping ({len(visited)+1}/{max_pages}): {current_page} (depth {depth})")

        # Scrape the page
        # current_url = f'https://en.wikipedia.org/wiki/{current_page}'
        links = scrape_page(f'https://en.wikipedia.org/wiki/{current_page}')
        
        # Add to graph with depth info
        graph[current_page] = {
            'links': links,
            'depth': depth
        }
        visited.add(current_page)
        
        # Add new links to queue
        for link in links:
            if link not in visited:
                queue.append((link, depth + 1))
    
    print(f"Finished! Scraped {len(visited)} pages")
    return graph

# UNUSED: DEBUG 
# if __name__ == '__main__':
#     # Test BFS
#     graph = build_graph_bfs('Fergana_(moth)', max_pages=20, max_depth=2)
    
#     print("\nGraph structure:")
#     for page, data in list(graph.items())[:]:
#         print(f"{page} (depth {data['depth']}): {len(data['links'])} links")
    
#     print(graph)

# UNUSED: Building one-level of interconnected scraped pages
# def build_graph_one_level(start_page):
#     """
#     Build graph with only one level (start page + its direct children).
#     Only shows connections between children.
    
#     Args:
#         start_page: Starting Wikipedia page name
    
#     Returns:
#         dict: Adjacency list with depth info
#         {
#             "Fergana_(moth)": {"links": ["Animal", "Insect"], "depth": 0},
#             "Animal": {"links": [...], "depth": 1},
#             ...
#         }
#     """
#     graph = {}
    
#     print(f"Scraping main page: {start_page}")
    
#     # Scrape starting page
#     start_url = f'https://en.wikipedia.org/wiki/{start_page}'
#     child_links = scrape_page(start_url)
    
#     graph[start_page] = {
#         'links': child_links,
#         'depth': 0
#     }
    
#     # Scrape each child, but only keep links to other children
#     for child in child_links:
#         print(f"Scraping child: {child}")
#         child_url = f'https://en.wikipedia.org/wiki/{child}'
#         all_links = scrape_page(child_url)
        
#         # Filter: only keep links that are also children of start_page
#         filtered_links = [link for link in all_links if link in child_links]
        
#         graph[child] = {
#             'links': filtered_links,
#             'depth': 1
#         }
    
#     print(f"Finished! Main page + {len(child_links)} children")
#     return graph