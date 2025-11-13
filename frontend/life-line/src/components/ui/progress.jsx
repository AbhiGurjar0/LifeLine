import * as React from "react"
import { cn } from "../../../lib/utils"
import { motion } from "framer-motion";

export function Progress({ value, className }) {
  return (
    <motion.div 
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-700", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        whileHover={{ scaleY: 1.5 }}
      />
    </motion.div>
  )
}