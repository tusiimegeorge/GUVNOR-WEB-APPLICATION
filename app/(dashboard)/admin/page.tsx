import { redirect } from "next/navigation"
import { isAdminOrSuperAdmin, isSuperAdmin, getUserRole } from "@/lib/admin-utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import Link from "next/link"
import {
  Calendar,
  MessageSquare,
  ImageIcon,
  Bell,
  Users,
  Home,
  Wine,
  Table,
  QrCode,
  Layout,
  CreditCard,
} from "lucide-react"

export default async function AdminDashboard() {
  const hasAdminAccess = await isAdminOrSuperAdmin()
  const superadmin = await isSuperAdmin()
  const role = await getUserRole()

  if (!hasAdminAccess) {
    redirect("/")
  }

  const supabase = await createClient()

  // Get stats
  const now = new Date()
  
  // Fetch paid bookings with event info to filter by upcoming events
  const { data: paidBookingsData } = await supabase
    .from("bookings")
    .select("id, event_id, booking_type, events(event_date)")
    .eq("payment_status", "paid")
  
  // Filter to only count bookings for upcoming/happening events (event_date >= today)
  const totalBookings = paidBookingsData?.filter((booking: any) => {
    if (booking.booking_type === "table") {
      // Table bookings without events are counted
      return true
    }
    // Event bookings only counted if event_date is today or in future
    if (booking.events) {
      const eventData = Array.isArray(booking.events) ? booking.events[0] : booking.events
      if (eventData?.event_date) {
        const eventDate = new Date(eventData.event_date)
        return eventDate >= now
      }
    }
    return false
  }).length || 0

  const { count: pendingComments } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .is("admin_reply", null)

  const { count: totalEvents } = await supabase.from("events").select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen p-[var(--space-8)]">
      <div className="w-[95vw] max-w-7xl mx-auto">
        <div className="mb-[var(--space-4)]">
          <BackButton fallbackUrl="/" />
        </div>

        <div className="mb-[var(--space-8)]">
          <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-2)]">Admin Dashboard</h1>
          <p className="text-[var(--font-size-base)] text-muted-foreground">Manage Club Guvnor content and bookings ({role})</p>
        </div>

        <div className="grid grid-cols-3 gap-[var(--gap-lg)] mb-[var(--space-8)]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-[var(--gap-sm)]">
                <Bell className="w-[var(--icon-md)] h-[var(--icon-md)] text-primary" />
                Paid Bookings
              </CardTitle>
              <CardDescription>Total confirmed reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--font-size-6xl)] font-bold">{totalBookings || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-[var(--gap-sm)]">
                <MessageSquare className="w-[var(--icon-md)] h-[var(--icon-md)] text-primary" />
                Pending Comments
              </CardTitle>
              <CardDescription>Comments awaiting response</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--font-size-6xl)] font-bold">{pendingComments || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-[var(--gap-sm)]">
                <Calendar className="w-[var(--icon-md)] h-[var(--icon-md)] text-primary" />
                Total Events
              </CardTitle>
              <CardDescription>Events in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--font-size-6xl)] font-bold">{totalEvents || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Booking Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/tables">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="w-5 h-5 text-primary" />
                    Tables & Pricing
                  </CardTitle>
                  <CardDescription>Edit table details, capacity, and prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Tables</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/complementaries">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wine className="w-5 h-5 text-primary" />
                    Complementaries
                  </CardTitle>
                  <CardDescription>Manage bottles, platters, wines, and packages</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Complementaries</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/bookings">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Booking Alerts
                  </CardTitle>
                  <CardDescription>View and manage table reservations and ticket purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Bookings</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Operations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/gallery">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Public Gallery
                  </CardTitle>
                  <CardDescription>Upload images and videos to the public gallery</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Gallery</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/comments">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    User Comments
                  </CardTitle>
                  <CardDescription>Respond to guest feedback and suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Comments</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/media">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Event Media
                  </CardTitle>
                  <CardDescription>Upload photos and videos for events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Media</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/events">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Manage Events
                  </CardTitle>
                  <CardDescription>Create and update club events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Events</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/barcode-scanner">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    Barcode Scanner
                  </CardTitle>
                  <CardDescription>Scan tickets at event entrance for entry verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Open Scanner</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/home-content">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Hero Slide Content
                  </CardTitle>
                  <CardDescription>Edit homepage hero slides and media</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Manage Hero Slides</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {superadmin && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Superadmin Features</h2>
              <p className="text-muted-foreground">Advanced system configuration and content management</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/users">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage admin roles and user accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="default">
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/social-media">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Social Media & Payments
                    </CardTitle>
                    <CardDescription>Manage social links and configure MTN MoMo / Airtel Money API credentials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="default">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/layouts">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-primary" />
                      Layout Blueprints
                    </CardTitle>
                    <CardDescription>Upload blueprint images for club layouts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="default">
                      Manage Blueprints
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
