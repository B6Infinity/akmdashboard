import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
  Tooltip
} from "react-leaflet"

// import wardData from "../data/AKM_Wards.geojson"
import { useEffect, useState } from "react";



function Map({ selectedReportTooltipContent }) { // Unpack right here
  const selectedReportLocation = selectedReportTooltipContent?.location;
  const selectedReportPhotoURL = selectedReportTooltipContent?.photo_url;
  const selectedReportType = selectedReportTooltipContent?.type;
  const selectedReportRemarks = selectedReportTooltipContent?.remarks;

  // console.log('selectedLocation :>> ', selectedLocation);

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