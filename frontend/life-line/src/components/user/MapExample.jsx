import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  GeoJSON,
} from "react-leaflet";
import { useEffect, useState } from "react";

export default function MapExample() {

  const [boundary, setBoundary] = useState(null);

  useEffect(() => {
    async function loadCity(cityName) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&polygon_geojson=1`
      );
      const data = await res.json();
      const city = data[0];

      const lat = parseFloat(city.lat);
      const lon = parseFloat(city.lon);

      setCenter([lat, lon]);
      setBoundary(city.geojson);
    }

    loadCity("Jaipur"); 
  }, []);

  return (
    <div className="w-[80vw] h-[80vh] ml-[20vw] mt-[2vh]">
      {center && (
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {boundary && (
            <GeoJSON data={boundary} style={{ color: "blue", weight: 2 }} />
          )}
        </MapContainer>
      )}
    </div>
  );
}
