export const WorldPopPage = {
    render(parent, { year, data }) {
    parent.innerHTML = `
      <h3>Stacked dashboard — ${year}</h3>
      <div id="barChartContainer" style="margin-top:10px;"></div>
    `;
    this.renderStackedBarChart(year, data);
  },

  renderContent(year, allData) {
    const container = d3.select("#myContentArea");
    container.html("");

    container.append("div")
        .text(`Hello, this is a test page for year ${year}`)
  }
}