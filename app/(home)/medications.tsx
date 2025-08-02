import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { mockDataService } from "@/mocks/mockService";
import { Medication } from "@/mocks/types";

interface MedicationCardProps {
  medication: Medication;
}

function MedicationCard({ medication }: MedicationCardProps) {
  const confidenceColor =
    medication.confidence > 0.9
      ? "#10b981"
      : medication.confidence > 0.8
      ? "#f59e0b"
      : "#ef4444";

  return (
    <ThemedView style={styles.medicationCard}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>
        <View
          style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
        >
          <Text style={styles.confidenceText}>
            {Math.round(medication.confidence * 100)}%
          </Text>
        </View>
      </View>

      {medication.genericName && (
        <ThemedText style={styles.genericName}>
          Generic: {medication.genericName}
        </ThemedText>
      )}

      <ThemedText style={styles.dosageText}>
        {medication.dosage} - {medication.frequency}
      </ThemedText>
      <ThemedText style={styles.prescriberText}>
        Prescribed by: {medication.prescriber}
      </ThemedText>
      <ThemedText style={styles.pharmacyText}>
        Pharmacy: {medication.pharmacy}
      </ThemedText>

      {medication.notes && (
        <ThemedText style={styles.notesText}>{medication.notes}</ThemedText>
      )}

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: medication.isActive ? "#10b981" : "#6b7280" },
          ]}
        >
          <Text style={styles.statusText}>
            {medication.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}

export default function MedicationsScreen() {
  const medications = mockDataService.getMedications();
  const activeMedications = medications.filter((med) => med.isActive);

  const renderMedication = ({ item }: { item: Medication }) => (
    <MedicationCard medication={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Medications</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {activeMedications.length} active medication
          {activeMedications.length !== 1 ? "s" : ""}
        </ThemedText>
      </ThemedView>

      <FlatList
        data={activeMedications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  medicationCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  genericName: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 4,
  },
  dosageText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  prescriberText: {
    fontSize: 14,
    marginBottom: 2,
  },
  pharmacyText: {
    fontSize: 14,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
