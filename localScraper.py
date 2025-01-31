from bs4 import BeautifulSoup

with open('home.html', 'r') as html_file:
    content = html_file.read()    
    soup = BeautifulSoup(content, 'lxml')
    section_cards = soup.find_all('div', class_='card')
    for section in section_cards:
        section_name = section.h5.text
        section_price = section.a.text.split()[-1] #spl its text by spaces and puts into array.
                                                 #-1 index grabs the last array element
        
        print(f'{section_name} has {section_price}')

 