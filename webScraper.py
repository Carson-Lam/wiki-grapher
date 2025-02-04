from bs4 import BeautifulSoup
import requests
import re

#Wikipedia page "Fungus" used for testing due to length
url = 'https://en.wikipedia.org/wiki/Amastigomycota'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'lxml')

#Body and stop point handling
stop_element = soup.find('h2', id='See_also')  # Find stop point
title = soup.find('h1', id = 'firstHeading')
body = soup.find_all(True) #Get all body elements

links = []

for element in body:
    if element == stop_element:
        break

    if element == title:
        print(f'Extracted title {title.text}')

    #Add links retrieved from paragraphs
    if element.name == "p":
        paraLinks = element.find_all('a', href=re.compile('/wiki/'))
        for paraLink in paraLinks:
            links.append(paraLink)
            # if paraLink not in links:
            #     links.append(paraLink)

    #Add links retrieved from image captions
    if element.name == "figcaption":
        capLinks = element.find_all('a', href=re.compile('/wiki/'))
        for capLink in capLinks:
            links.attend(capLink)
            # if capLink not in links:
            #     links.append(capLink)

    #Add links retrieved from table
    if element.name == "table":
        rows = element.find_all('tr')
        for row in rows: 
            #Gets each column cell in each row, going horizontally
            cols=row.find_all('td')
            for col in cols: #ensures row has data (skip empty rows)
                colLinks = col.find_all('a', href=re.compile('/wiki/'))
                for colLink in colLinks:
                    links.append(colLink)
                    # if colLink not in links and colLink.get('title'):
                    #     links.append(colLink)

                    # --- Alternate image exclusion method ---
                    # if colLink not in links and not re.search(r'\.(jpg|jpeg|png|gif)', colLink.get('href')):
                    #     links.append(colLink)

listUnique = list(set(links))

for link in listUnique:
    print(f'Extracted link {link.get('href')} with title {link.get('title')}')

