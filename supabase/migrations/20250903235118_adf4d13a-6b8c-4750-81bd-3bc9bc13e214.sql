-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Create a more restrictive policy that only allows public access to specific keys
CREATE POLICY "Public can view public site settings" 
ON public.site_settings 
FOR SELECT 
USING (
  key IN ('terms_of_service', 'privacy_policy')
);

-- Admin policy remains the same for full access
-- This ensures admins can still manage all settings while protecting sensitive config data