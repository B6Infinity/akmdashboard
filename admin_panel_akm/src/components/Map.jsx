import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap
} from "react-leaflet"

// import wardData from "../data/AKM_Wards.geojson"
import { useEffect, useState } from "react";



function WardMap( selectedLocation ) {

  selectedLocation = selectedLocation.selectedLocation; // Its sending the object packed with object with its own name (i.e., selectedLocation)
  
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
      {selectedLocation && <MapController selectedLocation={selectedLocation}/>}
      

      

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {selectedLocation && 
      <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
        <Popup>
          AKM Area
        </Popup>
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

  }, [selectedLocation])

  return null
}


export default WardMap