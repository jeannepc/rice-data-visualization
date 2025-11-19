// Load country list from CSV
d3.csv("master_dataset.csv").then(function(data){

  const flagBar = document.getElementById("flagBar");

  data.forEach((row, i) => {
    const countryName = row.Country;
    const countryId = countryName.toLowerCase().replace(/ /g, "_");

    // Create a flag button
    const div = document.createElement("div");
    div.className = "country";
    div.dataset.country = countryId;
    div.textContent = countryName;

    // Make the first one active by default
    if (i === 0) div.classList.add("active");

    flagBar.appendChild(div);
  });

updatePanels();

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
    // Clear active class
    document.querySelectorAll('.country')
      .forEach(b => b.classList.remove('active'));

    // Set active
    button.classList.add('active');

    // Trigger your updatePanels() if needed
    if (typeof updatePanels === "function") updatePanels();
  });
});

});
