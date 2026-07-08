export interface PaymentProvider {
  id: string
  name: string
  logo: string
  type: "mobile_money"
  enabled: boolean
  instructions: string
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: "momo_pay",
    name: "MTN MoMo Pay",
    logo: "/payment-logos/momo-pay.png",
    type: "mobile_money",
    enabled: true,
    instructions: "Enter your MTN Mobile Money number to complete payment",
  },
  {
    id: "airtel_pay",
    name: "Airtel Money",
    logo: "/payment-logos/airtel-money.png",
    type: "mobile_money",
    enabled: true,
    instructions: "Enter your Airtel Money number to complete payment",
  },
]

export interface MobileMoneyPayment {
  provider: string
  phone_number: string
  amount: number
  booking_id: string
}

export async function initiateMobileMoneyPayment(payment: MobileMoneyPayment): Promise<{
  success: boolean
  transaction_id?: string
  error?: string
}> {
  // In production, this would call the actual payment gateway API
  // For now, return a mock response
  console.log("[v0] Initiating mobile money payment:", payment)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    success: true,
    transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
}

export async function verifyMobileMoneyPayment(transactionId: string): Promise<{
  success: boolean
  status: "pending" | "completed" | "failed"
}> {
  // In production, this would verify with the payment gateway
  console.log("[v0] Verifying payment:", transactionId)

  return {
    success: true,
    status: "completed",
  }
}
