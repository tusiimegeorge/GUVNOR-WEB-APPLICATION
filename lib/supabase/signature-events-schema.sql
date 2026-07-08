-- Signature Events Table
-- This table stores video content for showcase signature events
CREATE TABLE IF NOT EXISTS signature_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(1024) NOT NULL,
  thumbnail_url VARCHAR(1024),
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_featured BOOLEAN DEFAULT FALSE,
  order_position INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT signature_events_unique_video_url UNIQUE(video_url)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_signature_events_featured ON signature_events(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_signature_events_order ON signature_events(order_position ASC);
CREATE INDEX IF NOT EXISTS idx_signature_events_created_at ON signature_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE signature_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view signature events (no auth required)
CREATE POLICY "signature_events_select_all"
  ON signature_events
  FOR SELECT
  USING (TRUE);

-- RLS Policy: Only admins can insert
CREATE POLICY "signature_events_admin_insert"
  ON signature_events
  FOR INSERT
  WITH CHECK (public.is_admin_user(auth.uid()));

-- RLS Policy: Only admins can update
CREATE POLICY "signature_events_admin_update"
  ON signature_events
  FOR UPDATE
  USING (public.is_admin_user(auth.uid()));

-- RLS Policy: Only admins can delete
CREATE POLICY "signature_events_admin_delete"
  ON signature_events
  FOR DELETE
  USING (public.is_admin_user(auth.uid()));

-- Create storage bucket for signature event videos
-- Note: This needs to be created via Supabase dashboard or via migration script
-- INSERT into storage.buckets (id, name, public) VALUES ('signature-events', 'signature-events', false);
