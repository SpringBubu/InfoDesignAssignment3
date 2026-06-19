# The Austrian Diet
Griaß di! "The Austrian Diet" is a small interactive website built with HTML, CSS, JavaScript and d3.js v7. The goal
of this website is to visualize the production, ecological footprints, and nutritional biochemistry in Austria's
food system.

## Instructions
Go to this website *LINK* or click on the green "< > Code" button on the top right of the repo, and then the "Download ZIP" 
button to download the repo locally. Unpack that ZIP and double-click on the index.html in the root folder to open the 
website. Alternatively, open the folder as a project in your IDE or text editor of your choice and start the site from there.
The website should be good to go, the only needed library (d3.js) should be loaded automatically as an external script. 

## Formal Requirements
This project was made as a part of the TU Vienna course "Fundamentals of Visualization", 2026. Which is why we want to
list the formal requirements and how we fulfilled them.

n equals the number of team members, meaning in our case n = 3.

### At least n different visualization components
1. Diverging Bar Chart about "The Macro Balance"
2. Sankey about "Cheese & Ecological Cost"
3. Scatter Plot about "The Environmental Shift"
4. Network Graph about "The Biochemical Sandbox"

### At least three different interaction techniques
1. Interaction by changing sorting (Diverging Bar Chart)
2. Interaction by changing units/views (Scatter Plot and Sankey)
3. Zooming (Scatter Plot and Network Graph)
4. Panning (Scatter Plot and Network Graph)
5. Node Manipulation (Network Graph)
6. Details when hovering over element (Network Graph)
7. Filtering (Network Graph)

### At least 2n narrative views or story components
1. Introduction: The Epistemological Hook
2. The Macro Balance: Production vs. Consumption (Diverging Bar Chart)
3. The Ecological Price Tag: Emissions & Cheese (Sankey)
4. The Shift: Visualizing the Change (Scatter Plot)
5. The Nutritional Sandbox: The Big Graph (Network Graph)
6. Conclusion & Credits

## Notes
No restrictions on programming tools or libraries, but encouraged to use D3.js. 
The only exception is the use of dashboarding or non-programming software like Tableau or Power BI.

### Data Sets
- Dataset A: Austrian Macro-Consumption: 
  - URL: https://www.statistik.at/statistiken/land-und-forstwirtschaft/landwirtschaftliche-bilanzen/versorgungsbilanzen
- Dataset B: Environmental Life Cycle Assessments
  - URL: https://ourworldindata.org/environmental-impacts-of-food
  - NOTE: CSV states 2010 as year, but according to website the data is from 2018, so there might be an error.
- Dataset C: High-Resolution Nutritional Biochemistry Profiles
  - URL: https://fdc.nal.usda.gov/download-datasets.html

## TODO/ Touch ups once done:
- add the years for the data (might be interesting)?
- add sources at the bottom of the page?
- Check criteria again
- Do presentation