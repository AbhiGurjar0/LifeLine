// App.js
import React, { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import AlertsPage from "./pages/Alerts";
import OptimalRoute from "./pages/OptimalRoute";
import Reports from "./pages/Reports";
import Login from "./components/admin/Login";
import Profile from "./pages/Profile";
import { Routes, Route } from "react-router-dom";

import MapExample from "./components/user/MapExample";
import Intersections from "./pages/Intersections";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Alerts" element={<AlertsPage />} />
        <Route path="/Intersections" element={<Intersections />} />
        <Route path="/OptimalRoute" element={<OptimalRoute />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="login" element={<Login />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
      {/* <MapExample /> */}
    </div>
  );
}

export default App;
