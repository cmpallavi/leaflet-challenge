

 // Store our API endpoint as queryUrl.
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

function chooseColor(depth){
  if (depth < 10) return "#00FF00";
  else if (depth < 30) return "greenyellow";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "orangered";
  else return "#FF0000";
}
function colorFunction(feature, layer) {
  return {
    color : "black",
    fillColor : chooseColor(feature.geometry.coordinates[2]),
    fillOpacity : .7,
    weight : 0.5
  };
}


// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    console.log(earthquakeData);
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function featurefunction(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Depth = ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakesLayer = L.geoJSON(earthquakeData, {
    style: colorFunction,
    onEachFeature: featurefunction,
    pointToLayer: (feature, latlng) => {
          return new L.Circle(latlng, feature.properties.mag*20000);
        },
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakesLayer);
}

function createMap(earthquakesLayer) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakesLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakesLayer]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];

    
    let innerHTML = "<table style='text-align: center;background: white;padding: 10px'>"

    for (var i = 0; i < depth.length; i++) {
      innerHTML +=
      '<tr><td style="background:' + chooseColor(depth[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</td> ' + '<td>'+ depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '</td></tr>' : '+</td></tr>');
    }
    innerHTML += "</table>"
    div.innerHTML += innerHTML;
    return div;
  };
  legend.addTo(myMap);
}
