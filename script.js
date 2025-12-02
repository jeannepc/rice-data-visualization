// Import modular right-panel (requires script to be loaded as type="module")
import { RightPanel } from "./rightPanel/RightPanel.js";
import { StackedPage } from "./rightPanel/StackedPage.js";
//import { WorldPopPage } from "./rightPanel/WorldPopPage.js"; 


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

let raiLayer = null;
let worldPopLayer = null;
let globalRiceLayer = null;
let positronBaseLayer = null;
let layerControl = null;
// Store layer visibility state to persist across country switches
let layerVisibilityState = {
  "RAI Heatmap": true,  // Default to visible
  "Population Density": false,
  "Rice Harvest": false
};

window.sharedState = {
  highlightedCountry: null,

  setHighlighted(country) {
    this.highlightedCountry = country;
    if (window.applyHighlightState) window.applyHighlightState(); 
  }
};

// Function to save current layer visibility state
function saveLayerVisibilityState() {
  if (layerControl) {
    // Check which layers are currently on the map
    layerVisibilityState["RAI Heatmap"] = map.hasLayer(raiLayer);
    layerVisibilityState["Population Density"] = map.hasLayer(worldPopLayer);
    layerVisibilityState["Rice Harvest"] = map.hasLayer(globalRiceLayer);
  }
}

// Function to update layers when country or year changes
function updateLayers(countryName, year, wmsUrl) {
  // Save current visibility state before removing layers
  saveLayerVisibilityState();
  
  // Remove old layers from map
  if (raiLayer) map.removeLayer(raiLayer);
  if (worldPopLayer) map.removeLayer(worldPopLayer);
  if (globalRiceLayer) map.removeLayer(globalRiceLayer);
  
  // Remove old layer control
  if (layerControl) {
    map.removeControl(layerControl);
  }
  
  // Create new layer names based on current country and year
  const riceLayerName = countryName
    ? `rice:${countryName.toLowerCase().replace(/ /g, "_")}_${year}_rai`
    : null;
  const worldPopLayerName = countryName
    ? `rice:${countryName.toLowerCase().replace(/ /g, "_")}_${year}_pop_10km_aligned`
    : null;
  const globalRiceLayerName = countryName
    ? `rice:${countryName.toLowerCase().replace(/ /g, "_")}_${year}_rice_10km`
    : null;
  
  // Create new layers
  raiLayer = L.tileLayer.wms(wmsUrl, {
    layers: riceLayerName,
    format: "image/png",
    transparent: true,
    version: '1.3.0',
    tileSize: 512,
    detectRetina: true,
    updateWhenIdle: true,
    keepBuffer: 2,
    zIndex: 1000,
    attribution: 'Rice Area Index Data'
  });
  
  worldPopLayer = L.tileLayer.wms(wmsUrl, {
    layers: worldPopLayerName,
    format: "image/png",
    transparent: true,
    version: '1.3.0',
    tileSize: 512,
    detectRetina: true,
    updateWhenIdle: true,
    keepBuffer: 2,
    zIndex: 999,
    attribution: 'World Population Data'
  });
  
  globalRiceLayer = L.tileLayer.wms(wmsUrl, {
    layers: globalRiceLayerName,
    format: "image/png",
    transparent: true,
    version: '1.3.0',
    tileSize: 512,
    detectRetina: true,
    updateWhenIdle: true,
    keepBuffer: 2,
    zIndex: 998,
    attribution: 'Global Rice Data'
  });
  
  // Restore visibility state by adding layers to map first
  // This ensures the layer control reflects the correct initial state
  if (layerVisibilityState["RAI Heatmap"]) {
    raiLayer.addTo(map);
  }
  if (layerVisibilityState["Population Density"]) {
    worldPopLayer.addTo(map);
  }
  if (layerVisibilityState["Rice Harvest"]) {
    globalRiceLayer.addTo(map);
  }
  
  // Create base layers object
  const baseLayers = {
    "Positron": positronBaseLayer
  };
  
  // Create overlays object
  const overlays = {
    "RAI Heatmap": raiLayer,
    "Population Density": worldPopLayer,
    "Rice Harvest": globalRiceLayer
  };
  
  // Create new layer control (it will automatically detect which layers are on the map)
  layerControl = L.control.layers(baseLayers, overlays).addTo(map);
  
  // Return layer information for querying
  return {
    rai: { name: riceLayerName, type: 'RAI', layer: raiLayer },
    worldPop: { name: worldPopLayerName, type: 'World Population', layer: worldPopLayer },
    globalRice: { name: globalRiceLayerName, type: 'Global Rice', layer: globalRiceLayer }
  };
}


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

// Helper function to query a single WMS layer
function querySingleLayer(wmsUrl, layerName, latlng, countryBounds) {
  const fixedWidth = 2000;
  const fixedHeight = 2000;
  
  const west = countryBounds[0][1];
  const south = countryBounds[0][0];
  const east = countryBounds[1][1];
  const north = countryBounds[1][0];
  
  const bbox = west + ',' + south + ',' + east + ',' + north;
  
  const pixelX = Math.round(((latlng.lng - west) / (east - west)) * fixedWidth);
  const pixelY = Math.round(((north - latlng.lat) / (north - south)) * fixedHeight);
  
  const x = Math.max(0, Math.min(fixedWidth - 1, pixelX));
  const y = Math.max(0, Math.min(fixedHeight - 1, pixelY));
  
  const url = wmsUrl + '?' + 
    'SERVICE=WMS&' +
    'VERSION=1.1.1&' +
    'REQUEST=GetFeatureInfo&' +
    'LAYERS=' + encodeURIComponent(layerName) + '&' +
    'QUERY_LAYERS=' + encodeURIComponent(layerName) + '&' +
    'STYLES=&' +
    'BBOX=' + bbox + '&' +
    'WIDTH=' + fixedWidth + '&' +
    'HEIGHT=' + fixedHeight + '&' +
    'SRS=EPSG:4326&' +
    'FORMAT=image/png&' +
    'INFO_FORMAT=application/json&' +
    'X=' + x + '&' +
    'Y=' + y;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error(`Error querying layer ${layerName}:`, error);
      return null;
    });
}

function queryWmsFeature(map, wmsUrl, enabledLayers, latlng, countryBounds) {
  // Query all enabled layers in parallel
  const layerQueries = enabledLayers.map(layerInfo => 
    querySingleLayer(wmsUrl, layerInfo.name, latlng, countryBounds)
      .then(data => ({ layerInfo, data }))
  );

  Promise.all(layerQueries)
    .then(results => {
      let content = '<div style="font-size: 12px;">';
      let hasValidData = false;
      
      results.forEach(({ layerInfo, data }) => {
        if (data && data.features && data.features.length > 0) {
          const properties = data.features[0].properties;
          let layerHasData = false;
          
          for (let key in properties) {
            const value = properties[key];
            // Skip no-data values (-9999, null, undefined, NaN)
            if (value !== null && value !== undefined && !isNaN(value) && value !== -9999 && value !== '-9999') {
              const numValue = parseFloat(value);
              
              // Format based on layer type
              if (layerInfo.type === 'RAI') {
                // RAI as percentage
                const percentage = (numValue).toFixed(2);
                content += `<div><b>RAI:</b> ${percentage}%</div>`;
                layerHasData = true;
              } else if (layerInfo.type === 'World Population') {
                // Population Density: People per pixel (PPL)
                // Format as whole number since it represents count of people
                const formattedValue = numValue >= 1000 
                  ? numValue.toLocaleString('en-US', { maximumFractionDigits: 0 })
                  : numValue.toFixed(0);
                content += `<div><b>Population Density:</b> ${formattedValue} people</div>`;
                layerHasData = true;
              } else if (layerInfo.type === 'Global Rice') {
                // Rice Harvest: Metric tonnes (1,000 kg) per grid cell
                // Format with appropriate precision for metric tonnes
                let formattedValue;
                if (numValue >= 1000000) {
                  formattedValue = (numValue / 1000000).toFixed(2) + 'M tonnes';
                } else if (numValue >= 1000) {
                  formattedValue = (numValue / 1000).toFixed(2) + 'k tonnes';
                } else {
                  formattedValue = numValue.toFixed(2) + ' tonnes';
                }
                content += `<div><b>Rice Harvest:</b> ${formattedValue}</div>`;
                layerHasData = true;
              } else {
                content += `<div><b>${layerInfo.type}:</b> ${numValue.toFixed(3)}</div>`;
                layerHasData = true;
              }
            }
          }
          
          if (layerHasData) {
            hasValidData = true;
          }
        }
      });
      
      if (!hasValidData) {
        content = '<div>No data at this location (no-data value)</div>';
      }
      content += '</div>';
      
      L.popup()
        .setLatLng(latlng)
        .setContent(content)
        .openOn(map);
    })
    .catch(error => {
      console.error('Error querying WMS layers:', error);
      L.popup()
        .setLatLng(latlng)
        .setContent('<div>Error retrieving data: ' + error.message + '</div>')
        .openOn(map);
    });
}



let highlightedCountry = null;

// Instantiate RightPanel (modular right side)
const rightPanel = new RightPanel("rightPanel");

// Load country list from CSV
d3.csv("master_dataset.csv").then(function(data){

  // Fields to analyse for bars to see
  data.forEach(d => {
    d.GDP_Per_Capita_USD = +d.GDP_Per_Capita_USD;
    d.National_RAI = +d.National_RAI;
    d.Mean_RAI = +d.Mean_RAI;
    d.Total_Production_tonnes_paddy = +d.Total_Production_tonnes_paddy;
    d.Total_Population = +d.Total_Population;
    d.Per_Capita_Consumption_kg = +d.Per_Capita_Consumption_kg;
  });

  const flagBar = document.getElementById("flagBar");

  const unique = new Set();

  data.forEach((row, i) => {
    const countryName = row.Country;
    if (unique.has(countryName)) return;
    unique.add(countryName);

    const countryId = countryName.toLowerCase().replace(/ /g, "_");

    // Create a flag button
    const div = document.createElement("div");
    div.className = "country";
    div.dataset.country = countryId;
    div.dataset.countryName = countryName; // Store the actual country name
    div.textContent = countryName;

    // Make the first one active by default
    if (unique.size === 1) div.classList.add("active");

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
    // CartoDB Positron - clean, minimal basemap without labels, perfect for raster overlays
    positronBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
  }
  const wmsUrl = "https://crcdata.soest.hawaii.edu/geoserver/ows";

  //updatePanels(); // initial render

  window.updatePanels = function updatePanels() {
    const year = document.querySelector("#yearMenu .active").dataset.year;
    const category = document.querySelector("#categoryMenu .active").dataset.type;
    const countryEl = document.querySelector(".country.active");
    const countryId = countryEl ? countryEl.dataset.country : null;

    const activeBtn = document.querySelector(".country.active");
    const countryName = activeBtn ? activeBtn.dataset.countryName : null;

    // left header
    const leftPanel = document.getElementById("leftPanel");
    const mapContainer = document.getElementById("map");

    if (map) {
      // Remove old click listeners to avoid duplicates
      map.off('click');

      if (countryName) {
        // Update layers (this will preserve visibility state)
        const layerInfo = updateLayers(countryName, year, wmsUrl);
        
        // Update map view (center, zoom, bounds)
        updateMapView(map, countryName);

        // Get country bounds for consistent queries
        const countryConfig = countryViewConfig[countryName];
        const countryBounds = countryConfig ? countryConfig.bounds : null;

        if (countryBounds) {
          map.on('click', (e) => {
            // Get enabled layers (only query layers that are currently visible on the map)
            const enabledLayers = [];
            if (map.hasLayer(layerInfo.rai.layer) && layerInfo.rai.name) {
              enabledLayers.push({ name: layerInfo.rai.name, type: layerInfo.rai.type });
            }
            if (map.hasLayer(layerInfo.worldPop.layer) && layerInfo.worldPop.name) {
              enabledLayers.push({ name: layerInfo.worldPop.name, type: layerInfo.worldPop.type });
            }
            if (map.hasLayer(layerInfo.globalRice.layer) && layerInfo.globalRice.name) {
              enabledLayers.push({ name: layerInfo.globalRice.name, type: layerInfo.globalRice.type });
            }
            
            if (enabledLayers.length > 0) {
              queryWmsFeature(map, wmsUrl, enabledLayers, e.latlng, countryBounds);
            } else {
              L.popup()
                .setLatLng(e.latlng)
                .setContent('<div>No layers enabled. Please enable at least one layer to query data.</div>')
                .openOn(map);
            }
          });
        }
      }
    }
    let header = leftPanel.querySelector("h3");
    if (!header) {
      header = document.createElement("h3");
      leftPanel.insertBefore(header, mapContainer);
    }
    const row = data.find(r => r.Country === countryName && String(r.Year) === String(year));
    header.textContent = `Heatmap for ${
      countryName ? countryName.toUpperCase() : "—"
    } – ${year} – RAI: ${row ? row.National_RAI : "N/A"} – SSR: ${row ? row.SSR : "N/A"}`;

    // render right panel
    if(category === "generic_data")
    {
      rightPanel.load(StackedPage, { year: parseInt(year), data });
    }
    // else if(category === "world_pop")
    // {
    //   rightPanel.load(WorldPopPage, { year: parseInt(year), data });

    // }

    // flag button listeners
    document.querySelectorAll(".country").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".country").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const cname = btn.dataset.countryName;

        if (window.sharedState.highlightedCountry === cname) {
          window.sharedState.setHighlighted(null);
        } else {
          window.sharedState.setHighlighted(cname);
        }

        window.updatePanels();
      };
    });

    if (window.applyHighlightState) window.applyHighlightState();
  };

  // === Highlight helper function ===
  function applyHighlightState() {
    const allSegs = d3.selectAll(".stack-seg");
    const highlighted = window.sharedState.highlightedCountry;

    if (!highlighted) {
      allSegs.attr("opacity", 1);
      document.querySelectorAll(".country").forEach(btn => (btn.style.background = ""));
      return;
    }

    allSegs.attr("opacity", d => d.country === highlighted ? 1 : 0.15);
    document.querySelectorAll(".country").forEach(btn => {
      btn.style.background = (btn.dataset.countryName === highlighted) ? "gold" : "";
    });
  }

  
  // Year menu listeners
  document.querySelectorAll('#yearMenu .menu-item').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#yearMenu .menu-item')
        .forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      // clear highlight when year changes
      highlightedCountry = null;
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

  // Expose global highlight function
  window.applyHighlightState = applyHighlightState;

  // FIRST LOAD
  updatePanels();

}).catch(err => {
  console.error("Error loading CSV:", err);
  const rightPanel = document.getElementById("rightPanel");
  if (rightPanel) rightPanel.innerHTML = "<div style='color:red;'>Failed to load master_dataset.csv</div>";
});
