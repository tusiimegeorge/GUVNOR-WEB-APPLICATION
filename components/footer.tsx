import { SocialMediaIcons } from "./social-media-icons"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Left Column - About */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4">Club Guvnor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Uganda's most iconic nightlife destination. 25 years of legendary entertainment and unforgettable experiences.
            </p>
          </div>

          {/* Center Column - Quick Links & Operating Hours */}
          <div className="grid grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/about-us" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="/menu" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Menu
                  </a>
                </li>
                <li>
                  <a href="/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Bookings
                  </a>
                </li>
              </ul>
            </div>

            {/* Operating Hours */}
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Opening Hours</h4>
              <div className="space-y-1.5 text-sm">
                <p className="text-foreground"><span className="text-muted-foreground">Wednesday:</span> <span className="font-semibold">8PM - 3AM</span></p>
                <p className="text-foreground"><span className="text-muted-foreground">Friday & Saturday:</span> <span className="font-semibold">9PM - 5AM</span></p>
                <p className="text-xs text-muted-foreground italic mt-3">Check events for special hours</p>
              </div>
            </div>
          </div>

          {/* Right Column - Connect With Us */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <SocialMediaIcons />
            </div>
            <p className="text-sm text-muted-foreground">On-site parking available</p>
            <div className="mt-4">
              <p className="text-xs font-bold text-muted-foreground mb-1">LOCATION</p>
              <p className="text-sm text-muted-foreground">
                1st Street Industrial Area
                <br />
                Kampala, Uganda
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Club Guvnor. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
