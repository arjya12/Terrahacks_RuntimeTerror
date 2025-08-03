-- Custom RLS function to avoid conflicts with built-in set_config
-- Run this in your Supabase SQL Editor

-- Create a uniquely named function for RLS context
CREATE OR REPLACE FUNCTION public.set_rls_config(setting_name text, setting_value text, is_local boolean DEFAULT true)
RETURNS text AS $$
BEGIN
    -- Use the built-in set_config function to actually set the value
    PERFORM set_config(setting_name, setting_value, is_local);
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_rls_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_rls_config(text, text, boolean) TO anon;

-- Test the function
SELECT public.set_rls_config('app.current_user_id', 'test-user-123', true);