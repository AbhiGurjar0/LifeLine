import React from "react";
import { motion } from "framer-motion";


const Sidebar = () => {
  return (
    <div>
     <aside className="flex min-h-[90vh] w-72 flex-col justify-between border-r border-white/10 bg-background-light p-4 backdrop-blur-sm">

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <motion.div 
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black cursor-pointer"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.span 
                className="material-symbols-outlined text-white"
                whileHover={{ rotate: 15 }}
              >
                space_dashboard
              </motion.span>
              <p className="text-white text-sm font-medium leading-normal">
                Dashboard
              </p>
            </motion.div>
            <motion.div
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white cursor-pointer"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.span 
                className="material-symbols-outlined text-gray-800"
                whileHover={{ scale: 1.2 }}
              >
                traffic
              </motion.span>
              <p className="text-black text-sm font-medium leading-normal">
                Intersections
              </p>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.span 
                className="material-symbols-outlined text-gray-900"
                whileHover={{ shake: true }}
              >
                warning
              </motion.span>
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Alerts
              </p>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.span 
                className="material-symbols-outlined text-gray-900"
                whileHover={{ scale: 1.2 }}
              >
                bar_chart
              </motion.span>
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Reports
              </p>
            </motion.div>
          </div>
        </div>
        <motion.div 
          className="flex flex-col gap-1 border-t border-white/10 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 cursor-pointer"
            whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span 
              className="material-symbols-outlined text-gray-900"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              logout
            </motion.span>
            <p className="text-gray-900 text-sm font-medium leading-normal">
              Logout
            </p>
          </motion.div>
        </motion.div>
      </aside>
    </div>
  );
};

export default Sidebar;