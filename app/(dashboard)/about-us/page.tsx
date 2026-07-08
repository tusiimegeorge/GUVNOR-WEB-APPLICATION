import { LocationMap } from "@/components/location-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Clock, Mail, Globe, Zap, Users, Sparkles } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { Footer } from "@/components/footer"

export default function AboutUsPage() {
  const clubLocation = {
    latitude: 0.3163,
    longitude: 32.5973,
    address: "GUVNOR, First Street",
    city: "Kampala, Uganda",
  }

  const uniqueFeatures = [
    {
      icon: Zap,
      title: "Latest Systems",
      description: "State-of-the-art sound and lighting systems that create an immersive experience unlike any other venue in the region.",
    },
    {
      icon: Users,
      title: "Exceptional Service",
      description: "Our dedicated team ensures every guest receives premium treatment, from the moment they arrive until the last song plays.",
    },
    {
      icon: Sparkles,
      title: "Legendary Atmosphere",
      description: "A modern, energetic vibe enhanced by neon-inspired design that creates the perfect backdrop for unforgettable nights.",
    },
  ]

  return (
    <div className="min-h-screen pb-[var(--space-16)] relative">
      <div className="absolute top-[var(--space-3)] left-[var(--space-3)] z-10">
        <BackButton fallbackUrl="/" />
      </div>
      <div className="w-[95vw] max-w-7xl mx-auto px-[var(--padding-x)] py-[var(--space-4)]">
        {/* Hero Section - Our Story */}
        <div className="text-center mb-[var(--space-8)]">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">25 Years of Legendary Nightlife</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            The story of Uganda&apos;s most iconic entertainment destination
          </p>
        </div>

        {/* Our Legacy Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Our Legacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Founded by the visionary Charlie Lubega, Guvnor has been at the heart of Uganda&apos;s nightlife scene for over two decades. What started as a bold dream to create a world-class entertainment venue has evolved into an institution that defines nightlife excellence in East Africa.
            </p>
            <p>
              Under the continued leadership of Jackson Mayanja, Guvnor has maintained its position as the premier destination for unforgettable nights. We&apos;ve hosted countless legendary events, welcomed international artists, and created memories for generations of party-goers.
            </p>
            <p>
              Today, Guvnor stands as a testament to innovation, quality, and the relentless pursuit of exceptional entertainment. Our commitment to delivering world-class experiences remains as strong as it was on day one.
            </p>
          </CardContent>
        </Card>

        {/* What Makes Us Unique Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">What Makes Us Unique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uniqueFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <Icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              To be Uganda&apos;s most iconic and innovative nightlife destination, setting the standard for entertainment excellence across East Africa.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Delivering world-class entertainment and unforgettable experiences through exceptional service, cutting-edge technology, and legendary events.
            </CardContent>
          </Card>
        </div>

        {/* Location Section */}
        <h2 className="text-3xl font-bold mb-6 text-center">Find Us</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Located in the heart of Industrial Area, Kampala. Easy to find and ready to welcome you
        </p>

        <div className="grid grid-cols-3 gap-[var(--gap-md)]">
          {/* Map */}
          <div className="col-span-2">
            <Card className="border-2 overflow-hidden">
              <div className="h-[clamp(400px,50vh,600px)]">
                <LocationMap
                  latitude={clubLocation.latitude}
                  longitude={clubLocation.longitude}
                  markerText="Guvnor Uganda"
                />
              </div>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="col-span-1 space-y-[var(--gap-md)]">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-[var(--text-lg)]">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--space-2)]">
                <div className="flex items-start gap-[var(--gap-sm)]">
                  <MapPin className="w-[var(--icon-sm)] h-[var(--icon-sm)] text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1 text-[var(--text-sm)]">Address</p>
                    <p className="text-[var(--text-xs)] text-muted-foreground">
                      {clubLocation.address}
                      <br />
                      {clubLocation.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Phone</p>
                    <a href="tel:+256772825306" className="text-sm text-primary hover:underline block">
                      +256 772825306
                    </a>
                    <a href="tel:+256414230190" className="text-sm text-primary hover:underline block">
                      +256 414 230190
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <a href="mailto:letoileafriquecolimited@gmail.com" className="text-sm text-primary hover:underline">
                      letoileafriquecolimited@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Website</p>
                    <a
                      href="http://www.clubguvnorug.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      www.clubguvnorug.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Opening Hours</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Friday & Saturday</p>
                      <p className="font-medium text-foreground">9:00 PM - 6:00 AM</p>
                      <p className="mt-2 text-xs">Open for private parties Mon-Thu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
