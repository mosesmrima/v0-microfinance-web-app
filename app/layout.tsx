import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"

export const metadata: Metadata = {
  title: {
    default: "FinFlow - Microfinance Platform",
    template: "%s | FinFlow",
  },
  description: "Fast, transparent, and secure microfinance solutions. Get approved in minutes with blockchain-powered lending.",
  keywords: ["microfinance", "loans", "lending", "blockchain", "fintech"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
