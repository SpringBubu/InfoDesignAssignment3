import { loadDatasetB } from "../utils/index.js";

// ################## Note: Why calc em to pixel? Can't use em directly in svg digram?
const EM = 16;

// diagram size stuff, the width/height refer to the diagram's size, not the SVG's
// margins will be used to push axis labels into the viewport
const margins = {
    top: 10,
    right: 60,
    bottom: 40,
    left: 60
};
const width = 500;
const height = 500;

// some "aliases" to make life easier
const landUseKg = "Land use per kilogram";
const ghgEmissionsKg = "Ghg emissions per kilogram";
const freshwaterKg = "Freshwater withdrawals per kilogram";

const landUseProtein = "Land use per 100g protein";
const ghgEmissionsProtein = "Ghg emissions per 100g protein";
const freshwaterProtein = "Freshwater withdrawals per 100g protein";

// TODO:
//  - [x] add interactivity
//  - [x] adjust text to be actually readable
//  - [x] adjust color scheme
//  - [ ] adjust sizing
// Inspired by
// - https://d3-graph-gallery.com/graph/scatter_basic.html
// - https://d3-graph-gallery.com/graph/interactivity_zoom.html
// - https://gist.github.com/d3noob/3aa3bbe05ee97b35af660c25ee27213b
// - https://observablehq.com/@d3/zoomable-scatterplot
// - https://stackoverflow.com/questions/28839161/d3js-creating-multiple-radio-buttons
export async function scatter() {

    // create SVG
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("id", "scatterPlotSVG")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("id", "scatterPlotViewport")
        .attr("transform", `translate(${margins.left}, ${margins.top})`);

    // prevents page scroll when zoom reaches max/min (from https://forum.babylonjs.com/t/how-to-avoid-scrolling-while-zooming/15609)
    svg.node().addEventListener("wheel", event => event.preventDefault())

    // add clipping plane to diagram
    svg.append("defs")
        .append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // reset button
    const resetButton = d3.select("#scatterplot")
        .insert("button", "svg")
        .attr("id", "scatterPlotReset")
        .text("Reset");

    // change view radio buttons
    const views = d3.select("#scatterplot")
        .insert("form", "svg");

    views.append("input")
        .attr("id", "radio-kg")
        .attr("type", "radio")
        .attr("value", "kilogram")
        .attr("name", "scatter")
        .attr("checked", "true");

    views.append("label")
        .html("per kilogram")
        .attr("for", "radio-kg");

    views.append("input")
        .attr("id", "radio-protein")
        .attr("type", "radio")
        .attr("value", "protein")
        .attr("name", "scatter");

    views.append("label")
        .html("per 100g protein")
        .attr("for", "radio-protein");

    loadDatasetB().then(data => {
        let unit = d3.select('input[name="scatter"]:checked').node().value;
        createPlot(data, unit);

        views.on("change", function () {
            unit = d3.select('input[name="scatter"]:checked').node().value;
            d3.select("#scatterPlotGraph")
                .transition()
                .duration(50)
                .style("opacity", "0.0")
                .remove();

            createPlot(data, unit);
        });
    });
}

function createPlot(data, unit) {
    const viewport = d3.select("#scatterPlotViewport")
        .append("g")
        .attr("id", "scatterPlotGraph");

    let xAxisData = unit === "kilogram" ? landUseKg : landUseProtein;
    let yAxisData = unit === "kilogram" ? ghgEmissionsKg : ghgEmissionsProtein;
    let radiusData = unit === "kilogram" ? freshwaterKg : freshwaterProtein;

    // create diagram axes based on biggest element in data set
    const xMax = d3.max(data, entry => +entry[xAxisData]) + 20; // +20 to prevent clipping
    const yMax = d3.max(data, entry => +entry[yAxisData]) + 20;
    const rMax = d3.max(data, entry => +entry[radiusData]);

    // console.log(data); console.log(yMax); console.log(xMax); console.log(rMax);

    const x = d3.scaleLinear()
        .domain([0, Math.ceil(xMax)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, Math.ceil(yMax)])
        .range([height, 0]);

    const xAxis = viewport.append("g")
        .attr("transform", `translate(0, ${height})`) // translate x-axis to bottom
        .style("opacity", "0.0")
        .call(d3.axisBottom(x)); // set on which side of the axis the labels should be

    const yAxis = viewport.append("g")
        .style("opacity", "0.0")
        .call(d3.axisLeft(y));

    xAxis.transition().duration(500).style("opacity", "1.0");
    yAxis.transition().duration(500).style("opacity", "1.0");

    // add labels
    viewport.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -margins.left * 0.6)
        .attr("font-size", "1em")
        .attr("font-weight", "bold")
        .text(`Greenhouse gas emissions, in C0₂ per ${unit === "kilogram" ? "kg" : "100g of protein"}`)
        .style("opacity", "0.0")
        .transition()
        .duration(500)
        .style("opacity", "1.0");

    viewport.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margins.bottom - margins.top * 0.5)
        .attr("font-size", "1em")
        .attr("font-weight", "bold")
        .text(`Land use, in m² per ${unit === "kilogram" ? "kg" : "100g of protein"}`)
        .style("opacity", "0.0")
        .transition()
        .duration(500)
        .style("opacity", "1.0");

    viewport.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", margins.top)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text(`Bubble size = Freshwater withdrawals in 1000l per ${unit === "kilogram" ? "kg" : "100g of protein"}`)
        .style("opacity", "0.0")
        .transition()
        .duration(500)
        .style("opacity", "1.0");

    // create scatter plot points
    const scatter = viewport.append('g')
        .attr("clip-path", "url(#clip)")

    // remove incomplete entry of per protein data
    const filteredData = unit === "protein"
        ? data.filter(entry => {
            return entry[ghgEmissionsProtein] !== ""
                && entry[landUseProtein] !== ""
                && entry[freshwaterProtein] !== "";
        })
        : data;

    const node = scatter.selectAll("circle")
        .data(filteredData)
        .enter();

    const milli = 0.001;

    node.append("circle")
        .attr("r", function (entry) { return entry[radiusData] * milli })
        .attr("cx", function (entry) { return x(+entry[xAxisData]); })
        .attr("cy", function (entry) { return y(+entry[yAxisData]); })
        .style("fill", "var(--accent)")
        .style("opacity", "0.0")
        .transition()
        .duration(500)
        .style("opacity", "0.8");

    node.append("text")
        .attr("font-size", function (entry) {
            const size = entry[radiusData] * milli;
            return size > 3 ? size : 0;
        })
        .attr("x", function (entry) { return x(+entry[xAxisData]) + entry[radiusData] * milli; })
        .attr("y", function (entry) { return y(+entry[yAxisData]) + entry[radiusData] * milli * 0.3; })
        .style("opacity", "0.0")
        .transition()
        .duration(500)
        .style("opacity", "0.8")
        .text(function (entry) { return entry["Entity"] });

    // Zooming and panning stuff:

    function updateViewport({ transform }) {
        const newX = transform.rescaleX(x);
        const newY = transform.rescaleY(y);
        const scale = transform.k;

        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        scatter.selectAll("circle")
            .attr("r", function (entry) { return entry[radiusData] * milli * scale })
            .attr("cx", function (entry) { return newX(+entry[xAxisData]); })
            .attr("cy", function (entry) { return newY(+entry[yAxisData]); });

        scatter.selectAll("text")
            .attr("x", function (entry) { return newX(+entry[xAxisData]) + entry[radiusData] * milli * scale; })
            .attr("y", function (entry) { return newY(+entry[yAxisData]) + entry[radiusData] * milli * 0.3 * scale; })
            .attr("font-size", function (entry) {
                const size = entry[radiusData] * milli * scale;
                return size > 3 ? size : 0;
            })
            ;
    }

    const zoom = d3.zoom()
        .scaleExtent([.5, 500])
        .extent([[0, 0], [width, height]])
        .on("zoom", updateViewport);

    // invisible rectangle over graph that reacts to mouse events
    const zoomArea = viewport.append("rect")
        .attr("id", "scatterPlotZoomArea")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    // add functionality to reset button
    d3.select("#scatterPlotReset").on("click", function () {
        zoomArea.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity);
    });
}