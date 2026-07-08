import { FooterQRCode } from "./footer-qr-code"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="w-[95vw] mx-auto px-[var(--padding-x)] py-[var(--space-8)]">
        <div className="grid grid-cols-2 gap-[var(--gap-lg)]">
          {/* About Section */}
          <div>
            <h3 className="font-bold text-[var(--text-lg)] mb-[var(--space-4)]">Club Guvnor</h3>
            <p className="text-[var(--text-xs)] text-muted-foreground mb-[var(--space-4)]">
              Kampala's premier nightclub since 1989. Experience legendary events, premium service, and unforgettable
              nights.
            </p>
            <p className="text-[var(--text-xs)] font-semibold text-primary">Whatever Your Mood, We've Got The Colour!</p>
          </div>

          {/* QR Code */}
          <div>
            <h3 className="font-bold text-[var(--text-lg)] mb-[var(--space-4)] text-center">Visit Us</h3>
            <FooterQRCode />
          </div>
        </div>

        <div className="mt-[var(--space-8)] pt-[var(--space-8)] border-t border-border text-center text-[var(--text-xs)] text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Club Guvnor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
