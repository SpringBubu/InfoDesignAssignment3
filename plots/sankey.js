import { loadDatasetB } from "../utils/index.js";

const margin = { top: 8, right: 250, bottom: 8, left: 200 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

export async function sankey() {

    const svg = d3.select("#sankey").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const color = d3.scaleOrdinal()
        .domain(["Milk", "Loss", "Cheese", "GHG", "Land", "Water"])
        .range(["#aaa", "#555", "#fed330", "#da3939", "#26de81", "#45aaf2"]);

    const sankey = d3.sankey()
        .nodeWidth(30)
        .nodePadding(40)
        .size([width, height]);

    const setB = await loadDatasetB();
    console.log(setB);

    const product = "Cheese";
    const entry = setB.find(e => e["Entity"] == product);
    const raw = {
        waterWithdrawal: entry["Freshwater withdrawals per kilogram"],
        ghg: entry["Ghg emissions per kilogram"],
        landUse: entry["Land use per kilogram"],
    };
    const dist = {
        waterWithdrawal: raw.waterWithdrawal / 10,
        ghg: raw.ghg / 1,
        landUse: raw.landUse / 1,
    };
    const sum = dist.waterWithdrawal + dist.ghg + dist.landUse;
    dist.waterWithdrawal /= sum;
    dist.ghg /= sum;
    dist.landUse /= sum;
    console.log(dist);

    let showImpact = false;
    const dataBase = {
        nodes: [
            { name: "10L Raw Milk", id: "Milk" },
            { name: "9L Loss in Water", id: "Loss" },
            { name: "1kg Cheese", id: "Cheese" }
        ],
        links: [
            { source: 0, target: 1, value: 9 },
            { source: 0, target: 2, value: 1 }
        ]
    };

    const dataImpact = {
        nodes: [
            { name: "Raw Milk", id: "Milk", valueStr: "10L" },
            { name: "Loss in Water", id: "Loss", valueStr: "9L" },
            { name: "Cheese", id: "Cheese", valueStr: "1kg" },
            // Ebene 2 mit echten Einheiten:
            { name: "GHG emissions", id: "GHG", valueStr: raw.ghg + "kg" },
            { name: "Land use", id: "Land", valueStr: raw.landUse + "m²" },
            { name: "Water withdrawal", id: "Water", valueStr: raw.waterWithdrawal + "L" }
        ],
        links: [
            { source: 0, target: 1, value: 9 },
            { source: 0, target: 2, value: 1 },
            { source: 2, target: 3, value: dist.ghg * 10 },
            { source: 2, target: 4, value: dist.landUse * 10 },
            { source: 2, target: 5, value: dist.waterWithdrawal * 10 }
        ]
    };

    function update(data) {
        const graph = sankey(JSON.parse(JSON.stringify(data)));

        const link = svg.selectAll(".link")
            .data(graph.links, d => `${d.source.id}-${d.target.id}`);

        link.exit().transition().duration(500).style("opacity", 0).remove();

        const linkEnter = link.enter().append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.target.id))
            .style("stroke-width", d => Math.max(1, d.width))
            .style("opacity", 0);

        link.merge(linkEnter).transition().duration(800)
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke-width", d => Math.max(1, d.width))
            .style("opacity", 0.4);

        const node = svg.selectAll(".node")
            .data(graph.nodes, d => d.id);

        node.exit().transition().duration(500).style("opacity", 0).remove();

        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .style("opacity", 0)
            .on("click", (event, d) => {
                if (d.id === "Cheese") {
                    showImpact = !showImpact;

                    if (showImpact) update(dataImpact);
                    else update(dataBase);
                }
            });

        nodeEnter.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", sankey.nodeWidth())
            .style("fill", d => color(d.id))
            .style("cursor", d => d.id == "Cheese" ? "pointer" : "normal");

        nodeEnter.append("text")
            .attr("x", d => d.x0 < width / 2 ? -6 : 6 + sankey.nodeWidth())
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "end" : "start")
            .style("z-index", "1")
            .text(d => d.valueStr ? `${d.name} (${d.valueStr})` : d.name);

        const nodeMerge = node.merge(nodeEnter);

        nodeMerge.transition().duration(800)
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .style("opacity", 1);

        nodeMerge.select("rect").transition().duration(800)
            .attr("height", d => d.y1 - d.y0);

        nodeMerge.select("text").transition().duration(800)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("x", d => d.x0 < width / 2 ? -6 : 6 + sankey.nodeWidth())
            .attr("text-anchor", d => d.x0 < width / 2 ? "end" : "start");
    }

    update(dataBase);
}
