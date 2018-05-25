// Store API endpoint inside queryURL
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the earthquakeURL
d3.json(earthquakeURL, function(data) {
    // Once response was retrieved, send the data.features to the createFeatures function
    createFeatures(data.features);
    console.log(data.features);
});

// Create a function that will make marker size by magnitude
function markerSize(magnitude) {
    return magnitude * 20000;
}

function createFeatures(earthquakeData) {
    // Create a GeoJson layer containing the features array on the earthquakeData object
    // Run style, onEachFeature, and pointToLayer functions once for each piece of data in the array
    // Give each feature a popup describing the place and magnitude of the earthquake
    let earthquakes = L.geoJSON(earthquakeData, {
        style: function(feature) {
            let mag = feature.properties.mag;
            if (mag < 1) {
                return {color: "#9bf442"};
            } else if (mag >= 1 && mag < 2) {
                return {color: "#d4f442"};
            } else if (mag >= 2 && mag < 3) {
                return {color: "#f9f104"};
            } else if (mag >= 3 && mag < 4) {
                return {color: "#f9cd04"};
            } else if (mag >= 4 && mag < 5) {
                return {color: "#f98b04"}
            } else {
                return {color: "#f92504"};
            }
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><h3>Magnitude: ${feature.properties.mag}</h3>`);
        },
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng, {
                radius: markerSize(feature.properties.mag),
                fillOpacity: .7,
                stroke: true,
                weight: .5
            })
        }
    });
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the tile layers that will be the background of the map
    let lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWtza2xhciIsImEiOiJjamgxYWhqcHIwaTNnMndsY202ZGN6NmlwIn0.zpndHUS-DwTLIqBGxvNXOQ", {
        maxZoom: 18
    });
    let satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWtza2xhciIsImEiOiJjamgxYWhqcHIwaTNnMndsY202ZGN6NmlwIn0.zpndHUS-DwTLIqBGxvNXOQ", {
        maxZoom: 18
    });

    // Create baseMap object to hold the light and satellite maps
    let baseMaps = {
        "Light Map": lightMap,
        "Satellite Map": satelliteMap
    };
    // Add tectonic plate layer
    let tectonicPlates = new L.LayerGroup();

    // Create overlayMaps object to hold the earthquake and tectonic plates layers
    let overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Create map and passing through lightMap, earthquakes, and tectonicPlates to display when page loads
    let myMap = L.map("map-id", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [lightMap, earthquakes, tectonicPlates]
    });

    // Perform a GET request to the platesURL
    // Create a GeoJson layer containing the features array on the platesData object
    d3.json(platesURL, function(platesData) {
        L.geoJSON(platesData, {
            color: "blue",
            weight: 2
        }).addTo(tectonicPlates);
    });

    // Create an layer control, pass in the baseMaps and overlayMaps.
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function(myMap) {
        let div = L.DomUtil.create("div", "info legend")
            magLevel = [0, 1, 2, 3, 4, 5],
            labels = [];

        for(let i = 0; i < magLevel.length; i++) {
            div.innerHTML += 
                '<i style="background:' + getColor(magLevel[i] + 1) + '"></i> ' +
                magLevel[i] + (magLevel[i + 1] ? '&ndash;' + magLevel[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
}

// Create function for colors in legend
function getColor(d) {
    return 
        d > 5 ? "#f92504":
        d > 4 ? "#f98b04":
        d > 3 ? "#f9cd04":
        d > 2 ? "#f9f104":
        d > 1 ? "#d4f442":
                "#9bf44";
}