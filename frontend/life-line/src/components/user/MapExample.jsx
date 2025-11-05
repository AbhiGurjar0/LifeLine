import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import busIconImg from "../../assets/bus.png";

const busIcon = L.icon({
  iconUrl: busIconImg,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

export default function MapExample() {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const points = [
    { 
      id: 1,
      name: "Central & Broadway",
      alert: "Emergency Override Active",
      video: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeUa_D-PGEilZ98ew_KzN_Szviq0-arRMektddig3fwxx61O-s-x4bTk5Wa0GD6VBUMO0_0uU…", 
      metrics: { cars: 42, wait: "15s" },
      position: [28.6139, 77.209] 
    },

    { 
      id: 2,
      name: "Stop B",
      alert: "Normal Operation",
      video: "https://picsum.photos/800/450",
      metrics: { cars: 30, wait: "20s" },
      position: [28.7041, 77.1025] 
    },
  ];

  return (
    <div className="relative">
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={11}
        style={{ height: "100vh" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {points.map((point) => (
          <Marker
            key={point.id}
            position={point.position}
            icon={busIcon}
            eventHandlers={{
              click: () => setSelectedPoint(point),
            }}
          />
        ))}
      </MapContainer>

      {/* ✅ Floating Side Popup Panel */}
      {selectedPoint && (
        <div className="z-[] absolute top-4 right-4 w-96 rounded-xl bg-background-dark/80 backdrop-blur-md border border-white/10 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedPoint.name}</h3>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#9F7AEA]"></div>
                <p className="text-sm text-purple-400">{selectedPoint.alert}</p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSelectedPoint(null)}
            >
              ✕
            </button>
          </div>

          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <img
              src={selectedPoint.video}
              className="w-full h-full object-cover"
              alt="location feed"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Real-time Metrics</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400">Cars/Min</p>
                <p className="text-white font-semibold text-lg">
                  {selectedPoint.metrics.cars}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400">Avg Wait</p>
                <p className="text-white font-semibold text-lg">
                  {selectedPoint.metrics.wait}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Manual Override</h4>
            <div className="flex gap-2">
              <button className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg py-2 text-sm font-semibold transition-colors">
                Optimize
              </button>
              <button className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg py-2 text-sm font-semibold transition-colors">
                All Red
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
