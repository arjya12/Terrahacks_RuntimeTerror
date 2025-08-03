export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
  dateAdded: string;
  notes?: string;
  genericName?: string;
  confidence?: number;
  isActive?: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface MedicalInfo {
  allergies: string[];
  conditions: string[];
  insuranceProvider: string;
  policyNumber: string;
}

export interface UserPreferences {
  notifications: boolean;
  shareWithProviders: boolean;
  reminderFrequency: string;
}

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  preferences: UserPreferences;
}

export interface SharingToken {
  id: string;
  token: string;
  patientId: string;
  createdAt: string;
  expiresAt: string;
  permissions: string[];
  isActive: boolean;
}

export interface ScannedMedicationData {
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
  confidence: number;
  lowConfidenceFields: string[];
}

export interface MedicationFormData {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
  notes?: string;
  isActive: boolean;
}

export interface StepFormData {
  step1: {
    name: string;
    dosage: string;
    frequency: string;
  };
  step2: {
    prescriber: string;
    pharmacy: string;
  };
  step3: {
    genericName?: string;
    notes?: string;
    isActive: boolean;
  };
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface DosageOption {
  value: string;
  label: string;
  unit: string;
}

export interface FrequencyOption {
  value: string;
  label: string;
  description: string;
}

// Dashboard-specific interfaces for redesign
export interface DashboardStats {
  dueToday: number;
  adherenceRate: number;
  currentStreak: number;
  totalMedications: number;
}

export interface MedicationSchedule {
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  taken: boolean;
  takenAt?: string;
  missed: boolean;
  isCritical: boolean;
}

export interface DailySchedule {
  date: string;
  medications: MedicationSchedule[];
  adherencePercentage: number;
}

export interface NotificationData {
  id: string;
  type:
    | "missed_dose"
    | "upcoming_dose"
    | "refill_reminder"
    | "streak_milestone";
  title: string;
  message: string;
  medicationId?: string;
  priority: "low" | "medium" | "high";
  timestamp: string;
  read: boolean;
}

export interface AdherenceData {
  medicationId: string;
  adherenceRate: number;
  streakDays: number;
  missedDoses: number;
  totalDoses: number;
  lastTaken?: string;
}
