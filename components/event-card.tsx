import Link from "next/link"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/types"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const price = event.price_in_cents.toLocaleString()

  return (
    <Card className="overflow-hidden border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20 flex flex-col h-full">
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image_url || "/guvnor-logo.png"}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-primary-foreground text-sm">UGX {price}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2 flex-grow">
        <h3 className="text-sm font-bold text-balance">{event.title}</h3>
        <p className="text-xs text-muted-foreground">{event.description}</p>
      </CardHeader>
      <CardContent className="space-y-1 text-sm pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{event.event_time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{event.venue}</span>
        </div>
        {event.dj_lineup && event.dj_lineup.length > 0 && (
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {event.dj_lineup.map((dj, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {dj}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full text-sm">Book Now</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
