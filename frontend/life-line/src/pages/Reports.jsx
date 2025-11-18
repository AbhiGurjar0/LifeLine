import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import Sidebar from "../components/user/Sidebar";

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedReport, setSelectedReport] = useState(null);

  const trafficData = {
    daily: [65, 78, 90, 81, 56, 55, 40, 45, 60, 75, 80, 95],
    weekly: [450, 520, 480, 510, 490, 530, 500],
    monthly: [1800, 2100, 1950, 2200, 2400, 2300],
  };

  const efficiencyData = {
    daily: [85, 82, 88, 79, 91, 86, 83, 89, 87, 84, 90, 92],
    weekly: [84, 87, 82, 89, 86, 90, 88],
    monthly: [85, 87, 83, 88, 86, 89],
  };

  const reports = [
    {
      id: 1,
      title: "Traffic Flow Analysis",
      description:
        "Comprehensive analysis of traffic patterns and flow efficiency",
      type: "analysis",
      date: "2024-01-15",
      status: "completed",
      metrics: {
        avgEfficiency: "87%",
        peakHours: "8:00-10:00 AM",
        congestionPoints: 3,
        totalVehicles: "45,234",
      },
      insights: [
        "Traffic flow improved by 12% compared to last week",
        "Signal timing optimization reduced wait times by 18%",
        "New congestion pattern detected at Moti Bagh intersection",
      ],
    },
    {
      id: 2,
      title: "Signal Performance Report",
      description: "Performance metrics for all traffic signals in the network",
      type: "performance",
      date: "2024-01-14",
      status: "completed",
      metrics: {
        avgUptime: "99.2%",
        responseTime: "2.3s",
        failures: 2,
        maintenance: "Scheduled",
      },
      insights: [
        "Signal uptime improved by 0.8% this month",
        "Response times remain within acceptable limits",
        "Two minor failures detected and resolved automatically",
      ],
    },
    {
      id: 3,
      title: "Congestion Hotspots",
      description: "Identification and analysis of recurring congestion areas",
      type: "congestion",
      date: "2024-01-13",
      status: "completed",
      metrics: {
        hotspots: 5,
        avgDelay: "4.2min",
        affectedRoutes: 8,
        improvement: "15%",
      },
      insights: [
        "South Extension shows 25% higher congestion during peak hours",
        "Implementing dynamic signal timing reduced delays by 15%",
        "Three new hotspots identified for monitoring",
      ],
    },
    {
      id: 4,
      title: "Weekly Efficiency Summary",
      description: "Weekly overview of traffic management efficiency",
      type: "summary",
      date: "2024-01-12",
      status: "completed",
      metrics: {
        overallEfficiency: "89%",
        prevWeek: "84%",
        bestPerformer: "Moti Bagh",
        improvement: "+5%",
      },
      insights: [
        "Overall efficiency increased by 5 percentage points",
        "Moti Bagh signal achieved 94% efficiency rating",
        "Weekend traffic patterns show consistent improvement",
      ],
    },
    {
      id: 5,
      title: "Emergency Response Analysis",
      description:
        "Analysis of traffic system performance during emergency scenarios",
      type: "emergency",
      date: "2024-01-11",
      status: "generating",
      metrics: {
        responseTime: "1.8s",
        clearanceRate: "92%",
        incidents: 3,
        successRate: "100%",
      },
      insights: [
        "System responded effectively to all emergency scenarios",
        "Average clearance time improved by 23%",
        "New protocols implemented successfully",
      ],
    },
  ];

  const statistics = {
    totalReports: 47,
    avgEfficiency: "86%",
    resolvedIssues: 128,
    activeAlerts: 5,
  };

  const getReportIcon = (type) => {
    switch (type) {
      case "analysis":
        return "📊";
      case "performance":
        return "⚡";
      case "congestion":
        return "🚦";
      case "summary":
        return "📋";
      case "emergency":
        return "🚨";
      default:
        return "📄";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "generating":
        return "text-amber-600 bg-amber-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const downloadReport = (report) => {
    // Simulate download
    console.log("Downloading report:", report.title);
    // In real implementation, this would trigger actual download
  };

  const generateNewReport = () => {
    // Simulate report generation
    console.log("Generating new report...");
    // In real implementation, this would call an API
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
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Traffic Analytics & Reports
            </h1>
            <p className="text-slate-600 mt-2">
              Comprehensive insights and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <motion.button
              onClick={generateNewReport}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>📈</span>
              Generate Report
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {statistics.totalReports}
                </p>
                <p className="text-green-600 text-sm font-medium mt-1">
                  +12% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Avg Efficiency
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {statistics.avgEfficiency}
                </p>
                <p className="text-green-600 text-sm font-medium mt-1">
                  +3.2% improvement
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Issues Resolved
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {statistics.resolvedIssues}
                </p>
                <p className="text-green-600 text-sm font-medium mt-1">
                  98% success rate
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {statistics.activeAlerts}
                </p>
                <p className="text-red-600 text-sm font-medium mt-1">
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Traffic Volume
              </h3>
              <span className="text-slate-500 text-sm">Vehicles per hour</span>
            </div>
            <div className="h-48 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-end justify-between h-32">
                {(timeRange === "7d"
                  ? trafficData.weekly
                  : timeRange === "30d"
                  ? trafficData.monthly
                  : trafficData.daily
                ).map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-6 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(value / 600) * 100}%` }}
                    />
                    <span className="text-xs text-slate-600 mt-2">
                      {timeRange === "7d"
                        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                            index
                          ]
                        : timeRange === "30d"
                        ? ["W1", "W2", "W3", "W4", "W5", "W6"][index]
                        : [
                            "6",
                            "8",
                            "10",
                            "12",
                            "14",
                            "16",
                            "18",
                            "20",
                            "22",
                            "24",
                            "2",
                            "4",
                          ][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                System Efficiency
              </h3>
              <span className="text-slate-500 text-sm">Percentage</span>
            </div>
            <div className="h-48 bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-end justify-between h-32">
                {(timeRange === "7d"
                  ? efficiencyData.weekly
                  : timeRange === "30d"
                  ? efficiencyData.monthly
                  : efficiencyData.daily
                ).map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-6 bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-slate-600 mt-2">
                      {timeRange === "7d"
                        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                            index
                          ]
                        : timeRange === "30d"
                        ? ["W1", "W2", "W3", "W4", "W5", "W6"][index]
                        : [
                            "6",
                            "8",
                            "10",
                            "12",
                            "14",
                            "16",
                            "18",
                            "20",
                            "22",
                            "24",
                            "2",
                            "4",
                          ][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reports List */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-xl font-bold text-slate-800">
              Generated Reports
            </h2>
            <p className="text-slate-600">
              Detailed analysis and performance reports
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() =>
                  setSelectedReport(
                    selectedReport?.id === report.id ? null : report
                  )
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{getReportIcon(report.type)}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {report.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status.charAt(0).toUpperCase() +
                            report.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-slate-600 mb-3">
                        {report.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">📅</span>
                          <span className="text-slate-700">
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                        </div>

                        {Object.entries(report.metrics).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-700 font-medium">
                              {key.split(/(?=[A-Z])/).join(" ")}: {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Expanded View */}
                      {selectedReport?.id === report.id && (
                        <motion.div
                          className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="font-semibold text-slate-800 mb-3">
                            Key Insights
                          </h4>
                          <ul className="space-y-2">
                            {report.insights.map((insight, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-slate-700"
                              >
                                <span className="text-green-500 mt-1">✓</span>
                                {insight}
                              </li>
                            ))}
                          </ul>

                          <div className="flex gap-3 mt-4">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadReport(report);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Download PDF
                            </motion.button>
                            <motion.button
                              onClick={(e) => e.stopPropagation()}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Share Report
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadReport(report);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-lg">📥</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
