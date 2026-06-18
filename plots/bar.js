import { loadDatasetA } from "../utils/index.js";

const margins = {
    top: 20,
    left: 150,
    right: 150,
    bottom: 10
}
const width = 1000;
const height = 2500;

const labelPadding = 10;

// This monstrosity cuts of rounds the input to two decimal digits while cutting of excess zeros.
// Additionally, it formats larger numbers to have point separators.
function formatNumber(num) {
    return new Intl.NumberFormat("de-DE", { style: "decimal" }).format(+parseFloat(num).toFixed(2));
}

// helper function because the data's CSV use different units
function getConsumption(entry) {
    return +entry["Human consumption per capita (in kg)"]
        || +entry["Human consumption per capita (in l)"]
        || +entry["Human consumption per capita (in pcs / in kg)"];
}

function consumptionUnit(entry) {
    return !entry["Human consumption per capita (in l)"] ? " kg" : " l";
}

// TODO:
//  - [ ] add emojis
//  - [ ] do something about the goddamn product labels (probably put it between the bars, as kind of a third column)
//  - [ ] remove like half of the products, there's like 5 Austrians total that about skimmed milk powder
//  - [ ] improve verbal description
//  - [ ] add way to sort differently(???)
// "bar" short for Dr. John Bar
export async function bar() {
    // create SVG
    const svg = d3.select("#bar-chart")
        .append("svg")
            .attr("id", "barChartSVG")
            .attr("width", width + margins.left + margins.right)
            .attr("height", height + margins.top + margins.bottom)

    const viewport = svg.append("g")
            .attr("id", "barChartViewport")
            .attr("transform", `translate(${margins.left}, ${margins.top})`);

    loadDatasetA().then(nestedData => {

        // flatten, filter/remove elements with missing data & sort data
        const data = nestedData
            .flat()
            .filter(entry => entry["PRODUCTION"] !== "")
            .filter(entry => getConsumption(entry))
            .sort((a, b) => b["PRODUCTION"] - a["PRODUCTION"]);

        // console.log(data); console.log(nestedData);

        const xRight = d3.scaleLinear()
            .domain([0, Math.ceil(d3.max(data, entry => getConsumption(entry)))])
            .range([0, width * 0.5]);

        const xLeft = d3.scaleLinear()
            .domain([Math.ceil(d3.max(data, entry => +entry["PRODUCTION"])), 0])
            .range([0, width * 0.5]);

        const y = d3.scaleBand()
            .domain(data.map(entry => entry["Values"]))
            .range([0, height])
            .padding(0.1);

        /* TODO: not sure if we actually want no axes at all like our design document seems to suggest
        const xAxisLeft = svg.append("g")
            .call(d3.axisTop(xLeft));

        const xAxisRight = svg.append("g")
            .call(d3.axisTop(xRight))
            .attr("transform", `translate(${width * 0.5})`);

        */
        const yAxis = viewport.append("g")
            .call(d3.axisLeft(y))
            .attr("transform", `translate(${width * 0.5})`);

        viewport.append("text")
            .attr("font-weight", "bold")
            .text("Total production in Austria, in metric tonnes")
            .style("opacity", "0.0")
            .transition()
            .duration(1500)
            .style("opacity", "1.0");

        viewport.append("text")
            .style("text-anchor", "end")
            .attr("transform", `translate(${width})`)
            .attr("font-weight", "bold")
            .text("Per capita consumption, in kilograms or liters")
            .style("opacity", "0.0")
            .transition()
            .duration(1500)
            .style("opacity", "1.0");

        const chart = viewport.append("g")
            .attr("transform", `translate(0, ${margins.top})`);

        chart.selectAll("rect.left")
            .data(data)
            .enter()
            .append("rect")
                .attr("x", xLeft(0))
                .attr("y", entry => y(entry["Values"]))
                .attr("height", y.bandwidth())
                .attr("fill", "var(--accent)")
                .transition()
                .duration(700)
                .attr("width", entry => xLeft(0) - xLeft(entry["PRODUCTION"]))
                .attr("x", entry => xLeft(entry["PRODUCTION"]));

        chart.selectAll("text.left")
            .data(data)
            .enter()
            .append("text")
                .attr("x", xLeft(0))
                .style("text-anchor", "end")
                .attr("y", entry => y(entry["Values"]))
                .attr("transform", `translate(${-labelPadding}, ${y.bandwidth() * 0.65})`)
                .text(entry => `${formatNumber(entry["PRODUCTION"])} t`)
                .transition()
                .duration(700)
                .attr("x", entry => xLeft(entry["PRODUCTION"]));

        chart.selectAll("rect.right")
            .data(data)
            .enter()
            .append("rect")
                .attr("x", xRight(0))
                .attr("y", entry => y(entry["Values"]))
                .attr("height", y.bandwidth())
                .attr("fill", "gold")
                .attr("transform", `translate(${width * 0.5})`)
                .transition()
                .duration(700)
                .attr("width", entry => xRight(getConsumption(entry)));

        chart.selectAll("text.right")
            .data(data)
            .enter()
            .append("text")
                .attr("transform", `translate(${width * 0.5 + labelPadding}, ${y.bandwidth() * 0.65})`)
                .attr("y", entry => y(entry["Values"]))
                .text(entry => formatNumber(getConsumption(entry)) + consumptionUnit(entry))
                .transition()
                .duration(700)
                .attr("x", entry => xRight(getConsumption(entry)));

        yAxis.raise(); // TODO: remove, temporary
    });
}