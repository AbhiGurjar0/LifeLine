import * as React from "react"
import { cn } from "../../../lib/utils"

export function Progress({ value, className }) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-700", className)}>
      <div
        className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
