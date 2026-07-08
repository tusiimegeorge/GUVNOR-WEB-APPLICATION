"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackButton } from "@/components/back-button"
import { Plus, Trash2, Save, MoveUp, MoveDown, ExternalLink, Smartphone, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  color: string
  display_order: number
}

interface PaymentConfig {
  id: string
  provider: string
  merchant_code: string
  endpoint: string
  is_production: boolean
  is_active: boolean
}

const ICON_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "tiktok", label: "TikTok" },
  { value: "snapchat", label: "Snapchat" },
  { value: "website", label: "Website" },
  { value: "external-link", label: "Other/Custom" },
]

const DEFAULT_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  youtube: "#FF0000",
  facebook: "#1877F2",
  x: "#000000",
  tiktok: "#000000",
  snapchat: "#FFFC00",
  "external-link": "#6B7280",
}

export function SocialMediaClient({
  initialLinks,
  initialPaymentConfigs,
}: {
  initialLinks: SocialLink[]
  initialPaymentConfigs: PaymentConfig[]
}) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Payment config state
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>(initialPaymentConfigs)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    apiKey: "",
    apiSecret: "",
    merchantCode: "",
    endpoint: "",
    isProduction: false,
  })

  // Social links logic
  const addLink = () => {
    const newLink: SocialLink = {
      id: `temp-${Date.now()}`,
      platform: "New Platform",
      url: "https://",
      icon: "external-link",
      color: DEFAULT_COLORS["external-link"],
      display_order: links.length + 1,
    }
    setLinks([...links, newLink])
  }

  const updateLink = (id: string, field: keyof SocialLink, value: string | number) => {
    setLinks(
      links.map((link) => {
        if (link.id === id) {
          const updated = { ...link, [field]: value }
          if (field === "icon" && typeof value === "string" && DEFAULT_COLORS[value]) {
            updated.color = DEFAULT_COLORS[value]
          }
          return updated
        }
        return link
      }),
    )
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const moveLink = (id: string, direction: "up" | "down") => {
    const index = links.findIndex((link) => link.id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === links.length - 1) return
    const newLinks = [...links]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]]
    newLinks.forEach((link, idx) => {
      link.display_order = idx + 1
    })
    setLinks(newLinks)
  }

  const saveLinks = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            setting_key: "social_media_links",
            setting_value: links,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "setting_key" },
        )
      if (error) throw error
      toast({ title: "Success", description: "Social media links updated successfully" })
      window.location.reload()
    } catch (error) {
      console.error("Error saving links:", error)
      toast({ title: "Error", description: "Failed to save social media links", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Payment config logic
  const openConfigForm = (provider: string) => {
    const existing = paymentConfigs.find((c) => c.provider === provider)
    setEditingProvider(provider)
    setPaymentForm({
      apiKey: "",
      apiSecret: "",
      merchantCode: existing?.merchant_code || "",
      endpoint: existing?.endpoint || "",
      isProduction: existing?.is_production || false,
    })
  }

  const savePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProvider) return
    setPaymentLoading(true)

    try {
      const response = await fetch("/api/admin/payments/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: editingProvider,
          ...paymentForm,
        }),
      })

      if (response.ok) {
        toast({ title: "Success", description: `${editingProvider.replace("_", " ")} configuration saved` })
        setEditingProvider(null)
        // Refresh configs
        const configRes = await fetch("/api/admin/payments/config")
        if (configRes.ok) {
          const configData = await configRes.json()
          setPaymentConfigs(configData.configs || [])
        }
      } else {
        toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving config:", error)
      toast({ title: "Error", description: "Error saving configuration", variant: "destructive" })
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/admin" />
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Social Media & Payments</h1>
          <p className="text-muted-foreground">
            Manage social media links and payment provider credentials (Superadmin only)
          </p>
        </div>

        <Tabs defaultValue="social" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Media Links</TabsTrigger>
            <TabsTrigger value="payments">Payment API Credentials</TabsTrigger>
          </TabsList>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configure Social Links</CardTitle>
                <CardDescription>
                  Add, edit, or remove social media links. These will appear on the home page, events page, and bookings
                  page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {links.map((link, index) => (
                  <Card key={link.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="icon" onClick={() => moveLink(link.id, "up")} disabled={index === 0}>
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => moveLink(link.id, "down")} disabled={index === links.length - 1}>
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Platform Name</Label>
                            <Input value={link.platform} onChange={(e) => updateLink(link.id, "platform", e.target.value)} placeholder="e.g., Instagram" />
                          </div>
                          <div>
                            <Label>URL</Label>
                            <Input value={link.url} onChange={(e) => updateLink(link.id, "url", e.target.value)} placeholder="https://..." />
                          </div>
                          <div>
                            <Label>Icon</Label>
                            <div className="flex gap-2">
                              <Select value={link.icon} onValueChange={(value) => updateLink(link.id, "icon", value)}>
                                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {ICON_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" title="Use custom icon name/URL">
                                <span className="text-xs font-bold">✎</span>
                              </Button>
                            </div>
                            <Input 
                              value={link.icon} 
                              onChange={(e) => updateLink(link.id, "icon", e.target.value)} 
                              placeholder="Or enter custom icon name/URL" 
                              className="mt-2 text-xs"
                            />
                          </div>
                          <div>
                            <Label>Button Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" value={link.color} onChange={(e) => updateLink(link.id, "color", e.target.value)} className="w-16 h-10" />
                              <Input value={link.color} onChange={(e) => updateLink(link.id, "color", e.target.value)} placeholder="#000000" className="flex-1" />
                            </div>
                          </div>
                        </div>

                        <Button variant="destructive" size="icon" onClick={() => deleteLink(link.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" style={{ backgroundColor: link.color }} className="text-white flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            {link.platform}
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button onClick={addLink} variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Media Link
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button onClick={saveLinks} disabled={loading} size="lg">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Provider Credentials</CardTitle>
                <CardDescription>
                  Configure MTN MoMo Pay and Airtel Money API credentials. These are required for the app to process
                  mobile money payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["mtn_momo", "airtel_money"] as const).map((provider) => {
                    const config = paymentConfigs.find((c) => c.provider === provider)
                    const isMTN = provider === "mtn_momo"
                    return (
                      <Card key={provider} className="border-2">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMTN ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                                <Smartphone className={`w-5 h-5 ${isMTN ? "text-yellow-500" : "text-red-500"}`} />
                              </div>
                              <div>
                                <p className="font-semibold">{isMTN ? "MTN MoMo Pay" : "Airtel Money"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {config ? (config.is_production ? "Production" : "Sandbox") : "Not configured"}
                                </p>
                              </div>
                            </div>
                            {config?.is_active && (
                              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                                <Check className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>

                          {config ? (
                            <div className="text-sm space-y-1 mb-4 bg-muted/50 p-3 rounded-lg">
                              <p><span className="text-muted-foreground">Merchant:</span> {config.merchant_code}</p>
                              <p><span className="text-muted-foreground">Endpoint:</span> <span className="text-xs break-all">{config.endpoint}</span></p>
                            </div>
                          ) : (
                            <div className="mb-4 bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                              No credentials configured yet. Click below to set up.
                            </div>
                          )}

                          <Button variant="outline" onClick={() => openConfigForm(provider)} className="w-full">
                            {config ? "Update Credentials" : "Configure Now"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Config Form */}
            {editingProvider && (
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle>
                    {editingProvider === "mtn_momo" ? "MTN MoMo Pay" : "Airtel Money"} Configuration
                  </CardTitle>
                  <CardDescription>
                    Enter the API credentials provided by {editingProvider === "mtn_momo" ? "MTN" : "Airtel"}. These will be stored securely in the database.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={savePaymentConfig} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={paymentForm.apiKey}
                          onChange={(e) => setPaymentForm({ ...paymentForm, apiKey: e.target.value })}
                          placeholder="Enter API key"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>API Secret</Label>
                        <Input
                          type="password"
                          value={paymentForm.apiSecret}
                          onChange={(e) => setPaymentForm({ ...paymentForm, apiSecret: e.target.value })}
                          placeholder="Enter API secret"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Merchant Code</Label>
                        <Input
                          type="text"
                          value={paymentForm.merchantCode}
                          onChange={(e) => setPaymentForm({ ...paymentForm, merchantCode: e.target.value })}
                          placeholder={editingProvider === "mtn_momo" ? "e.g., 18423782" : "e.g., AIRTEL_001"}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>API Endpoint</Label>
                        <Input
                          type="url"
                          value={paymentForm.endpoint}
                          onChange={(e) => setPaymentForm({ ...paymentForm, endpoint: e.target.value })}
                          placeholder={
                            editingProvider === "mtn_momo"
                              ? "https://sandbox.momodeveloper.mtn.com"
                              : "https://openapi.airtel.africa"
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Switch
                        id="production-mode"
                        checked={paymentForm.isProduction}
                        onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, isProduction: checked })}
                      />
                      <Label htmlFor="production-mode" className="cursor-pointer">
                        Use Production Environment
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={paymentLoading}>
                        {paymentLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Configuration
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingProvider(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
