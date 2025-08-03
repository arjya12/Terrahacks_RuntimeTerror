-- Corrected function with proper parameter order for Supabase RPC calls
-- Run this in your Supabase SQL Editor

-- Drop the existing function first (if it exists)
DROP FUNCTION IF EXISTS public.set_config(text, text, boolean);

-- Create the function with the correct parameter order that Supabase expects
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, setting_value text, is_local boolean DEFAULT false)
RETURNS text AS $$
BEGIN
    -- Use pg_catalog.set_config to avoid recursion
    PERFORM pg_catalog.set_config(setting_name, setting_value, is_local);
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO anon;

-- Test the function
SELECT public.set_config('app.current_user_id', 'test-user-123', true);