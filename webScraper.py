from bs4 import BeautifulSoup
import requests


url = 'https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'lxml')
table = soup.find('table', class_= 'wikitable')
rows = table.find_all('tr')[1:]
for row in rows: 
    cols=row.find_all('td')
    if cols: #ensures row has data (skip empty rows)
        country=cols[0].text.strip()
        region = cols[5].text.strip()
        print("Country: " + country + "  Region: " + region)



