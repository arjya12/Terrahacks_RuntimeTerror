-- Missing function needed for Row Level Security (RLS)
-- Run this in your Supabase SQL Editor

-- Function to set configuration for RLS
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, setting_value text, is_local boolean DEFAULT false)
RETURNS text AS $$
BEGIN
    PERFORM set_config(setting_name, setting_value, is_local);
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO anon;