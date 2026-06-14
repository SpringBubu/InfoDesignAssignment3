
export function loadVersorgungsbilanzen() {
    return d3.csv("./data/barChart/data.csv")
        // Promise.all([
        //     d3.csv("./data/raw/Bier.csv"),
        //     d3.csv("./data/raw/Eier.csv"),
        //     d3.csv("./data/raw/Fische.csv"),
        //     d3.csv("./data/raw/Fleisch.csv"),
        //     d3.csv("./data/raw/Geflügel.csv")
        // ])
        .catch(function (err) {
            console.error(`Something went wrong when trying to read data: ${err}`);
            return [];
        });
}

export function loadFoodFootprints() {
    return d3.csv("./data/scatterPlot/data.csv")
        .catch(function (err) {
            console.error(`Something went wrong when trying to read data: ${err}`);
            return [];
        });
}

export function placeholder(id, color) {
    const svg = d3.select(`#${id}`)
        .append("svg")
        .attr("width", 100)
        .attr("height", 100)
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 100)
        .attr("height", 100)
        .attr("fill", color);
}