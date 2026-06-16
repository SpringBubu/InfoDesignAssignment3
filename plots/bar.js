import { loadDatasetA } from "../utils/index.js";

const margins = {
    top: 20,
    left: 150,
    right: 150,
    bottom: 10
}
const width = 1000;
const height = 1500;

// "bar" short for Dr. John Bar
export async function bar() {
    // create SVG
    const svg = d3.select("#bar-chart")
        .append("svg")
            .attr("id", "barChartSVG")
            .attr("width", width + margins.left + margins.right)
            .attr("height", height + margins.top + margins.bottom)
        .append("g")
            .attr("id", "barChartViewport")
            .attr("transform", `translate(${margins.left}, ${margins.top})`);

    loadDatasetA().then(nestedData => {

        // flatten, filter & sort data
        const data = nestedData
            .flat()
            .filter(entry => entry["PRODUCTION"] !== "")
            .sort((a, b) => b["PRODUCTION"] - a["PRODUCTION"]);

        // console.log(data); console.log(nestedData);

        const x = d3.scaleSqrt()
            .domain([0, d3.max(data, entry => +entry["PRODUCTION"])])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(data.map(entry => entry["Values"]))
            .range([0, height])
            .padding(0.1);

        const xAxis = svg.append("g")
            .call(d3.axisTop(x));

        const yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
                .attr("x", x(0))
                .attr("y", function(entry) { return y(entry["Values"]); } )
                .attr("width", function(entry) { return x(entry["PRODUCTION"]); })
                .attr("height", y.bandwidth())
                .attr("fill", "var(--accent)")
    });
}