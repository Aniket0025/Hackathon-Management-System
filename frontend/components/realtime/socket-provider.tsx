"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

// Minimal provider that establishes a Socket.IO connection using JWT from localStorage
// and exposes the socket instance via React context for future use (notifications, etc.)

type SocketContextValue = {
  socket: Socket | null
  connected: boolean
}

export const SocketContext = React.createContext<SocketContextValue>({ socket: null, connected: false })

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const url = useMemo(() => {
    // Prefer explicit socket URL, fallback to API base
    const explicit = process.env.NEXT_PUBLIC_SOCKET_URL
    const apiBase = process.env.NEXT_PUBLIC_API_BASE
    return explicit || apiBase || "http://localhost:4000"
  }, [])

  useEffect(() => {
    // Avoid SSR
    if (typeof window === "undefined") return

    const token = localStorage.getItem("token") || ""

    const s = io(url, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token: token ? `Bearer ${token}` : undefined },
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    socketRef.current = s

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    s.on("connect", onConnect)
    s.on("disconnect", onDisconnect)

    // For quick verification in console
    s.on("server:hello", (payload) => {
      // eslint-disable-next-line no-console
      console.log("[socket] server:hello", payload)
    })

    return () => {
      s.off("connect", onConnect)
      s.off("disconnect", onDisconnect)
      s.disconnect()
    }
  }, [url])

  const value = useMemo<SocketContextValue>(() => ({ socket: socketRef.current, connected }), [connected])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
