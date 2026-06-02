import { turfFunctions } from "./turfPractice.js";
import * as layers from "./layers.js";
let activeWmsLayers = {};
const overlayLayers = {};
let districtsLayer;
let choroplethLayer;
let heatMapLayer;
let markersLayer;

let map = L.map('map', {
  center: [58.374, 26.715],
  zoom: 18,
  zoomControl: true
})

map.createPane('customDistrictsPane');
map.getPane('customDistrictsPane').style.zIndex = 390;

map.zoomControl.setPosition('topright');

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors'
})

osmLayer.addTo(map)

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS community',
  maxZoom: 19
})

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
})

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
}

const layerControlOptions = {
  collapsed: false,
  position: 'topleft'
};

function loadWmsLayers(layersList, overlayLayers, activeWmsLayersObj) {
  layersList.forEach(layer => {
    let paneName = `${layer.layers}-pane`;
    map.createPane(paneName);
    map.getPane(paneName).style.zIndex = layer.zIndex;

    let newLayer = L.tileLayer.wms(layer.url, {
      version: layer.version,
      layers: layer.layers,
      format: layer.format,
      transparent: layer.transparent,
      pane: paneName,
    });
    
    overlayLayers[layer.title.en] = newLayer;
    activeWmsLayersObj[layer.layers] = false;
  }); 
}



async function loadDistrictsLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();

    districtsLayer = L.geoJson(data, {
      pane: 'customDistrictsPane',
      style: function (feature) {
        return {
          fillColor: getDistrictColor(feature.properties.OBJECTID),
          fillOpacity: 0.5,
          weight: 1,
          color: 'grey'
        };
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          feature.properties.NIMI ||
          'District ' + feature.properties.OBJECTID
        );
      }
    });
    overlayLayers["Districts"] = districtsLayer;

  } catch (error) {
    console.error("Failed to load districts:", error);
  }
}

function getDistrictColor(id) {
  switch (id) {
    case 1: return '#ff0000';
    case 13: return '#009933';
    case 6: return '#0000ff';
    case 7: return '#ff0066';
    default: return '#ffffff';
  }
}

async function loadChoroplethLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();

    choroplethLayer = L.choropleth(data, {
      pane: 'customDistrictsPane',
      valueProperty: 'OBJECTID',
      scale: ['#e6ffe6', '#004d00'],
      steps: 11,
      mode: 'q',
      style: {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup('Value: ' + feature.properties.OBJECTID);
      }
    });

overlayLayers["Choropleth"] = choroplethLayer;

  } catch (error) {
    console.error("Failed to load choropleth:", error);
  }
}

async function loadHeatMapLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson');
    const data = await response.json();

    const heatData = data.features.map(function(feature) {
      return [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.area || 1
      ];
    });

    heatMapLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17
    });

overlayLayers["Heatmap"] = heatMapLayer;

  } catch (error) {
    console.error("Error loading heatmap:", error);
  }
}

async function loadMarkersLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()

    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: 'red',
          fillOpacity: 0.5,
          color: 'red',
          weight: 1,
          opacity: 1
        })
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          layer.bindPopup('Cell Tower<br>Area: ' + (feature.properties.area || 'Unknown'))
        }
      }
    })
     markersLayer = L.markerClusterGroup();
     markersLayer.addLayer(geoJsonLayer);

     overlayLayers["Cell Towers"] = markersLayer;

  } catch (error) {
    console.error("Error loading markers data:", error)
  }
}

async function initializeLayers() {

    loadWmsLayers(layers.wmsLayers, overlayLayers, activeWmsLayers);
  await Promise.all([
    loadDistrictsLayer(),
    loadChoroplethLayer(),
    loadHeatMapLayer(),
    loadMarkersLayer()
  ]);

  const layerControl = L.control.layers(
    baseLayers,
    overlayLayers,
    {
      collapsed: false,
      position: 'topleft'
    }
  );

  layerControl.addTo(map);

  osmLayer.addTo(map);
}


function toggleActiveState(layerId, boolean) {
  if (typeof(activeWmsLayers[layerId]) == "boolean") {
    activeWmsLayers[layerId] = boolean;
  }
}

map.on('overlayadd', (event) => {
  if (event.layer.options && event.layer.options.layers) {
    const layerId = event.layer.options.layers;
    toggleActiveState(layerId, true);
    console.log("Aktiivsed WMS kihid (lisatud):", activeWmsLayers);
  }
});

map.on('overlayremove', (event) => {
  if (event.layer.options && event.layer.options.layers) {
    const layerId = event.layer.options.layers;
    toggleActiveState(layerId, false);
    console.log("Aktiivsed WMS kihid (eemaldatud):", activeWmsLayers);
  }
});



initializeLayers();


function buildRequestUrl(e, baseUrl, layerName) {
  const bounds = map.getBounds();
  
  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',');

  const size = map.getSize();
  const sizeX = size.x;
  const sizeY = size.y;

  const xPoint = Math.round(e.containerPoint.x);
  const yPoint = Math.round(e.containerPoint.y);

  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    query_layers: layerName,
    layers: layerName,
    info_format: 'application/json',
    x: xPoint,
    y: yPoint,
    srs: 'EPSG:4326',
    width: sizeX,
    height: sizeY,
    bbox: bbox
  });

  return baseUrl + params.toString();
}


function getLayerName(layersData, layerName) {
  const layerObj = layersData.filter(entry => entry.layers === layerName);
  
  if (layerObj.length > 0) {
    return layerObj[0].title.en;
  }
  return layerName;
}

function fetchWmsData(fullUrl, layerName) {
  fetch(fullUrl)
  .then(response => response.json())
  .then(data => {
    const content = document.getElementById('info-content');
    
    const friendlyTitle = getLayerName(layers.wmsLayers, layerName);

    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0]; 
      const props = feature.properties;
      
      let html = `<h4>${friendlyTitle}</h4><ul>`;
      for (const key in props) {
        html += `<li><strong>${key}:</strong> ${props[key]}</li>`;
      }
      html += '</ul>';
      
      content.innerHTML = html;
    } else {
      content.innerHTML = `<em>No features found for ${friendlyTitle}</em><br>`;
    }
  })
  .catch(error => {
    console.error('Request failed:', error);
    const content = document.getElementById('info-content');
    const friendlyTitle = getLayerName(layers.wmsLayers, layerName);
    content.innerHTML = `<em style="color:red;">Error loading data for ${friendlyTitle}</em>`;
  });
}


map.on('click', function(event) {
  const infoWindowContent = document.getElementById('info-content');
  infoWindowContent.innerHTML = "";

  map.eachLayer(function(layer) {
    if (layer.options && layer.options.layers && activeWmsLayers[layer.options.layers] === true) {
      
      document.getElementById('info-box').style.display = 'block';
      
      const baseUrl = layer._url; 
      const layerName = layer.options.layers;
      
      const fullUrl = buildRequestUrl(event, baseUrl, layerName);
      fetchWmsData(fullUrl, layerName);
    }
  });
});

document.getElementById('info-close').addEventListener('click', () => {
  document.getElementById('info-box').style.display = 'none';
});





function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12);
}

document.getElementById("applySettingsButton")
  .addEventListener("click", defaultMapSettings);

turfFunctions(map);