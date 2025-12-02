// StackedPage.js

const VARIABLE_OPTIONS = [
  "GDP_Per_Capita_USD",
  "National_RAI",
  "Mean_RAI",
  "Total_Production_tonnes_paddy",
  "Total_Population",
  "Per_Capita_Consumption_kg"
];

const VARIABLE_LABLES = {
  GDP_Per_Capita_USD: "GDP per Capita",
  National_RAI: "National RAI",
  Mean_RAI: "Mean RAI",
  Total_Production_tonnes_paddy: "Production",
  Total_Population: "Total Population",
  Per_Capita_Consumption_kg: "Consumption"
};

const COLORS = [
  "#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
  "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf",
  "#393b79","#637939","#8c6d31","#843c39","#7b4173",
  "#3182bd","#e6550d","#31a354","#756bb1","#636363"
];

export const StackedPage = {

  render(parent, { year, data }) {
    parent.innerHTML = `
      <h3>Stacked dashboard — ${year}</h3>
      <div id="barChartContainer" style="margin-top:10px;"></div>
    `;
    this.renderStackedBarChart(year, data);
  },

  renderStackedBarChart(year, allData) {

    const container = d3.select("#barChartContainer");
    container.html("");

    const tooltipId = "bar-tooltip";
    let old = document.getElementById(tooltipId);
    if (old) old.remove();

    const tooltip = d3.select("body")
      .append("div")
      .attr("id", tooltipId)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("padding", "6px 8px")
      .style("background", "black")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("opacity", 0);

    // Filter rows for selected year
    const yearRows = allData.filter(d => String(d.Year) === String(year));
    if (yearRows.length === 0) {
      container.append("div").text("No data for selected year.");
      return;
    }

    const countryMap = {};
    yearRows.forEach(d => {
      const country = d.Country;
      countryMap[country] = {
        Country: country,
        GDP_Per_Capita_USD: +d.GDP_Per_Capita_USD || 0,
        National_RAI: +d.National_RAI || 0,
        Mean_RAI: +d.Mean_RAI || 0,
        Total_Production_tonnes_paddy: +d.Total_Production_tonnes_paddy || 0,
        Total_Population: +d.Total_Population || 0,
        Per_Capita_Consumption_kg: +d.Per_Capita_Consumption_kg || 0
      };
    });

    const countries = Object.values(countryMap)
      .sort((a,b) => b.GDP_Per_Capita_USD - a.GDP_Per_Capita_USD)
      .map(d => d.Country);

    const margin = { top: 30, right: 20, bottom: 30, left: 140 };
    const rowHeight = 48;
    const rowGap = 14;
    const innerWidth = Math.max(700, countries.length * 6);
    const width = innerWidth + margin.left + margin.right;
    const height = margin.top + VARIABLE_OPTIONS.length * rowHeight + (VARIABLE_OPTIONS.length - 1) * rowGap + margin.bottom;

    const svg = container.append("svg").attr("width", width).attr("height", height);

    const rowTotals = {};
    VARIABLE_OPTIONS.forEach(varName => {
      rowTotals[varName] = d3.sum(countries, c => countryMap[c][varName]);
    });

    const allSegments = [];
    VARIABLE_OPTIONS.forEach((varName, rowIndex) => {
      let x0 = 0;
      const total = rowTotals[varName] || 1;

      countries.forEach((country, i) => {
        const value = countryMap[country][varName];
        const w = (value / total) * innerWidth;

        allSegments.push({
          variable: varName,
          country,
          value,
          rowIndex,
          x: x0,
          width: w,
          color: COLORS[i % COLORS.length]
        });

        x0 += w;
      });
    });

    const rowGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const labels = svg.append("g").attr("transform", `translate(${margin.left - 10},${margin.top})`);

    VARIABLE_OPTIONS.forEach((varName, rowIndex) => {
      const y = rowIndex * (rowHeight + rowGap);
      labels.append("text")
        .attr("x", -10)
        .attr("y", y + rowHeight / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .style("fill", "#ffffff")
        .text(VARIABLE_LABLES[varName]);
    });

    rowGroup.selectAll("g.row")
      .data(VARIABLE_OPTIONS.map((v, i) => ({ variable: v, rowIndex: i })))
      .join("g")
      .attr("class", d => `row row-${d.rowIndex}`)
      .attr("transform", d => `translate(0, ${d.rowIndex * (rowHeight + rowGap)})`)
      .each(function(rowInfo) {

        const rowSegs = allSegments.filter(s => s.variable === rowInfo.variable);
        const g = d3.select(this);

        g.selectAll("rect")
          .data(rowSegs)
          .join("rect")
          .attr("class", "stack-seg")
          .attr("x", d => d.x)
          .attr("y", 0)
          .attr("width", d => Math.max(0.5, d.width))
          .attr("height", rowHeight)
          .attr("fill", d => d.color)
          .style("cursor", "pointer")

          // === Mouseover ===
          .on("mouseover", function(event, d) {

            const raw = countryMap[d.country][d.variable];

            const formatted = (raw === undefined || raw === null || isNaN(raw))

              ? "N/A"

              : raw;



            // Units for each variable

            const unitMap = {

              GDP_Per_Capita_USD: "USD per person",

              National_RAI: "RAI",

              Mean_RAI: "RAI",

              Total_Production_tonnes_paddy: "tonnes",

              Total_Population: "people",

              Per_Capita_Consumption_kg: "kg per person"

            };



            const unit = unitMap[d.variable] || "";



            tooltip.style("opacity", 1)

              .html(`

                <strong>${d.country}</strong><br/>

                ${formatted} ${unit}

              `);



            const marginRight = 10;

            const viewportWidth = window.styleinnerWidth || 

              document.documentElement.clientWidth;  



            const tooltipWidth = tooltip.node ? tooltip.node.offsetWidth : 150;



            let tx = event.pageX + 12;

            let ty = event.pageY + 12;



            if (tx + tooltipWidth + marginRight > viewportWidth)

            {

              tx = event.pageX - tooltipWidth - 12;

              if (tx < 8) tx = 8;

            }



            tooltip.style("left", tx + "px")

                  .style("top", ty + "px");

            if (!window.sharedState.highlightedCountry) {
              d3.selectAll(".stack-seg")
                .attr("opacity", s => s.country === d.country ? 1 : 0.2);
            }
          })

          .on("mousemove", function(event) {

          // Mirror the same flipping logic on mousemove

          const marginRight = 10;

          const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

          const tooltipNode = tooltip.node();

          const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 150;



          let tx = event.pageX + 12;

          let ty = event.pageY + 12;

          if (tx + tooltipWidth + marginRight > viewportWidth) {

            tx = event.pageX - tooltipWidth - 12;

            if (tx < 8) tx = 8;

          }

          tooltip.style("left", tx + "px").style("top", ty + "px");

        })

          // === Mouseout ===
          .on("mouseout", function() {
            tooltip.style("opacity", 0);

            if (!window.sharedState.highlightedCountry) {
              d3.selectAll(".stack-seg").attr("opacity", 1);
            } else {
              window.applyHighlightState();
            }
          })

          // === Click ===
          .on("click", function(event, d) {

            if (window.sharedState.highlightedCountry === d.country) {
              window.sharedState.highlightedCountry = null;
            } else {
              window.sharedState.highlightedCountry = d.country;   // FIXED
            }

            window.applyHighlightState();

            // activate flag button
            document.querySelectorAll('.country').forEach(btn => {
              btn.classList.toggle('active', btn.dataset.countryName === d.country);
            });

            // refresh map + header
            if (window.updatePanels) {
              setTimeout(() => window.updatePanels(), 50);
            }
          });

      });

    // apply highlight on first load or after re-render
    if (window.applyHighlightState) window.applyHighlightState();
  }
};
