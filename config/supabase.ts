import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Supabase configuration
const supabaseUrl = "https://ufmfegcyxqadivgebpch.supabase.co/";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseAnonKey) {
  throw new Error(
    "Missing Supabase anon key. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment or expo config."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Supabase auth since we're using Clerk
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: "patient" | "provider" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: "patient" | "provider" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: "patient" | "provider" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          date_of_birth: string | null;
          phone: string | null;
          emergency_contact: string | null;
          medical_conditions: string[] | null;
          allergies: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date_of_birth?: string | null;
          phone?: string | null;
          emergency_contact?: string | null;
          medical_conditions?: string[] | null;
          allergies?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date_of_birth?: string | null;
          phone?: string | null;
          emergency_contact?: string | null;
          medical_conditions?: string[] | null;
          allergies?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date: string | null;
          instructions: string | null;
          prescriber: string | null;
          rx_number: string | null;
          pharmacy: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date?: string | null;
          instructions?: string | null;
          prescriber?: string | null;
          rx_number?: string | null;
          pharmacy?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          dosage?: string;
          frequency?: string;
          start_date?: string;
          end_date?: string | null;
          instructions?: string | null;
          prescriber?: string | null;
          rx_number?: string | null;
          pharmacy?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          provider_id: string | null;
          appointment_date: string;
          appointment_type: string;
          status: "scheduled" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          provider_id?: string | null;
          appointment_date: string;
          appointment_type: string;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          provider_id?: string | null;
          appointment_date?: string;
          appointment_type?: string;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          file_path: string;
          file_type: string;
          file_size: number;
          upload_date: string;
          document_type:
            | "prescription"
            | "lab_result"
            | "medical_record"
            | "insurance"
            | "other";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          file_path: string;
          file_type: string;
          file_size: number;
          upload_date?: string;
          document_type:
            | "prescription"
            | "lab_result"
            | "medical_record"
            | "insurance"
            | "other";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          upload_date?: string;
          document_type?:
            | "prescription"
            | "lab_result"
            | "medical_record"
            | "insurance"
            | "other";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
