
from bs4 import BeautifulSoup
import requests
import re
import json
import math # For visualization
from pyvis.network import Network

def scrape_page(url):
    """
    Scrapes a single Wikipedia page and returns a list of linked pages.
    
    Args:
        url: Full Wikipedia URL (e.g., 'https://en.wikipedia.org/wiki/Fergana_(moth)')
    
    Returns:
        list: Page names that this page links to (e.g., ['Animal', 'Insect', 'Moth'])
    """

    # Wikipedia robot policy
    headers = {
    'User-Agent': 'WikiGrapher/1.0 (Educational Project; lamcn51@example.com)'
    }

    # Build the soup object
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'lxml')

    # Body and stop point handling
    stop_element = soup.select_one('h2#See_also, h2#References') # stop at either See Also/References
    title = soup.find('h1', id = 'firstHeading')                 # (some pages have no See Also)
    body = [title] + list(title.find_all_next(True)) # Get all body elements

    # Link storage
    seen_links = set()
    links = []
    # link_ids = []
    # link_id = 0

    # Helper to add unique links
    def add_unique_links(elements):

        # nonlocal link_id
        for element in elements:
            href = element.get('href')
            img = element.find('img')
            
            # Ensure link exists, has no image, is not internal, and unique
            if href and not img and not re.match(r'^/wiki/(Wikipedia:|Talk:|Special:|File:|Help:|Category:)', href) and href not in seen_links:
                
                # link_id += 1
                seen_links.add(href)
                page_name = href.replace('/wiki/', '')
                links.append(page_name)

                # if link_id not in link_ids:
                #     link_ids.append(enumerate(page_name))
    
    # Iterate through scraped data
    for element in body:
        # Stop scraping at end of page
        if element == stop_element:
            break
        
        # Add links from paragraphs, lists, and image captions
        if element.name == 'p' or element.name == 'figcaption' or element.name == 'ul':
            add_unique_links(element.find_all('a', href=re.compile('^/wiki/')))
        
        # Add links from tables
        if element.name == 'table':
            for row in element.find_all('tr'):
                add_unique_links(row.find_all('a', href=re.compile('^/wiki/')))
    
    return links #, link_ids


def scrape_subpage(url):
    """
    Scrapes a child page and returns a list of other child pages it links to
    
    Args:
        url: Full Wikipedia URL (e.g., 'https://en.wikipedia.org/wiki/Fergana_(moth)')
    
    Returns:
        list: Page names that this page links to (e.g., ['Animal', 'Insect', 'Moth'])
    """

    # Wikipedia robot policy
    headers = {
    'User-Agent': 'WikiGrapher/1.0 (Educational Project; lamcn51@example.com)'
    }

    # Build the soup object
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'lxml')

    # Body and stop point handling
    stop_element = soup.select_one('h2#See_also, h2#References') # stop at either See Also/References
    title = soup.find('h1', id = 'firstHeading')                 # (some pages have no See Also)
    body = [title] + list(title.find_all_next(True)) # Get all body elements

    # Link storage
    seen_links = set()
    links = []

    # Helper to add unique links
    def add_unique_links(elements):

        for element in elements:
            href = element.get('href')
            img = element.find('img')
            page_name = href.replace('/wiki/', '')

            
            # Ensure link exists, has no image, is not internal, and unique
            if href and not img and not re.match(r'^/wiki/(Wikipedia:|Talk:|Special:|File:|Help:|Category:)', href) and href not in seen_links and page_name in childLinks:
                seen_links.add(href)
                links.append(page_name)

    
    # Iterate through scraped data
    for element in body:
        # Stop scraping at end of page
        if element == stop_element:
            break
        
        # Add links from paragraphs, lists, and image captions
        if element.name == 'p' or element.name == 'figcaption' or element.name == 'ul':
            add_unique_links(element.find_all('a', href=re.compile('^/wiki/')))
        
        # Add links from tables
        if element.name == 'table':
            for row in element.find_all('tr'):
                add_unique_links(row.find_all('a', href=re.compile('^/wiki/')))
    
    return links #, link_ids


# FIND OVERLAPPING GRANDCHILD PAGES
# def find_overlaps(adjlist):
#     overlaps = {}

#     parents = list(adjlist.keys())

#     for i in range(len(parents)):
#         for j in range(i + 1, len(parents)):
#             parent1 = parents[i]
#             parent2 = parents[j]

#             children1 = set(adjlist[parent1])
#             children2 = set(adjlist[parent2])
#             shared = children1.intersection(children2)

#             overlaps[f"{parent1}, {parent2}"] = list(shared)

#     return overlaps


def visualize_one_level_only(adjlist, start_page, output_file='graph.html'):
    """
    Only visualize the starting page and pages it directly links to.
    """
    net = Network(height='1080PX', width='1920PX', directed=True)
    net.toggle_physics(False)
    # net.barnes_hut(gravity=-80000, central_gravity=0.3, spring_length=250)
    
    # Get the starting page's links
    if start_page not in adjlist:
        print(f"Error: {start_page} not in adjacency list")
        return
    
    directLinks = adjlist[start_page]
    
    # To make graph look prettier
    radius = 300  
    n = len(directLinks)
    
    # Add starting page
    net.add_node(start_page, label=start_page, color='red', size=30)
    
    # Add all direct links as nodes FIRST
    for i, childLink in enumerate(directLinks):

        # To make graph look prettier
        angle = 2 * math.pi * i / n
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)

        net.add_node(childLink, label=childLink, color='lightblue', size=20, x=x, y=y)
        net.add_edge(start_page, childLink, smooth = False)

    for childLink in directLinks:
        for grandchildLink in adjlist[childLink]:
            net.add_edge(childLink, grandchildLink, color = 'green', smooth = False)

    
    # # NOW add connections between direct links
    # for child in direct_links:
    #     if child in adjlist:
    #         for grandchild in adjlist[child]:
    #             if grandchild in direct_links:  # Only show if it's also a direct link
    #                 if not net.get_node(grandchild):
    #                     net.add_node(grandchild, label=grandchild, color='lightblue', size=20)
    #                 net.add_edge(child, grandchild, color='green')

    
    net.save_graph(output_file)
    print(f"Graph saved to {output_file}")

# Testable inputs:
# Longer: https://en.wikipedia.org/wiki/Fungus
# Shorter: https://en.wikipedia.org/wiki/Rozellida
# Shortest: https://en.wikipedia.org/wiki/Fergana_(moth)

if __name__ == "__main__":
    wiki_search = input("Enter a wiki page title: ")
    url = f'https://en.wikipedia.org/wiki/{wiki_search}'
    print(f'Scraping: {url}' )
    
    # Child links of main url
    childLinks = scrape_page(url)
    for childLink in childLinks:
        print(childLink)

    adjlist = {}
    # overlaps = {}

    for childLink in childLinks:

        grandchildLinks = scrape_subpage("https://en.wikipedia.org/wiki/" + childLink)
        adjlist[childLink] = grandchildLinks
        # print("=" * 40)
        print("Getting Links for sublink:" + childLink)
        # print("=" * 40)
        # for link in grandchildLinks:
        #     print(link)

    with open("adjlist.json", "w") as f:
        json.dump(adjlist, f, indent=4)

    # overlaps = find_overlaps(adjlist)
    # with open("overlaps.json", "w") as f:
    #     json.dump(overlaps, f, indent=4)

    visualize_one_level_only(adjlist, f'{wiki_search}', 'wiki_graph.html')
    

    
    

