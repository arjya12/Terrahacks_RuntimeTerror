import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EnhancedMedicationCard } from "@/components/dashboard/EnhancedMedicationCard";
import { FloatingActionButton } from "@/components/dashboard/FloatingActionButton";
import { MyMedicationsSection } from "@/components/dashboard/MyMedicationsSection";
import { QuickActionsBar } from "@/components/dashboard/QuickActionsBar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AppIcon } from "@/components/icons/IconSystem";
import { MedicationEntryFlow } from "@/components/medication-entry/MedicationEntryFlow";
import OnboardingFlow from "@/components/OnboardingFlow";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { mockDataService } from "@/mocks/mockService";
import { AdherenceData, Medication, MedicationFormData } from "@/mocks/types";

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function MedicationCard({
  medication,
  onEdit,
  onDelete,
  isDeleting,
}: MedicationCardProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const confidence = medication.confidence ?? 1.0;
  const confidenceColor =
    confidence > 0.9 ? "#10b981" : confidence > 0.8 ? "#f59e0b" : "#ef4444";

  const handleDelete = () => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(medication.id),
        },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ThemedView style={styles.medicationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <ThemedText style={styles.medicationName}>
              {medication.name}
            </ThemedText>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: confidenceColor },
              ]}
            >
              <Text style={styles.confidenceText}>
                {Math.round(confidence * 100)}%
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(medication)}
              accessibilityLabel={`Edit ${medication.name}`}
              accessibilityHint="Opens edit form for this medication"
            >
              <AppIcon name="action_edit" size="small" color="active" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isDeleting && styles.actionButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
              accessibilityLabel={`Delete ${medication.name}`}
              accessibilityHint="Removes this medication from your list"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <AppIcon name="action_delete" size="small" color="error" />
              )}
            </TouchableOpacity>
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
    </Animated.View>
  );
}

// Using MedicationFormData from types.ts - no local interface needed

// EditModal replaced by MedicationEntryFlow - new 3-step guided flow

/**
 * MedicationsScreen - PRIMARY app interface with enhanced dashboard features
 *
 * This is the main screen users see after authentication.
 * Combines medication management with dashboard functionality:
 * - Quick stats and medication overview
 * - Quick action buttons for scanning and sharing
 * - Full medication list with management capabilities
 * - Streamlined interface focused on core tasks
 */
export default function MedicationsScreen() {
  const insets = useSafeAreaInsets();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherenceData, setAdherenceData] = useState<AdherenceData[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [refreshing, setRefreshing] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (medications.length === 0 && !isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [medications.length, isLoading, pulseAnim]);

  const loadMedications = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setIsLoading(true);
    }
    try {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, isRefresh ? 400 : 800)
      );
      const [allMedications, adherence] = await Promise.all([
        mockDataService.getMedicationsAsync(),
        mockDataService.getAdherenceData(),
      ]);
      setMedications(allMedications);
      setAdherenceData(adherence);
    } catch (error) {
      Alert.alert("Error", "Failed to load medications. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load medications and check onboarding status on component mount
  React.useEffect(() => {
    loadMedications(false);
    checkOnboardingStatus();
  }, [loadMedications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadMedications(true);
  }, [loadMedications]);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        // Show onboarding for new users
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
      setShowOnboarding(false);
    }
  };

  const handleAddMedication = () => {
    setEditingMedication(null);
    setShowEditModal(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveMedication = async (formData: MedicationFormData) => {
    setIsSaving(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (editingMedication) {
        // Update existing medication
        await mockDataService.updateMedication(editingMedication.id, {
          ...formData,
          genericName: formData.genericName || undefined,
          notes: formData.notes || undefined,
        });
        Alert.alert("Success", "Medication updated successfully.");
      } else {
        // Add new medication
        await mockDataService.addMedication({
          ...formData,
          genericName: formData.genericName || undefined,
          notes: formData.notes || undefined,
          dateAdded: new Date().toISOString(),
          confidence: 1.0, // Manual entry gets full confidence
        });
        Alert.alert("Success", "Medication added successfully.");
      }
      await loadMedications();
      setShowEditModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save medication. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    const medication = medications.find((med) => med.id === id);
    if (!medication) return;

    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(id);
            try {
              // Simulate API delay
              await new Promise((resolve) => setTimeout(resolve, 500));
              await mockDataService.deleteMedication(id);
              await loadMedications();
              Alert.alert("Success", "Medication deleted successfully.");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete medication. Please try again."
              );
            } finally {
              setIsDeleting(null);
            }
          },
        },
      ]
    );
  };

  // Dashboard interaction handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
  };

  const handleClear = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setSortBy("name");
  };

  const handleStatsCardPress = (
    cardType: "due_today" | "adherence" | "streak"
  ) => {
    // Navigate to detailed views or show modal with more information
    switch (cardType) {
      case "due_today":
        // Could open today's schedule modal or scroll to it
        break;
      case "adherence":
        // Could open adherence analytics
        break;
      case "streak":
        // Could show streak history
        break;
    }
  };

  const handleMedicationTaken = async (medicationId: string) => {
    // Refresh adherence data when medication is marked as taken
    try {
      const updatedAdherence = await mockDataService.getAdherenceData();
      setAdherenceData(updatedAdherence);
    } catch (error) {
      console.error("Failed to refresh adherence data:", error);
    }
  };

  const handleMedicationDetails = (medication: Medication) => {
    // Handle press on medication card for details view
    handleEditMedication(medication);
  };

  // Filtering and sorting logic
  const getFilteredMedications = () => {
    let filtered = medications;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (med) =>
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.prescriber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.pharmacy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case "active":
        filtered = filtered.filter((med) => med.isActive ?? true);
        break;
      case "due_today":
        // This would need integration with schedule data
        break;
      case "missed":
        // This would need integration with schedule data
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "due_time":
        // Would need schedule integration
        break;
      case "adherence":
        filtered.sort((a, b) => {
          const aAdherence =
            adherenceData.find((data) => data.medicationId === a.id)
              ?.adherenceRate || 0;
          const bAdherence =
            adherenceData.find((data) => data.medicationId === b.id)
              ?.adherenceRate || 0;
          return bAdherence - aAdherence;
        });
        break;
      case "date_added":
        filtered.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
    }

    return filtered;
  };

  const filteredMedications = getFilteredMedications();
  const activeMedications = medications.filter((med) => med.isActive ?? true);
  const inactiveMedications = medications.filter(
    (med) => !(med.isActive ?? true)
  );

  const renderMedicationList = () => {
    if (filteredMedications.length === 0) {
      return (
        <ThemedView style={styles.emptyContainer}>
          <AppIcon name="nav_medications" size="large" color="disabled" />
          <ThemedText style={styles.emptyTitle}>
            {searchQuery || activeFilter !== "all"
              ? "No matches found"
              : "No Medications"}
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            {searchQuery || activeFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start building your medication list to keep track of your prescriptions"}
          </ThemedText>
          {!searchQuery && activeFilter === "all" && (
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={handleAddMedication}
              >
                <AppIcon
                  name="action_add_medication"
                  size="small"
                  color="white"
                />
                <Text style={styles.emptyActionText}>Add Manually</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.emptyActionButton,
                  styles.emptyActionButtonSecondary,
                ]}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <AppIcon
                  name="action_scan_bottle"
                  size="small"
                  color="active"
                />
                <Text
                  style={[
                    styles.emptyActionText,
                    styles.emptyActionTextSecondary,
                  ]}
                >
                  Scan Bottle
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      );
    }

    return (
      <View style={styles.medicationListContainer}>
        {filteredMedications.map((medication) => {
          const medicationAdherence = adherenceData.find(
            (data) => data.medicationId === medication.id
          );

          return (
            <EnhancedMedicationCard
              key={medication.id}
              medication={medication}
              adherenceData={medicationAdherence}
              onEdit={handleEditMedication}
              onDelete={handleDeleteMedication}
              onMarkTaken={handleMedicationTaken}
              onViewDetails={handleMedicationDetails}
              isDeleting={isDeleting === medication.id}
            />
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={styles.loadingText}>
            Loading medications...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Unified Scroll Container for Entire Page */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContentContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }, // Extra padding for FAB
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
            progressBackgroundColor="#ffffff"
          />
        }
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Enhanced Dashboard Header */}
        <DashboardHeader />

        {/* Actionable Stats Cards */}
        <StatsCards onCardPress={handleStatsCardPress} />

        {/* Quick Actions Bar */}
        <QuickActionsBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onClear={handleClear}
          onCalendarPress={() => {
            /* TODO: Implement calendar view */
          }}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          sortBy={sortBy}
        />

        {/* My Medications Section with Enhanced Cards */}
        <MyMedicationsSection
          medications={medications}
          adherenceData={adherenceData}
          onEdit={handleEditMedication}
          onDelete={handleDeleteMedication}
          onMarkTaken={handleMedicationTaken}
          onViewDetails={handleMedicationDetails}
          isDeleting={isDeleting}
        />

        {/* All Medications List */}
        <View style={styles.allMedicationsSection}>
          <Text style={styles.allMedicationsTitle}>All Medications</Text>
          {renderMedicationList()}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={handleAddMedication}
        isVisible={!showEditModal && !showOnboarding}
        loading={isSaving}
      />

      {/* Modals */}
      <MedicationEntryFlow
        visible={showEditModal}
        medication={editingMedication}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveMedication}
        isSaving={isSaving}
      />

      <OnboardingFlow
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
  },
  allMedicationsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  allMedicationsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  medicationListContainer: {
    paddingTop: 8,
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  addButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
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
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
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
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  // Old modal styles removed - now using MedicationEntryFlow component
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  emptyActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  emptyActionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  emptyActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyActionTextSecondary: {
    color: "#3b82f6",
  },
  // Dashboard Stats Styles
  dashboardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  // Quick Actions Styles
  quickActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  shareButton: {
    backgroundColor: "#f59e0b",
  },
  quickActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
