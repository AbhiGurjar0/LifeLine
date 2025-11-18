import { useEffect, useState } from "react";
import L, { PolyUtil, popup } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import useWebSocket from "react-use-websocket";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
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
  html: `<div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>`,
});
const dotIcon2 = L.divIcon({
  className: "dot-icon",
  html: `<div class="w-5 h-5 bg-green-500 rounded-full shadow-lg"></div>`,
});

const greenSignalIcon = L.divIcon({
  className: "signal-icon",
  html: `
    <div class="w-5 h-10 bg-gray-900 rounded flex flex-col justify-center items-center p-1 shadow-xl border border-gray-700">
      <div class="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_12px_green] animate-pulse"></div>
    </div>
  `,
});
const greenSignalIcon2 = L.divIcon({
  className: "signal-icon",
  html: `
    <div class="w-10 h-5 bg-gray-900 rounded flex justify-center items-center p-1 shadow-xl border border-gray-700">
      <div class="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_12px_green] animate-pulse"></div>
    </div>
  `,
});
const carIcon = L.icon({
  iconUrl: "./car.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const redSignalIcon = L.divIcon({
  className: "signal-icon",
  html: `
    <div class="w-5 h-10 bg-gray-900 rounded flex flex-col justify-center items-center p-1 shadow-xl border border-gray-700">
      <div class="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_red]"></div>
    </div>
  `,
});
const redSignalIcon2 = L.divIcon({
  className: "signal-icon",
  html: `
    <div class="w-10 h-5 bg-gray-900 rounded flex justify-center items-center p-1 shadow-xl border border-gray-700">
      <div class="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_red]"></div>
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
  const [message, setMessage] = useState([]);

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
        console.log("Received:", data);
        if (data.routes) {
          setRoutesData(data.routes);
        }

        // Update only the status and points, NOT route_chunks
        if (data.routes[0].moving_points)
          setMovingPoints(data.routes[0].moving_points);
        if (data.routes[0].chunk_status)
          setChunkStatus(data.routes[0].chunk_status);
        if (
          data.data_packet &&
          data.data_packet.signal_details &&
          Object.keys(data.data_packet.signal_details).length > 0
        ) {
          const details = data.data_packet.signal_details[1];
          const all = details?.All_details;

          if (details && all) {
            setSignals((prev) => ({
              ...prev,
              remaining: all.remain_time ?? prev.remaining,
              NS: details.pred_NS ?? prev.NS,
              EW: details.pred_EW ?? prev.EW,
              phase: all.curr_phase ?? prev.phase,
              wait_time: all.wait_time ?? prev.wait_time,
              curr_NS: details.ns ?? prev.curr_NS,
              curr_EW: details.ew ?? prev.curr_EW,
              curr_state: all.curr_phase ?? prev.curr_state,
            }));

            setSignalIcon(() =>
              all.curr_phase === "EW" ? redSignalIcon : greenSignalIcon
            );

            setSignalIcon2(() =>
              all.curr_phase === "NS" ? redSignalIcon2 : greenSignalIcon2
            );
            if (details?.message) {
              setMessage(details.message);
            }
          }
        }

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
        // console.log("Fetched routeChunksData:", res.user);
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

  // image upload
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    console.log(file);

    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/detect", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
  }

  //popup
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <header className="fixed w-[100vw]  top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white text-xl">🚦</span>
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                City Traffic Command
              </motion.h1>
              <p className="text-slate-600 text-sm">
                Real-time traffic monitoring & management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
              <div className="flex w-80 items-stretch rounded-xl bg-slate-100/80 backdrop-blur-sm border border-slate-200">
                <div className="flex items-center justify-center pl-3 text-slate-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  className="w-full px-3 py-2.5 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-slate-500 text-slate-800"
                  placeholder="Search for intersections or addresses"
                />
              </div>
            </motion.div>

            <div className="flex gap-2">
              <motion.button
                className="p-3 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <svg
                    className="w-5 h-5 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4 6h16M4 12h8m-8 6h6"
                    />
                  </svg>
                </motion.div>
              </motion.button>

              <motion.button
                className="p-3 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </motion.button>

              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full cursor-pointer border-2 border-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex mt-20">
        {/* Sidebar */}
        <div className="w-60 h-screen fixed">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="ml-60 flex-1 mt-16 p-6 overflow-hidden">
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Map Container */}
            <div className="col-span-2">
              <motion.div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="text-xl font-bold text-slate-800">
                    Live Traffic Map
                  </h2>
                  <p className="text-slate-600">
                    Real-time signal status and vehicle movement
                  </p>
                </div>
                <div className="h-[calc(100%-80px)]">
                  <MapContainer
                    center={[28.6139, 77.209]}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    className="rounded-b-2xl"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {routesData.map((route, routeIndex) => (
                      <div key={routeIndex}>
                        <Polyline
                          positions={route.route_coords}
                          pathOptions={{
                            color: routeIndex === 0 ? "blue" : "orange",
                            weight: 4,
                            opacity: 0.8,
                          }}
                        />
                        <Polyline
                          key={`coords-${routeIndex}`}
                          positions={coords}
                        />
                        {isAdmin &&
                          route.moving_points.map((p, i) => (
                            <Marker key={i} position={p} icon={carIcon} />
                          ))}
                        {route.route_chunks.map((chunk, cIdx) => (
                          <Polyline
                            key={cIdx}
                            positions={chunk}
                            pathOptions={{
                              color: chunkStatus[cIdx],
                              weight: 8,
                              opacity: 0.9,
                            }}
                          />
                        ))}
                      </div>
                    ))}

                    <Marker position={signalPosition} icon={signalIcon} />
                    <Marker position={signalPosition2} icon={signalIcon2} />
                  </MapContainer>
                </div>
              </motion.div>
            </div>

            {/* Signals Panel */}
            <div className="space-y-6 w-[27vw]">
              <motion.div
                className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🚦</span>
                    Live Signal Dashboard
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Real-time traffic signal monitoring
                  </p>
                </div>

                <div className="p-6">
                  {signals && (
                    <motion.div
                      key={signals.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <motion.h3
                              className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors"
                              whileHover={{ x: 5 }}
                            >
                              {signals.name}
                            </motion.h3>
                            <motion.span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPhaseColor(
                                signals.phase
                              )} text-white shadow-lg`}
                              whileHover={{ scale: 1.1 }}
                              animate={{
                                boxShadow: [
                                  "0 0 0px rgba(59, 130, 246, 0)",
                                  "0 0 15px currentColor",
                                  "0 0 0px rgba(59, 130, 246, 0)",
                                ],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {signals.phase === "NS"
                                ? "North-South"
                                : "East-West"}
                            </motion.span>
                          </div>

                          <div className="space-y-4 text-slate-200">
                            <motion.div
                              className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                              whileHover={{
                                x: 5,
                                backgroundColor: "rgba(51, 65, 85, 0.8)",
                              }}
                            >
                              <span className="flex items-center gap-2">
                                ⏱️ Remaining Time
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  signals.remaining <= 5
                                    ? "text-red-400 animate-pulse"
                                    : "text-blue-400"
                                }`}
                              >
                                {signals.remaining}s
                              </span>
                            </motion.div>

                            <motion.div
                              className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                              whileHover={{
                                x: 5,
                                backgroundColor: "rgba(51, 65, 85, 0.8)",
                              }}
                            >
                              <span>🚗 Predicted Vehicles</span>
                              <span className="font-semibold text-amber-400">
                                NS={signals.NS} | EW={signals.EW}
                              </span>
                            </motion.div>

                            <motion.div
                              className="p-3 bg-slate-700/50 rounded-lg"
                              whileHover={{
                                x: 5,
                                backgroundColor: "rgba(51, 65, 85, 0.8)",
                              }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span>📊 Congestion Level</span>
                                <span
                                  className={`font-semibold ${getPredictionColor(
                                    signals.prediction
                                  )}`}
                                >
                                  {signals.prediction}
                                </span>
                              </div>
                              <Progress
                                className="w-full bg-slate-600 h-2 rounded-full overflow-hidden"
                                value={Math.min(
                                  (signals.NS + signals.EW) * 3,
                                  100
                                )}
                              />
                            </motion.div>

                            <motion.div
                              className="grid grid-cols-2 gap-3 text-sm"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-slate-400">
                                  Wait Time NS
                                </div>
                                <div className="font-semibold text-green-400">
                                  {signals.wait_time.NS}s
                                </div>
                              </div>
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-slate-400">
                                  Wait Time EW
                                </div>
                                <div className="font-semibold text-green-400">
                                  {signals.wait_time.EW}s
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Upload Section */}
                  <motion.div
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-semibold text-slate-800 mb-3">
                      📸 Traffic Analysis
                    </h3>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                      />
                      <motion.div
                        className="w-full py-4 bg-white border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-blue-500 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-slate-600 font-medium">
                          Upload Traffic Image
                        </div>
                        <div className="text-slate-500 text-sm mt-1">
                          Click to browse files
                        </div>
                      </motion.div>
                    </label>

                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4"
                      >
                        <img
                          src={imagePreview}
                          alt="uploaded"
                          className="w-full rounded-lg shadow-lg"
                        />
                      </motion.div>
                    )}

                    {response && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-white rounded-lg border border-slate-200"
                      >
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Analysis Results
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Vehicle Count:
                            </span>
                            <span className="font-semibold text-blue-600">
                              {response.vehicle_count}
                            </span>
                          </div>
                          <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto">
                            {JSON.stringify(response.signal, null, 2)}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm z-[9999]"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
