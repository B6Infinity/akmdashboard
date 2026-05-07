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
let AKM_Wards = null;

// Map Layer Functions
function fetchAKMBoundary() {
    // Loading geoJSON data
    return fetch('http://localhost:4000/api/map/boundary')
        .then(response => response.json())
        .then(data => {
            AKM_Boundary = data.data;
            console.log('AKM_Boundary loaded', AKM_Boundary);
        })
        .catch(error => console.error('Failed to load AKM_Wards.json:', error));
}

function fetchAKMRoads() {
    return fetch('http://localhost:4000/api/map/roads')
        .then(response => response.json())
        .then(data => {
            AKM_Roads = data.data;
            console.log('AKM_Roads loaded:', AKM_Roads.features.length);
        });
}

function fetchAKMWards() {
    return fetch('http://localhost:4000/api/map/wards')
        .then(response => response.json())
        .then(data => {
            AKM_Wards = data.data;

            console.log('AKM_Wards loaded:', AKM_Wards.data);
        });
}

// Helpers
function inferAuthority(properties) {

    if (properties.ref?.startsWith("NH")) {
        return "NHAI";
    }

    if (properties.highway === "trunk") {
        return "PWD";
    }

    return "Municipality";
}

async function drawGeoSpatialLayers() {
    // Fetch em all
    await fetchAKMBoundary();
    await fetchAKMRoads();
    await fetchAKMWards();

    // Draw em all

    // L.geoJSON(AKM_Boundary).addTo(map);

    L.geoJSON(AKM_Roads, {
        onEachFeature: (feature, layer) => {
            const tooltipContent = `OSM ID: ${feature.properties.osm_id || 'N/A'}<br>Name: ${feature.properties.name || 'N/A'}<br>Ref: ${feature.properties.ref || 'N/A'}<br>Authority: ${inferAuthority(feature.properties)}`;
            layer.bindTooltip(tooltipContent, { direction: 'top', sticky: true });

            layer.on("click", () => {

                console.log("OSM ID:", feature.properties.osm_id);
                console.log("Name:", feature.properties.name);
                console.log("Ref:", feature.properties.ref);

                // Evaluate authority (basic MVP prototype)
                console.log("Authority:", inferAuthority(feature.properties));



            });
        }
    }).addTo(map);

    L.geoJSON(AKM_Wards).addTo(map);

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
drawGeoSpatialLayers();