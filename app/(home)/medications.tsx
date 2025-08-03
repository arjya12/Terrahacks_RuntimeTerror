import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProtectedRoute } from "@/components/auth/SupabaseAuthSync";
import { AppIcon } from "@/components/icons/IconSystem";
import { AddMedicationModal } from "@/components/medication/AddMedicationModal";
import { ImprovedTakeMedicationCard } from "@/components/medication/ImprovedTakeMedicationCard";
import { Database } from "@/config/supabase";
import { useDeleteMedication, useMedications } from "@/hooks/useSupabase";

type Medication = Database["public"]["Tables"]["medications"]["Row"];

interface MedicationCardProps {
  medication: Medication;
  onDelete?: (id: string) => void;
}

/**
 * MedicationCard - Displays individual medication information in a card format
 *
 * @param medication - The medication object containing name, dosage, prescriber, etc.
 * @param onDelete - Optional callback for deleting the medication
 *
 * Features:
 * - Active/inactive status badge
 * - Displays all medication details including dosage, prescriber, pharmacy
 * - Optional instructions section
 * - Delete functionality with confirmation
 * - Responsive card design with shadow effects
 */
function MedicationCard({ medication, onDelete }: MedicationCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(medication.id);
    }
  };

  return (
    <ThemedView style={styles.medicationCard}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>
        {onDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <AppIcon name="action_delete" size="small" color="error" />
          </TouchableOpacity>
        )}
      </View>

      <ThemedText style={styles.dosageText}>
        {medication.dosage} - {medication.frequency}
      </ThemedText>

      {medication.prescriber && (
        <ThemedText style={styles.prescriberText}>
          Prescribed by: {medication.prescriber}
        </ThemedText>
      )}

      {medication.pharmacy && (
        <ThemedText style={styles.pharmacyText}>
          Pharmacy: {medication.pharmacy}
        </ThemedText>
      )}

      {medication.instructions && (
        <ThemedText style={styles.notesText}>
          {medication.instructions}
        </ThemedText>
      )}

      <View style={styles.medicationDetails}>
        <ThemedText style={styles.dateText}>
          Started: {new Date(medication.start_date).toLocaleDateString()}
        </ThemedText>
        {medication.end_date && (
          <ThemedText style={styles.dateText}>
            Ends: {new Date(medication.end_date).toLocaleDateString()}
          </ThemedText>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: medication.active ? "#10b981" : "#6b7280",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {medication.active ? "Active" : "Inactive"}
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
 * - Real-time data from Supabase
 * - Loading spinner while fetching medications
 * - Empty state when no medications exist
 * - Active medication filtering and count display
 * - Delete medication functionality
 * - Protected authentication route
 */
function MedicationsScreenContent() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const {
    data: medicationsResult,
    isLoading,
    error,
    refetch,
  } = useMedications();
  const deleteMedication = useDeleteMedication();

  const medications = medicationsResult?.data || [];
  const activeMedications = medications.filter((med) => med.active);

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      await deleteMedication.mutateAsync(medicationId);
    } catch (error) {
      console.error("Failed to delete medication:", error);
    }
  };

  const renderMedication = ({ item }: { item: Medication }) => (
    <ImprovedTakeMedicationCard
      medication={{
        id: item.id,
        name: item.name,
        dosage: item.dosage || "",
        frequency: item.frequency || "",
        instructions: item.instructions || undefined,
        prescriber: item.prescriber || undefined,
        pharmacy: item.pharmacy || undefined,
        active: item.active || false,
        start_date: item.start_date || "",
        end_date: item.end_date || undefined,
      }}
      onDelete={handleDeleteMedication}
      onMarkTaken={(medicationId) => {
        // Handle mark taken logic here
        console.log("Marking medication taken:", medicationId);
      }}
      onSkip={(medicationId) => {
        // Handle skip logic here
        console.log("Skipping medication:", medicationId);
      }}
      onViewDetails={(medication) => {
        // Handle view details logic here
        console.log("Viewing details for:", medication.name);
      }}
    />
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
      <ThemedText style={styles.errorText}>
        {error?.message || "Failed to load medications. Please try again."}
      </ThemedText>
      <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Take Medications</ThemedText>
        </ThemedView>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Take Medications</ThemedText>
        </ThemedView>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Take Medications</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Manage your daily doses • {activeMedications.length} active medication
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <AppIcon name="action_add_medication" size="medium" color="white" />
      </TouchableOpacity>

      {/* Add Medication Modal */}
      <AddMedicationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

export default function MedicationsScreen() {
  return (
    <ProtectedRoute>
      <MedicationsScreenContent />
    </ProtectedRoute>
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  medicationDetails: {
    marginVertical: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: "#3b82f6",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
