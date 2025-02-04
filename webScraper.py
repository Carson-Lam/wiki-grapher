from bs4 import BeautifulSoup
import requests
import re

# Wikipedia page "Fungus" used for testing due to length
url = 'https://en.wikipedia.org/wiki/Fungus'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'lxml')

# Body and stop point handling
stop_element = soup.find('h2', id='See_also')  # Find stop point
title = soup.find('h1', id = 'firstHeading')
body = soup.find_all(True) # Get all body elements

# Link storage
seen_links = set()
unique_links = []

def add_unique_links(elements):
    for element in elements:
        href = element.get('href')
        img = element.find('img')
        if href and not img and href not in seen_links: # Ensure link is unique, exists, and has no image
            seen_links.add(href)                      
            unique_links.append(element)

for element in body:
    if element == stop_element:
        break

    if element == title:
        print(f'Extracted title {title.text}')

    # Add links retrieved from paragraphs and image captions
    if element.name == "p" or element.name == "figcaption":
        add_unique_links(element.find_all('a', href=re.compile('/wiki/')))

    # Add links retrieved from table
    if element.name == "table":
        for row in element.find_all('tr'): 
            add_unique_links(row.find_all('a', href=re.compile('/wiki/')))

for link in unique_links:
    print(f'Extracted link {link.get('href')} with title {link.get('title')}')
 
