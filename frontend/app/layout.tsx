import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import RouteTransition from "@/components/route-transition"
import { SocketProvider } from "@/components/realtime/socket-provider"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "HackHost - Event & Hackathon Platform",
  description: "Modern platform for hosting innovation events and hackathons",
  generator: "v0.app",
  icons: {
    icon: "/hackhost-logo.png",
    shortcut: "/hackhost-logo.png",
    apple: "/hackhost-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${manrope.variable} antialiased`}>
      <head>
        {apiBase ? (
          <>
            <link rel="dns-prefetch" href={apiBase} />
            <link rel="preconnect" href={apiBase} crossOrigin="anonymous" />
          </>
        ) : null}
        {/* Fallback favicon for older browsers */}
        <link rel="icon" href="/hackhost-logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  var lowMem = (navigator.deviceMemory && navigator.deviceMemory <= 4);
                  var lowCPU = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
                  var mobile = /Mobi|Android/i.test(navigator.userAgent);
                  if (reduce || lowMem || lowCPU || mobile) {
                    document.documentElement.classList.add('perf-lite');
                  }
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 ambient-bg texture-noise no-grid beam-lights">
        <SocketProvider>
          <AdvancedNavigation />
          <div className="pt-16 md:pt-20">
            <RouteTransition>{children}</RouteTransition>
          </div>
        </SocketProvider>
      </body>
    </html>
  )
}
