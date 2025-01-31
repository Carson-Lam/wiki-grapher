from bs4 import BeautifulSoup
import requests


url = 'https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'lxml')

countries = soup.find_all('tr')
for country in countries: 
    print(country)


