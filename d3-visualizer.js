function drawGraph(data){
    document.getElementsByTagName("h2")[0].innerHTML = "Graph of <i>Fergana</i> (Moth)";
}

function draw(){
    Promise.all([d3.json("graph_data.json"),
        d3.json("data/")
    
    )]
}

// DIMENSIONS
const width = 1400;
const height = 900;

const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
}

const plot_width = width - margin.left - margin.right;
const plot_height = height - margin.top - margin.bottom;

const canvas = d3.select('#canvas')
    .append('svg')
    .style('background', 'aliceblue')
    .attr('height', height)
    .attr('width', width);

const plot  = canvas.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);