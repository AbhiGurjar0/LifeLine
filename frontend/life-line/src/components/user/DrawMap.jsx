import { useEffect, useState } from "react";
import L, { PolyUtil } from "leaflet";
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
const dotIcon = L.divIcon({
  className: "dot-icon",
  html: `<div style="width:8px;height:8px;background:red;border-radius:50%;"></div>`,
});
const dotIcon2 = L.divIcon({
  className: "dot-icon",
  html: `<div style="width:20px;height:20px;background:green;border-radius:50%;"></div>`,
});

const greenSignalIcon = L.divIcon({
  className: "",
  html: `
    <div style="width:20px;height:40px;background:black;border-radius:4px;padding:4px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:12px;height:12px;background:green;border-radius:50%;box-shadow:0 0 8px green;"></div>
    </div>
  `,
});

const redSignalIcon = L.divIcon({
  className: "",
  html: `
    <div style="width:20px;height:40px;background:black;border-radius:4px;padding:4px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:12px;height:12px;background:red;border-radius:50%;box-shadow:0 0 8px red;"></div>
    </div>
  `,
});

export default function LeafletDrawMap() {
  const [coords, setCoords] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  //some random points
  const [points, setPoints] = useState([]);

  //dummy values
  const [dummy, setDummy] = useState(null);
  const [movingPoints, setMovingPoints] = useState([
    [26.912399, 75.787298],
    [26.912399, 75.78739],
    [26.912399, 75.787299],
    [26.912399, 75.797298],
  ]);
  const [routeChunks, setRouteChunks] = useState([]);

  const [indexes, setIndexes] = useState([0, 0, 0, 0]);

  // looping for running coordinate
  useEffect(() => {
    if (!dummy || dummy.length === 0) return;

    const interval = setInterval(() => {
      setMovingPoints((prev) => prev.map((point, i) => dummy[indexes[i]]));
      setIndexes((prev) => prev.map((i) => (i + 1) % dummy.length));
    }, 1000); // every second or choose different speeds

    return () => clearInterval(interval);
  }, [dummy, indexes]);

  //Calling road coordinates funtion
  useEffect(() => {
    async function getCord() {
      let res = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVjOWJlZDI3YzA1ODQ5ZGM4NTMzYTg1NjBmMTc3YjgyIiwiaCI6Im11cm11cjY0In0=&start=75.7873,26.9124&end=77.1025,28.7041`
      );
      res = await res.json();

      // Extract the raw coordinates
      let routeCoords = res.features[0].geometry.coordinates;
      let segPoints = res.features[0].properties.segments[0].steps;

      const stepCoords = segPoints.map((step) => {
        const [start, end] = step.way_points;
        return routeCoords.slice(start, end + 1);
      });

      // Convert [lon,lat] → [lat,lon]
      let latlon = routeCoords.map(([lon, lat]) => [lat, lon]);

      let latlon2 = stepCoords.map((step, index) => {
        // Convert coords of this step
        const converted = step.map(([lon, lat]) => [lat, lon]);

        const firstPoint = converted[0];

        setPoints((prev) => [
          ...prev,
          {
            id: index,
            name: "Point " + index,
            alert: "Emergency Override Active",
            video: "...",
            metrics: { cars: 42, wait: "15s" },
            position: firstPoint,
          },
        ]);

        return converted;
      });

      setSegments(latlon2);

      setCoords(latlon);
      setDummy(latlon);
    }
    getCord();
  }, []);

  //for creating chunks
  useEffect(() => {
    if (coords.length > 0) {
      console.log("✅ Data is now available:", coords);
      function chunkRoute(coords, size = 30) {
        const chunks = [];
        for (let i = 0; i < coords.length; i += size) {
          chunks.push(coords.slice(i, i + size));
        }
        return chunks;
      }
      setRouteChunks(chunkRoute(coords, 30));
    }
  }, [coords]);

  //spiliting colors on road
  function pointNearChunk(point, chunk, threshold = 0.0005) {
    return chunk.some(([lat, lon]) => {
      return (
        Math.abs(point[0] - lat) < threshold &&
        Math.abs(point[1] - lon) < threshold
      );
    });
  }
  const chunkStatus = routeChunks.map((chunk) => {
    const count = movingPoints.filter((point) =>
      pointNearChunk(point, chunk)
    ).length;
    return count >= 2 ? "red" : "green";
  });

  const signalPosition = [26.933803, 75.83302 ];

  function pointsNearSignal(movingPoints, signalPosition, threshold = 0.0005) {
    return movingPoints.some(
      (point) =>
        Math.abs(point[0] - signalPosition[0]) < threshold &&
        Math.abs(point[1] - signalPosition[1]) < threshold
    );
  }
  const [signalIcon, setSignalIcon] = useState(greenSignalIcon);

  useEffect(() => {
    const hasTraffic = pointsNearSignal(movingPoints, signalPosition);

    setSignalIcon(hasTraffic ? redSignalIcon : greenSignalIcon);
  }, [movingPoints]); // runs whenever moving points move

  // async function updateTraffic() {
  //   const updated = await Promise.all(
  //     segments.map(async (road) => {
  //       console.log("Calling backend for:", road);

  //       const res = await fetch(
  //         `http://localhost:8000/route-with-traffic?start_lat=${road.mid.lat1}&start_lon=${road.mid.lon1}&end_lat=${road.mid.lat2}&end_lon=${road.mid.lon2}`
  //       );

  //       const data = await res.json();

  //       const severities = data.segments.map((seg) => seg[2]);

  //       function worst(sev) {
  //         if (sev.includes("emergency")) return "emergency";
  //         if (sev.includes("heavy")) return "heavy";
  //         if (sev.includes("moderate")) return "moderate";
  //         return "low";
  //       }

  //       return { ...road, severity: worst(severities) };
  //     })
  //   );

  //   setRoads(updated);
  // }

  // const colors = {
  //   low: "#38A169",
  //   moderate: "#D69E2E",
  //   heavy: "#E53E3E",
  //   emergency: "#9F7AEA",
  // };

  // const severityColors = {
  //   low: "#38A169",
  //   moderate: "#D69E2E",
  //   heavy: "#E53E3E",
  //   emergency: "#9F7AEA",
  // };

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
              {coords.length > 0 && <Polyline positions={coords} />}
              {segments.map((seg, index) => (
                <Marker
                  eventHandlers={{
                    click: () => {
                      console.log(points);
                      setSelectedPoint(points[index]);
                    },
                  }}
                  key={index}
                  position={seg[0]}
                  icon={dotIcon}
                />
              ))}
              {movingPoints.map((pos, i) => (
                <Marker key={i} position={pos} icon={dotIcon2} />
              ))}
              {routeChunks &&
                routeChunks.map((chunk, index) => (
                  <Polyline
                    key={index}
                    positions={chunk}
                    pathOptions={{ color: chunkStatus[index], weight: 5 }}
                  />
                ))}
              <Marker position={signalPosition} icon={signalIcon} />
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
