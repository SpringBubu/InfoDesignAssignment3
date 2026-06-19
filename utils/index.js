
export function loadDatasetA() {
    const products = [
        "Bier", "Eier", "Fische", "Fleisch", "Geflügel", "Gemüse", "Getreide",
        "Honig", "Kartoffeln_und_Kartoffelstärke", "Milch", "Obst",
        "Pflanzliche_Öle", "Reis", "Tierische_Fette", "Wein", "Zucker", "Ölsaaten"
    ];
    return Promise.all(
            products.map(product => d3.csv(`./data/dataSetA/${product}.csv`))
        ).catch(function (err) {
            console.error(`Something went wrong when trying to load dataset A: ${err}`);
            return [];
        });
}

export function loadDatasetB() {
    return d3.csv("./data/dataSetB/data.csv")
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