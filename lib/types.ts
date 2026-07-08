export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string
  venue: string
  image_url: string | null
  event_status: "happening_now" | "upcoming" | "past"
  total_views: number
  total_tickets: number
  available_tickets: number
  ticket_price_in_cents: number
  pricing_model: "free" | "standard" | "conditional"
  pricing_notes: string | null
  is_featured: boolean
  instagram_url?: string | null
  twitter_url?: string | null
  tiktok_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface Table {
  id: string
  table_number: string
  capacity: number
  price_in_cents: number
  x_position: number
  y_position: number
  section: string
  status: "available" | "booked" | "reserved"
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  event_id: string | null
  table_id: string | null
  booking_type: "event" | "table"
  guest_name: string
  guest_email: string
  guest_phone: string | null
  number_of_guests: number
  total_price_in_cents: number
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_method: "momo_pay" | "paypal" | "airtel_pay" | "pesapay" | null
  stripe_session_id: string | null
  booking_date: string
  special_requests: string | null
  admin_booking: boolean
  admin_id: string | null
  created_at: string
  updated_at: string
}

export interface EventBooking extends Booking {
  booking_type: "event"
  event_id: string
  tickets?: Ticket[]
}

export interface Ticket {
  id: string
  booking_id: string
  event_id: string
  barcode: string
  barcode_image_url: string | null
  is_scanned: boolean
  scanned_at: string | null
  ticket_number: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: "user" | "admin" | "superadmin"
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: string
  title: string | null
  description: string | null
  image_url: string
  category: string | null
  display_order: number
  created_at: string
}

export interface EventVideo {
  id: string
  event_id: string
  video_url: string
  title: string | null
  description: string | null
  duration_seconds: number
  video_type: "short" | "long"
  thumbnail_url: string | null
  display_order: number
  created_at: string
}

export interface EventPhoto {
  id: string
  event_id: string
  photo_url: string
  title: string | null
  description: string | null
  display_order: number
  created_at: string
}

export interface EventWithMedia extends Event {
  event_status: "upcoming" | "happening_now" | "past"
  videos?: EventVideo[]
  photos?: EventPhoto[]
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price_in_cents?: number
  bottle_price_in_cents: number | null
  tots_price_in_cents: number | null
  bottle_size: string | null
  has_tots: boolean
  category: string
  category_image_url: string | null
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  user_name: string
  comment: string
  rating: number | null
  admin_reply: string | null
  is_approved: boolean
  replied_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminBookingAlert {
  id: string
  booking_type: "event" | "table"
  guest_name: string
  guest_email: string
  guest_phone: string | null
  number_of_guests: number
  total_price_in_cents: number
  payment_status: string
  booking_date: string
  created_at: string
  event_title: string | null
  event_date: string | null
  table_number: string | null
  section: string | null
}

export interface Complementary {
  id: string
  name: string
  description: string | null
  category: string
  price_in_cents: number
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface SectionComplementary {
  id: string
  section_id: string
  complementary_id: string
  quantity: number
  is_included: boolean
  complementaries: Complementary
  club_sections: {
    id: string
    name: string
  }
}

export interface TableComplementary {
  id: string
  table_id: string
  complementary_id: string
  quantity: number
  is_included: boolean
  complementaries: Complementary
  tables: {
    id: string
    table_number: string
    section_id: string
    club_sections: {
      name: string
    }
  }
}
