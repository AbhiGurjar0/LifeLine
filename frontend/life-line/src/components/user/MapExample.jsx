import { useEffect, useState } from "react";
import L, { PolyUtil, popup } from "leaflet";
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
}