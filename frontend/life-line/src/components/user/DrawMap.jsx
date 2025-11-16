import { useEffect, useState } from "react";
import L, { PolyUtil } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import useWebSocket from "react-use-websocket";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { motion } from "framer-motion";
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
const greenSignalIcon2 = L.divIcon({
  className: "",
  html: `
    <div style="width:40px;height:20px;background:black;border-radius:4px;padding:4px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:12px;height:12px;background:green;border-radius:50%;box-shadow:0 0 8px green;"></div>
    </div>
  `,
});
const carIcon = L.icon({
  iconUrl: "./car.png", // Put a small car icon in public folder
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const redSignalIcon = L.divIcon({
  className: "",
  html: `
    <div style="width:20px;height:40px;background:black;border-radius:4px;padding:4px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:12px;height:12px;background:red;border-radius:50%;box-shadow:0 0 8px red;"></div>
    </div>
  `,
});
const redSignalIcon2 = L.divIcon({
  className: "",
  html: `
    <div style="width:40px;height:20px;background:black;border-radius:4px;padding:4px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:12px;height:12px;background:red;border-radius:50%;box-shadow:0 0 8px red;"></div>
    </div>
  `,
});

export default function LeafletDrawMap() {
  const isAdmin = true;
  const [coords, setCoords] = useState([]);
  const [routeChunks, setRouteChunks] = useState([]);
  const [chunkStatus, setChunkStatus] = useState([]);
  const [movingPoints, setMovingPoints] = useState([]);
  const [coords2, setCoords2] = useState([]);
  const [routeChunks2, setRouteChunks2] = useState([]);
  const [chunkStatus2, setChunkStatus2] = useState([]);
  const [routes, setRoutes] = useState({});

  const [routesData, setRoutesData] = useState([]);

  const [signals, setSignals] = useState({
    id: 1,
    name: "Signal 1 — Moti Bagh",
    phase: "NS",
    remaining: 15,
    NS: 10,
    EW: 5,
    wait_time: 23,
    prediction: "Medium",
  });

  const getPhaseColor = (phase) =>
    phase === "NS" ? "bg-green-500" : "bg-yellow-500";

  const getPredictionColor = (level) =>
    level === "High"
      ? "text-red-500"
      : level === "Medium"
      ? "text-yellow-500"
      : "text-green-500";

  // ✅ WebSocket connection
  useEffect(() => {
    let socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received:", data.routes[0].route_coords);
        if (data.routes) {
          setRoutesData(data.routes);
        }

        // Update only the status and points, NOT route_chunks
        if (data.routes[0].moving_points)
          setMovingPoints(data.routes[0].moving_points);
        if (data.routes[0].chunk_status)
          setChunkStatus(data.routes[0].chunk_status);
        // if (data.data) {
        //   setSignals((prev) => ({
        //     ...prev,
        //     remaining: data.data.signal_details.remain_time,
        //     NS: data.data.signal_details.green_A,
        //     EW: data.data.signal_details.green_B,
        //     phase: data.data.signal_details.curr_phase,
        //     wait_time: data.data.signal_details.wait_time,
        //     curr_NS: data.data.signals.signal2.ns,
        //     curr_EW: data.data.signals.signal2.ew,
        //     curr_state: data.data.signals.signal2.state,
        //   }));
        //   setSignalIcon(() =>
        //     data.data.signal_details.curr_phase == "EW"
        //       ? redSignalIcon
        //       : greenSignalIcon
        //   );
        //   setSignalIcon2(() =>
        //     data.data.signal_details.curr_phase == "NS"
        //       ? redSignalIcon2
        //       : greenSignalIcon2
        //   );
        // }

        // DON'T update routeChunks here - it's already set from /route
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      console.log("Closing WebSocket connection");
      socket.close();
    };
  }, []);

  // ✅ Fetch route coordinates once
  useEffect(() => {
    async function getCord() {
      try {
        let res = await fetch(
          `http://localhost:8000/route?start_lat=28.612894&start_lon=77.229446 &end_lat=28.524428&end_lon=77.185456 `
        );
        res = await res.json();
        res = res.routes;

        const routeCoords = res.route_coords;
        const routeChunksData = res.route_chunks;

        setCoords2(routeCoords);
        setRouteChunks2(routeChunksData);

        // // Initialize chunk_status with green (until WebSocket updates)
        setChunkStatus2(new Array(routeChunksData.length).fill("blue"));
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
    getCord();
  }, []);
  useEffect(() => {
    async function getCord() {
      try {
        let res = await fetch(
          `http://localhost:8000/route?start_lat=28.593&start_lon=77.163 &end_lat=28.572207&end_lon=77.258475 `
        );
        res = await res.json();
        res = res.routes;

        const routeCoords = res.route_coords;
        const routeChunksData = res.route_chunks;

        setCoords(routeCoords);
        setRouteChunks(routeChunksData);

        // // Initialize chunk_status with green (until WebSocket updates)
        setChunkStatus(new Array(routeChunksData.length).fill("green"));
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
    getCord();
  }, []);

  //signal
  const signalPosition = [28.5708, 77.2084];
  const [signalIcon, setSignalIcon] = useState(greenSignalIcon);
  const signalPosition2 = [28.571, 77.209];
  const [signalIcon2, setSignalIcon2] = useState(greenSignalIcon2);

  // useEffect(() => {
  //   const timer = setTimeout(() => {

  //   }, 15000);

  //   // Cleanup timer when component unmounts
  //   return () => clearTimeout(timer);
  // }, [signalIcon]);
  // useEffect(() => {
  //   // const hasTraffic = pointsNearSignal(movingPoints, signalPosition);

  //   setSignalIcon(hasTraffic ? redSignalIcon : greenSignalIcon);
  // }, [movingPoints]); // runs whenever moving points move

  return (
    <>
      <div>
        <header className="z-[9999] flex sticky top-0 left-0 shrink-0 items-center justify-between border-b border-white/10 bg-background-light px-6 py-3 font-display text-black bg-gray-100 backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center gap-4">
            <motion.span
              className="material-symbols-outlined text-2xl"
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              traffic
            </motion.span>
            <motion.h2
              className="text-lg font-bold leading-tight tracking-[-0.015em]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              City Traffic Command
            </motion.h2>
          </div>
          <div className="flex flex-1 justify-end gap-4">
            <motion.label
              className="flex flex-col h-10 w-full max-w-sm"
              whileFocus={{ scale: 1.02 }}
            >
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full backdrop-blur-sm bg-zinc-200/90">
                <div className="text-gray-400 flex border-none bg-zinc-200 items-center justify-center pl-3 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black focus:outline-0 focus:ring-0 border-none bg-zinc-200 focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal focus:bg-white transition-colors duration-200"
                  placeholder="Search for intersections or addresses"
                />
              </div>
            </motion.label>
            <div className="flex gap-2">
              <motion.button
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="material-symbols-outlined"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  notifications
                </motion.span>
              </motion.button>
              <motion.button
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-symbols-outlined">settings</span>
              </motion.button>
            </div>
            <motion.div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300"
              data-alt="User profile picture"
              style={{
                backgroundImage: `url(
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCNFkrQLsbAuoBZp2vi7tFNSaueqiG4isoudsHNGXy4OCOSVqqF6WQp_fjau7-5fxyFFIbgul31lBwnqvVmov1kcdsPFTrWGOi83s9amJwNejH6WAc1IUtDAfQCC0ZD9Jl8gt3cRR9b1YVdqvepCjA0dvBd7iPiE6u6X29bGrKHrBZpP0URk-1LPlBKKdqNYnVgdtGieIAHFOT96TB2irlxiakiQ96l8NmVYtaeudyaljKN32fCR0qrmLk0URhz7iOInE7llB8AaJk"
          )`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            />
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
              {routesData.map((route, routeIndex) => (
                <>
                  <Polyline
                    key={routeIndex}
                    positions={route.route_coords}
                    pathOptions={{
                      color: routeIndex === 0 ? "blue" : "orange",
                    }}
                  />
                  <Polyline key={`coords-${routeIndex}`} positions={coords} />
                  {isAdmin &&
                    route.moving_points.map((p, i) => (
                      <Marker key={i} position={p} icon={carIcon} />
                    ))}
                  {route.route_chunks.map((chunk, cIdx) => (
                      <Polyline
                        key={cIdx}
                        positions={chunk}
                        pathOptions={{ color: chunkStatus[cIdx], weight: 6 }}
                      />
                    ))}
                </>
              ))}
              
              <Marker position={signalPosition} icon={signalIcon} />
              <Marker position={signalPosition2} icon={signalIcon2} />
            </MapContainer>
          </div>
          <motion.div
            className="w-1/3 bg-gray-900 p-4 overflow-y-auto h-screen text-white border-l border-gray-800 backdrop-blur-sm bg-opacity-95"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-2xl font-semibold mb-4 text-center text-blue-400"
              animate={{
                textShadow: [
                  "0 0 8px rgba(59, 130, 246, 0.5)",
                  "0 0 15px rgba(59, 130, 246, 0.8)",
                  "0 0 8px rgba(59, 130, 246, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🚦 Live Signal Dashboard
            </motion.h2>

            {signals && (
              <motion.div
                key={signals.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gray-800 shadow-lg border border-gray-700 hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <motion.h3
                        className="font-semibold text-lg"
                        whileHover={{ color: "#60a5fa" }}
                      >
                        {signals.name}
                      </motion.h3>
                      <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(
                          signals.phase
                        )}`}
                        whileHover={{ scale: 1.1 }}
                        animate={{
                          boxShadow: [
                            "0 0 0px rgba(59, 130, 246, 0)",
                            "0 0 10px currentColor",
                            "0 0 0px rgba(59, 130, 246, 0)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {signals.phase === "NS" ? "North-South" : "East-West"}
                      </motion.span>
                    </div>

                    <div className="mt-3 text-sm space-y-2">
                      <motion.p
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        ⏱️ Remaining Time:{" "}
                        <span className="text-blue-400 font-bold">
                          {signals.remaining}s
                        </span>
                      </motion.p>
                      <motion.p
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        🚗 Predicted Vehicles: NS={signals.NS} | EW={signals.EW}
                      </motion.p>
                      <motion.p
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        🚗 Current Vehicles: NS={signals.curr_NS} | EW=
                        {signals.curr_EW} | curr_state = {signals.curr_state}
                      </motion.p>
                      <p>current_phase = {signals.phase}</p>
                      <motion.p
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        Wait Time(NS) ={signals.wait_time.NS} | Wait Time(EW) =
                        {signals.wait_time.EW}
                      </motion.p>
                      <motion.div
                        className="flex items-center mt-2"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span>Congestion:</span>
                        <Progress
                          className="ml-2 w-full bg-gray-700"
                          value={Math.min((signals.NS + signals.EW) * 3, 100)}
                        />
                      </motion.div>
                      <motion.p
                        className="mt-2 flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        🧠 Prediction:{" "}
                        <span
                          className={`font-semibold ${getPredictionColor(
                            signals.prediction
                          )}`}
                        >
                          {signals.prediction}
                        </span>
                      </motion.p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
