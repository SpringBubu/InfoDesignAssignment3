import { placeholder } from "../utils/index.js";

export async function sankey() {

    const margin = { top: 8, right: 150, bottom: 8, left: 100 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#sankey").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const color = d3.scaleOrdinal()
        .domain(["Milk", "Loss", "Cheese", "CO2", "Land", "Water"])
        .range(["#aaa", "#555", "#fed330", "#da3939", "#26de81", "#45aaf2"]);

    const sankey = d3.sankey()
        .nodeWidth(30)
        .nodePadding(40)
        .size([width, height]);

    let showImpact = false;
    const dataBase = {
        nodes: [{ name: "10L Raw Milk", id: "Milk" }, { name: "9L Loss in Water", id: "Loss" }, { name: "1kg Cheese", id: "Cheese" }],
        links: [
            { source: 0, target: 1, value: 9 },
            { source: 0, target: 2, value: 1 }
        ]
    };

    const dataImpact = {
        nodes: [
            { name: "10L Rohmilch", id: "Milk", valueStr: "10 L" },
            { name: "9L Molke/Wasserverlust", id: "Loss", valueStr: "9 L" },
            { name: "1kg Käse", id: "Cheese", valueStr: "1 kg" },
            // Ebene 2 mit echten Einheiten:
            { name: "CO₂-Ausstoß", id: "CO2", valueStr: "8.5 kg CO₂-Äq." },
            { name: "Flächenbedarf", id: "Land", valueStr: "25 m²" },
            { name: "Wasserfußabdruck", id: "Water", valueStr: "5.000 L" }
        ],
        links: [
            { source: 0, target: 1, value: 9 },
            { source: 0, target: 2, value: 1 },
            { source: 2, target: 3, value: 4 }, // Käse -> CO2
            { source: 2, target: 4, value: 3 }, // Käse -> Land
            { source: 2, target: 5, value: 6 }  // Käse -> Water
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
                if (d.id === "Cheese") toggleData();
            });

        nodeEnter.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", sankey.nodeWidth())
            .style("fill", d => color(d.id))
            .style("cursor", d => d.id == "Cheese" ? "pointer" : "normal");

        nodeEnter.append("text")
            .attr("x", d => d.x0 < width / 2 ? 6 + sankey.nodeWidth() : -6)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .style("z-index", "1")
            .text(d => `${d.name} ${d?.valueStr}`);

        const nodeMerge = node.merge(nodeEnter);

        nodeMerge.transition().duration(800)
            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            .style("opacity", 1);

        nodeMerge.select("rect").transition().duration(800)
            .attr("height", d => d.y1 - d.y0);

        nodeMerge.select("text").transition().duration(800)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("x", d => d.x0 < width / 2 ? 6 + sankey.nodeWidth() : -6)
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end");
    }


    function toggleData() {
        showImpact = !showImpact;

        if (showImpact) update(dataImpact);
        else update(dataBase);
    }

    update(dataBase);
}
