import { Database, supabase } from "@/config/supabase";
import { useUser } from "@clerk/clerk-expo";

type Tables = Database["public"]["Tables"];
type User = Tables["users"]["Row"];
type Patient = Tables["patients"]["Row"];
type Medication = Tables["medications"]["Row"];
type Appointment = Tables["appointments"]["Row"];
type MedicalDocument = Tables["medical_documents"]["Row"];
type MedicationDose = Tables["medication_doses"]["Row"];

// Helper function to set the current user context for RLS
export const setSupabaseUserContext = async (clerkUserId: string) => {
  const { data, error } = await supabase.rpc("set_rls_config", {
    setting_name: "app.current_user_id",
    setting_value: clerkUserId,
    is_local: true,
  });

  if (error) {
    console.error("Error setting user context:", error);
  }
  return { data, error };
};

// User Management
export const userService = {
  async syncClerkUser(
    clerkUser: any
  ): Promise<{ data: User | null; error: any }> {
    try {
      // Set user context for RLS
      await setSupabaseUserContext(clerkUser.id);

      const userData = {
        clerk_user_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        first_name: clerkUser.firstName || "",
        last_name: clerkUser.lastName || "",
      };

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_user_id", clerkUser.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        return { data: null, error: fetchError };
      }

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from("users")
          .update(userData)
          .eq("clerk_user_id", clerkUser.id)
          .select()
          .single();
        return { data, error };
      } else {
        // Create new user
        const { data, error } = await supabase
          .from("users")
          .insert(userData)
          .select()
          .single();
        return { data, error };
      }
    } catch (error) {
      return { data: null, error };
    }
  },

  async getCurrentUser(
    clerkUserId: string
  ): Promise<{ data: User | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();

    return { data, error };
  },

  async updateProfile(
    clerkUserId: string,
    updates: Partial<User>
  ): Promise<{ data: User | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("clerk_user_id", clerkUserId)
      .select()
      .single();

    return { data, error };
  },
};

// Patient Management
export const patientService = {
  async getPatientProfile(
    clerkUserId: string
  ): Promise<{ data: Patient | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return { data, error };
  },

  async upsertPatientProfile(
    clerkUserId: string,
    patientData: Partial<Patient>
  ): Promise<{ data: Patient | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    const { data, error } = await supabase
      .from("patients")
      .upsert({ ...patientData, user_id: user.id })
      .select()
      .single();

    return { data, error };
  },
};

// Medication Management
export const medicationService = {
  async getMedications(
    clerkUserId: string
  ): Promise<{ data: Medication[] | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async addMedication(
    clerkUserId: string,
    medication: Omit<Medication, "id" | "user_id" | "created_at" | "updated_at">
  ): Promise<{ data: Medication | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    const { data, error } = await supabase
      .from("medications")
      .insert({ ...medication, user_id: user.id })
      .select()
      .single();

    return { data, error };
  },

  async updateMedication(
    clerkUserId: string,
    medicationId: string,
    updates: Partial<Medication>
  ): Promise<{ data: Medication | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data, error } = await supabase
      .from("medications")
      .update(updates)
      .eq("id", medicationId)
      .select()
      .single();

    return { data, error };
  },

  async deleteMedication(
    clerkUserId: string,
    medicationId: string
  ): Promise<{ error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { error } = await supabase
      .from("medications")
      .update({ active: false })
      .eq("id", medicationId);

    return { error };
  },
};

// Appointment Management
export const appointmentService = {
  async getAppointments(
    clerkUserId: string
  ): Promise<{ data: Appointment[] | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patient:patient_id(first_name, last_name),
        provider:provider_id(first_name, last_name)
      `
      )
      .or(`patient_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order("appointment_date", { ascending: true });

    return { data, error };
  },

  async createAppointment(
    clerkUserId: string,
    appointment: Omit<Appointment, "id" | "created_at" | "updated_at">
  ): Promise<{ data: Appointment | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data, error } = await supabase
      .from("appointments")
      .insert(appointment)
      .select()
      .single();

    return { data, error };
  },

  async updateAppointment(
    clerkUserId: string,
    appointmentId: string,
    updates: Partial<Appointment>
  ): Promise<{ data: Appointment | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", appointmentId)
      .select()
      .single();

    return { data, error };
  },
};

// Medical Document Management
export const documentService = {
  async getDocuments(
    clerkUserId: string
  ): Promise<{ data: MedicalDocument[] | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    const { data, error } = await supabase
      .from("medical_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("upload_date", { ascending: false });

    return { data, error };
  },

  async uploadDocument(
    clerkUserId: string,
    file: File | Blob,
    metadata: Omit<
      MedicalDocument,
      "id" | "user_id" | "file_path" | "created_at" | "updated_at"
    >
  ): Promise<{ data: MedicalDocument | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data: user } = await userService.getCurrentUser(clerkUserId);
    if (!user) return { data: null, error: "User not found" };

    // Generate unique filename
    const fileExt = metadata.file_type.split("/")[1];
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("medical-documents")
      .upload(fileName, file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Save document metadata
    const { data, error } = await supabase
      .from("medical_documents")
      .insert({
        ...metadata,
        user_id: user.id,
        file_path: uploadData.path,
      })
      .select()
      .single();

    return { data, error };
  },

  async deleteDocument(
    clerkUserId: string,
    documentId: string
  ): Promise<{ error: any }> {
    await setSupabaseUserContext(clerkUserId);

    // Get document details
    const { data: document } = await supabase
      .from("medical_documents")
      .select("file_path")
      .eq("id", documentId)
      .single();

    if (document) {
      // Delete from storage
      await supabase.storage
        .from("medical-documents")
        .remove([document.file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from("medical_documents")
      .delete()
      .eq("id", documentId);

    return { error };
  },
};

// Medication Dose Tracking
export const doseService = {
  async getTodaysDoses(
    clerkUserId: string
  ): Promise<{ data: MedicationDose[] | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("medication_doses")
      .select(
        `
        *,
        medication:medication_id(name, dosage)
      `
      )
      .gte("scheduled_time", `${today}T00:00:00.000Z`)
      .lt("scheduled_time", `${today}T23:59:59.999Z`)
      .order("scheduled_time", { ascending: true });

    return { data, error };
  },

  async markDoseTaken(
    clerkUserId: string,
    doseId: string
  ): Promise<{ data: MedicationDose | null; error: any }> {
    await setSupabaseUserContext(clerkUserId);

    const { data, error } = await supabase
      .from("medication_doses")
      .update({
        status: "taken",
        taken_time: new Date().toISOString(),
      })
      .eq("id", doseId)
      .select()
      .single();

    return { data, error };
  },

  async generateDosesForMedication(
    clerkUserId: string,
    medicationId: string,
    days: number = 30
  ): Promise<{ error: any }> {
    await setSupabaseUserContext(clerkUserId);

    // This would generate scheduled doses based on medication frequency
    // Implementation depends on your specific requirements
    // For now, we'll skip the complex scheduling logic

    return { error: null };
  },
};

// React Query hooks for easy integration
export const useSupabaseQuery = () => {
  const { user } = useUser();

  return {
    user: user?.id,
    isAuthenticated: !!user,
  };
};
