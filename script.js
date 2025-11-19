// Current selections
let selectedYear = "2010";
let selectedMetric = "world_pop";
let selectedCountry = "usa";

// When any button changes, update both charts
function updateDisplays() {
  updateLeftHeatmap(selectedYear, selectedCountry);
  updateRightBarchart(selectedYear, selectedMetric, selectedCountry);
  updateVisibility();
}

/* ---------------------------
   BUTTON BEHAVIOR
---------------------------- */

// YEAR BUTTONS
document.querySelectorAll(".item_left").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".item_left").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedYear = btn.dataset.year;
    updateDisplays();
  });
});

// METRIC BUTTONS
document.querySelectorAll(".item_right").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".item_right").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMetric = btn.dataset.metric;
    updateDisplays();
  });
});

// COUNTRY BUTTONS
document.querySelectorAll(".country").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".country").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCountry = btn.dataset.country;
    updateDisplays();
  });
});

/* ---------------------------
   PLACEHOLDER D3 CHARTS
---------------------------- */

function updateLeftHeatmap(year, country) {
  d3.select("#leftViz").html("");
  d3.select("#leftViz")
    .append("div")
    .style("font-size", "16px")
    .text(`Heatmap for ${country.toUpperCase()} in ${year}`);
}

function updateRightBarchart(year, metric, country) {
  d3.select("#rightViz").html("");
  d3.select("#rightViz")
    .append("div")
    .style("font-size", "16px")
    .text(`Bar chart: ${metric} for ${country.toUpperCase()} in ${year}`);
}

// Initial render
updateDisplays();

function updatePanels() {
  const year = document.querySelector("#yearMenu .active").dataset.year;
  const category = document.querySelector("#categoryMenu .active").dataset.type;
  const country = document.querySelector(".country.active").dataset.country;

  // LEFT PANEL CONTENT
  let leftHTML = `<h3>Heatmap for ${country.toUpperCase()} – ${year}</h3>`;

  // If USA + 2010, show a PNG
  if (country === "usa" && year === "2010") {
    leftHTML += `<img src="images/usa_2010_rai_heatmap.png" 
                 style="width:100%; border-radius:8px; margin-top:10px;">`;
  }
  else if (country === "usa" && year === "2015") {
    leftHTML += `<img src="images/usa_2015_rai_heatmap.png" 
                 style="width:100%; border-radius:8px; margin-top:10px;">`;
  }
  else if (country === "usa" && year === "2020") {
    leftHTML += `<img src="images/usa_2020_rai_heatmap.png" 
                 style="width:100%; border-radius:8px; margin-top:10px;">`;
  }
  document.getElementById("leftPanel").innerHTML = leftHTML;


  // RIGHT PANEL CONTENT
  let rightHTML = `<h3>Bar chart for ${country.toUpperCase()} – ${year} – ${category}</h3>`;
  if (country === "usa" && year === "2020" && category === "world_pop") {
    rightHTML += `<img src="images/temp_usa_heatmap.jpg" 
                 style="width:100%; border-radius:8px; margin-top:10px;">`;
  }
  document.getElementById("rightPanel").innerHTML =rightHTML;
}


// Year menu listeners
document.querySelectorAll('#yearMenu .menu-item').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('#yearMenu .menu-item')
      .forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    updatePanels();
  });
});

// Category menu listeners
document.querySelectorAll('#categoryMenu .menu-item').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('#categoryMenu .menu-item')
      .forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    updatePanels();
  });
});

// Country menu listeners
document.querySelectorAll('.country').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.country')
      .forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    updatePanels();
  });
});

updatePanels();

function updateVisibility() {

  // Hide everything first
  document.querySelectorAll('.left_content').forEach(div => div.classList.remove('show'));
  document.querySelectorAll('.right_content').forEach(div => div.classList.remove('show'));

  // Example expected element IDs:
  //   left_2010_usa
  //   right_2010_world_pop_usa

  const leftId  = `left_${selectedYear}_${selectedCountry}`;
  const rightId = `right_${selectedYear}_${selectedMetric}_${selectedCountry}`;

  const leftDiv  = document.getElementById(leftId);
  const rightDiv = document.getElementById(rightId);

  if (leftDiv)  leftDiv.classList.add('show');
  if (rightDiv) rightDiv.classList.add('show');
}
