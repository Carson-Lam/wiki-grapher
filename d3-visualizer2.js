// DIMENSIONS
const width = window.innerWidth;
const height = window.innerHeight;

const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
}

const plot_width = width - margin.left - margin.right;
const plot_height = height - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style({
        'background': 'red',
        'color': 'white',
        'width': '90px',
    });

d3.json("https://raw.githubusercontent.com/Carson-Lam/wiki-grapher/refs/heads/main/graph_data.json").then(function(data) {
    console.log("Nodes: ", data.nodes);
    console.log("Links: ", data.links);
    var nodes = data["nodes"];
    var links = data["links"];

    // var force = d3.layout.forceSimulation()
    //     .size([width, height])
    //     .nodes(d3.values(nodes))
    //     .links(links)
    //     .on("tick", tick)
    //     .linkDistance(300)
    //     .start();
    var force = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(function(d) { return d.id; }).distance(300))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", tick);

    var link = svg.selectAll('.link')
        .data(links)
        .enter().append('line')
        .attr("class", "link");

    var node = svg.selectAll('.node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'node')

    function tick() {
        node.attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });


        link.attr('x1', function (d) {
                return d.source.x
            })
            .attr('y1', function (d) {
                return d.source.y
            })
            .attr('x2', function (d) {
                return d.target.x
            })
            .attr('y2', function (d) {
                return d.target.y
            })
    }

}).catch(function (error) {
    console.log("Error loading the JSON: ", error);
});