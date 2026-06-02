//map
let map = L.map('map').setView([58.373523, 26.716045], 12);

//basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors',
}).addTo(map);

//default
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12);
}

//heatmap
addGeoJson('geojson/tartu_city_celltowers_edu.geojson')
async function addGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const heatData = data.features.map(heatDataConvert)
  const heatMap = L.heatLayer(heatData, { radius: 10 })
  heatMap.addTo(map)
}

function heatDataConvert(feature) {
  return [
    feature.geometry.coordinates[1],
    feature.geometry.coordinates[0],
    feature.properties.area,
  ]
}