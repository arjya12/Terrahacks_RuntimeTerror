-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE document_type AS ENUM ('prescription', 'lab_result', 'medical_record', 'insurance', 'other');

-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (extended user profile for patients)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    phone TEXT,
    emergency_contact TEXT,
    medical_conditions TEXT[],
    allergies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    prescriber TEXT,
    rx_number TEXT,
    pharmacy TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_type TEXT NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical documents table
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_type document_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication doses tracking table
CREATE TABLE IF NOT EXISTS public.medication_doses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- 'pending', 'taken', 'missed', 'skipped'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(active);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON public.medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_doses_medication_id ON public.medication_doses(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_doses_scheduled_time ON public.medication_doses(scheduled_time);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON public.medical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (clerk_user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (clerk_user_id = current_setting('app.current_user_id', true));

-- Patients policies
CREATE POLICY "Users can view own patient data" ON public.patients FOR ALL USING (
    user_id IN (SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true))
);

-- Medications policies
CREATE POLICY "Users can manage own medications" ON public.medications FOR ALL USING (
    user_id IN (SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true))
);

-- Appointments policies (patients can see their appointments, providers can see their assigned appointments)
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (
    patient_id IN (SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true))
);

CREATE POLICY "Providers can view assigned appointments" ON public.appointments FOR SELECT USING (
    provider_id IN (SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true))
);

CREATE POLICY "Patients can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true))
);

-- Medical documents policies
CREATE POLICY "Users can manage own documents" ON public.medical_documents FOR ALL USING (
    user_id IN (SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true))
);

-- Medication doses policies
CREATE POLICY "Users can manage own medication doses" ON public.medication_doses FOR ALL USING (
    medication_id IN (
        SELECT id FROM public.medications WHERE user_id IN (
            SELECT id FROM public.users WHERE clerk_user_id = current_setting('app.current_user_id', true)
        )
    )
);

-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-documents', 'medical-documents', false);

-- Storage policies for medical documents
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'medical-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (
    bucket_id = 'medical-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE USING (
    bucket_id = 'medical-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to set configuration for RLS (using unique name to avoid conflicts)
CREATE OR REPLACE FUNCTION public.set_rls_config(setting_name text, setting_value text, is_local boolean DEFAULT true)
RETURNS text AS $$
BEGIN
    PERFORM set_config(setting_name, setting_value, is_local);
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_rls_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_rls_config(text, text, boolean) TO anon;

-- Function to handle user creation from Clerk
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (clerk_user_id, email, first_name, last_name)
    VALUES (NEW.clerk_user_id, NEW.email, NEW.first_name, NEW.last_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing (remove in production)
INSERT INTO public.users (clerk_user_id, email, first_name, last_name, role) VALUES
('clerk_test_user_1', 'patient@example.com', 'John', 'Doe', 'patient'),
('clerk_test_user_2', 'provider@example.com', 'Dr. Jane', 'Smith', 'provider')
ON CONFLICT (clerk_user_id) DO NOTHING;

INSERT INTO public.patients (user_id, date_of_birth, phone, allergies) VALUES
((SELECT id FROM public.users WHERE email = 'patient@example.com'), '1990-01-01', '+1234567890', ARRAY['Penicillin', 'Shellfish'])
ON CONFLICT DO NOTHING;

INSERT INTO public.medications (user_id, name, dosage, frequency, start_date, prescriber) VALUES
((SELECT id FROM public.users WHERE email = 'patient@example.com'), 'Lisinopril', '10mg', 'Once daily', '2024-01-01', 'Dr. Jane Smith'),
((SELECT id FROM public.users WHERE email = 'patient@example.com'), 'Metformin', '500mg', 'Twice daily', '2024-01-01', 'Dr. Jane Smith')
ON CONFLICT DO NOTHING;