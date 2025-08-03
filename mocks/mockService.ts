import interactionsData from "./interactions.json";
import medicationListData from "./medication-list.json";
import userProfileData from "./mock-user-profile.json";
import {
  AdherenceData,
  DailySchedule,
  DashboardStats,
  Medication,
  MedicationSchedule,
  NotificationData,
  PatientProfile,
  ScannedMedicationData,
  SharingToken,
} from "./types";

class MockDataService {
  private medications: Medication[] = [];
  private userProfile: PatientProfile;
  private sharingTokens: SharingToken[] = [];
  private notifications: NotificationData[] = [];
  private adherenceData: Map<string, AdherenceData> = new Map();

  constructor() {
    // Initialize with mock data
    this.medications = medicationListData as Medication[];
    this.userProfile = userProfileData as PatientProfile;
    this.initializeDashboardData();
  }

  private initializeDashboardData() {
    // Initialize adherence data for existing medications
    this.medications.forEach((med) => {
      this.adherenceData.set(med.id, {
        medicationId: med.id,
        adherenceRate: Math.random() * 0.3 + 0.7, // 70-100% adherence
        streakDays: Math.floor(Math.random() * 30) + 1,
        missedDoses: Math.floor(Math.random() * 5),
        totalDoses: Math.floor(Math.random() * 50) + 30,
        lastTaken: new Date(
          Date.now() - Math.random() * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    });

    // Initialize sample notifications
    this.notifications = [
      {
        id: "1",
        type: "missed_dose",
        title: "Missed Dose",
        message: "You missed your morning Lisinopril dose",
        medicationId: "1",
        priority: "high",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: "2",
        type: "upcoming_dose",
        title: "Upcoming Dose",
        message: "Metformin due in 30 minutes",
        medicationId: "2",
        priority: "medium",
        timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: "3",
        type: "streak_milestone",
        title: "Great Job!",
        message: "You've maintained a 7-day streak!",
        priority: "low",
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
  }

  // Medication Management
  getMedications(): Medication[] {
    return [...this.medications];
  }

  async getMedicationsAsync(): Promise<Medication[]> {
    // Simulate API delay
    await this.delay(800);
    return [...this.medications];
  }

  async addMedication(medication: Omit<Medication, "id">): Promise<Medication> {
    await this.delay(600);
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString(),
    };
    this.medications.push(newMedication);
    return newMedication;
  }

  async updateMedication(
    id: string,
    updates: Partial<Medication>
  ): Promise<Medication> {
    await this.delay(500);
    const index = this.medications.findIndex((med) => med.id === id);
    if (index === -1) {
      throw new Error("Medication not found");
    }
    this.medications[index] = { ...this.medications[index], ...updates };
    return this.medications[index];
  }

  async deleteMedication(id: string): Promise<void> {
    await this.delay(400);
    const index = this.medications.findIndex((med) => med.id === id);
    if (index === -1) {
      throw new Error("Medication not found");
    }
    this.medications.splice(index, 1);
  }

  // Mock OCR Scanning
  async scanMedication(): Promise<ScannedMedicationData> {
    await this.delay(2000); // Simulate AI processing time

    // Mock OCR results with varying confidence
    const mockResults: ScannedMedicationData[] = [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        prescriber: "Dr. Williams",
        pharmacy: "Rite Aid Pharmacy",
        confidence: 0.95,
        lowConfidenceFields: [],
      },
      {
        name: "Ibuprofen",
        dosage: "200mg",
        frequency: "As needed",
        prescriber: "Dr. Brown",
        pharmacy: "Target Pharmacy",
        confidence: 0.78,
        lowConfidenceFields: ["frequency", "prescriber"],
      },
      {
        name: "Synthroid",
        dosage: "75mcg",
        frequency: "Once daily",
        prescriber: "Dr. Davis",
        pharmacy: "Costco Pharmacy",
        confidence: 0.89,
        lowConfidenceFields: ["dosage"],
      },
    ];

    // Return random result
    const randomIndex = Math.floor(Math.random() * mockResults.length);
    return mockResults[randomIndex];
  }

  // QR Code Sharing
  async generateSharingToken(permissions: string[]): Promise<SharingToken> {
    await this.delay(500);

    const token: SharingToken = {
      id: Date.now().toString(),
      token: this.generateRandomToken(),
      patientId: this.userProfile.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      permissions,
      isActive: true,
    };

    this.sharingTokens.push(token);
    return token;
  }

  async getActiveSharingTokens(): Promise<SharingToken[]> {
    await this.delay(300);
    return this.sharingTokens.filter(
      (token) => token.isActive && new Date(token.expiresAt) > new Date()
    );
  }

  async revokeSharingToken(tokenId: string): Promise<void> {
    await this.delay(400);
    const token = this.sharingTokens.find((t) => t.id === tokenId);
    if (token) {
      token.isActive = false;
    }
  }

  async getSharedMedicationList(token: string): Promise<{
    medications: Medication[];
    patient: PatientProfile;
  }> {
    await this.delay(1000);

    const sharingToken = this.sharingTokens.find(
      (t) =>
        t.token === token && t.isActive && new Date(t.expiresAt) > new Date()
    );

    if (!sharingToken) {
      throw new Error("Invalid or expired sharing token");
    }

    return {
      medications: [...this.medications],
      patient: { ...this.userProfile },
    };
  }

  // User Profile
  async getUserProfile(): Promise<PatientProfile> {
    await this.delay(400);
    return { ...this.userProfile };
  }

  async updateUserProfile(
    updates: Partial<PatientProfile>
  ): Promise<PatientProfile> {
    await this.delay(600);
    this.userProfile = { ...this.userProfile, ...updates };
    return { ...this.userProfile };
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay(300);

    const todaySchedule = await this.getTodaySchedule();
    const dueToday = todaySchedule.medications.filter(
      (med) => !med.taken
    ).length;

    // Calculate overall adherence rate
    const adherenceRates = Array.from(this.adherenceData.values()).map(
      (data) => data.adherenceRate
    );
    const averageAdherence =
      adherenceRates.length > 0
        ? adherenceRates.reduce((sum, rate) => sum + rate, 0) /
          adherenceRates.length
        : 0;

    // Calculate current streak (days with 100% adherence)
    const streakDays = Array.from(this.adherenceData.values()).map(
      (data) => data.streakDays
    );
    const currentStreak = streakDays.length > 0 ? Math.max(...streakDays) : 0;

    return {
      dueToday,
      adherenceRate: Math.round(averageAdherence * 100),
      currentStreak,
      totalMedications: this.medications.filter((med) => med.isActive !== false)
        .length,
    };
  }

  async getTodaySchedule(): Promise<DailySchedule> {
    await this.delay(200);

    const today = new Date().toISOString().split("T")[0];
    const medications: MedicationSchedule[] = [];

    // Generate schedule for active medications
    this.medications
      .filter((med) => med.isActive !== false)
      .forEach((med) => {
        const scheduleCount = this.getScheduleCountFromFrequency(med.frequency);
        const baseTime = 8; // Start at 8 AM

        for (let i = 0; i < scheduleCount; i++) {
          const hour = baseTime + i * (12 / Math.max(scheduleCount - 1, 1));
          const scheduledTime = `${Math.floor(hour)
            .toString()
            .padStart(2, "0")}:${((hour % 1) * 60)
            .toString()
            .padStart(2, "0")}`;

          const now = new Date();
          const scheduled = new Date();
          scheduled.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

          const taken = scheduled < now && Math.random() > 0.3; // 70% taken rate
          const missed = scheduled < now && !taken && Math.random() > 0.7;

          medications.push({
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            scheduledTime,
            taken,
            takenAt: taken ? scheduled.toISOString() : undefined,
            missed,
            isCritical:
              med.name.toLowerCase().includes("lisinopril") ||
              med.name.toLowerCase().includes("metformin"),
          });
        }
      });

    const takenCount = medications.filter((med) => med.taken).length;
    const adherencePercentage =
      medications.length > 0
        ? Math.round((takenCount / medications.length) * 100)
        : 100;

    return {
      date: today,
      medications: medications.sort((a, b) =>
        a.scheduledTime.localeCompare(b.scheduledTime)
      ),
      adherencePercentage,
    };
  }

  async getNotifications(): Promise<NotificationData[]> {
    await this.delay(250);
    return [...this.notifications].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getUnreadNotifications(): Promise<NotificationData[]> {
    await this.delay(150);
    return this.notifications.filter((notif) => !notif.read);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.delay(100);
    const notification = this.notifications.find(
      (notif) => notif.id === notificationId
    );
    if (notification) {
      notification.read = true;
    }
  }

  async getAdherenceData(medicationId?: string): Promise<AdherenceData[]> {
    await this.delay(200);
    if (medicationId) {
      const data = this.adherenceData.get(medicationId);
      return data ? [data] : [];
    }
    return Array.from(this.adherenceData.values());
  }

  async markMedicationTaken(medicationId: string): Promise<void> {
    await this.delay(300);

    // Update adherence data
    const adherenceData = this.adherenceData.get(medicationId);
    if (adherenceData) {
      adherenceData.totalDoses += 1;
      adherenceData.lastTaken = new Date().toISOString();
      adherenceData.adherenceRate = Math.min(
        1,
        adherenceData.adherenceRate + 0.01
      );
      adherenceData.streakDays += 1;
    }

    // Add a positive notification
    this.notifications.unshift({
      id: Date.now().toString(),
      type: "upcoming_dose",
      title: "Great Job!",
      message: "Medication marked as taken",
      medicationId,
      priority: "low",
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  /**
   * Check drug interactions for all user medications
   */
  async checkAllMedicationInteractions(): Promise<{
    interactions_found: number;
    interactions: any[];
  }> {
    await this.delay(500);

    const activeMedications = this.medications.filter(
      (med) => med.isActive !== false
    );
    const foundInteractions: any[] = [];

    // Check all combinations of active medications
    for (let i = 0; i < activeMedications.length; i++) {
      for (let j = i + 1; j < activeMedications.length; j++) {
        const medA = activeMedications[i];
        const medB = activeMedications[j];

        // Check if there's an interaction between these medications
        const interaction = (interactionsData as any[]).find(
          (int) =>
            (int.drugA.toLowerCase() === medA.name.toLowerCase() &&
              int.drugB.toLowerCase() === medB.name.toLowerCase()) ||
            (int.drugA.toLowerCase() === medB.name.toLowerCase() &&
              int.drugB.toLowerCase() === medA.name.toLowerCase())
        );

        if (interaction) {
          foundInteractions.push({
            ...interaction,
            medication1: medA,
            medication2: medB,
          });
        }
      }
    }

    return {
      interactions_found: foundInteractions.length,
      interactions: foundInteractions,
    };
  }

  private getScheduleCountFromFrequency(frequency: string): number {
    const freq = frequency.toLowerCase();
    if (freq.includes("once")) return 1;
    if (freq.includes("twice") || freq.includes("two")) return 2;
    if (freq.includes("three") || freq.includes("thrice")) return 3;
    if (freq.includes("four")) return 4;
    return 1; // Default
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateRandomToken(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;
