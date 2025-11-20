// Initialize Leaflet map
let map = null;
const countryViewConfig = {
  China: { 
    center: [35.8617, 104.1954], 
    zoom: 4, 
    minZoom: 3, 
    maxZoom: 8,
    bounds: [[18.0, 73.0], [53.0, 135.0]]
  },
  India: { 
    center: [20.5937, 78.9629], 
    zoom: 5, 
    minZoom: 4, 
    maxZoom: 9,
    bounds: [[6.0, 68.0], [37.0, 97.0]]
  },
  Indonesia: { 
    center: [-0.7893, 113.9213], 
    zoom: 5, 
    minZoom: 4, 
    maxZoom: 9,
    bounds: [[-11.0, 95.0], [6.0, 141.0]]
  },
  Bangladesh: { 
    center: [23.6850, 90.3563], 
    zoom: 7, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[20.0, 88.0], [27.0, 93.0]]
  },
  Vietnam: { 
    center: [14.0583, 108.2772], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[8.0, 102.0], [23.0, 110.0]]
  },
  Thailand: { 
    center: [15.8700, 100.9925], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[5.0, 97.0], [21.0, 106.0]]
  },
  Myanmar: { 
    center: [21.9162, 95.9560], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[9.0, 92.0], [29.0, 102.0]]
  },
  Philippines: { 
    center: [12.8797, 121.7740], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[4.0, 116.0], [21.0, 127.0]]
  },
  Pakistan: { 
    center: [30.3753, 69.3451], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[23.0, 60.0], [37.0, 78.0]]
  },
  Japan: { 
    center: [36.2048, 138.2529], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[24.0, 123.0], [46.0, 146.0]]
  },
  Cambodia: { 
    center: [12.5657, 104.9910], 
    zoom: 7, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[10.0, 102.0], [15.0, 108.0]]
  },
  Laos: { 
    center: [19.8563, 102.4955], 
    zoom: 7, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[13.0, 100.0], [23.0, 108.0]]
  },
  "Sri Lanka": { 
    center: [7.8731, 80.7718], 
    zoom: 7, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[5.0, 79.0], [10.0, 82.0]]
  },
  Nepal: { 
    center: [28.3949, 84.1240], 
    zoom: 7, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[26.0, 80.0], [31.0, 89.0]]
  },
  "South Korea": { 
    center: [35.9078, 127.7669], 
    zoom: 7, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[33.0, 124.0], [39.0, 132.0]]
  },
  Nigeria: { 
    center: [9.0820, 8.6753], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[4.0, 2.0], [14.0, 15.0]]
  },
  Madagascar: { 
    center: [-18.7669, 46.8691], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[-26.0, 43.0], [-11.0, 51.0]]
  },
  Egypt: { 
    center: [26.8206, 30.8025], 
    zoom: 6, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[22.0, 24.0], [32.0, 37.0]]
  },
  Brazil: { 
    center: [-14.2350, -51.9253], 
    zoom: 4, 
    minZoom: 3, 
    maxZoom: 8,
    bounds: [[-34.0, -74.0], [6.0, -32.0]]
  },
  USA: { 
    center: [37.0902, -95.7129], 
    zoom: 4, 
    minZoom: 3, 
    maxZoom: 8,
    bounds: [[24.0, -125.0], [50.0, -66.0]]
  }
};

function updateMapView(map, country) {
  if (map && countryViewConfig[country]) {
    const config = countryViewConfig[country];
    console.log(`Updating map view for ${country}:`, config);
    
    // Set zoom restrictions for this country
    map.setMinZoom(config.minZoom);
    map.setMaxZoom(config.maxZoom);
    
    // Set bounding box to restrict panning to country area
    if (config.bounds) {
      const bounds = L.latLngBounds(config.bounds);
      map.setMaxBounds(bounds);
    }
    
    // Set the view with the country's center and zoom
    map.setView(config.center, config.zoom);
    
    // Ensure current zoom is within bounds
    const currentZoom = map.getZoom();
    if (currentZoom < config.minZoom) {
      map.setZoom(config.minZoom);
    } else if (currentZoom > config.maxZoom) {
      map.setZoom(config.maxZoom);
    }
  } else {
    console.log(`Map view update failed - map: ${!!map}, country: ${country}, config exists: ${!!countryViewConfig[country]}`);
  }
}

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
    div.dataset.countryName = countryName; // Store the actual country name
    div.textContent = countryName;

    // Make the first one active by default
    if (i === 0) div.classList.add("active");

    flagBar.appendChild(div);
  });

  // Initialize map once
  const mapContainer = document.getElementById("map");
  if (mapContainer && !map) {
    map = L.map(mapContainer, {
      minZoom: 2,
      maxZoom: 18,
      maxBounds: null // No initial bounds restriction
    }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  }

updatePanels();

function updatePanels() {
  const year = document.querySelector("#yearMenu .active").dataset.year;
  const category = document.querySelector("#categoryMenu .active").dataset.type;
  const countryId = document.querySelector(".country.active").dataset.country;
  const countryName = document.querySelector(".country.active").dataset.countryName;

  // LEFT PANEL CONTENT - Keep map container, add header above it
  const leftPanel = document.getElementById("leftPanel");
  const mapContainer = document.getElementById("map");
  updateMapView(map, countryName);
  // Create header if it doesn't exist
  let header = leftPanel.querySelector("h3");
  if (!header) {
    header = document.createElement("h3");
    leftPanel.insertBefore(header, mapContainer);
  }
  header.textContent = `Heatmap for ${countryName.toUpperCase()} – ${year}`;

  // If map exists, invalidate size in case container changed
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }


  // RIGHT PANEL CONTENT
  let rightHTML = `<h3>Bar chart for ${countryName.toUpperCase()} – ${year} – ${category}</h3>`;
  if (countryId === "usa" && year === "2020" && category === "world_pop") {
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
