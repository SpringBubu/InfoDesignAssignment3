
export function loadDatasetA() {
    return d3.csv("./data/barChart/data.csv")
        // Promise.all([
        //     d3.csv("./data/raw/Bier.csv"),
        //     d3.csv("./data/raw/Eier.csv"),
        //     d3.csv("./data/raw/Fische.csv"),
        //     d3.csv("./data/raw/Fleisch.csv"),
        //     d3.csv("./data/raw/Geflügel.csv")
        // ])
        .catch(function (err) {
            console.error(`Something went wrong when trying to load dataset A: ${err}`);
            return [];
        });
}

export function loadDatasetB() {
    return d3.csv("./data/scatterPlot/data.csv")
        .catch(function (err) {
            console.error(`Something went wrong when trying to load dataset B: ${err}`);
            return [];
        });
}

export async function loadDatasetC() {
    try {
        const res = await fetch("./data/FoodData_Central_foundation_food_json_2026-04-30.json");
        const dataJson = await res.json();
        return dataJson["FoundationFoods"].filter(f => !!f);
    } catch (err) {
        console.error(`Something went wrong when trying to load dataset C: ${err}`);
        return [];
    }
}

export function placeholder(id, color) {
    d3.select(`#${id}`)
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