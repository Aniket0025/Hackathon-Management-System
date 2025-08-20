"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-fit items-center justify-center gap-2 rounded-xl p-1.5 bg-white/90 backdrop-blur border border-slate-200 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-300 transform-gpu will-change-transform",
        // base (inactive)
        "bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-md",
        // focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2",
        // 3D transforms
        "[transform:perspective(900px)_rotateX(0deg)_rotateY(0deg)] hover:[transform:perspective(900px)_rotateX(3deg)_rotateY(2deg)_translateY(-1px)] active:translate-y-0",
        // active state: higher contrast, gradient, inner shadow
        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:border-emerald-500 data-[state=active]:shadow-lg data-[state=active]:hover:shadow-xl data-[state=active]:hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(-2deg)_translateY(-2px)]",
        // dark mode tweaks
        "dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white dark:data-[state=active]:from-emerald-500 dark:data-[state=active]:to-green-500",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
