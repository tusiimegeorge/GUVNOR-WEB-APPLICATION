import { AdminPaymentDashboard } from './admin-payment-dashboard'
import { requireSuperAdmin } from '@/lib/admin-utils'
import { BackButton } from "@/components/back-button"
import { getServiceRoleClient } from '@/lib/supabase/service-role'

export const metadata = {
  title: 'Payment Management | Guvnor Admin',
  description: 'Manage payment configurations and transactions',
}

export default async function AdminPaymentsPage() {
  await requireSuperAdmin()
  const supabase = getServiceRoleClient()

  // Fetch real booking stats for accurate numbers
  const { data: paidBookings } = await supabase
    .from('bookings')
    .select('total_price_in_cents')
    .eq('payment_status', 'paid')

  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'pending')

  const { count: failedCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'failed')

  const totalRevenue = (paidBookings || []).reduce((sum, b) => sum + (b.total_price_in_cents || 0), 0)

  const stats = {
    totalRevenue: Math.round(totalRevenue / 100), // Convert cents to UGX
    paidCount: paidBookings?.length || 0,
    pendingCount: pendingCount || 0,
    failedCount: failedCount || 0,
  }

  // Fetch recent bookings as transactions (most recent 15)
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('id, guest_name, total_price_in_cents, payment_status, payment_method, created_at, booking_type')
    .in('payment_status', ['paid', 'pending', 'failed'])
    .order('created_at', { ascending: false })
    .limit(15)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton fallbackUrl="/admin" />
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">
            Monitor transactions and revenue from real booking data
          </p>
        </div>

        <AdminPaymentDashboard stats={stats} recentBookings={recentBookings || []} />
      </div>
    </div>
  )
}
