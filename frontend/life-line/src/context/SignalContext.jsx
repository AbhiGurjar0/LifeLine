import React from "react";
import { useState, useEffect } from "react";
export const Signal_Context = React.createContext();
const SignalContext = (props) => {
  const [signals, setSignals] = useState([]);

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
          const details = data.data_packet.signal_details;
          console.log("Signal details:", Object.keys(details).length);

          const updatedSignals = [];

          for (let i = 0; i <= Object.keys(details).length; i++) {
            const detail = details[Object.keys(details)[i]];
            console.log("Processing detail for signal:", i, detail);
            const all = detail?.All_details;

            if (detail && all) {
              updatedSignals.push({
                signal_Number: all?.signal_Number,
                remaining: all?.remain_time,
                NS: detail?.pred_NS,
                EW: detail?.pred_EW,
                phase: all?.curr_phase,
                wait_time: all?.wait_time,
                curr_NS: detail?.ns,
                curr_EW: detail?.ew,
                curr_state: all?.curr_phase,
                name: detail?.name,
                prediction: all?.prediction,
              });
            }
          }
          setSignals(updatedSignals);
          console.log("Updated signals:", updatedSignals);
          return;
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
