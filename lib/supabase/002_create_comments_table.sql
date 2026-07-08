-- Create comments table for guest feedback (matches GUVNOR pattern)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on is_approved and created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_approved_date ON public.comments(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "comments_select_approved" ON public.comments;
DROP POLICY IF EXISTS "comments_select_own" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_public" ON public.comments;
DROP POLICY IF EXISTS "comments_admin_update" ON public.comments;
DROP POLICY IF EXISTS "comments_admin_delete" ON public.comments;

-- RLS Policies for comments (following GUVNOR pattern)
-- Anyone can read approved comments (no auth required)
CREATE POLICY "comments_select_approved"
  ON public.comments
  FOR SELECT
  USING (is_approved = true);

-- Authenticated users can read their own unapproved comments
CREATE POLICY "comments_select_own"
  ON public.comments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert their own comments
CREATE POLICY "comments_insert_own"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments (only if not yet approved)
CREATE POLICY "comments_update_own"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false);

-- Users can delete their own comments (only if not yet approved)
CREATE POLICY "comments_delete_own"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id AND is_approved = false);
