from bs4 import BeautifulSoup

with open('home.html', 'a') as html_file:
    content = html_file.read()
    print(content)