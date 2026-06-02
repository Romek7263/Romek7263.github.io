const styles = {
  polygonYellow: {
    color: "#ffa000",
    fillColor: "#ffa000",
    fillOpacity: 0.3,
    weight: 5,
    opacity: 0.3,
  },
  polygonRed: {
    color: "#e53935",
    fillColor: "red",
    fillOpacity: 0.5,
    weight: 5,
    opacity: 0.3,
  },

  polygonDefault: {
    color: "#1976d2",
    weight: 5,
    opacity: 0.5,
  },

  tileColors: {
    "#d01c25": 1,
    "#ffaa24": 2.5,
    "#fff570": 4,
    "#799ba2": 6,
    "#0049d0": 8,
    "#4e006c": 10,
  },

  vectorTileStyle:
    function(layer) {
      let style = {
        color: "",
        weight: 1,
        fillOpacity: 0.5,
      }

      let suitabilityValue = layer.properties.suitability
      let forestType = layer.properties.tyyp

      if (suitabilityValue !== undefined) {
        let col = ''
        let keys = Object.keys(styles.tileColors)
        let values = Object.values(styles.tileColors)
  
        if (suitabilityValue < values[0]) { col = keys[0] }
        else if (suitabilityValue <= values[1]) { col = keys[1]}
        else if (suitabilityValue <= values[2]) { col = keys[2]}
        else if (suitabilityValue <= values[3]) { col = keys[3]}
        else if (suitabilityValue <= values[4]) {col = keys[4]}
        else {col = keys[5]}
  
        style.color = col
      }

      if (forestType !== undefined) {
        let col = ""
        if (forestType == 10) {
          col = "green"
        } else {
          col = "#68ed4a"
        }
        style.color = col
      }

      return style
    }
  }

export default { styles }
