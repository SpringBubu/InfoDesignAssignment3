import { loadDatasetA } from "../utils/index.js";

const margins = {
    top: 20,
    left: 150,
    right: 150,
    bottom: 10
}
const width = 1000;
const height = 1250;
const labelPadding = 15;

// This monstrosity rounds the input to two decimal digits while cutting of excess zeros.
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

// stuff for sorting
let isOrderedAlphabetical = false;
let isOrderedProduction = true;
let isOrderedConsumption = false;
let isOrderedReverse = false;

function alphabetical(a, b) {
    return a["Values"] > b["Values"] ? 1 : -1;
}

function alphabeticalReversed(a, b) {
    return a["Values"] < b["Values"] ? 1 : -1;
}

function productionDescending(a, b) {
    return b["PRODUCTION"] - a["PRODUCTION"];
}

function productionAscending(a, b) {
    return a["PRODUCTION"] - b["PRODUCTION"];
}

function consumptionDescending(a, b) {
    return getConsumption(b) - getConsumption(a);
}

function consumptionAscending(a, b) {
    return getConsumption(a) - getConsumption(b);
}

// TODO:
//  - [ ] add emojis
//  - [x] do something about the goddamn product labels (probably put it between the bars, as kind of a third column)
//  - [x] remove like half of the products, there's like 5 Austrians total that about skimmed milk powder
//  - [x] improve verbal description
//  - [x] add way to sort differently(???)
// "bar" short for Dr. John Bar
// inspired by:
// - https://observablehq.com/@avis-n/d3-sortable-bar-chart
// - https://observablehq.com/@d3/bar-chart-transitions/2
// - https://codesandbox.io/p/sandbox/d3-bar-chart-updating-rkb7s
// - https://stackoverflow.com/questions/61087443/d3-update-stacked-bar-graph-using-selection-join
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

        // Add chart area in svg
        const chart = viewport.append("g")
            .attr("transform", `translate(0, ${margins.top})`);

        // flatten, filter/remove elements with missing data & sort data
        const data = nestedData
            .flat()
            .filter(entry => entry["PRODUCTION"] !== "")
            .filter(entry => getConsumption(entry))
            .sort((a, b) => productionDescending(a, b));

        console.log(data); console.log(nestedData);

        // Add axes
        const xRight = d3.scaleLinear()
            .domain([0, Math.ceil(d3.max(data, entry => getConsumption(entry)))])
            .range([0, width * 0.5 - labelPadding * 1.5]);

        const xLeft = d3.scaleLinear()
            .domain([Math.ceil(d3.max(data, entry => +entry["PRODUCTION"])), 0])
            .range([labelPadding * 1.5, width * 0.5]);

        const y = d3.scaleBand()
            .domain(data.map(entry => entry["Values"]))
            .range([0, height])
            .padding(0.1);

        /*
        const xAxisLeft = chart.append("g")
            .call(d3.axisTop(xLeft))
            .attr("transform", `translate(${-labelPadding * 5})`);

        const xAxisRight = chart.append("g")
            .call(d3.axisTop(xRight))
            .attr("transform", `translate(${width * 0.5 + labelPadding * 5})`);
        */

        // add y axis to SVG
        const yAxis = chart.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "y-axis")
            .attr("transform", `translate(${width * 0.5})`);

        // style y axis labels
        yAxis.selectAll("text")
            .style("text-anchor", "middle")
            .attr("transform", `translate(${labelPadding * 0.65})`)

        // add axes labels
        viewport.append("text")
            .on("click", () => sortData("production"))
            .attr("font-weight", "bold")
            .text("Total production in Austria, in metric tonnes \u21C5")
            .style("opacity", "0.0")
            .transition()
            .duration(1500)
            .style("opacity", "1.0");

        viewport.append("text")
            .on("click", () => sortData("alphabetical"))
            .style("text-anchor", "middle")
            .attr("transform", `translate(${width * 0.5})`)
            .attr("font-weight", "bold")
            .text("Product \u21C5")
            .style("opacity", "0.0")
            .transition()
            .duration(1500)
            .style("opacity", "1.0");

        viewport.append("text")
            .on("click", () => sortData("consumption"))
            .style("text-anchor", "end")
            .attr("transform", `translate(${width})`)
            .attr("font-weight", "bold")
            .text("Per capita consumption, in kilograms or liters \u21C5")
            .style("opacity", "0.0")
            .transition()
            .duration(1500)
            .style("opacity", "1.0");

        // fill left chart with data and labels
        const updateBarsLeft = function (data) {
            chart.selectAll("rect.bar-left")
                .data(data, entry => entry["Values"])
                .join(
                    enter => enter.append("rect")
                        .attr("class", "bar-left")
                        .attr("x", xLeft(0) - labelPadding * 5)
                        .attr("y", entry => y(entry["Values"]))
                        .attr("height", y.bandwidth())
                        .attr("fill", "var(--accent)")
                        .transition()
                        .duration(700)
                        .attr("width", entry => xLeft(0) - xLeft(entry["PRODUCTION"]))
                        .attr("x", entry => xLeft(entry["PRODUCTION"]) - labelPadding * 5),
                    update => update.transition()
                        .duration(700)
                        .attr("y", entry => y(entry["Values"]))
                );

            chart.selectAll("text.label-left")
                .data(data, entry => entry["Values"])
                .join(
                    enter => enter.append("text")
                        .style("font-size", "0.75em")
                        .style("text-anchor", "end")
                        .attr("class", "label-left")
                        .attr("x", xLeft(0) - labelPadding * 5)
                        .attr("y", entry => y(entry["Values"]))
                        .attr("transform", `translate(${-labelPadding}, ${y.bandwidth() * 0.6})`)
                        .text(entry => `${formatNumber(entry["PRODUCTION"])} t`)
                        .transition()
                        .duration(700)
                        .attr("x", entry => xLeft(entry["PRODUCTION"]) - labelPadding * 5),
                    update => update.transition()
                        .duration(700)
                        .attr("y", entry => y(entry["Values"]))
                );
        }

        // fill right chart with data and labels
        const updateBarsRight = function (data) {
            chart.selectAll("rect.bar-right")
                .data(data, entry => entry["Values"])
                .join(
                    enter => enter.append("rect")
                        .attr("class", "bar-right")
                        .attr("x", xRight(0) + labelPadding * 5)
                        .attr("y", entry => y(entry["Values"]))
                        .attr("height", y.bandwidth())
                        .attr("fill", "gold")
                        .attr("transform", `translate(${width * 0.5})`)
                        .transition()
                        .duration(700)
                        .attr("width", entry => xRight(getConsumption(entry))),
                    update => update.transition()
                        .duration(700)
                        .attr("y", entry => y(entry["Values"]))
                );

            chart.selectAll("text.label-right")
                .data(data, entry => entry["Values"])
                .join(
                    enter => enter.append("text")
                        .style("font-size", "0.75em")
                        .attr("class", "label-right")
                        .attr("transform", `translate(${width * 0.5 + labelPadding * 6}, ${y.bandwidth() * 0.6})`)
                        .attr("y", entry => y(entry["Values"]))
                        .text(entry => formatNumber(getConsumption(entry)) + consumptionUnit(entry))
                        .transition()
                        .duration(700)
                        .attr("x", entry => xRight(getConsumption(entry))),
                    update => update.transition()
                        .duration(700)
                        .attr("y", entry => y(entry["Values"]))
                );
        }

        updateBarsLeft(data);
        updateBarsRight(data);

        // interaction / sorting
        function updateChart(order) {
            data.sort(order);

            y.domain(data.map(entry => entry["Values"]));
            yAxis.transition()
                .duration(700)
                .call(d3.axisLeft(y));

            updateBarsLeft(data);
            updateBarsRight(data);

            console.log(data);
        }

        function sortData(order) {
            switch(order) {
                case "alphabetical":
                    if (!isOrderedAlphabetical || isOrderedAlphabetical && isOrderedReverse) {
                        updateChart(alphabetical);
                        isOrderedAlphabetical = true;
                        isOrderedProduction = isOrderedConsumption = isOrderedReverse = false;
                    } else {
                        updateChart(alphabeticalReversed);
                        isOrderedReverse = true;
                    }
                    break;
                case "production":
                    if (!isOrderedProduction || isOrderedProduction && isOrderedReverse) {
                        updateChart(productionDescending);
                        isOrderedProduction = true;
                        isOrderedAlphabetical = isOrderedConsumption = isOrderedReverse = false;
                    } else {
                        updateChart(productionAscending);
                        isOrderedReverse = true;
                    }
                    break;
                case "consumption":
                    if (!isOrderedConsumption || isOrderedConsumption && isOrderedReverse) {
                        updateChart(consumptionDescending);
                        isOrderedConsumption = true;
                        isOrderedAlphabetical = isOrderedProduction = isOrderedReverse = false;
                    } else {
                        updateChart(consumptionAscending);
                        isOrderedReverse = true;
                    }
                    break;
                default:
                    console.error(`Invalid ordering: ${order}`);
            }
        }
    });
}