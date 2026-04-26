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

addGeoJson('geojson/tartu_city_districts_edu.geojson');

// add geoJSON layer
async function addGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()

  L.choropleth(data, {
    valueProperty: 'OBJECTID',

    scale: ['#ffffff', '#ff9900'],

    steps: 5,
    mode: 'q',

    style: {
      color: '#fff',
      weight: 2,
      fillOpacity: 0.8,
    },

    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        'District: ' + feature.properties.NIMI +
        '<br>Tower count: ' + feature.properties.OBJECTID
      )
    }
  }).addTo(map)
}