'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'

interface Customer {
  id: string
  email: string
  full_name: string
  phone?: string
}

interface AdminCustomerSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectCustomer: (customer: Customer) => void
}

export function AdminCustomerSearch({
  isOpen,
  onClose,
  onSelectCustomer,
}: AdminCustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!searchQuery.trim()) {
      setCustomers([])
      return
    }

    const searchCustomers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone')
          .ilike('full_name', `%${searchQuery}%`)
          .limit(10)

        if (error) {
          console.error('[v0] Error searching customers:', error)
          setCustomers([])
        } else {
          setCustomers(data || [])
        }
      } catch (err) {
        console.error('[v0] Customer search failed:', err)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCustomers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, supabase])

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer)
    setSearchQuery('')
    setCustomers([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Table for Customer</DialogTitle>
          <DialogDescription>
            Search and select a customer to book a table for them
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="customer-search">Search Customer by Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="customer-search"
                placeholder="Enter customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Searching customers...
            </p>
          )}

          {!loading && customers.length === 0 && searchQuery && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No customers found matching "{searchQuery}"
            </p>
          )}

          {customers.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{customer.full_name}</div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
