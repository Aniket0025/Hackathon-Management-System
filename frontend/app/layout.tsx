import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import { AdvancedNavigation } from "@/components/advanced-navigation"
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
      </head>
      <body className="font-sans">
        <AdvancedNavigation />
        <div className="pt-16 md:pt-20">{children}</div>
      </body>
    </html>
  )
}
