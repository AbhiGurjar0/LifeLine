import React from "react";
import { useState, useEffect } from "react";
export const Signal_Context = React.createContext();
const SignalContext = (props) => {
  const [signals, setSignals] = useState({
    // id: 1,
    // name: "Signal 1 — Moti Bagh",
    phase: "NS",
    remaining: 15,
    NS: 10,
    EW: 5,
    wait_time: 23,
    prediction: "Medium",
  });
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
  return (
    <div>
      <Signal_Context.Provider value={signals}>
        {props.children}
      </Signal_Context.Provider>
    </div>
  );
};

export default SignalContext;
