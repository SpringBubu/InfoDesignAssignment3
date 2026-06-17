import { loadDatasetA, loadDatasetC, placeholder } from "../utils/index.js";

const margin = { top: 0, right: 0, bottom: 0, left: 250 };
const width = window.innerWidth - margin.left - margin.right;
const height = (670) - margin.top - margin.bottom;

export async function network() {

    const svg = d3.select("#network-graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    const zoomGroup = svg.append("g");
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => zoomGroup.attr("transform", event.transform));
    svg.call(zoom);

    const color = d3.scaleOrdinal()
        .domain(["food", "nutrient", "biology"])
        .range(["var(--accent)", "#aaa", "#000"]);

    const xPositions = {
        "food": width * 0.2,
        "nutrient": width * 0.5,
        "biology": width * 0.8
    };

    const dataRaw = await loadDatasetC();
    console.log(dataRaw);

    const foods = new Set();
    const nutrients = new Set();
    const biologies = new Set();

    const data = {
        nodes: [],
        links: []
    };

    const linkedCache = {};


    function isConnected(a, b) {
        return linkedCache[`${a.id},${b.id}`] || linkedCache[`${b.id},${a.id}`] || a.id === b.id;
    }

    for (const collection of dataRaw) {
        const fid = collection.description.split(",")[0];
        foods.add(fid);
        for (const n of collection.foodNutrients) {
            if (n.amount <= 0) continue;

            const nid = n.nutrient.name.split(",")[0];
            nutrients.add(nid);


            if (!isConnected({ id: fid }, { id: nid })) {
                linkedCache[`${fid},${nid}`] = 1;
                linkedCache[`${nid},${fid}`] = 1;
                data.links.push({ source: fid, target: nid, amount: n.amount, unitName: n.nutrient.unitName, avg: n.median });
            }
        }
    }
    data.nodes.push(...[...foods.values()].map((fid) => ({ id: fid, group: "food", radius: 10 })));
    data.nodes.push(...[...nutrients.values()].map((nid) => ({ id: nid, group: "nutrient", radius: 10 })));
    data.nodes.push(...[...biologies.values()].map((bid) => ({ id: bid, group: "biology", radius: 10 })));

    data.nodes.sort((a, b) => a.id.localeCompare(b.id));

    for (const n of data.nodes) {
        n.x = xPositions[n.group];
        n.y = height / 2;
    }

    console.log(data);

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("x", d3.forceX(d => xPositions[d.group]).strength(1))
        .force("y", d3.forceY(height / 2).strength(0.3)) // to center of screen
        .force("collide", d3.forceCollide().radius(d => d.radius + 30));

    const linkGroup = zoomGroup.append("g");
    const nodeGroup = zoomGroup.append("g");

    function update(data) {
        simulation.nodes(data.nodes);
        simulation.force("link").links(data.links);

        const nutrientStats = {};
        for (const n of data.nodes) {
            if (n.group != "nutrient") continue;
            const links = data.links.filter(l => l.target.id == n.id);
            for (const l of links) {
                if (!nutrientStats[n.id]) {
                    nutrientStats[n.id] = { counter: 0, max: 0, sum: 0 };
                }
                nutrientStats[n.id].counter++;
                nutrientStats[n.id].sum += l.amount;
                if (l.amount > nutrientStats[n.id].max) nutrientStats[n.id].max = l.amount;
            }
        }

        const links = linkGroup.selectAll("line")
            .data(data.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
            .join("line")
            .attr("stroke", "#444")
            .attr("opacity", "1")
            .attr("stroke-width", d => Math.max(0.5, d.amount / nutrientStats[d.target.id].max * 5));

        const nodes = nodeGroup.selectAll("g.net-node")
            .data(data.nodes, d => d.id)
            .join(enter => {
                const g = enter.append("g").attr("class", "net-node").call(drag(simulation));

                g.append("circle")
                    .attr("cursor", "pointer")
                    .attr("r", d => d.radius || 15)
                    .attr("fill", d => color(d.group));

                g.append("text")
                    .attr("text-anchor", d => d.group == "food" ? "end" : "start")
                    .attr("x", d => d.group == "food" ? -12 : 12)
                    .attr("y", ".42em")
                    .text(d => d.id);

                return g;
            });

        simulation.on("tick", () => {
            links
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodes
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        simulation.alpha(0.3).restart();


        const infoDiv = d3.select("#network-info")

        nodes.on("mouseover", function (event, d) {
            nodes.style("opacity", o => isConnected(d, o) ? 1 : 0.1);
            links.style("opacity", o => (o.source === d || o.target === d) ? 1 : 0.1);

            if (d.group == "food") {
                const connections = data.links.filter(l => l.source.id == d.id);
                infoDiv.append("h3").text(d.id);
                const ul = infoDiv.append("ul");
                for (const c of connections) {
                    ul.append("li")
                        .text(`${c.target.id}: ${c.amount}${c.unitName}`);

                }
                infoDiv.style("display", "block");
                console.log(d);
            }

        }).on("mouseout", function () {
            nodes.style("opacity", 1);
            links.style("opacity", 1);

            infoDiv.style("display", "none");
            infoDiv.html("");
        });
    }

    const fids = ["apples", "bananas", "beef", "cheese", "milk"];
    const nids = ["protein", "iron", "vitamin b12", "vitamin c", "vitamin k"];

    const food = d3.select("#network-foods")
        .selectAll("div")
        .data(data.nodes.filter(n => n.group == "food"))
        .join("div");

    food.append("input")
        .attr("type", "checkbox")
        .attr("id", d => `check-${d.id}`)
        .property("checked", d => fids.includes(d.id.toLowerCase()))
        .on("change", (event, d) => {
            const id = d.id.toLowerCase();
            const i = fids.indexOf(id);
            if (!event.target.checked) {
                if (i >= 0) fids.splice(i, 1);
            }
            else {
                if (i < 0) fids.push(id);
            }
            update(getFilteredData(fids, nids));
        });

    food.append("label")
        .attr("for", d => `check-${d.id}`)
        .text(d => d.id)

    const nutrient = d3.select("#network-nutritions")
        .selectAll("div")
        .data(data.nodes.filter(n => n.group == "nutrient"))
        .join("div");

    nutrient.append("input")
        .attr("type", "checkbox")
        .attr("id", d => `check-${d.id}`)
        .property("checked", d => nids.includes(d.id.toLowerCase()))
        .on("change", (event, d) => {
            const id = d.id.toLowerCase();
            const i = nids.indexOf(id);
            if (!event.target.checked) {
                if (i >= 0) nids.splice(i, 1);
            }
            else {
                if (i < 0) nids.push(id);
            }

            update(getFilteredData(fids, nids));
        });

    nutrient.append("label")
        .attr("for", d => `check-${d.id}`)
        .text(d => d.id)



    function getFilteredData(fids, nids) {
        const filteredNodes = data.nodes.filter(n => {
            if (n.group == "food") return fids.includes(n.id.toLowerCase());
            return nids.includes(n.id.toLowerCase())
        });

        const allowedNodeIds = new Set(filteredNodes.map(n => n.id));

        const filteredLinks = data.links.filter(l => {
            const source = l.source.id || l.source;
            const target = l.target.id || l.target;
            return allowedNodeIds.has(source) && allowedNodeIds.has(target);
        });

        const filtered = { nodes: filteredNodes, links: filteredLinks };
        console.log(filtered);
        return filtered;
    }

    update(getFilteredData(fids, nids));
}

function drag(simulation) {
    function start(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function drag(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function end(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    return d3.drag()
        .on("start", start)
        .on("drag", drag)
        .on("end", end);
}