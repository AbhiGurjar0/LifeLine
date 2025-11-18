import { useState, useEffect, useContext } from "react";
import Sidebar from "../components/user/Sidebar";
import { motion } from "framer-motion";
import { Signal_Context } from "../context/SignalContext.jsx";

export default function TrafficSignalUI() {
  const [signals, setSignals] = useState([
    {
      id: 1,
      name: "Signal 1 — Moti Bagh",
      phase: "NS",
      remaining: 15,
      prediction: "Medium",
      location: [28.6139, 77.209],
      signal_Number: 1,
      status: ["Green", "Red"],
      signal_Time: 30,
      waiting_Time: { NS: 10, EW: 5 },
    },
    {
      id: 2,
      name: "Signal 2 — South Ex",
      phase: "EW",
      remaining: 8,
      prediction: "High",
      location: [28.567, 77.234],
      signal_Number: 2,
      status: ["Red", "Green"],
      signal_Time: 25,
      waiting_Time: { NS: 15, EW: 3 },
    },
  ]);
  const contextValue = useContext(Signal_Context);
  console.log("Context Value:", contextValue);
  setSignals({
    ...signals,
    phase: contextValue.phase,
    remaining: contextValue.remaining,
    NS: contextValue.NS,
    EW: contextValue.EW,
    wait_time: contextValue.wait_time,
    prediction: contextValue.prediction,
  });

  const [open, setOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [form, setForm] = useState({
    signal_Number: "",
    name: "",
    location_lat: "",
    location_lng: "",
    NS_status: "Red",
    EW_status: "Red",
    signal_Time: "",
    waiting_NS: "",
    waiting_EW: "",
  });

  // // Simulate real-time updates
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSignals((prev) =>
  //       prev.map((signal) => ({
  //         ...signal,
  //         remaining:
  //           signal.remaining > 0 ? signal.remaining - 1 : signal.signal_Time,
  //         phase:
  //           signal.remaining <= 1
  //             ? signal.phase === "NS"
  //               ? "EW"
  //               : "NS"
  //             : signal.phase,
  //         status:
  //           signal.remaining <= 1
  //             ? [signal.status[1], signal.status[0]]
  //             : signal.status,
  //       }))
  //     );
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // function handleChange(e) {
  //   setForm({
  //     ...form,
  //     [e.target.name]: e.target.value,
  //   });
  // }

  function submitForm() {
    const newSignal = {
      id: Date.now(),
      signal_Number: Number(form.signal_Number),
      name: form.name,
      location: [Number(form.location_lat), Number(form.location_lng)],
      status: [form.NS_status, form.EW_status],
      phase: form.NS_status === "Green" ? "NS" : "EW",
      signal_Time: Number(form.signal_Time),
      remaining: Number(form.signal_Time),
      waiting_Time: {
        NS: Number(form.waiting_NS),
        EW: Number(form.waiting_EW),
      },
      prediction: "Medium",
    };

    // setSignals((prev) => [...prev, newSignal]);
    setOpen(false);
    setForm({
      signal_Number: "",
      name: "",
      location_lat: "",
      location_lng: "",
      NS_status: "Red",
      EW_status: "Red",
      signal_Time: "",
      waiting_NS: "",
      waiting_EW: "",
    });
  }

  function deleteSignal(id) {
    setSignals((prev) => prev.filter((signal) => signal.id !== id));
  }

  // const filteredSignals = signals.filter(
  //   (signal) =>
  //     signal.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
  //     (activeTab === "all" ||
  //       (activeTab === "active" && signal.remaining > 5) ||
  //       (activeTab === "critical" && signal.remaining <= 5))
  // );

  const getStatusColor = (status) => {
    switch (status) {
      case "Green":
        return "bg-emerald-500";
      case "Yellow":
        return "bg-amber-500";
      case "Red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPredictionColor = (prediction) => {
    switch (prediction) {
      case "Low":
        return "text-emerald-600 bg-emerald-100";
      case "Medium":
        return "text-amber-600 bg-amber-100";
      case "High":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <header className="fixed w-[100vw] top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 shadow-sm">
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

      <div className="flex mt-14">
        {/* Sidebar */}
        <div className="w-60 h-screen fixed">
          <Sidebar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto ml-66 mt-14">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Traffic Signal Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Real-time traffic signal monitoring and management
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search signals..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 absolute left-3 top-2.5 text-slate-400"
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

            <button
              onClick={() => setOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Signal
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {/* <div className="flex gap-2 mb-6">
          {["all", "active", "critical"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              {tab} (
              {/* {tab === "all"
                ? signals.length
                : tab === "active"
                ? signals.filter((s) => s.remaining > 5).length
                : signals.filter((s) => s.remaining <= 5).length}
              ) */}
            {/* </button> */}
          {/* ))} */}
        {/* </div> */} */

        {/* Signals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {signal.name}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Signal #{signal.signal_Number}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPredictionColor(
                      signal.prediction
                    )}`}
                  >
                    {signal.prediction} Traffic
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Timer */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-600 font-medium">
                    Time Remaining
                  </span>
                  <div
                    className={`text-2xl font-bold ${
                      signal.remaining <= 5
                        ? "text-red-600 animate-pulse"
                        : "text-slate-800"
                    }`}
                  >
                    {signal.remaining}s
                  </div>
                </div>

                {/* Signal Status */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-600 mb-2">
                      North-South
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold ${getStatusColor(
                        signal.status[0]
                      )}`}
                    >
                      {signal.status[0].charAt(0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-600 mb-2">
                      East-West
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold ${getStatusColor(
                        signal.status[1]
                      )}`}
                    >
                      {signal.status[1].charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cycle Time</span>
                    <span className="font-semibold">{signal.signal_Time}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Waiting NS</span>
                    <span className="font-semibold">
                      {signal.waiting_Time.NS}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Waiting EW</span>
                    <span className="font-semibold">
                      {signal.waiting_Time.EW}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Location</span>
                    <span className="font-semibold">
                      {signal.location[0].toFixed(4)},{" "}
                      {signal.location[1].toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={() => deleteSignal(signal.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {signals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-6xl mb-4">🚦</div>
            <h3 className="text-xl font-semibold text-slate-600">
              No signals found
            </h3>
            <p className="text-slate-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Add Signal Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-slideUp">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                Add Traffic Signal
              </h2>
              <p className="text-slate-600 mt-1">
                Enter the details for the new signal
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Signal Number
                  </label>
                  <input
                    name="signal_Number"
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.signal_Number}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Signal Name
                  </label>
                  <input
                    name="name"
                    placeholder="Moti Bagh Signal"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.name}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    name="location_lat"
                    placeholder="28.6139"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.location_lat}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    name="location_lng"
                    placeholder="77.2090"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.location_lng}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    NS Status
                  </label>
                  <select
                    name="NS_status"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.NS_status}
                  >
                    <option value="Red">Red</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    EW Status
                  </label>
                  <select
                    name="EW_status"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.EW_status}
                  >
                    <option value="Red">Red</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Signal Time (sec)
                </label>
                <input
                  name="signal_Time"
                  placeholder="30"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={handleChange}
                  value={form.signal_Time}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Waiting NS (sec)
                  </label>
                  <input
                    name="waiting_NS"
                    placeholder="10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.waiting_NS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Waiting EW (sec)
                  </label>
                  <input
                    name="waiting_EW"
                    placeholder="5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onChange={handleChange}
                    value={form.waiting_EW}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                onClick={submitForm}
              >
                Add Signal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
