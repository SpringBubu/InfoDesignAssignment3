import { loadDatasetB } from "../utils/index.js";

// ################## Note: Why calc em to pixel? Can't use em directly in svg digram?
const EM = 16;

// TODO:
//  - [~] add interactivity (missing per 100g of protein view)
//  - [~] adjust text to be actually readable
//  - [ ] adjust color scheme
//  - [ ] adjust sizing
// Inspired by
// - https://d3-graph-gallery.com/graph/scatter_basic.html
// - https://d3-graph-gallery.com/graph/interactivity_zoom.html
// - https://gist.github.com/d3noob/3aa3bbe05ee97b35af660c25ee27213b
// - https://observablehq.com/@d3/zoomable-scatterplot
export async function scatter() {

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

    loadDatasetB().then(data => {

        // some "aliases" to make life easier
        const xAxisData = "Land use per kilogram";
        const yAxisData = "Ghg emissions per kilogram";
        const radiusData = "Freshwater withdrawals per kilogram";

        const xAxisDataProtein = "Land use per 100g protein";
        const yAxisDataProtein = "Ghg emissions per 100g protein";
        const radiusDataProtein = "Freshwater withdrawals per 100g protein";

        // create diagram axes based on biggest element in data set
        const xMax = d3.max(data, d => +d[xAxisData]) + 20; // +20 to prevent clipping
        const yMax = d3.max(data, d => +d[yAxisData]) + 20;
        const rMax = d3.max(data, d => +d[radiusData]);

        // console.log(data); console.log(yMax); console.log(xMax); console.log(rMax);

        const x = d3.scaleLinear()
            .domain([0, Math.ceil(xMax)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, Math.ceil(yMax)])
            .range([height, 0]);

        const xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height})`) // translate x-axis to bottom
            .call(d3.axisBottom(x)); // set on which side of the axis the labels should be

        const yAxis = svg.append("g")
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
        const scatter = svg.append('g')
            .attr("clip-path", "url(#clip)")

        const node = scatter.selectAll("circle")
            .data(data)
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

        // Zooming:
        const zoom = d3.zoom()
            .scaleExtent([.5, 300])
            .extent([[0, 0], [width, height]])
            .on("zoom", update);

        // clipping plane
        svg.append("defs")
            .append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // invisible rectangle over graph that reacts to mouse events
        const zoomArea = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

        function update({transform}) {
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

        // reset button
        const resetButton = d3.select("#scatterplot")
            .insert("button", ":first-child")
            .text("Reset");

        resetButton.on("click", function() {
            zoomArea.transition()
                .duration(500)
                .call(zoom.transform, d3.zoomIdentity);
        })
    });
}
