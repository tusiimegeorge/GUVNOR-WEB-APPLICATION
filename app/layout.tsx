import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Club Guvnor | The Premier Nightclub in Kampala",
  description: "Welcome to Club Guvnor Uganda, Kampala's ultimate premium nightlife experience. Enjoy themed nights, top DJs, and exclusive VIP lounge spaces.",
  generator: "Club Guvnor",
  keywords: ["club guvnor", "guvnor uganda", "nightclubs in kampala", "kampala nightlife", "club guvnor ug"],
  alternates: {
    canonical: "https://clubguvnorug.com",
  },
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
