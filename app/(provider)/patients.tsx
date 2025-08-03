import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import ClinicalDecisionSupport from "@/components/provider/ClinicalDecisionSupport";

interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  medications: PatientMedication[];
}

export default function PatientsScreen() {
  const [showClinicalSupport, setShowClinicalSupport] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock patient data for testing clinical decision support
  const mockPatients = [
    {
      id: "patient_001",
      name: "John Doe",
      age: 78,
      conditions: ["Type 2 Diabetes", "Hypertension", "Kidney Disease"],
      medications: [
        {
          id: "med_001",
          name: "Metformin",
          dosage: "1000mg",
          frequency: "twice daily",
          prescriber: "Dr. Smith",
          pharmacy: "CVS Pharmacy",
        },
        {
          id: "med_002",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "once daily",
          prescriber: "Dr. Johnson",
          pharmacy: "CVS Pharmacy",
        },
      ],
      factors: {
        user_id: "patient_001",
        age: 78,
        weight_kg: 75,
        creatinine_clearance: 45,
        liver_function: "normal",
      },
      last_updated: "2024-12-20T10:30:00Z",
    },
  ];

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowClinicalSupport(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Patient Records</ThemedText>
        <ThemedText style={styles.subtitle}>
          Review shared medication lists and clinical recommendations
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mockPatients.length > 0 ? (
          <View style={styles.patientsContainer}>
            {mockPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => handlePatientSelect(patient)}
              >
                <View style={styles.patientHeader}>
                  <AppIcon name="nav_profile" size="medium" color="primary" />
                  <View style={styles.patientInfo}>
                    <ThemedText style={styles.patientName}>
                      {patient.name}
                    </ThemedText>
                    <ThemedText style={styles.patientAge}>
                      Age: {patient.age}
                    </ThemedText>
                  </View>
                  <View style={styles.medicationCount}>
                    <ThemedText style={styles.medicationCountText}>
                      {patient.medications.length}
                    </ThemedText>
                    <ThemedText style={styles.medicationCountLabel}>
                      Medications
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.conditionsContainer}>
                  <ThemedText style={styles.conditionsLabel}>
                    Conditions:
                  </ThemedText>
                  <View style={styles.conditionsList}>
                    {patient.conditions.map((condition, index) => (
                      <View key={index} style={styles.conditionBadge}>
                        <ThemedText style={styles.conditionText}>
                          {condition}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.patientFooter}>
                  <ThemedText style={styles.lastUpdated}>
                    Last updated:{" "}
                    {new Date(patient.last_updated).toLocaleDateString()}
                  </ThemedText>
                  <View style={styles.actionContainer}>
                    <AppIcon name="status_check" size="small" color="success" />
                    <ThemedText style={styles.actionText}>
                      Tap for Clinical Analysis
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <AppIcon name="nav_medications" size="large" color="disabled" />
            <ThemedText style={styles.emptyTitle}>
              No Patient Records
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Patients haven't shared their medication lists with you yet. Once
              they do, you'll see their records here.
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Clinical Decision Support Modal */}
      <ClinicalDecisionSupport
        visible={showClinicalSupport}
        onClose={() => {
          setShowClinicalSupport(false);
          setSelectedPatient(null);
        }}
        patientMedications={selectedPatient?.medications || []}
        patientConditions={selectedPatient?.conditions || []}
        patientFactors={selectedPatient?.factors || {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollContent: {
    padding: 16,
  },
  patientsContainer: {
    gap: 16,
  },
  patientCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  patientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 14,
    color: "#64748b",
  },
  medicationCount: {
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
  },
  medicationCountText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
  },
  medicationCountLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  conditionsContainer: {
    marginBottom: 16,
  },
  conditionsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  conditionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1e40af",
  },
  patientFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#64748b",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
});
