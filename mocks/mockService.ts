import {
  DrugInteraction,
  DrugInteractionSchema,
  Medication,
  MedicationSchema,
  PatientProfile,
  PatientProfileSchema,
  ProviderProfile,
  ProviderProfileSchema,
  SharingToken,
  SharingTokenSchema,
} from "./types";

// Import mock data
import interactionsData from "./interactions.json";
import medicationsData from "./medications.json";
import sharingData from "./sharing.json";
import usersData from "./users.json";

class MockDataService {
  private medications: Medication[] = [];
  private patients: PatientProfile[] = [];
  private providers: ProviderProfile[] = [];
  private interactions: DrugInteraction[] = [];
  private sharingTokens: SharingToken[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Validate and parse medications
    this.medications = medicationsData.map((med) =>
      MedicationSchema.parse(med)
    );

    // Validate and parse users
    this.patients = usersData.patients.map((patient) =>
      PatientProfileSchema.parse(patient)
    );
    this.providers = usersData.providers.map((provider) =>
      ProviderProfileSchema.parse(provider)
    );

    // Validate and parse interactions
    this.interactions = interactionsData.map((interaction) =>
      DrugInteractionSchema.parse(interaction)
    );

    // Validate and parse sharing tokens
    this.sharingTokens = sharingData.map((token) =>
      SharingTokenSchema.parse(token)
    );
  }

  // Medication methods
  getMedications(): Medication[] {
    return this.medications;
  }

  getMedicationsByPatient(patientId: string): Medication[] {
    // In a real app, this would filter by patient ID
    // For now, return all medications for demo
    return this.medications.filter((med) => med.isActive);
  }

  addMedication(medication: Omit<Medication, "id">): Medication {
    const newMed: Medication = {
      ...medication,
      id: `med_${Date.now()}`,
    };
    this.medications.push(newMed);
    return newMed;
  }

  updateMedication(
    id: string,
    updates: Partial<Medication>
  ): Medication | null {
    const index = this.medications.findIndex((med) => med.id === id);
    if (index === -1) return null;

    this.medications[index] = { ...this.medications[index], ...updates };
    return this.medications[index];
  }

  deleteMedication(id: string): boolean {
    const index = this.medications.findIndex((med) => med.id === id);
    if (index === -1) return false;

    this.medications.splice(index, 1);
    return true;
  }

  // User methods
  getPatientProfile(userId: string): PatientProfile | null {
    return this.patients.find((patient) => patient.userId === userId) || null;
  }

  getProviderProfile(userId: string): ProviderProfile | null {
    return (
      this.providers.find((provider) => provider.userId === userId) || null
    );
  }

  getAllPatients(): PatientProfile[] {
    return this.patients;
  }

  getAllProviders(): ProviderProfile[] {
    return this.providers;
  }

  // Interaction methods
  checkDrugInteractions(medicationNames: string[]): DrugInteraction[] {
    const foundInteractions: DrugInteraction[] = [];

    for (let i = 0; i < medicationNames.length; i++) {
      for (let j = i + 1; j < medicationNames.length; j++) {
        const drugA = medicationNames[i];
        const drugB = medicationNames[j];

        const interaction = this.interactions.find(
          (int) =>
            (int.drugA === drugA && int.drugB === drugB) ||
            (int.drugA === drugB && int.drugB === drugA)
        );

        if (interaction) {
          foundInteractions.push(interaction);
        }
      }
    }

    return foundInteractions;
  }

  // Sharing methods
  createSharingToken(
    patientId: string,
    permissions: string[],
    expirationHours: number = 24
  ): SharingToken {
    const token = `med_share_${Math.random().toString(36).substr(2, 12)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const sharingToken: SharingToken = {
      id: `share_${Date.now()}`,
      patientId,
      token,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      permissions,
      createdAt: new Date().toISOString(),
    };

    this.sharingTokens.push(sharingToken);
    return sharingToken;
  }

  getSharingToken(token: string): SharingToken | null {
    return (
      this.sharingTokens.find((st) => st.token === token && st.isActive) || null
    );
  }

  revokeSharingToken(token: string): boolean {
    const index = this.sharingTokens.findIndex((st) => st.token === token);
    if (index === -1) return false;

    this.sharingTokens[index].isActive = false;
    return true;
  }

  // Mock OCR service
  async mockOCRProcessing(imageUri: string): Promise<Partial<Medication>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return mock OCR results
    const mockResults = [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        prescriber: "Dr. Johnson",
        pharmacy: "CVS Pharmacy",
        confidence: 0.92,
      },
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        prescriber: "Dr. Chen",
        pharmacy: "Walgreens",
        confidence: 0.88,
      },
      {
        name: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily",
        prescriber: "Dr. Rodriguez",
        pharmacy: "Rite Aid",
        confidence: 0.95,
      },
    ];

    // Return random result
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;
