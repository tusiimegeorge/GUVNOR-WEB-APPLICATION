"use client"

import Link from "next/link"
import { MapPin, Phone } from "lucide-react"

export function LightingDisplayPanels() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Location Card */}
      <Link href="/about-us">
        <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border hover:ring-primary hover:shadow-md transition-all duration-300 min-h-44 flex flex-col cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Location</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Visit our location page for detailed directions and map</p>
              <p className="text-sm font-semibold text-foreground">1st Street Industrial Area</p>
              <p className="text-sm text-muted-foreground">Kampala, Uganda</p>
            </div>
          </div>
          <p className="text-xs text-primary font-semibold mt-auto">View Map →</p>
        </div>
      </Link>

      {/* Contact Card */}
      <Link href="/about-us">
        <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border hover:ring-primary hover:shadow-md transition-all duration-300 min-h-44 flex flex-col cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Call us for reservations and inquiries</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold text-foreground">+256 700 123456</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-primary hover:underline">info@guvnor.co.ug</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-primary font-semibold mt-auto">Contact Info →</p>
        </div>
      </Link>
    </section>
  )
}
