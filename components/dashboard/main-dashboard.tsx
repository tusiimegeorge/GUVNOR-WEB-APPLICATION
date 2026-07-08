"use client"

import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { NightlifeCarousel } from './nightlife-carousel'
import { PerformanceMetrics } from './performance-metrics'
import { LoyalistsPatronsCard } from './loyalists-patrons-card'
import { LightingDisplayPanels } from './lighting-display-panels'
import PremiumSelectionCarousel from './premium-selection-carousel'
import { SignatureEventsCard } from './signature-events-card'
import { EventsCarouselCalendar } from "@/components/dashboard/events-carousel-calendar"
import { Footer } from "@/components/footer"

export function MainDashboard() {
  return (
    <div className="relative z-10 min-h-screen">
      <div className="space-y-5 max-w-7xl mx-auto px-4 py-6 md:py-8 lg:py-10">
      <WelcomeCard />

      {/* Our Signature Events - Full width */}
      <SignatureEventsCard />

      {/* Events Calendar Section */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-2">UPCOMING HAPPENINGS</p>
          <h2 className="text-2xl md:text-3xl font-bold">Event Calendar</h2>
          <p className="text-muted-foreground mt-2">Stay updated with our upcoming events, special nights, and exclusive experiences throughout the week</p>
        </div>
        <EventsCarouselCalendar />
      </div>

      {/* Premium Menu Selection Section */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-2">CRAFTED FOR EXCELLENCE</p>
          <h2 className="text-2xl md:text-3xl font-bold">Our Premium Selection</h2>
          <p className="text-muted-foreground mt-2">Indulge in an exquisite collection of world-class beverages, gourmet cuisine, and signature bottle service experiences. From rare champagnes to perfectly grilled delicacies, curated to elevate your night</p>
        </div>
        <PremiumSelectionCarousel />
      </div>

      {/* Night Life Express Section */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-2">EXPERIENCE THE PULSE</p>
          <h2 className="text-2xl md:text-3xl font-bold">Night Life Express</h2>
          <p className="text-muted-foreground mt-2">Immerse yourself in the electrifying energy of Club Guvnor's most vibrant nights and unforgettable moments</p>
        </div>
        <NightlifeCarousel />
      </div>

      {/* Guest Feedback & Club Insights Section */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-2">WHAT OUR GUESTS SAY</p>
          <h2 className="text-2xl md:text-3xl font-bold">Guest Feedback & Insights</h2>
          <p className="text-muted-foreground mt-2">Hear from our valued guests about their unforgettable experiences at Club Guvnor</p>
        </div>
        <PerformanceMetrics />
      </div>

      {/* Loyalists & Patrons Section */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-2">CELEBRATE WITH US</p>
          <h2 className="text-2xl md:text-3xl font-bold">Our Community & Loyalists</h2>
          <p className="text-muted-foreground mt-2">Meet our loyal patrons and celebrate the bonds that make Club Guvnor truly legendary</p>
        </div>
        <LoyalistsPatronsCard />
      </div>

      {/* Visit Us Section */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-2">PLAN YOUR VISIT</p>
          <h2 className="text-2xl md:text-3xl font-bold">Find Us & Get in Touch</h2>
          <p className="text-muted-foreground mt-2">Everything you need to know about our location, directions, and how to reach us</p>
        </div>
        <LightingDisplayPanels />
      </div>

      <Footer />
      </div>
    </div>
  )
}
