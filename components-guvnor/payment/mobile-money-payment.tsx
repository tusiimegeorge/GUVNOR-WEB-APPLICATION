"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { PAYMENT_PROVIDERS, initiateMobileMoneyPayment } from "@/lib/payment-providers"
import { useToast } from "@/hooks/use-toast"

interface MobileMoneyPaymentProps {
  amount: number
  bookingId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}

export function MobileMoneyPayment({ amount, bookingId, onSuccess, onCancel }: MobileMoneyPaymentProps) {
  const [selectedProvider, setSelectedProvider] = useState(PAYMENT_PROVIDERS[0].id)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const provider = PAYMENT_PROVIDERS.find((p) => p.id === selectedProvider)

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const result = await initiateMobileMoneyPayment({
        provider: selectedProvider,
        phone_number: phoneNumber,
        amount,
        booking_id: bookingId,
      })

      if (result.success && result.transaction_id) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone to complete the payment",
        })

        // Simulate waiting for payment confirmation
        await new Promise((resolve) => setTimeout(resolve, 2000))

        onSuccess(result.transaction_id)
      } else {
        setError(result.error || "Payment failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile Money Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Select Payment Method</Label>
          <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
            {PAYMENT_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value={provider.id} id={provider.id} />
                <Label htmlFor={provider.id} className="flex-1 cursor-pointer flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">{provider.name}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {provider && (
          <div className="space-y-3">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">{provider.instructions}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing || !phoneNumber} className="flex-1">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
