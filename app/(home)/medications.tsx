import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";
import { Medication } from "@/mocks/types";

interface MedicationCardProps {
  medication: Medication;
}

/**
 * MedicationCard - Displays individual medication information in a card format
 *
 * @param medication - The medication object containing name, dosage, prescriber, etc.
 *
 * Features:
 * - Confidence indicator with color-coded badges (green >90%, yellow >80%, red <80%)
 * - Active/inactive status badge
 * - Displays all medication details including generic name, dosage, prescriber, pharmacy
 * - Optional notes section
 * - Responsive card design with shadow effects
 */
function MedicationCard({ medication }: MedicationCardProps) {
  const confidence = medication.confidence ?? 1.0;
  const confidenceColor =
    confidence > 0.9 ? "#10b981" : confidence > 0.8 ? "#f59e0b" : "#ef4444";

  return (
    <ThemedView style={styles.medicationCard}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>
        <View
          style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
        >
          <Text style={styles.confidenceText}>
            {Math.round(confidence * 100)}%
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
            {
              backgroundColor:
                medication.isActive ?? true ? "#10b981" : "#6b7280",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {medication.isActive ?? true ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}

/**
 * MedicationsScreen - Displays the user's medication list with loading and empty states
 *
 * Features:
 * - Loading spinner while fetching medications
 * - Empty state when no medications exist
 * - Active medication filtering and count display
 * - Responsive medication cards with confidence indicators
 */
export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeMedications = medications.filter((med) => med.isActive ?? true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockDataService.getMedicationsAsync();
      setMedications(data);
    } catch (error) {
      console.error("Failed to load medications:", error);
      setError("Failed to load medications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedication = ({ item }: { item: Medication }) => (
    <MedicationCard medication={item} />
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <AppIcon name="nav_medications" size="large" color="disabled" />
      <ThemedText style={styles.emptyTitle}>No Medications Yet</ThemedText>
      <ThemedText style={styles.emptyText}>
        Start by scanning a medication bottle or adding medications manually to
        keep track of your prescriptions.
      </ThemedText>
    </ThemedView>
  );

  const renderLoadingState = () => (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <ThemedText style={styles.loadingText}>Loading medications...</ThemedText>
    </ThemedView>
  );

  const renderErrorState = () => (
    <ThemedView style={styles.errorContainer}>
      <AppIcon name="feedback_error" size="large" color="error" />
      <ThemedText style={styles.errorTitle}>Unable to Load</ThemedText>
      <ThemedText style={styles.errorText}>{error}</ThemedText>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Medications</ThemedText>
        </ThemedView>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Medications</ThemedText>
        </ThemedView>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

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
        contentContainerStyle={[
          styles.listContainer,
          activeMedications.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
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
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
});
