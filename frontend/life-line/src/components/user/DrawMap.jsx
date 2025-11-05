import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import Sidebar from "./Sidebar";
import busIconImg from "../../assets/bus.png";

export default function LeafletDrawMap() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const points = [
    {
      id: 1,
      name: "Central & Broadway",
      alert: "Emergency Override Active",
      video:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBeUa_D-PGEilZ98ew_KzN_Szviq0-arRMektddig3fwxx61O-s-x4bTk5Wa0GD6VBUMO0_0uU…",
      metrics: { cars: 42, wait: "15s" },
      position: [28.6139, 77.209],
    },

    {
      id: 2,
      name: "Stop B",
      alert: "Normal Operation",
      video: "https://picsum.photos/800/450",
      metrics: { cars: 30, wait: "20s" },
      position: [28.7041, 77.1025],
    },
  ];
  const [segments, setRoads] = useState([
    {
      id: "R1",
      points: [
        [28.6139, 77.209],
        [28.7041, 77.1025],
      ],
      mid: { lat1: 26.55, lon1: 75.49, lat2: 28.38, lon2: 77.42 }, // midpoint used for TomTom lookup
      severity: "moderate", // this gets updated from backend
    },
  ]);
  // useEffect(() => {
  async function updateTraffic() {
    const updated = await Promise.all(
      segments.map(async (road) => {
        console.log("Calling backend for:", road);

        const res = await fetch(
          `http://localhost:8000/route-with-traffic?start_lat=${road.mid.lat1}&start_lon=${road.mid.lon1}&end_lat=${road.mid.lat2}&end_lon=${road.mid.lon2}`
        );

        const data = await res.json();

        const severities = data.segments.map((seg) => seg[2]);

        function worst(sev) {
          if (sev.includes("emergency")) return "emergency";
          if (sev.includes("heavy")) return "heavy";
          if (sev.includes("moderate")) return "moderate";
          return "low";
        }

        return { ...road, severity: worst(severities) };
      })
    );

    setRoads(updated);
  }

  // useEffect(() => {
  //   updateTraffic();
  //   const interval = setInterval(updateTraffic, 15000);
  //   return () => clearInterval(interval);
  // }, [segments]);

  //   const interval = setInterval(updateTraffic, 15000);

  //   return () => clearInterval(interval);
  // }, []);
  // updateTraffic();

  const colors = {
    low: "#38A169",
    moderate: "#D69E2E",
    heavy: "#E53E3E",
    emergency: "#9F7AEA",
  };

  const severityColors = {
    low: "#38A169",
    moderate: "#D69E2E",
    heavy: "#E53E3E",
    emergency: "#9F7AEA",
  };

  return (
    <>
      <div>
        <header className="z-[9999] flex sticky top-0 left-0 shrink-0 items-center justify-between border-b border-white/10 bg-background-light px-6 py-3 font-display text-black bg-gray-100 ">
          <div className="flex items-center gap-4 ">
            <span className="material-symbols-outlined  text-2xl">traffic</span>
            <h2 className=" text-lg font-bold leading-tight tracking-[-0.015em]">
              City Traffic Command
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-4">
            <label className="flex flex-col h-10 w-full max-w-sm">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-gray-400 flex border-none bg-zinc-200 items-center justify-center pl-3 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black focus:outline-0 focus:ring-0 border-none bg-zinc-200 focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  placeholder="Search for intersections or addresses"
                />
              </div>
            </label>
            <div className="flex gap-2">
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              data-alt="User profile picture"
              style={{
                backgroundImage: `url(
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCNFkrQLsbAuoBZp2vi7tFNSaueqiG4isoudsHNGXy4OCOSVqqF6WQp_fjau7-5fxyFFIbgul31lBwnqvVmov1kcdsPFTrWGOi83s9amJwNejH6WAc1IUtDAfQCC0ZD9Jl8gt3cRR9b1YVdqvepCjA0dvBd7iPiE6u6X29bGrKHrBZpP0URk-1LPlBKKdqNYnVgdtGieIAHFOT96TB2irlxiakiQ96l8NmVYtaeudyaljKN32fCR0qrmLk0URhz7iOInE7llB8AaJk"
                )`,
              }}
            ></div>
          </div>
        </header>
        <div className="w-full h-screen flex">
          <div className="w-[20vw] h-screen fixed">
            <Sidebar />
          </div>
          <div className="w-[80vw] h-[80vh] ml-[20vw] mt-[2vh]">
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
                  eventHandlers={{
                    click: () => setSelectedPoint(point),
                  }}
                />
              ))}
              {segments.map((seg, i) => {
                if (i === 0) return null;
                return (
                  <Polyline
                    key={i}
                    positions={[
                      [segments[i - 1][0], segments[i - 1][1]],
                      [segments[i][0], segments[i][1]],
                    ]}
                    pathOptions={{
                      color: colors[segments[i][2]], // severity
                      weight: 7,
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>
        </div>
        {selectedPoint && (
          <div
            className="z-[9999] absolute top-20 right-4 w-96 rounded-2xl 
  bg-white border border-gray-200 shadow-xl p-6 flex flex-col gap-6 animate-fadeIn"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPoint.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <p className="text-sm text-blue-600 font-medium">
                    {selectedPoint.alert}
                  </p>
                </div>
              </div>

              <button
                className="text-gray-400 hover:text-gray-600 transition"
                onClick={() => setSelectedPoint(null)}
              >
                ✕
              </button>
            </div>

            {/* Video feed */}
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
              <img
                src={selectedPoint.video}
                className="w-full h-full object-cover"
                alt="location feed"
              />
            </div>

            {/* Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Real-time Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <p className="text-gray-500">Cars/Min</p>
                  <p className="text-gray-900 font-semibold text-lg leading-tight">
                    {selectedPoint.metrics.cars}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <p className="text-gray-500">Avg Wait</p>
                  <p className="text-gray-900 font-semibold text-lg leading-tight">
                    {selectedPoint.metrics.wait}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Manual Override
              </h4>
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-[#4f46e5] text-white hover:bg-primary-dark 
        rounded-lg py-2 text-sm font-semibold transition"
                >
                  Optimize
                </button>
                <button
                  className="flex-1 bg-red-500 text-white hover:bg-red-600 
        rounded-lg py-2 text-sm font-semibold transition"
                >
                  All Red
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
