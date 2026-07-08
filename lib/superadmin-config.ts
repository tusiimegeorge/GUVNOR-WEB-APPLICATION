export const SUPERADMIN_CONFIG = {
  email: "tusiimegeorgetrevour12@gmail.com",
  phone_number: "0775839195",
  // This will be checked against the profiles table role column
  // Superadmin account must be created via Supabase Auth first
}

export const ADMIN_PERMISSIONS = {
  superadmin: [
    "manage_users",
    "manage_roles",
    "manage_menu_items",
    "edit_prices",
    "upload_media",
    "delete_media",
    "manage_events",
    "manage_bookings",
    "manage_comments",
    "manage_all_content",
    "view_analytics",
    "manage_settings",
  ],
  admin: ["upload_media", "delete_media", "manage_events", "manage_bookings", "manage_comments", "view_analytics"],
  user: [],
}

export function hasPermission(role: string, permission: string): boolean {
  if (role === "superadmin") {
    return ADMIN_PERMISSIONS.superadmin.includes(permission)
  }
  if (role === "admin") {
    return ADMIN_PERMISSIONS.admin.includes(permission)
  }
  return false
}
