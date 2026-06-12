# Something about diagrams, I think
## Formal Requirements
### At least 3 different visualization components
|    | Component           | About                   | Done                     |
|----|---------------------|-------------------------|--------------------------|
| 1. | Diverging Bar Chart | The Macro Balance       | <ul><li>- [ ] </li></ul> |
| 2. | Sankey              | Cheese & Ecologial Cost | <ul><li>- [ ] </li></ul> |
| 3. | Scatterplot         | The Environmental Shift | <ul><li>- [ ] </li></ul> |
| 4. | Network Graph       | The Biochemical Sandbox | <ul><li>- [ ] </li></ul> |

### At least three different interaction techniques
1. Diverging Bar Chart: Somehow interactive TBD
2. Sankey: Brushing and Linking
3. Scatterplot: Toggle to change unit (not sure what kind of technique that is exactly, querying?)
4. Network Graph: Brushing, Zooming, Manipulation of nodes 

### At least 6 narrative views or story components
1. Introduction: The Epistemological Hook
2. The Macro Balance: Production vs. Consumption (Diverging Bar Chart)
3. The Ecological Price Tag: Emissions & Cheese (Sankey)
4. The Shift: Visualizing the Change (Scatterplot)
5. The Nutritional Sandbox: The Big Graph (Network Graph)
6. ??? (Does the Scrollytellying count for this? Or else some kind of summary?)

## Notes
No restrictions on programming tools or libraries, but encouraged to use D3.js. 
The only exception is the use of dashboarding or non-programming software like Tableau or Power BI.

## Data Sets
- Dataset A: Austrian Macro-Consumption: 
  - URL: https://www.statistik.at/statistiken/land-und-forstwirtschaft/landwirtschaftliche-bilanzen/versorgungsbilanzen
  - FILE: Could not find any CSV or JSON file, might need manual work
- Dataset B: Environmental Life Cycle Assessments
  - URL: https://ourworldindata.org/environmental-impacts-of-food
  - FILE: food-footprints.csv
- Dataset C: High-Resolution Nutritional Biochemistry Profiles
  - URL: https://fdc.nal.usda.gov/download-datasets.html
  - FILE: FoodData_Central_foundation_food_json_2026-04-30.json (also other, larger data available on that site)