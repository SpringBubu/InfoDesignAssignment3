import { loadDatasetB } from "../utils/index.js";

// ################## Note: Why calc em to pixel? Can't use em directly in svg digram?
const EM = 16;

// diagram size stuff, the width/height refer to the diagram's size, not the SVG's
// margins will be used to push axis labels into the viewport
const margins = {
    top: 10,
    right: 300,
    bottom: 40,
    left: 160
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
//  - [~] adjust text to be actually readable
//  - [ ] adjust color scheme
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
        .attr("type", "radio")
        .attr("value", "kilogram")
        .attr("name", "scatter")
        .attr("checked", "true");

    views.append("label")
        .html("per kilogram");

    views.append("input")
        .attr("type", "radio")
        .attr("value", "protein")
        .attr("name", "scatter");

    views.append("label")
        .html("per 100g protein");

    loadDatasetB().then(data => {
        let unit = d3.select('input[name="scatter"]:checked').node().value;
        createPlot(data, unit);

        views.on("change", function() {
            unit = d3.select('input[name="scatter"]:checked').node().value;
            d3.select("#scatterPlotGraph").remove()
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
        .call(d3.axisBottom(x)); // set on which side of the axis the labels should be

    const yAxis = viewport.append("g")
        .call(d3.axisLeft(y));

    // add labels
    viewport.append("text")
        .attr("x", -margins.left)
        .attr("y", margins.top)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text("Greenhouse gas");

    viewport.append("text")
        .attr("x", -margins.left)
        .attr("y", margins.top + 0.75 * EM)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text("emissions, in");

    viewport.append("text")
        .attr("x", -margins.left)
        .attr("y", margins.top + 1.5 * EM)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text(`C0₂ per ${ unit === "kilogram" ? "kg" : "100g of protein"}`);

   viewport.append("text")
        .attr("x", width + EM)
        .attr("y", height + 0.5 * EM)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text(`Land use, in m² per ${ unit === "kilogram" ? "kg" : "100g of protein"}`);

    viewport.append("text")
        .attr("x", width + EM)
        .attr("y", margins.top)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text("Bubble size");
    viewport.append("text")
        .attr("x", width + EM)
        .attr("y", margins.top + 0.75 * EM)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text("=");
    viewport.append("text")
        .attr("x", width + EM)
        .attr("y", margins.top + 1.5 * EM)
        .attr("font-size", "0.75em")
        .attr("font-weight", "bold")
        .text(`Freshwater withdrawals per ${unit === "kilogram" ? "kg" : "100g of protein"}`);

    // create scatter plot points
    const scatter = viewport.append('g')
        .attr("clip-path", "url(#clip)")

    // remove incomplete entry of per protein data
    const filteredData = unit === "protein"
        ? data.filter(entry => {
            return entry[ghgEmissionsProtein] !== ""
                && entry[landUseProtein]      !== ""
                && entry[freshwaterProtein]   !== "";
        })
        : data;

    const node = scatter.selectAll("circle")
        .data(filteredData)
        .enter();

    node.append("circle")
        .attr("r", function (entry) { return +entry[radiusData] / (rMax * 0.05) })
        .attr("cx", function (entry) { return x(+entry[xAxisData]); })
        .attr("cy", function (entry) { return y(+entry[yAxisData]); })
        .style("fill", "#FF0000");

    node.append("text")
        .attr("x", function (entry) { return x(+entry[xAxisData]); })
        .attr("y", function (entry) { return y(+entry[yAxisData]); })
        .text(function (entry) { return entry["Entity"] });

    // Zooming and panning stuff:

    function updateViewport({transform}) {
        const newX = transform.rescaleX(x);
        const newY = transform.rescaleY(y);
        const scale = transform.k;

        xAxis.call(d3.axisBottom(newX))
        yAxis.call(d3.axisLeft(newY))

        scatter.selectAll("circle")
            .attr("r", function (entry) { return (+entry[radiusData] * scale / (rMax * 0.05)) })
            .attr("cx", function (entry) { return newX(+entry[xAxisData]); })
            .attr("cy", function (entry) { return newY(+entry[yAxisData]); });

        scatter.selectAll("text")
            .attr("x", function (entry) { return newX(+entry[xAxisData]); })
            .attr("y", function (entry) { return newY(+entry[yAxisData]); });
    }

    const zoom = d3.zoom()
        .scaleExtent([.5, 300])
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
    d3.select("#scatterPlotReset").on("click", function() {
        zoomArea.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity);
    });
}