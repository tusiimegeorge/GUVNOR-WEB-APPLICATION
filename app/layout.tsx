import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Club Guvnor",
  description: "Club Guvnor - A modern, customizable dashboard built with Next.js, React, and Tailwind CSS. Experience an elegant interface with magenta and purple theming.",
  generator: "Club Guvnor",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // Put antialiasing on html so it applies before hydration.
      className="antialiased"
      // Ensure a default brand so color theming is active before hydration.
      data-brand="purple"
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            {children}
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
