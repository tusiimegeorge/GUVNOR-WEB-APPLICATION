'use client'

import React from "react"
import { Card } from '@/components/ui/card'
import { DollarSign, Check, X, Clock, Smartphone } from 'lucide-react'

interface BookingStats {
  totalRevenue: number
  paidCount: number
  pendingCount: number
  failedCount: number
}

interface RecentBooking {
  id: string
  guest_name: string
  total_price_in_cents: number
  payment_status: string
  payment_method: string
  created_at: string
  booking_type: string
}

export function AdminPaymentDashboard({
  stats,
  recentBookings,
}: {
  stats: BookingStats
  recentBookings: RecentBooking[]
}) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-600',
      pending: 'bg-yellow-500/10 text-yellow-600',
      failed: 'bg-red-500/10 text-red-600',
      cancelled: 'bg-muted text-muted-foreground',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getMethodIcon = (method: string) => {
    if (method?.includes('mtn') || method?.includes('momo')) {
      return <Smartphone className="w-4 h-4 text-yellow-500" />
    }
    if (method?.includes('airtel')) {
      return <Smartphone className="w-4 h-4 text-red-500" />
    }
    return <DollarSign className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-40" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold">{stats.paidCount}</p>
            </div>
            <Check className="w-8 h-8 text-blue-500 opacity-40" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{stats.failedCount}</p>
            </div>
            <X className="w-8 h-8 text-red-500 opacity-40" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold">{stats.pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-40" />
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>

        {recentBookings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Guest</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Method</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-3 text-xs">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-medium">{b.guest_name || 'N/A'}</td>
                    <td className="py-3 px-3 capitalize text-xs">{b.booking_type}</td>
                    <td className="py-3 px-3 font-medium">
                      UGX {((b.total_price_in_cents || 0) / 100).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {getMethodIcon(b.payment_method)}
                        <span className="capitalize text-xs">
                          {(b.payment_method || 'pending').replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(b.payment_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
