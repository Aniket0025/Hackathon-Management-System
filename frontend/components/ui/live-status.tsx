"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"

export function LiveStatus({ label = "Live Data", pulse = true }: { label?: string; pulse?: boolean }) {
  return (
    <Badge
      aria-live="polite"
      variant="secondary"
      className="bg-green-100 text-green-700 flex items-center"
    >
      <span
        className={`mr-2 inline-block w-2 h-2 rounded-full ${pulse ? "animate-pulse" : ""} bg-green-500`}
        aria-hidden
      />
      {label}
    </Badge>
  )
}
