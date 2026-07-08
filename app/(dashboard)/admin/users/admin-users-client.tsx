"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BackButton } from "@/components/back-button"
import type { Profile } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Shield, User, Crown, Star, QrCode, RefreshCw, Eye, Download } from "lucide-react"
import QRCode from "qrcode"

export default function AdminUsersClient() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    // Fetch profiles with email from auth.users
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesData) {
      // Fetch emails separately from auth metadata
      const profilesWithEmails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
          return {
            ...profile,
            email: userData?.user?.email || "",
          }
        })
      )
      setProfiles(profilesWithEmails as Profile[])
    }
  }

  async function handleViewUser(profile: Profile) {
    setSelectedUser(profile)
    
    // Generate QR code if user is VIP
    if (profile.is_vip_member && profile.vip_qr_code) {
      try {
        const qrDataUrl = await QRCode.toDataURL(profile.vip_qr_code, {
          width: 300,
          margin: 2,
        })
        setQrCodeDataUrl(qrDataUrl)
      } catch (err) {
        console.error("Failed to generate QR code:", err)
      }
    }
    
    setUserDetailsOpen(true)
  }

  async function toggleVipMembership(profileId: string, currentVipStatus: boolean) {
    setLoading(true)
    
    const newVipStatus = !currentVipStatus
    const updateData: any = {
      is_vip_member: newVipStatus,
    }
    
    // If upgrading to VIP, generate QR code
    if (newVipStatus) {
      const qrCode = `VIP-${profileId.replace(/-/g, '').toUpperCase().substring(0, 20)}-${Math.floor(Math.random() * 10000)}`
      updateData.vip_qr_code = qrCode
      updateData.vip_activated_at = new Date().toISOString()
      updateData.vip_qr_generated_at = new Date().toISOString()
    }
    
    const { error } = await supabase.from("profiles").update(updateData).eq("id", profileId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update VIP membership",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: newVipStatus ? "User upgraded to VIP member" : "VIP membership removed",
      })
      loadProfiles()
    }
    setLoading(false)
  }

  async function regenerateQrCode(profileId: string) {
    setLoading(true)
    
    const qrCode = `VIP-${profileId.replace(/-/g, '').toUpperCase().substring(0, 20)}-${Math.floor(Math.random() * 10000)}`
    
    const { error } = await supabase
      .from("profiles")
      .update({
        vip_qr_code: qrCode,
        vip_qr_generated_at: new Date().toISOString(),
      })
      .eq("id", profileId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate QR code",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "VIP QR code regenerated successfully",
      })
      loadProfiles()
      
      // Update selected user if details dialog is open
      if (selectedUser && selectedUser.id === profileId) {
        const { data } = await supabase.from("profiles").select("*").eq("id", profileId).single()
        if (data) {
          setSelectedUser(data as Profile)
          const qrDataUrl = await QRCode.toDataURL(qrCode, { width: 300, margin: 2 })
          setQrCodeDataUrl(qrDataUrl)
        }
      }
    }
    setLoading(false)
  }

  function downloadQrCode() {
    if (!qrCodeDataUrl || !selectedUser) return

    const link = document.createElement("a")
    link.download = `VIP-${selectedUser.full_name?.replace(/\s+/g, "_") || "Member"}-QRCode.png`
    link.href = qrCodeDataUrl
    link.click()

    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    })
  }

  async function handleRoleChange(profileId: string, newRole: "user" | "admin" | "superadmin") {
    setLoading(true)
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profileId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
      loadProfiles()
    }
    setLoading(false)
  }

  function getRoleIcon(role: string) {
    if (role === "superadmin") return <Crown className="w-5 h-5 text-yellow-500" />
    if (role === "admin") return <Shield className="w-5 h-5 text-primary" />
    return <User className="w-5 h-5" />
  }

  function getRoleBadgeVariant(role: string) {
    if (role === "superadmin") return "default"
    if (role === "admin") return "default"
    return "secondary"
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/admin" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage admin roles and user accounts</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note:</strong> Admin users have full access to manage content, view bookings, respond to comments,
              and edit all aspects of the website.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Superadmin:</strong> Can promote users to admin or demote admins. Only superadmin credentials are
              set in the source code.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {getRoleIcon(profile.role)}
                      <button
                        onClick={() => handleViewUser(profile)}
                        className="hover:underline hover:text-primary transition-colors cursor-pointer text-left"
                      >
                        {profile.full_name || "User"}
                      </button>
                      <Badge
                        variant={getRoleBadgeVariant(profile.role)}
                        className={profile.role === "superadmin" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                      >
                        {profile.role}
                      </Badge>
                      {profile.is_vip_member && (
                        <Badge className="bg-purple-500 hover:bg-purple-600">
                          <Star className="w-3 h-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(profile)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant={profile.is_vip_member ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleVipMembership(profile.id, profile.is_vip_member || false)}
                      disabled={loading}
                      className={profile.is_vip_member ? "bg-purple-500 hover:bg-purple-600" : ""}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {profile.is_vip_member ? "Remove VIP" : "Make VIP"}
                    </Button>
                    {profile.role !== "superadmin" ? (
                      <Select
                        value={profile.role}
                        onValueChange={(value: "user" | "admin" | "superadmin") => handleRoleChange(profile.id, value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                        Protected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {profile.phone && (
                <CardContent>
                  <p className="text-sm">
                    <strong>Phone:</strong> {profile.phone}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser && getRoleIcon(selectedUser.role)}
              {selectedUser?.full_name || "User Details"}
              {selectedUser?.is_vip_member && (
                <Badge className="bg-purple-500">
                  <Star className="w-3 h-3 mr-1" />
                  VIP Member
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Complete user information and VIP membership status</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Full Name</h3>
                  <p>{selectedUser.full_name || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email</h3>
                  <p className="text-sm break-all">{selectedUser.email || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Phone</h3>
                  <p>{selectedUser.phone || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Role</h3>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Member Since</h3>
                  <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedUser.is_vip_member && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    VIP Membership
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">VIP Since</h4>
                      <p>
                        {selectedUser.vip_activated_at
                          ? new Date(selectedUser.vip_activated_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Permanent QR Code</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        This QR code grants entry to all events. Scan at venue for verification.
                      </p>
                      {qrCodeDataUrl && (
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <img src={qrCodeDataUrl} alt="VIP QR Code" className="w-64 h-64" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {selectedUser.vip_qr_code}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Last Generated</h4>
                      <p className="text-sm">
                        {selectedUser.vip_qr_generated_at
                          ? new Date(selectedUser.vip_qr_generated_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={downloadQrCode}
                        disabled={loading || !qrCodeDataUrl}
                        variant="default"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR
                      </Button>
                      <Button
                        onClick={() => regenerateQrCode(selectedUser.id)}
                        disabled={loading}
                        variant="outline"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => {
                        toggleVipMembership(selectedUser.id, true)
                        setUserDetailsOpen(false)
                      }}
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Revoke VIP Membership
                    </Button>
                  </div>
                </div>
              )}

              {!selectedUser.is_vip_member && (
                <div className="border-t pt-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This user is not a VIP member. Click "Make VIP" to upgrade them and generate a permanent event
                      access QR code.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
