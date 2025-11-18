import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      icon: "space_dashboard",
      label: "Dashboard",
      path: "/",
    },
    {
      icon: "traffic",
      label: "Intersections",
      path: "/intersections",
    },
    {
      icon: "warning",
      label: "Alerts",
      path: "/alerts",
    },
    {
      icon: "bar_chart",
      label: "Reports",
      path: "/reports",
    },
    
  ];

  return (
    <aside className="flex h-[93vh] flex-col justify-between border-r border-slate-200 bg-white/80 backdrop-blur-xl p-6">
      <div className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex items-center gap-3 w-full"
                whileHover={{
                  scale: 1.02,
                  x: 5,
                  backgroundColor: isActive ? "" : "rgba(241, 245, 249, 1)",
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.span
                  className="material-symbols-outlined text-lg"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {item.icon}
                </motion.span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>

      <motion.div
        className="flex flex-col gap-1 border-t border-slate-200 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className="material-symbols-outlined text-lg"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            logout
          </motion.span>
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
