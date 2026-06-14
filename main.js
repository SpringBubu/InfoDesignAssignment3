import { plots } from "./plots/index.js";

function main() {
    plots.bar().then(() => console.log("loaded bar chart"));
    plots.sankey().then(() => console.log("loaded sankey diagram"));
    plots.scatter().then(() => console.log("loaded scatter plot"));
    plots.network().then(() => console.log("loaded network graph"));
}

main();