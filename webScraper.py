# Author: Carson Lam

from bs4 import BeautifulSoup
import requests
import re
import json

# Testable inputs:
# Longer: https://en.wikipedia.org/wiki/Fungus
# Shorter: https://en.wikipedia.org/wiki/Rozellida
# Shortest: https://en.wikipedia.org/wiki/Fergana_(moth)

# Build the soup object
url = 'https://en.wikipedia.org/wiki/Fergana_(moth)'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'lxml')

# Body and stop point handling
stop_element = soup.select_one('h2#See_also, h2#References') # stop at either See Also/References
title = soup.find('h1', id = 'firstHeading')                 # (some pages have no See Also)
body = [title] + list(title.find_all_next(True)) # Get all body elements

# Link and Link Size storage
# Node key (id) storage
seen_links = set()
edges = []
id = -1
ids = {}

# Helper method for appending unique links
def add_unique_links(elements):
    global id
    for element in elements:
        href = element.get('href')
        img = element.find('img')
        
        # Ensure link exists, has no image, is not internal, and unique
        if href and not img and not re.match(r'^/wiki/(Wikipedia:|Talk:|Special:|File:|Help:|Category:)', href) and href not in seen_links: 

            #Retrieve size of link's page 
            # response = requests.get(f'https://en.wikipedia.org{href}')
            # linkSize = len(response.content)

            # Add link to seen_links as href and as a node to edgelist dictionary 
            id += 1
            seen_links.add(href)      
            target = href.replace('/wiki/', '') 

            # Assign an ID (Key) to unique pages
            if target not in ids:
                ids[target] = id

            # Edgelist dictionary has: source (source page), target (link's page), current page ID, source page ID
            # ---size (link's pagesize) IN PROGRESS---
            edges.append({
                'source': title.text, 
                'target': href.replace('/wiki/', ''),
                'page-id': ids[target],
                'source-id': 0 #Set source ID to title page
                # 'size': linkSize
            })

# Iterate through scraped data
for element in body:
    # Stop scraping at end of page
    if element == stop_element:
        break

    # Scrape title
    if element == title:
        print(f'Extracted title {title.text}')

    # Add links retrieved from paragraphs, lists, and image captions
    if element.name == 'p' or element.name == 'figcaption' or element.name == 'ul':
        add_unique_links(element.find_all('a', href=re.compile('^/wiki/')))

    # Add links retrieved from table
    if element.name == 'table':
        for row in element.find_all('tr'): 
            add_unique_links(row.find_all('a', href=re.compile('^/wiki/')))

# Format dictionary "edges" into two json lists
graph_data = {
    'nodes': [{'id': link['page-id'], 'label': link['target']} for link in edges],
    'links': [{'source': link['source-id'], 'target': link['page-id']} for link in edges]
}

# Print to json file
with open('graph_data.json', 'w') as f:
    json.dump(graph_data, f, indent = 4)

print('Graph data saved!')


# DEBUG
# print('Graph Data:')
# print(graph_data)