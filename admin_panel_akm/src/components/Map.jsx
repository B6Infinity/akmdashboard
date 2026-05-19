import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
  Circle, CircleMarker,
  Tooltip
} from "react-leaflet"

// import wardData from "../data/AKM_Wards.geojson"
import { useEffect, useState } from "react";



function Map({ selectedReportTooltipContent, allIncidents }) { // Unpack right here
  const selectedReportLocation = selectedReportTooltipContent?.location;
  const selectedReportPhotoURL = selectedReportTooltipContent?.photo_url;
  const selectedReportType = selectedReportTooltipContent?.type;
  const selectedReportRemarks = selectedReportTooltipContent?.remarks;

  allIncidents && console.log('Number of Incidents to plot on map :>> ', allIncidents.length);

  // Load Wards
  const [wardData, setWardData] = useState(null);
  useEffect(() => {

    fetch("http://localhost:4000/api/map/wards")
      .then((response) => response.json())
      .then((data) => {
        setWardData(data.data)
      })
      .catch((error) => {
        console.error(error)
      })

  }, [])


  return (
    <MapContainer
      center={[22.845, 88.64]}
      zoom={13}
      style={{
        height: "100%",
        width: "100%"
      }}
    >
      {selectedReportLocation && <MapController selectedLocation={selectedReportLocation} />}




      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />



      {/* <CircleMarker
        center={[22.845, 88.64]}
        pathOptions={{
          color: 'red',       // Border color
          fillColor: 'pink',   // Fill color
          fillOpacity: 0.4     // Opacity of the fill (0 to 1)
        }}
        radius={10}          // Radius in METERS
      /> */}

      {/* Render a circle for each incident in the list */}
      {allIncidents && allIncidents.map((incident) => {

        // Optional: Change circle color based on incident type
        const getCircleColor = (type) => {
          switch (type) {
            case 'pothole': return '#e67e22'; // Orange
            case 'accident': return '#e74c3c'; // Red
            case 'flooding': return '#3498db'; // Blue
            default: return '#9b59b6';        // Purple
          }
        };

        return (
          <Circle
            key={incident.id} // Always use a unique key when mapping in React
            center={[incident.lat, incident.lng]}
            radius={incident.public_attention_score * 200} // Dynamic radius in meters (e.g., score 1.35 * 200 = 270m)
            pathOptions={{
              color: getCircleColor(incident.type),
              fillColor: getCircleColor(incident.type),
              fillOpacity: 0.35,
              weight: 2
            }}
          >
            {/* Optional: Add a popup or tooltip when clicking/hovering the circle */}
            <Popup>
              <div>
                <strong>Type:</strong> {incident.type}<br />
                <strong>Reports:</strong> {incident.no_of_reports}<br />
                <strong>Attention Score:</strong> {incident.public_attention_score}
              </div>
            </Popup>
          </Circle>
        );
      })}


      {selectedReportLocation &&
        <Marker
          position={[selectedReportLocation.lat, selectedReportLocation.lng]}
        >
          <Popup>
            AKM Area
          </Popup>

          <Tooltip permanent>
            <img style={{ maxWidth: '200px', maxHeight: '200px' }} src={selectedReportPhotoURL} alt="" />
            {selectedReportRemarks && (
              <div>
                <b>Remarks: </b>
                {selectedReportRemarks}
              </div>
            )}
          </Tooltip>


        </Marker>
      }

      {/* geoJSON */}
      {wardData && <GeoJSON
        data={wardData}
        style={() => ({
          fillOpacity: 0
        })}
      />}

    </MapContainer>
  )
}

function MapController({ selectedLocation }) {

  const map = useMap();

  useEffect(() => {

    if (!selectedLocation) return


    map.flyTo(
      [selectedLocation.lat, selectedLocation.lng],
      17
    );

  }, [map, selectedLocation])

  return null
}


export default Map