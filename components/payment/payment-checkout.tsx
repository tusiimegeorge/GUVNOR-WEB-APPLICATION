'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Smartphone, Loader2, AlertCircle } from 'lucide-react'

interface PaymentCheckoutProps {
  bookingId: string
  amount: number // Amount in UGX
  userEmail: string
  userName: string
  onPaymentComplete: (success: boolean, transactionId?: string) => void
}

export function PaymentCheckout({
  bookingId,
  amount,
  userEmail,
  userName,
  onPaymentComplete,
}: PaymentCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'airtel_money' | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  const handleInitiatePayment = async () => {
    try {
      setError('')
      setLoading(true)

      if (!paymentMethod) {
        setError('Please select a payment method')
        return
      }

      if (!phoneNumber) {
        setError('Phone number is required')
        return
      }

      // Price accuracy check - verify amount before submitting
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount, // Exact amount from booking
          paymentMethod,
          phoneNumber,
          email: userEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Payment initiation failed')
        return
      }

      setTransactionId(data.transactionId)
      setPaymentStatus('initiated')

      // Poll for payment confirmation
      setTimeout(() => {
        pollPaymentStatus(data.transactionId)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }

  const pollPaymentStatus = async (transId: string) => {
    try {
      setPaymentStatus('waiting')

      // Poll for max 5 minutes
      let attempts = 0
      const maxAttempts = 150 // 150 * 2 seconds = 5 minutes

      const poll = async () => {
        if (attempts > maxAttempts) {
          setError('Payment confirmation timeout. Please check your transaction status.')
          setPaymentStatus('timeout')
          return
        }

        attempts++

        try {
          const response = await fetch(`/api/payments/status?transactionId=${transId}`)
          const data = await response.json()

          if (data.status === 'completed') {
            setPaymentStatus('completed')
            onPaymentComplete(true, transId)
            return
          }

          if (data.status === 'failed') {
            setError('Payment failed. Please try again.')
            setPaymentStatus('failed')
            onPaymentComplete(false)
            return
          }

          // Still pending, poll again
          setTimeout(poll, 2000)
        } catch (err) {
          console.error('[v0] Poll error:', err)
          setTimeout(poll, 2000)
        }
      }

      await poll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment status check failed')
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Complete Your Booking Payment</h2>
      <p className="text-muted-foreground mb-6">
        Exact Amount: <span className="font-semibold text-foreground">UGX {amount.toLocaleString()}</span>
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {paymentStatus === '' && (
        <>
          <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* MTN MoMo */}
            <button
              onClick={() => {
                setPaymentMethod('mtn_momo')
                setPaymentStatus('')
              }}
              className={`p-4 border-2 rounded-lg transition-all ${
                paymentMethod === 'mtn_momo'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <Smartphone className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="font-semibold">MTN MoMo</p>
              <p className="text-sm text-muted-foreground">Uganda</p>
            </button>

            {/* Airtel Money */}
            <button
              onClick={() => {
                setPaymentMethod('airtel_money')
                setPaymentStatus('')
              }}
              className={`p-4 border-2 rounded-lg transition-all ${
                paymentMethod === 'airtel_money'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <Smartphone className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="font-semibold">Airtel Money</p>
              <p className="text-sm text-muted-foreground">Uganda</p>
            </button>
          </div>

          {/* Phone Number Input for Mobile Money */}
          {paymentMethod && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Phone Number ({paymentMethod === 'mtn_momo' ? 'MTN' : 'Airtel'})
              </label>
              <input
                type="tel"
                placeholder="+256700000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your phone number to receive payment prompt
              </p>
            </div>
          )}

          <Button
            onClick={handleInitiatePayment}
            disabled={loading || !paymentMethod}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay UGX ${amount.toLocaleString()}`
            )}
          </Button>
        </>
      )}

      {paymentStatus === 'initiated' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold mb-2">Payment Initiated</h3>
          <p className="text-muted-foreground">
            Check your {paymentMethod === 'mtn_momo' ? 'MTN' : 'Airtel'} phone for payment prompt
          </p>
        </div>
      )}

      {paymentStatus === 'waiting' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold mb-2">Confirming Payment</h3>
          <p className="text-muted-foreground">This may take a few moments...</p>
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="text-center py-8 bg-green-50 rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-900 mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Your booking has been confirmed. Check your email for details.
          </p>
        </div>
      )}
    </Card>
  )
}
