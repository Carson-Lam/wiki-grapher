# Wikipedia Scraper & Visualizer

## Overview

An intuitive Wikipedia Web Scraper that graphically represents the interconnectivity between Wikipedia's many pages.

## Features

- Clickable, draggable, fully movable nodes & graph w a physics simulation!
- **Hover** nodes to see connections (pages that the page links to in the graph)
- **Click** nodes to see its corresponding wikipedia page
- **Adjust** the graph using the live options panel

## Run & visit

#### Available on https://wiki-grapher.vercel.app/

*If you want to run the app on your local machine, feel free to [email me](mailto:lamcn51@gmail.com)*

## Dependencies
This app uses a Python backend and a React frontend bundled with Vite.

**Python Libraries** <br>

1. [Requests](https://pypi.org/project/requests/) for Wikipedia API calls (along with SSE)
2. [BeautifulSoup](https://pypi.org/projectbeautifulsoup4/) for BFS Wikipedia Page Scraping & streaming 
3. [Flask](https://flask.palletsprojects.com/en/stable/) to provide scraping and stopping API endpoints 

**Javascript Libraries:** <br>
1. [D3](https://d3js.org/) for additional graph physics 
2. [React-Force-Graph](https://www.npmjs.com/package/react-force-graph-2d) for main graph node & edge construction
3. [React-Hot-Toast](https://www.npmjs.com/package/react-hot-toast) for alert and state handling

**Additional assets:**
- [Linux Libertine](https://www.dafont.com/linux-libertine.font) font
- [Hoefler Text](https://fontsgeek.com/fonts/Hoefler-Text-Regular) font
- [Wikimedia](https://commons.wikimedia.org/wiki/File:Wikipedia_logo_outline.svg#Licensing) logo


