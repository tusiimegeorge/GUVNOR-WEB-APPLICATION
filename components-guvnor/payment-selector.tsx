"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Phone, Wallet } from "lucide-react"

export type PaymentMethod = "momo_pay" | "airtel_pay" | "cash"

interface PaymentSelectorProps {
  onSelect: (method: PaymentMethod) => void
  selectedMethod?: PaymentMethod
}

export function PaymentSelector({ onSelect, selectedMethod }: PaymentSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethod>(selectedMethod || "momo_pay")

  const handleSelect = (value: string) => {
    const method = value as PaymentMethod
    setSelected(method)
    onSelect(method)
  }

  const paymentMethods = [
    {
      id: "momo_pay",
      name: "MTN Mobile Money",
      description: "Pay with MTN MoMo",
      icon: Phone,
      color: "text-yellow-500",
    },
    {
      id: "airtel_pay",
      name: "Airtel Money",
      description: "Pay with Airtel Money",
      icon: Phone,
      color: "text-red-500",
    },
    {
      id: "cash",
      name: "Cash on Arrival",
      description: "Pay at the venue",
      icon: Wallet,
      color: "text-green-500",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>Choose how you would like to pay for your booking</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selected === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleSelect(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex items-center gap-3 flex-1">
                  <Icon className={`w-6 h-6 ${method.color}`} />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="text-base font-semibold cursor-pointer">
                      {method.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
