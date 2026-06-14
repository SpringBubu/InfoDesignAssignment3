import { plots } from "./plots/index.js";
import { EmojiCanvas } from "./utils/EmojiCanvas.js";

function main() {
    plots.bar().then(() => console.log("loaded bar chart"));
    plots.sankey().then(() => console.log("loaded sankey diagram"));
    plots.scatter().then(() => console.log("loaded scatter plot"));
    plots.network().then(() => console.log("loaded network graph"));
}

main();

window.customElements.define("emoji-canvas", EmojiCanvas);