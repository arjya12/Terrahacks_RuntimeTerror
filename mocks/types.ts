import { z } from "zod";

// Medication schemas
export const MedicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  genericName: z.string().optional(),
  dosage: z.string(),
  frequency: z.string(),
  prescriber: z.string(),
  pharmacy: z.string(),
  dateCreated: z.string(),
  isActive: z.boolean(),
  confidence: z.number().min(0).max(1),
  imageUri: z.string().optional(),
  notes: z.string().optional(),
});

export const UserRoleSchema = z.enum(["patient", "provider"]);

export const PatientProfileSchema = z.object({
  id: z.string(),
  userId: z.string(), // Clerk user ID
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
  phoneNumber: z.string().optional(),
  allergies: z.array(z.string()),
  conditions: z.array(z.string()),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
    .optional(),
});

export const ProviderProfileSchema = z.object({
  id: z.string(),
  userId: z.string(), // Clerk user ID
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  specialization: z.string(),
  npiNumber: z.string(),
  licenseNumber: z.string(),
  organization: z.string(),
  isVerified: z.boolean(),
});

export const DrugInteractionSchema = z.object({
  id: z.string(),
  drugA: z.string(),
  drugB: z.string(),
  severity: z.enum(["minor", "moderate", "major"]),
  description: z.string(),
  mechanism: z.string(),
  recommendation: z.string(),
});

export const SharingTokenSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  providerId: z.string().optional(),
  token: z.string(),
  expiresAt: z.string(),
  isActive: z.boolean(),
  permissions: z.array(z.string()),
  createdAt: z.string(),
});

// Type exports
export interface Medication extends z.infer<typeof MedicationSchema> {}
export interface PatientProfile extends z.infer<typeof PatientProfileSchema> {}
export interface ProviderProfile
  extends z.infer<typeof ProviderProfileSchema> {}
export interface DrugInteraction
  extends z.infer<typeof DrugInteractionSchema> {}
export interface SharingToken extends z.infer<typeof SharingTokenSchema> {}
export type UserRole = z.infer<typeof UserRoleSchema>;
