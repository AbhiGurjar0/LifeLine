import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "../components/ui/card";

const AdminProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Dr. Sarah Chen",
    title: "Senior Traffic Management Specialist",
    email: "sarah.chen@trafficcontrol.gov",
    phone: "+1 (555) 123-4567",
    department: "Urban Traffic Management",
    location: "New Delhi, India",
    joinDate: "2022-03-15",
    employeeId: "TC-8472",
    bio: "Dedicated traffic management professional with 8+ years of experience in urban traffic optimization and smart city initiatives. Passionate about leveraging AI and data analytics to improve urban mobility.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
  });

  const [formData, setFormData] = useState({ ...profile });

  const stats = {
    systemsManaged: 47,
    alertsResolved: 128,
    efficiencyImprovement: "23%",
    uptime: "99.8%",
    activeProjects: 5,
    teamMembers: 12
  };

  const recentActivity = [
    {
      id: 1,
      action: "Optimized signal timing",
      description: "Adjusted cycle times at Moti Bagh intersection",
      timestamp: "2 hours ago",
      type: "optimization",
      impact: "15% improvement"
    },
    {
      id: 2,
      action: "Resolved system alert",
      description: "Fixed camera connectivity issue at South Extension",
      timestamp: "5 hours ago",
      type: "maintenance",
      impact: "System restored"
    },
    {
      id: 3,
      action: "Generated weekly report",
      description: "Traffic flow analysis for Q4 2024",
      timestamp: "1 day ago",
      type: "reporting",
      impact: "Data insights"
    },
    {
      id: 4,
      action: "Team coordination",
      description: "Led emergency response protocol meeting",
      timestamp: "2 days ago",
      type: "management",
      impact: "Protocol updated"
    }
  ];

  const skills = [
    { name: "Traffic Analysis", level: 95 },
    { name: "System Optimization", level: 88 },
    { name: "Data Analytics", level: 92 },
    { name: "Team Leadership", level: 85 },
    { name: "Emergency Response", level: 90 },
    { name: "AI Integration", level: 78 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'optimization': return '⚡';
      case 'maintenance': return '🔧';
      case 'reporting': return '📊';
      case 'management': return '👥';
      default: return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'optimization': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      case 'reporting': return 'text-purple-600 bg-purple-100';
      case 'management': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Profile
            </h1>
            <p className="text-slate-600 mt-2">Manage your account and view performance metrics</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 bg-white text-slate-700 rounded-xl font-semibold hover:shadow-lg border border-slate-200 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{isEditing ? '❌' : '✏️'}</span>
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600" />
                <CardContent className="p-6 -mt-12">
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
                    <p className="text-slate-600 mt-1">{profile.title}</p>
                    <p className="text-slate-500 text-sm mt-2">{profile.department}</p>
                    
                    <div className="flex gap-3 mt-4">
                      <motion.button
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-lg">📧</span>
                      </motion.button>
                      <motion.button
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-lg">📞</span>
                      </motion.button>
                      <motion.button
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-lg">💬</span>
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Systems Managed</span>
                    <span className="font-semibold text-blue-600">{stats.systemsManaged}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Alerts Resolved</span>
                    <span className="font-semibold text-green-600">{stats.alertsResolved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Efficiency Improvement</span>
                    <span className="font-semibold text-purple-600">+{stats.efficiencyImprovement}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">System Uptime</span>
                    <span className="font-semibold text-amber-600">{stats.uptime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active Projects</span>
                    <span className="font-semibold text-indigo-600">{stats.activeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Team Members</span>
                    <span className="font-semibold text-cyan-600">{stats.teamMembers}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Skills & Expertise</h3>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="flex border-b border-slate-200">
                  {['profile', 'activity', 'settings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 font-medium transition-all ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <CardContent className="p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isEditing ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                            <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              rows="4"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="flex gap-3">
                            <motion.button
                              onClick={handleSave}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Save Changes
                            </motion.button>
                            <motion.button
                              onClick={handleCancel}
                              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-slate-500 mb-2">Contact Information</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">📧</span>
                                  <span className="text-slate-700">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">📞</span>
                                  <span className="text-slate-700">{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">🏢</span>
                                  <span className="text-slate-700">{profile.department}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">📍</span>
                                  <span className="text-slate-700">{profile.location}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-slate-500 mb-2">Employment Details</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">🆔</span>
                                  <span className="text-slate-700">{profile.employeeId}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">📅</span>
                                  <span className="text-slate-700">
                                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">⏱️</span>
                                  <span className="text-slate-700">2 years, 10 months</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-2">About</h4>
                            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <motion.div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-semibold text-slate-800">{activity.action}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                                  {activity.type}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm mb-2">{activity.description}</p>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">{activity.timestamp}</span>
                                <span className="text-green-600 font-medium">{activity.impact}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Settings</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                              <option>English</option>
                              <option>Hindi</option>
                              <option>Spanish</option>
                              <option>French</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                              <option>IST (India Standard Time)</option>
                              <option>EST (Eastern Standard Time)</option>
                              <option>PST (Pacific Standard Time)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="ml-2 text-slate-700">Email notifications for critical alerts</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="ml-2 text-slate-700">SMS notifications for system failures</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-slate-700">Weekly performance reports</span>
                          </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <motion.button
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Save Preferences
                          </motion.button>
                          <motion.button
                            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reset to Defaults
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;