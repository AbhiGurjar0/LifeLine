import * as React from "react"
import { cn } from "../../../lib/utils"
import { motion } from "framer-motion";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg text-white transition-all duration-300",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardContent }
