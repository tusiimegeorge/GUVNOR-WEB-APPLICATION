-- Create is_admin_user function (SECURITY DEFINER - bypasses RLS)
-- This function checks if a user has admin role in the profiles table
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

CREATE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO anon, authenticated;
