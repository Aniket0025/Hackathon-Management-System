"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Trigger a brief fade-out then fade-in on route change
    setShow(false)
    const t = setTimeout(() => setShow(true), 60) // quick swap
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <div
      key={pathname}
      className={`transition-opacity duration-200 ease-out ${show ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  )
}
