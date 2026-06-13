const EM = 16; // 1em = 16px, to make some computations a bit better

function meow() {
    window.alert("meow");
    console.log("meowed");
}

function main() {
    barChart().then(() => console.log("loaded bar chart"));
    sankey().then(() => console.log("loaded sankey diagram"));
    scatterPlot().then(() => console.log("loaded scatter plot"));
    networkGraph().then(() => console.log("loaded network graph"));
}

function loadVersorgungsbilanzen() {
    return d3.csv("./data/barChart/data.csv")
        // Promise.all([
        //     d3.csv("./data/raw/Bier.csv"),
        //     d3.csv("./data/raw/Eier.csv"),
        //     d3.csv("./data/raw/Fische.csv"),
        //     d3.csv("./data/raw/Fleisch.csv"),
        //     d3.csv("./data/raw/Geflügel.csv")
        // ])
        .catch(function (err) {
            console.error(`Something went wrong when trying to read data: ${err}`);
            return[];
        });
}

function loadFoodFootprints() {
    return d3.csv("./data/scatterPlot/data.csv")
    .catch(function (err) {
        console.error(`Something went wrong when trying to read data: ${err}`);
        return [];
    });
}

function placeholder(id, color) {
    const svg = d3.select(`#${id}`)
        .append("svg")
            .attr("width", 100)
            .attr("height", 100)
        .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", color);
}

async function barChart() {
    placeholder("bar-chart", "purple");
}

async function sankey() {
    placeholder("sankey", "cyan");
}

// TODO:
//  - [ ] add interactivity
//  - [ ] adjust text to be actually readable
//  - [ ] adjust color scheme
//  - [ ] adjust sizing
// Inspired by
// - https://d3-graph-gallery.com/graph/scatter_basic.html
// - https://gist.github.com/d3noob/3aa3bbe05ee97b35af660c25ee27213b
async function scatterPlot() {

    // diagram size stuff, the width/height refer to the diagram's size, not the SVG's
    // margins will be used to push axis labels into the viewport
    const margins = {
        top: 10,
        right: 300,
        bottom: 40,
        left: 125
    };
    const width = 500;
    const height = 500;

    // create SVG
    const svg = d3.select("#scatterplot")
        .append("svg")
            .attr("width", width + margins.left + margins.right)
            .attr("height", height + margins.top + margins.bottom)
        .append("g")
            .attr("transform", `translate(${margins.left}, ${margins.top})`);

    loadFoodFootprints().then(data => {

        // some "aliases" to make life easier
        const xAxisData = "Land use per kilogram";
        const yAxisData = "ghg_emissions_per_kilogram__poore__and__nemecek__2018";
        const radiusData = "Freshwater withdrawals per kilogram";

        // create diagram axes based on biggest element in data set
        const xMax = d3.max(data, d => +d[xAxisData]);
        const yMax = d3.max(data, d => +d[yAxisData]);
        const rMax = d3.max(data, d => +d[radiusData]);

        // console.log(data); console.log(yMax); console.log(xMax); console.log(rMax);

        const x = d3.scaleLinear()
            .domain([0, Math.ceil(xMax)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, Math.ceil(yMax)])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`) // translate x-axis to bottom
            .call(d3.axisBottom(x)); // set on which side of the axis the labels should be

        svg.append("g")
            .call(d3.axisLeft(y));

        // add labels
        svg.append("text")
            .attr("x", -margins.left)
            .attr("y", margins.top)
            .attr("font-size", "0.75em")
            .attr("font-weight", "bold")
            .text("Greenhouse gas");

        svg.append("text")
            .attr("x", -margins.left)
            .attr("y", margins.top + 0.75 * EM)
            .attr("font-size", "0.75em")
            .attr("font-weight", "bold")
            .text("emissions,");

        svg.append("text")
            .attr("x", -margins.left)
            .attr("y", margins.top + 1.5 * EM)
            .attr("font-size", "0.75em")
            .attr("font-weight", "bold")
            .text("in C0₂ per kg");

        svg.append("text")
            .attr("x", width + EM)
            .attr("y", height + 0.5 * EM)
            .attr("font-size", "0.75em")
            .attr("font-weight", "bold")
            .text("Land use, in m² per kg");

        svg.append("text")
            .attr("x", width + EM)
            .attr("y", margins.top)
            .attr("font-size", "0.75em")
            .attr("font-weight", "bold")
            .text("Bubble size = Freshwater withdrawals per kg");

        // create scatter plot points
        const node = svg.selectAll("dot")
            .data(data)
            .enter();

        node.append("circle")
            .attr("r", function (entry) { return +entry[radiusData] / (rMax * 0.05) })
            .attr("cx", function (entry) { return x(+entry[xAxisData]); })
            .attr("cy", function (entry) { return y(+entry[yAxisData]); })
            .style("fill", "#FF0000");

        node.append("text")
            .attr("x", function(entry) { return x(+entry[xAxisData]); })
            .attr("y", function(entry) { return y(+entry[yAxisData]); })
            .text(function(entry) { return entry["entity"] });
    });
}

async function networkGraph() {
    placeholder("network-graph", "gold");
}