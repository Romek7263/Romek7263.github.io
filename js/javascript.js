//map
let map = L.map('map').setView([58.373523, 26.716045], 12);

//basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors',
}).addTo(map);

//popup

function popUPinfo(feature, layer) {
  layer.bindPopup(feature.properties.NIMI);
}

//colors
function getColor(property) {
  switch (property) {
    case 1:
      return '#ff0000';
    case 13:
      return '#009933';
    case 6:
      return '#0000ff';
    case 7:
      return '#ff0066';
    default:
      return '#cccccc';
  }
}

//polygons
function polygonStyle(feature) {
  return {
    fillColor: getColor(feature.properties.OBJECTID),
    fillOpacity: 0.5,
    weight: 1,
    opacity: 1,
    color: 'grey',
  };
}

//districts

async function addDistrictsGeoJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  const polygons = L.geoJson(data, {
    onEachFeature: popUPinfo,
    style: polygonStyle,
  });

  polygons.addTo(map);
}
addDistrictsGeoJson('geojson/tartu_city_districts_edu.geojson');
//clusters

async function addCelltowersGeoJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  const markers = L.geoJson(data);
  const clusters = L.markerClusterGroup();
  clusters.addLayer(markers);
  map.addLayer(clusters);
}

addCelltowersGeoJson('geojson/tartu_city_celltowers_edu.geojson');

//default
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12);
}
