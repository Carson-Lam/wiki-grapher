# Author: Carson Lam

from bs4 import BeautifulSoup
import requests
import re

# Testable inputs:
# Longer: https://en.wikipedia.org/wiki/Fungus
# Shorter: https://en.wikipedia.org/wiki/Rozellida
# Shortest: https://en.wikipedia.org/wiki/Marie_Maxime_Cornu

# Build the soup object
url = 'https://en.wikipedia.org/wiki/Marie_Maxime_Cornu'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'lxml')

# Body and stop point handling
stop_element = soup.select_one('h2#See_also, h2#References') # stop at either See Also/References
title = soup.find('h1', id = 'firstHeading')                 # (some pages have no See Also)
body = [title] + list(title.find_all_next(True)) # Get all body elements

# Link storage
seen_links = set()
unique_links = []

# Helper method for appending unique links
def add_unique_links(elements):
    for element in elements:
        href = element.get('href')
        img = element.find('img')

        # Ensure link exists, has no image, is not internal, and unique
        if href and not img and not re.match(r'^/wiki/(Wikipedia:|Talk:|Special:)', href) and href not in seen_links: 
            seen_links.add(href)                      
            unique_links.append(element)

for element in body:
    if element == stop_element:
        break

    if element == title:
        print(f'Extracted title {title.text}')

    # Add links retrieved from paragraphs and image captions
    if element.name == 'p' or element.name == 'figcaption' or element.name == 'ul':
        add_unique_links(element.find_all('a', href=re.compile('^/wiki/')))

    # Add links retrieved from table
    if element.name == 'table':
        for row in element.find_all('tr'): 
            add_unique_links(row.find_all('a', href=re.compile('^/wiki/')))

for link in unique_links:
    print(f'Extracted link {link.get('href')} with title {link.get('title')}')



 
