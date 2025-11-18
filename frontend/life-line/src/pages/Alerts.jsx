import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import Sidebar from "../components/user/Sidebar";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Heavy Traffic Detected",
      description:
        "Unusual traffic congestion detected at Moti Bagh intersection",
      severity: "high",
      location: "Moti Bagh Signal",
      timestamp: "2024-01-15T10:30:00Z",
      status: "active",
      type: "congestion",
    },
    {
      id: 2,
      title: "Signal Timing Issue",
      description:
        "Signal cycle timing appears suboptimal for current traffic flow",
      severity: "medium",
      location: "South Extension",
      timestamp: "2024-01-15T09:15:00Z",
      status: "active",
      type: "timing",
    },
    {
      id: 3,
      title: "Vehicle Breakdown",
      description: "Vehicle breakdown reported blocking right lane",
      severity: "high",
      location: "India Gate Circle",
      timestamp: "2024-01-15T08:45:00Z",
      status: "resolved",
      type: "incident",
    },
    {
      id: 4,
      title: "Low Traffic Efficiency",
      description: "Traffic flow efficiency below 60% threshold",
      severity: "low",
      location: "Connaught Place",
      timestamp: "2024-01-15T07:20:00Z",
      status: "active",
      type: "efficiency",
    },
    {
      id: 5,
      title: "Camera Offline",
      description: "Traffic camera at RK Puram temporarily offline",
      severity: "medium",
      location: "RK Puram",
      timestamp: "2024-01-14T22:10:00Z",
      status: "investigating",
      type: "system",
    },
  ]);

  const [filters, setFilters] = useState({
    severity: "all",
    status: "all",
    type: "all",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-red-600 bg-red-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      case "investigating":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "congestion":
        return "🚦";
      case "timing":
        return "⏱️";
      case "incident":
        return "🚨";
      case "efficiency":
        return "📊";
      case "system":
        return "📷";
      default:
        return "⚠️";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      filters.severity === "all" || alert.severity === filters.severity;
    const matchesStatus =
      filters.status === "all" || alert.status === filters.status;
    const matchesType = filters.type === "all" || alert.type === filters.type;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const resolveAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" } : alert
      )
    );
  };

  const deleteAlert = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
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
      <div className="max-w-7xl mx-auto ml-64 mt-14">
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Traffic Alerts
            </h1>
            <p className="text-slate-600 mt-2">
              Monitor and manage real-time traffic incidents
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
              <input
                type="text"
                placeholder="Search alerts..."
                className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 absolute left-3 top-3 text-slate-400"
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
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Alerts
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {alerts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {alerts.filter((a) => a.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {alerts.filter((a) => a.severity === "high").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {alerts.filter((a) => a.status === "resolved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, severity: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="congestion">Congestion</option>
                <option value="timing">Timing</option>
                <option value="incident">Incident</option>
                <option value="efficiency">Efficiency</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Alerts List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-3 h-12 rounded-full ${getSeverityColor(
                            alert.severity
                          )}`}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getTypeIcon(alert.type)}
                            </span>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {alert.title}
                            </h3>
                          </div>

                          <p className="text-slate-600 mb-3">
                            {alert.description}
                          </p>

                          <div className="flex flex-wrap gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                alert.status
                              )}`}
                            >
                              {alert.status.charAt(0).toUpperCase() +
                                alert.status.slice(1)}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                              📍 {alert.location}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                              ⏰ {getTimeAgo(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {alert.status !== "resolved" && (
                          <motion.button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Resolve
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => deleteAlert(alert.id)}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Dismiss
                        </motion.button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredAlerts.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-slate-600">
                No alerts found
              </h3>
              <p className="text-slate-500 mt-2">
                All clear! No alerts match your current filters.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AlertsPage;
