import { Database } from "@/config/supabase";
import {
  appointmentService,
  documentService,
  doseService,
  medicationService,
  patientService,
  userService,
} from "@/services/supabaseService";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Tables = Database["public"]["Tables"];
type User = Tables["users"]["Row"];
type Patient = Tables["patients"]["Row"];
type Medication = Tables["medications"]["Row"];
type Appointment = Tables["appointments"]["Row"];
type MedicalDocument = Tables["medical_documents"]["Row"];

// Query Keys
export const QUERY_KEYS = {
  user: (clerkUserId: string) => ["user", clerkUserId],
  patient: (clerkUserId: string) => ["patient", clerkUserId],
  medications: (clerkUserId: string) => ["medications", clerkUserId],
  appointments: (clerkUserId: string) => ["appointments", clerkUserId],
  documents: (clerkUserId: string) => ["documents", clerkUserId],
  todaysDoses: (clerkUserId: string) => ["todaysDoses", clerkUserId],
} as const;

// User Hooks
export function useCurrentUser() {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.user(user?.id || ""),
    queryFn: () =>
      user
        ? userService.getCurrentUser(user.id)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSyncUser() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clerkUser: any) => userService.syncClerkUser(clerkUser),
    onSuccess: (data) => {
      if (data.data && user?.id) {
        queryClient.setQueryData(QUERY_KEYS.user(user.id), data);
      }
    },
  });
}

// Patient Hooks
export function usePatientProfile() {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.patient(user?.id || ""),
    queryFn: () =>
      user
        ? patientService.getPatientProfile(user.id)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });
}

export function useUpdatePatientProfile() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientData: Partial<Patient>) =>
      user
        ? patientService.upsertPatientProfile(user.id, patientData)
        : Promise.resolve({ data: null, error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.patient(user.id),
        });
      }
    },
  });
}

// Medication Hooks
export function useMedications() {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.medications(user?.id || ""),
    queryFn: () =>
      user
        ? medicationService.getMedications(user.id)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });
}

export function useAddMedication() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      medication: Omit<
        Medication,
        "id" | "user_id" | "created_at" | "updated_at"
      >
    ) =>
      user
        ? medicationService.addMedication(user.id, medication)
        : Promise.resolve({ data: null, error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.medications(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.todaysDoses(user.id),
        });
      }
    },
  });
}

export function useUpdateMedication() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      medicationId,
      updates,
    }: {
      medicationId: string;
      updates: Partial<Medication>;
    }) =>
      user
        ? medicationService.updateMedication(user.id, medicationId, updates)
        : Promise.resolve({ data: null, error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.medications(user.id),
        });
      }
    },
  });
}

export function useDeleteMedication() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicationId: string) =>
      user
        ? medicationService.deleteMedication(user.id, medicationId)
        : Promise.resolve({ error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.medications(user.id),
        });
      }
    },
  });
}

// Appointment Hooks
export function useAppointments() {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.appointments(user?.id || ""),
    queryFn: () =>
      user
        ? appointmentService.getAppointments(user.id)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });
}

export function useCreateAppointment() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      appointment: Omit<Appointment, "id" | "created_at" | "updated_at">
    ) =>
      user
        ? appointmentService.createAppointment(user.id, appointment)
        : Promise.resolve({ data: null, error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.appointments(user.id),
        });
      }
    },
  });
}

// Document Hooks
export function useMedicalDocuments() {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.documents(user?.id || ""),
    queryFn: () =>
      user
        ? documentService.getDocuments(user.id)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });
}

export function useUploadDocument() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      metadata,
    }: {
      file: File | Blob;
      metadata: Omit<
        MedicalDocument,
        "id" | "user_id" | "file_path" | "created_at" | "updated_at"
      >;
    }) =>
      user
        ? documentService.uploadDocument(user.id, file, metadata)
        : Promise.resolve({ data: null, error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.documents(user.id),
        });
      }
    },
  });
}

export function useDeleteDocument() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      user
        ? documentService.deleteDocument(user.id, documentId)
        : Promise.resolve({ error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.documents(user.id),
        });
      }
    },
  });
}

// Dose Tracking Hooks
export function useTodaysDoses() {
  const { user } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.todaysDoses(user?.id || ""),
    queryFn: () =>
      user
        ? doseService.getTodaysDoses(user.id)
        : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useMarkDoseTaken() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doseId: string) =>
      user
        ? doseService.markDoseTaken(user.id, doseId)
        : Promise.resolve({ data: null, error: "No user" }),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.todaysDoses(user.id),
        });
      }
    },
  });
}

// Health Data Summary Hook
export function useHealthSummary() {
  const { user } = useUser();
  const medicationsQuery = useMedications();
  const appointmentsQuery = useAppointments();
  const dosesQuery = useTodaysDoses();

  return {
    isLoading:
      medicationsQuery.isLoading ||
      appointmentsQuery.isLoading ||
      dosesQuery.isLoading,
    isError:
      medicationsQuery.isError ||
      appointmentsQuery.isError ||
      dosesQuery.isError,
    data: {
      medications: medicationsQuery.data?.data || [],
      appointments: appointmentsQuery.data?.data || [],
      todaysDoses: dosesQuery.data?.data || [],
      totalMedications: medicationsQuery.data?.data?.length || 0,
      upcomingAppointments:
        appointmentsQuery.data?.data?.filter(
          (apt) => new Date(apt.appointment_date) > new Date()
        ).length || 0,
      pendingDoses:
        dosesQuery.data?.data?.filter((dose) => dose.status === "pending")
          .length || 0,
    },
    refetch: () => {
      medicationsQuery.refetch();
      appointmentsQuery.refetch();
      dosesQuery.refetch();
    },
  };
}
