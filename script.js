// Import modular right-panel (requires script to be loaded as type="module")
import { RightPanel } from "./rightPanel/RightPanel.js";
import { StackedPage } from "./rightPanel/StackedPage.js";


// Initialize Leaflet map
let map = null;
const countryViewConfig = {
  Global: {
    center: [0, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    bounds: [[-90, -180], [90, 180]]
  },
  China: { 
    center: [35.8617, 104.1954], 
    zoom: 3, 
    minZoom: 3, 
    maxZoom: 8,
    bounds: [[18.0, 73.0], [53.0, 135.0]]
  },
  India: { 
    center: [20.5937, 78.9629], 
    zoom: 4, 
    minZoom: 4, 
    maxZoom: 9,
    bounds: [[6.0, 68.0], [37.0, 97.0]]
  },
  Indonesia: { 
    center: [-0.7893, 113.9213], 
    zoom: 4, 
    minZoom: 4, 
    maxZoom: 9,
    bounds: [[-11.0, 95.0], [6.0, 141.0]]
  },
  Bangladesh: { 
    center: [23.6850, 90.3563], 
    zoom: 6, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[20.0, 88.0], [27.0, 93.0]]
  },
  Vietnam: { 
    center: [14.0583, 108.2772], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[8.0, 102.0], [23.0, 110.0]]
  },
  Thailand: { 
    center: [15.8700, 100.9925], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[5.0, 97.0], [21.0, 106.0]]
  },
  Myanmar: { 
    center: [21.9162, 95.9560], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[9.0, 92.0], [29.0, 102.0]]
  },
  Philippines: { 
    center: [12.8797, 121.7740], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[4.0, 116.0], [21.0, 127.0]]
  },
  Pakistan: { 
    center: [30.3753, 69.3451], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[23.0, 60.0], [37.0, 78.0]]
  },
  Japan: { 
    center: [36.2048, 138.2529], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[24.0, 123.0], [46.0, 146.0]]
  },
  Cambodia: { 
    center: [12.5657, 104.9910], 
    zoom: 6, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[10.0, 102.0], [15.0, 108.0]]
  },
  Laos: { 
    center: [19.8563, 102.4955], 
    zoom: 6, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[13.0, 100.0], [23.0, 108.0]]
  },
  "Sri Lanka": { 
    center: [7.8731, 80.7718], 
    zoom: 6, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[5.0, 79.0], [10.0, 82.0]]
  },
  Nepal: { 
    center: [28.3949, 84.1240], 
    zoom: 6, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[26.0, 80.0], [31.0, 89.0]]
  },
  "South Korea": { 
    center: [35.9078, 127.7669], 
    zoom: 6, 
    minZoom: 6, 
    maxZoom: 11,
    bounds: [[33.0, 124.0], [39.0, 132.0]]
  },
  Nigeria: { 
    center: [9.0820, 8.6753], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[4.0, 2.0], [14.0, 15.0]]
  },
  Madagascar: { 
    center: [-18.7669, 46.8691], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[-26.0, 43.0], [-11.0, 51.0]]
  },
  Egypt: { 
    center: [26.8206, 30.8025], 
    zoom: 5, 
    minZoom: 5, 
    maxZoom: 10,
    bounds: [[22.0, 24.0], [32.0, 37.0]]
  },
  Brazil: { 
    center: [-14.2350, -51.9253], 
    zoom: 3, 
    minZoom: 3, 
    maxZoom: 8,
    bounds: [[-34.0, -74.0], [6.0, -32.0]]
  },
  USA: { 
    center: [37.0902, -95.7129], 
    zoom: 3, 
    minZoom: 3, 
    maxZoom: 8,
    bounds: [[19.0, -180.0], [71.0, -65.0]]
  }
};

let raiLayer = null;
let worldPopLayer = null;
let globalRiceLayer = null;
let positronBaseLayer = null;
let layerControl = null;
let legendControl = null;
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
  
  // Remove old legend event listeners
  map.off('overlayadd overlayremove', updateLegend);

  // For "Global", use global layer names (without country name prefix)
  let riceLayerName, worldPopLayerName, globalRiceLayerName;
  
  // Create new layer names based on current country and year
  if (countryName === "Global") {
    // Global layers - adjust these if your WMS server uses different naming
    // Common patterns: rice:global_${year}_rai, rice:${year}_rai_global, or rice:rai_${year}
    riceLayerName = `rice:global_${year}_rai`;
    worldPopLayerName = `rice:global_${year}_pop_10km_aligned`;
    globalRiceLayerName = `rice:global_${year}_rice_10km`;
  }
  else if (countryName) {
    riceLayerName = `rice:${countryName.toLowerCase().replace(/ /g, "_")}_${year}_rai`;
    worldPopLayerName = `rice:${countryName.toLowerCase().replace(/ /g, "_")}_${year}_pop_10km_aligned`;
    globalRiceLayerName = `rice:${countryName.toLowerCase().replace(/ /g, "_")}_${year}_rice_10km`;
  } 
  else {
    riceLayerName = null;
    worldPopLayerName = null;
    globalRiceLayerName = null;
  }
  
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
  
  // Update legend after layers are created (with small delay to ensure layers are added)
  setTimeout(() => {
    updateLegend();
  }, 100);
  
  // Listen for layer add/remove events to update legend
  map.on('overlayadd overlayremove', () => {
    setTimeout(() => {
      updateLegend();
    }, 50);
  });
  
  // Return layer information for querying
  return {
    rai: { name: riceLayerName, type: 'RAI', layer: raiLayer },
    worldPop: { name: worldPopLayerName, type: 'World Population', layer: worldPopLayer },
    globalRice: { name: globalRiceLayerName, type: 'Global Rice', layer: globalRiceLayer }
  };
}


// Color scale definitions for each layer type (matching actual SLD styles)
const colorScales = {
  'RAI': {
    name: 'RAI Heatmap',
    // Red monochrome scale: dark red (critical deficit) to light pink (surplus)
    colors: ['#67000d', '#a50f15', '#cb181d', '#ef3b2c', '#fb6a4a', '#fc9272', '#fcbba1', '#fee0d2', '#fff5f0'],
    values: ['0%', '10%', '25%', '50%', '75%', '100%', '150%', '200%+', '300%+'],
    unit: '%',
    description: 'Dark red = Critical deficit, Light pink = Surplus'
  },
  'World Population': {
    name: 'Population Density',
    // Black overlay with varying opacity - shown as grayscale gradient
    colors: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040', '#202020', '#000000'],
    values: ['0', '100', '500', '1k', '5k', '10k', '25k', '50k', '250k+'],
    unit: 'people',
    description: 'White = Unpopulated, Black = High density'
  },
  'Global Rice': {
    name: 'Rice Harvest',
    // Green scale: transparent/white to dark green
    colors: ['#ffffff', '#d4f1d4', '#a8e3a8', '#7dd57d', '#41ab5d', '#238b45', '#006d2c', '#00441b', '#002d12'],
    values: ['0', '100', '500', '1k', '1.5k', '2k', '3k', '5k+', ''],
    unit: 'tonnes',
    description: 'White = No production, Dark green = High production'
  }
};

// Function to create gradient CSS
function createGradient(colors) {
  const stops = colors.map((color, i) => 
    `${color} ${(i / (colors.length - 1)) * 100}%`
  ).join(', ');
  return `linear-gradient(to right, ${stops})`;
}

// Function to update the legend
function updateLegend() {
  if (!map) return;
  
  // Remove old legend if it exists
  if (legendControl) {
    map.removeControl(legendControl);
  }
  
  // Get enabled layers
  const enabledLayers = [];
  if (map.hasLayer(raiLayer)) {
    enabledLayers.push('RAI');
  }
  if (map.hasLayer(worldPopLayer)) {
    enabledLayers.push('World Population');
  }
  if (map.hasLayer(globalRiceLayer)) {
    enabledLayers.push('Global Rice');
  }
  
  // Only show legend if there are enabled layers
  if (enabledLayers.length === 0) {
    return;
  }
  
  // Create custom legend control
  legendControl = L.control({ position: 'bottomright' });
  
  let isLegendCollapsed = false;
  
  legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'custom-legend');
    div.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
    div.style.padding = '8px';
    div.style.borderRadius = '6px';
    div.style.border = '1px solid #334155';
    div.style.color = 'white';
    div.style.fontSize = '11px';
    div.style.minWidth = '160px';
    div.style.maxWidth = '180px';
    div.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    div.style.cursor = 'pointer';
    
    const contentDiv = L.DomUtil.create('div', 'legend-content');
    
    const headerDiv = L.DomUtil.create('div', 'legend-header');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '8px';
    headerDiv.style.fontWeight = '600';
    headerDiv.style.fontSize = '12px';
    headerDiv.style.cursor = 'pointer';
    
    const titleSpan = L.DomUtil.create('span');
    titleSpan.textContent = 'Color Scale';
    
    const toggleSpan = L.DomUtil.create('span', 'legend-toggle');
    toggleSpan.textContent = '▼';
    toggleSpan.style.fontSize = '10px';
    toggleSpan.style.color = '#60a5fa';
    
    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(toggleSpan);
    contentDiv.appendChild(headerDiv);
    
    const scalesDiv = L.DomUtil.create('div', 'legend-scales');
    
    enabledLayers.forEach((layerType, index) => {
      const scale = colorScales[layerType];
      if (!scale) return;
      
      if (index > 0) {
        const separator = L.DomUtil.create('div');
        separator.style.marginTop = '10px';
        separator.style.borderTop = '1px solid #334155';
        separator.style.paddingTop = '10px';
        scalesDiv.appendChild(separator);
      }
      
      const scaleDiv = L.DomUtil.create('div');
      scaleDiv.style.marginBottom = '6px';
      
      const nameDiv = L.DomUtil.create('div');
      nameDiv.textContent = scale.name;
      nameDiv.style.fontWeight = '500';
      nameDiv.style.marginBottom = '4px';
      nameDiv.style.color = '#60a5fa';
      nameDiv.style.fontSize = '10px';
      
      const gradientDiv = L.DomUtil.create('div');
      gradientDiv.style.height = '16px';
      gradientDiv.style.borderRadius = '3px';
      gradientDiv.style.marginBottom = '3px';
      gradientDiv.style.background = createGradient(scale.colors);
      gradientDiv.style.border = '1px solid #475569';
      
      const valuesDiv = L.DomUtil.create('div');
      valuesDiv.style.display = 'flex';
      valuesDiv.style.justifyContent = 'space-between';
      valuesDiv.style.fontSize = '9px';
      valuesDiv.style.color = '#cbd5e1';
      
      const minSpan = L.DomUtil.create('span');
      minSpan.textContent = scale.values[0];
      const maxSpan = L.DomUtil.create('span');
      maxSpan.textContent = scale.values[scale.values.length - 1];
      
      valuesDiv.appendChild(minSpan);
      valuesDiv.appendChild(maxSpan);
      
      scaleDiv.appendChild(nameDiv);
      scaleDiv.appendChild(gradientDiv);
      scaleDiv.appendChild(valuesDiv);
      
      // Add description if available
      if (scale.description) {
        const descDiv = L.DomUtil.create('div');
        descDiv.textContent = scale.description;
        descDiv.style.fontSize = '8px';
        descDiv.style.color = '#94a3b8';
        descDiv.style.marginTop = '2px';
        descDiv.style.fontStyle = 'italic';
        scaleDiv.appendChild(descDiv);
      }
      
      scalesDiv.appendChild(scaleDiv);
    });
    
    contentDiv.appendChild(scalesDiv);
    div.appendChild(contentDiv);
    
    // Toggle functionality
    L.DomEvent.on(headerDiv, 'click', function() {
      isLegendCollapsed = !isLegendCollapsed;
      if (isLegendCollapsed) {
        scalesDiv.style.display = 'none';
        toggleSpan.textContent = '▶';
      } else {
        scalesDiv.style.display = 'block';
        toggleSpan.textContent = '▼';
      }
    });
    
    // Prevent map clicks when clicking on legend
    L.DomEvent.disableClickPropagation(div);
    
    return div;
  };
  
  legendControl.addTo(map);
}

function updateMapView(map, country) {
  if (map && countryViewConfig[country]) {
    const config = countryViewConfig[country];
    console.log(`Updating map view for ${country}:`, config);
    
    // Set zoom restrictions for this country
    map.setMinZoom(config.minZoom);
    map.setMaxZoom(config.maxZoom);
    
    // Set bounding box to restrict panning to country area
    // Skip bounds for Global view to allow free panning
    if (country === "Global") {
      map.setMaxBounds(null); // Remove bounds restriction for global view
    } else if (config.bounds) {
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

  return Promise.all(layerQueries)
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
                // Population Density: Values are in thousands of people per grid cell
                // Scale the value by 1000 to get actual population count
                const actualPopulation = numValue * 1000;
                const formattedValue = actualPopulation >= 1000
                  ? actualPopulation.toLocaleString('en-US', { maximumFractionDigits: 0 })
                  : actualPopulation.toFixed(0);
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

  // Add "Global" as the first option and make it active by default
  const globalDiv = document.createElement("div");
  globalDiv.className = "country active";
  globalDiv.dataset.country = "global";
  globalDiv.dataset.countryName = "Global";
  globalDiv.textContent = "Global";
  flagBar.appendChild(globalDiv);

  const unique = new Set();

  // Hardcoded country array, sorted by continent area → country area
  // I used ChatGPT to get the areas.
  const countriesByArea = [
    // North America
    { name: "USA", continent: "North America", area: 9834000 },

    // South America
    { name: "Brazil", continent: "South America", area: 8516000 },

    // Asia
    { name: "China", continent: "Asia", area: 9597000 },
    { name: "India", continent: "Asia", area: 3287000 },
    { name: "Indonesia", continent: "Asia", area: 1905000 },
    { name: "Pakistan", continent: "Asia", area: 881000 },
    { name: "Myanmar", continent: "Asia", area: 676000 },
    { name: "Thailand", continent: "Asia", area: 513000 },
    { name: "Japan", continent: "Asia", area: 378000 },
    { name: "Vietnam", continent: "Asia", area: 331000 },
    { name: "Philippines", continent: "Asia", area: 300000 },
    { name: "Laos", continent: "Asia", area: 237000 },
    { name: "Cambodia", continent: "Asia", area: 181000 },
    { name: "Bangladesh", continent: "Asia", area: 148000 },
    { name: "Nepal", continent: "Asia", area: 147000 },
    { name: "South Korea", continent: "Asia", area: 100000},
    { name: "Sri Lanka", continent: "Asia", area: 66000 },

    // Africa
    { name: "Egypt", continent: "Africa", area: 1010000 },
    { name: "Nigeria", continent: "Africa", area: 923000 },
    { name: "Madagascar", continent: "Africa", area: 587000 },
  ];


  countriesByArea.forEach((country, i) => {
    const countryId = country.name.toLowerCase().replace(/ /g, "_");

    const div = document.createElement("div");
    div.className = "country";
    div.dataset.country = countryId;
    div.dataset.countryName = country.name; // Store the actual country name
    div.textContent = country.name;

    flagBar.appendChild(div);
  });

  // Optional: get current button order
  window.getFlagOrder = function() {
    return Array.from(document.querySelectorAll(".country"))
      .map(btn => btn.dataset.countryName);
  };

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
    // For Global view, don't show country-specific metrics
    if (countryName === "Global") {
      header.innerHTML = `Global Overview – ${year} <span style="color: #94a3b8; font-size: 0.9em;">(Click on map to view data)</span>`;
    } else {
      const row = data.find(r => r.Country === countryName && String(r.Year) === String(year));
      const raiValue = row ? row.National_RAI : "N/A";
      const ssrValue = row ? row.SSR : "N/A";
      
      header.innerHTML = `Heatmap for ${
        countryName ? countryName.toUpperCase() : "—"
      } – ${year} – RAI: ${raiValue}%<span class="tooltip-trigger" data-tooltip="rai">ℹ️<span class="tooltip-content"><h4>Rice Accessibility Index (RAI)</h4><p>Measures whether rice produced within 50km of each location can meet local consumption needs.</p><ul><li><strong>100%</strong> = Local production meets local demand</li><li><strong>&gt;100%</strong> = Surplus production nearby</li><li><strong>&lt;100%</strong> = Insufficient local production</li></ul><p>This reveals vulnerabilities in the food system even when national production seems adequate. Urban areas often show low RAI due to geographic separation from rural production zones.</p></span></span> – SSR: ${ssrValue}%<span class="tooltip-trigger" data-tooltip="ssr">ℹ️<span class="tooltip-content"><h4>Self-Sufficiency Ratio (SSR)</h4><p>Measures whether a country's total rice production can meet its total national consumption needs.</p><ul><li><strong>100%</strong> = National production meets national demand</li><li><strong>&gt;100%</strong> = Net exporter (produces surplus)</li><li><strong>&lt;100%</strong> = Import dependent (production deficit)</li></ul><p>This shows overall national food security but doesn't reveal regional vulnerabilities or supply chain risks within the country.</p></span></span>`;
    }

    // Add click handlers for tooltips (only if tooltips exist)
    const tooltipTriggers = header.querySelectorAll('.tooltip-trigger');
    if (tooltipTriggers.length > 0) {
      tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          // Close all other tooltips
          tooltipTriggers.forEach(t => {
            if (t !== trigger) {
              t.classList.remove('active');
            }
          });
          // Toggle current tooltip
          trigger.classList.toggle('active');
        });
      });

      // Close tooltips when clicking outside
      document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
          tooltipTriggers.forEach(trigger => {
            trigger.classList.remove('active');
          });
        }
      });
    }

    // render right panel
    if(category === "generic_data")
    {
      rightPanel.load(StackedPage, { year: parseInt(year), data });
    }
    // else if(category === "world_pop")
    // {
    //   rightPanel.load(WorldPopPage, { year: parseInt(year), data });

    // }
    if(window.stackedPageInfo) {
      const colors = window.stackedPageInfo.colors;
      document.querySelectorAll(".country").forEach(btn => {
        const cname = btn.dataset.countryName;
        btn.style.borderLeft = `8px solid ${colors[cname]}`;
       
      });
    }
    
  
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

        setTimeout(() => {
          if (window.sharedState.highlightedCountry && window.stackedLabelHelpers) {
            window.stackedLabelHelpers.updateAllLabelsForCountry(
              window.sharedState.highlightedCountry
            );
          }
        }, 50);
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

document.addEventListener("DOMContentLoaded", () => {
  startRiceEffect();
});

function startRiceEffect() {
  const overlay = document.getElementById("riceOverlay");

  const RICE_COUNT = 2500;  // ⬅️ doubled for more coverage
  const riceElements = [];
  const radius = 70;         // slightly larger brush radius

  function createRice() {
      const NO_RICE_HEIGHT = 100; // <-- bottom area to avoid

    for (let i = 0; i < RICE_COUNT; i++) {
      const rice = document.createElement("div");
      rice.classList.add("rice");

      // Starting positions
      rice.x = Math.random() * window.innerWidth;
    rice.y = Math.random() * (window.innerHeight - NO_RICE_HEIGHT);

      rice.style.left = rice.x + "px";
      rice.style.top = rice.y + "px";

      // We track the rice's current pushed offset
      rice.offsetX = 0;
      rice.offsetY = 0;

      overlay.appendChild(rice);
      riceElements.push(rice);
    }
  }

  createRice();

  // Brush: push rice permanently
  document.addEventListener("mousemove", (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    riceElements.forEach((rice) => {
      const dx = rice.x + rice.offsetX - mx;
      const dy = rice.y + rice.offsetY - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const angle = Math.atan2(dy, dx);
        const pushDist = (radius - dist) * 0.9;

        // Update permanent offset
        rice.offsetX += Math.cos(angle) * pushDist;
        rice.offsetY += Math.sin(angle) * pushDist;

        // Apply transform
        rice.style.transform = `translate(${rice.offsetX}px, ${rice.offsetY}px)`;
      }
    });
  });

  // Click to remove overlay
overlay.addEventListener("click", () => {
  overlay.remove();  // instantly remove rice screen

  // Show second screen
  const second = document.getElementById("secondOverlay");
  second.style.display = "flex";
});


const second = document.getElementById("secondOverlay");

second.addEventListener("click", () => {
  second.remove();   // instantly remove second screen
  // User now sees the main index.html content
});

}
