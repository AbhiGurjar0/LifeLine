// App.js
import React, { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import OptimalRoute from "./pages/OptimalRoute";
import { Route, Routes } from "react-router-dom";
import MapExample from "./components/user/MapExample";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Alerts" element={<Alerts />} />
        <Route path="/OptimalRoute" element={<OptimalRoute />} />
      </Routes>
      {/* <MapExample /> */}
    </div>
  );
}

export default App;
