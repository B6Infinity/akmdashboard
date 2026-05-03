let AKM_CENTER = [22.83, 88.63];
const map = L.map('map').setView(AKM_CENTER, 14);

// Init with tileLayer
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// Global Vars
let AKM_Boundary = null;
let AKM_Roads = null;

// Map Layer Functions
function fetchAKMBoundary() {
    // Loading geoJSON data
    return fetch('AKM_Boundary.geojson')
        .then(response => response.json())
        .then(data => {
            AKM_Boundary = data;
            console.log('AKM_Boundary loaded', AKM_Boundary);
        })
        .catch(error => console.error('Failed to load AKM_Wards.json:', error));
}

function fetchAKMRoads() {
    return fetch('AKM_Roads.geojson')
        .then(response => response.json())
        .then(data => {
            AKM_Roads = data;
            console.log('AKM_Roads loaded:', AKM_Roads.features.length);
        });
}

function inferAuthority(properties) {

  if (properties.ref?.startsWith("NH")) {
    return "NHAI";
  }

  if (properties.highway === "trunk") {
    return "PWD";
  }

  return "Municipality";
}

async function drawAKMBoundary() {
    await fetchAKMBoundary();
    await fetchAKMRoads();

    // Draw the boundaries
    // L.geoJSON(AKM_Boundary).addTo(map);
    // Draw the roads
    L.geoJSON(AKM_Roads, {
        onEachFeature: (feature, layer) => {
            const tooltipContent = `OSM ID: ${feature.properties.osm_id || 'N/A'}<br>Name: ${feature.properties.name || 'N/A'}<br>Ref: ${feature.properties.ref || 'N/A'}<br>Authority: ${inferAuthority(feature.properties)}`;
            layer.bindTooltip(tooltipContent, {direction: 'top', sticky: true});

            layer.on("click", () => {

                console.log("OSM ID:", feature.properties.osm_id);
                console.log("Name:", feature.properties.name);
                console.log("Ref:", feature.properties.ref);
                
                // Evaluate authority (basic MVP prototype)
                console.log("Authority:", inferAuthority(feature.properties));
                


            });
        }
    }).addTo(map);


    console.log('Drawn bound');
}


// Map Event Handling ------------------------------
var popup = L.popup();


// Event Handlers ------------------
// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);




// Execute ----------------------------------
drawAKMBoundary();