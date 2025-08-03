import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProtectedRoute } from "@/components/auth/SupabaseAuthSync";
import { AppIcon } from "@/components/icons/IconSystem";
import { AddMedicationModal } from "@/components/medication/AddMedicationModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  useHealthSummary,
  useMarkDoseTaken,
  useTodaysDoses,
} from "@/hooks/useSupabase";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}

function StatCard({ title, value, icon, color, onPress }: StatCardProps) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <AppIcon name={icon as any} size="small" color="white" />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

interface DoseCardProps {
  dose: any;
  onMarkTaken: (doseId: string) => void;
}

function DoseCard({ dose, onMarkTaken }: DoseCardProps) {
  const medication = dose.medication;
  const scheduledTime = new Date(dose.scheduled_time);
  const isPending = dose.status === "pending";
  const isTaken = dose.status === "taken";

  return (
    <ThemedView style={styles.doseCard}>
      <View style={styles.doseHeader}>
        <View>
          <ThemedText style={styles.doseMedicationName}>
            {medication?.name || "Unknown Medication"}
          </ThemedText>
          <ThemedText style={styles.doseDosage}>
            {medication?.dosage || "Unknown dosage"}
          </ThemedText>
        </View>
        <View style={styles.doseTimeContainer}>
          <ThemedText style={styles.doseTime}>
            {scheduledTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isTaken
                  ? "#10b981"
                  : isPending
                  ? "#f59e0b"
                  : "#ef4444",
              },
            ]}
          >
            <ThemedText style={styles.statusText}>
              {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>

      {isPending && (
        <TouchableOpacity
          style={styles.markTakenButton}
          onPress={() => onMarkTaken(dose.id)}
        >
          <AppIcon name="status_success" size="small" color="white" />
          <Text style={styles.markTakenText}>Mark as Taken</Text>
        </TouchableOpacity>
      )}

      {dose.notes && (
        <ThemedText style={styles.doseNotes}>{dose.notes}</ThemedText>
      )}
    </ThemedView>
  );
}

function SupabaseHealthDashboardContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const healthSummary = useHealthSummary();
  const todaysDoses = useTodaysDoses();
  const markDoseTaken = useMarkDoseTaken();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([healthSummary.refetch(), todaysDoses.refetch()]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkDoseTaken = async (doseId: string) => {
    try {
      await markDoseTaken.mutateAsync(doseId);
      Alert.alert("Success", "Dose marked as taken!");
    } catch (error) {
      console.error("Failed to mark dose as taken:", error);
      Alert.alert("Error", "Failed to mark dose as taken. Please try again.");
    }
  };

  if (healthSummary.isLoading || todaysDoses.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size="large" />
        <ThemedText style={styles.loadingText}>
          Loading health data...
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (healthSummary.isError || todaysDoses.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <AppIcon name="feedback_error" size="large" color="error" />
          <ThemedText style={styles.errorTitle}>Unable to Load Data</ThemedText>
          <ThemedText style={styles.errorText}>
            Failed to load your health data. Please check your connection and
            try again.
          </ThemedText>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const { data: healthData } = healthSummary;
  const { data: dosesResult } = todaysDoses;
  const doses = dosesResult?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Health Dashboard</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Welcome back! Here's your health summary.
          </ThemedText>
        </ThemedView>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Medications"
            value={healthData.totalMedications}
            icon="nav_medications"
            color="#3b82f6"
          />
          <StatCard
            title="Pending Doses"
            value={healthData.pendingDoses}
            icon="status_pending"
            color="#f59e0b"
          />
          <StatCard
            title="Upcoming Appointments"
            value={healthData.upcomingAppointments}
            icon="nav_appointments"
            color="#10b981"
          />
        </View>

        {/* Today's Medication Schedule */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Today's Schedule
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              {doses.length} dose{doses.length !== 1 ? "s" : ""} scheduled
            </ThemedText>
          </View>

          {doses.length === 0 ? (
            <ThemedView style={styles.emptySchedule}>
              <AppIcon name="status_success" size="large" color="success" />
              <ThemedText style={styles.emptyScheduleTitle}>
                All Set for Today!
              </ThemedText>
              <ThemedText style={styles.emptyScheduleText}>
                No doses scheduled or all doses have been taken.
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.dosesContainer}>
              {doses.map((dose) => (
                <DoseCard
                  key={dose.id}
                  dose={dose}
                  onMarkTaken={handleMarkDoseTaken}
                />
              ))}
            </View>
          )}
        </ThemedView>

        {/* Recent Medications */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Recent Medications
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                /* Navigate to medications */
              }}
            >
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          {healthData.medications.length === 0 ? (
            <ThemedView style={styles.emptyMedications}>
              <AppIcon name="nav_medications" size="large" color="disabled" />
              <ThemedText style={styles.emptyMedicationsTitle}>
                No Medications Yet
              </ThemedText>
              <ThemedText style={styles.emptyMedicationsText}>
                Add your first medication to get started with tracking.
              </ThemedText>
              <TouchableOpacity
                style={styles.addFirstMedicationButton}
                onPress={() => setShowAddModal(true)}
              >
                <AppIcon name="general_add" size="small" color="white" />
                <Text style={styles.addFirstMedicationText}>
                  Add Medication
                </Text>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <View style={styles.recentMedications}>
              {healthData.medications.slice(0, 3).map((medication: any) => (
                <ThemedView key={medication.id} style={styles.medicationItem}>
                  <View style={styles.medicationInfo}>
                    <ThemedText style={styles.medicationName}>
                      {medication.name}
                    </ThemedText>
                    <ThemedText style={styles.medicationDosage}>
                      {medication.dosage} - {medication.frequency}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.medicationStatus,
                      {
                        backgroundColor: medication.active
                          ? "#10b981"
                          : "#6b7280",
                      },
                    ]}
                  >
                    <Text style={styles.medicationStatusText}>
                      {medication.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </ThemedView>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAddModal(true)}
            >
              <AppIcon name="general_add" size="small" color="white" />
              <Text style={styles.actionButtonText}>Add Medication</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <AppIcon name="action_scan_bottle" size="small" color="primary" />
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}
              >
                Scan Bottle
              </Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Add Medication Modal */}
      <AddMedicationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

export function SupabaseHealthDashboard() {
  return (
    <ProtectedRoute>
      <SupabaseHealthDashboardContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  dosesContainer: {
    gap: 12,
  },
  doseCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  doseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  doseMedicationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  doseDosage: {
    fontSize: 14,
    opacity: 0.7,
  },
  doseTimeContainer: {
    alignItems: "flex-end",
  },
  doseTime: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  markTakenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  markTakenText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  doseNotes: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
  },
  emptySchedule: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyScheduleTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyScheduleText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  emptyMedications: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyMedicationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyMedicationsText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 16,
  },
  addFirstMedicationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addFirstMedicationText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  recentMedications: {
    gap: 12,
  },
  medicationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    opacity: 0.7,
  },
  medicationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  medicationStatusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryButtonText: {
    color: "#3b82f6",
  },
});
