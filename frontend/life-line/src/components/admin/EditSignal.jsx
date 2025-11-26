import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SignalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [signal, setSignal] = useState({});

  // 1️⃣ Fetch existing signal data
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("called with id ", id);
        const res = await fetch(`http://localhost:8000/traffic/signals/${id}`);
        let data = await res.json();
        console.log(data);
        data = data.signal[0];
        console.log(data);

        setSignal({
          name: data.name,
          direction: data.status[0],
          cycleTime: 30,
          signalTime: data.signal_Time,
          latitude: parseFloat(data.location[0]),
          longitude: parseFloat(data.location[1]),
          signalNumber: data.signal_Number,
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [id]);

  // 2️⃣ Save edited data
  const handleSave = async () => {
    console.log("Saving payload:", signal);

    try {
      let res = await fetch(
        `http://localhost:8000/traffic/signals/update_signal/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signal),
        }
      );

      res = await res.json();

      if (res.success) {
        alert("Changes saved successfully!");
        navigate("/Intersections");
      } else {
        alert("Something Went Wrong!");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  // 3️⃣ Cancel edit
  const handleCancel = () => {
    const ok = window.confirm(
      "Are you sure? All unsaved changes will be lost."
    );
    if (ok) navigate("/Intersections");
  };

  // 4️⃣ Update fields
  const updateField = (key, value) => {
    const numericFields = ["latitude", "longitude", "cycleTime", "signalTime"];

    setSignal((prev) => ({
      ...prev,
      [key]: numericFields.includes(key) ? Number(value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="bg-gray-800 text-white p-6 rounded-t-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">Jaipur</h1>
          <div className="flex justify-between text-sm text-gray-300">
            <span>Editing Signal #{signal.signalNumber}</span>
          </div>
        </header>

        {/* Signal Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-3 border-b">
            Signal Status
          </h2>

          {/* Direction */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">Select Direction</label>
            <select
              value={signal.direction}
              onChange={(e) => updateField("direction", e.target.value)}
              className="w-full p-3 border rounded-md"
            >
              <option value="NS">North-South</option>
              <option value="EW">East-West</option>
            </select>
          </div>

          {/* Cycle Time */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Cycle Time</label>
            <input
              type="number"
              value={signal.cycleTime}
              onChange={(e) => updateField("cycleTime", Number(e.target.value))}
              className="w-full p-3 border rounded-md"
            />
          </div>

          {/* Signal Time */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Signal Time</label>
            <input
              type="number"
              value={signal.signalTime}
              onChange={(e) =>
                updateField("signalTime", Number(e.target.value))
              }
              className="w-full p-3 border rounded-md"
            />
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-3 border-b">Location</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Latitude</label>
              <input
                type="text"
                value={signal.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
                className="w-full p-3 border rounded-md"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Longitude</label>
              <input
                type="text"
                value={signal.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
                className="w-full p-3 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignalEdit;
