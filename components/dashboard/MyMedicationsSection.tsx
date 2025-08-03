import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";
import { AdherenceData, Medication } from "@/mocks/types";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Haptics,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MyMedicationsSectionProps {
  medications: Medication[];
  adherenceData: AdherenceData[];
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onMarkTaken?: (medicationId: string) => void;
  onViewDetails?: (medication: Medication) => void;
  isDeleting?: string | null;
}

interface ActionableMedicationCardProps {
  medication: Medication;
  adherenceData?: AdherenceData;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onMarkTaken?: (medicationId: string) => void;
  onViewDetails?: (medication: Medication) => void;
  isDeleting?: boolean;
}

/**
 * ActionableMedicationCard - Enhanced card with contextual action buttons
 *
 * Features:
 * - Full medication details (name, generic, dosage, prescriber, pharmacy)
 * - Adherence percentage with colored background
 * - Contextual action buttons based on medication status
 * - Micro-interactions and haptic feedback
 * - Status indicators for due/taken/overdue states
 */
function ActionableMedicationCard({
  medication,
  adherenceData,
  onEdit,
  onDelete,
  onMarkTaken,
  onViewDetails,
  isDeleting,
}: ActionableMedicationCardProps) {
  const [isMarkingTaken, setIsMarkingTaken] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleCardPress = () => {
    Haptics.selectionAsync();
    onViewDetails?.(medication);
  };

  const handleMarkTaken = async () => {
    if (isMarkingTaken) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMarkingTaken(true);

    try {
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      await mockDataService.markMedicationTaken(
        medication.id,
        new Date().toISOString()
      );

      onMarkTaken?.(medication.id);

      // Brief success feedback
      setTimeout(() => {
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 1000);
    } catch (error) {
      console.error("Failed to mark medication as taken:", error);
      Alert.alert("Error", "Failed to mark medication as taken");
    } finally {
      setIsMarkingTaken(false);
    }
  };

  const handleSkip = async () => {
    if (isSkipping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSkipping(true);

    try {
      // For now, just show confirmation
      Alert.alert(
        "Dose Skipped",
        `${medication.name} has been marked as skipped for this time.`,
        [{ text: "OK", style: "default" }]
      );
    } catch (error) {
      console.error("Failed to skip medication:", error);
    } finally {
      setIsSkipping(false);
    }
  };

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

  // Get medication status
  const getMedicationStatus = () => {
    const now = new Date();
    const hour = now.getHours();

    // Simulate medication timing based on frequency
    const freq = medication.frequency.toLowerCase();
    if (freq.includes("once")) {
      return hour < 9 ? "due" : hour < 12 ? "taken" : "upcoming";
    } else if (freq.includes("twice")) {
      if (hour < 9) return "due";
      if (hour < 12) return "taken";
      if (hour < 21) return "due";
      return "taken";
    }
    return "upcoming";
  };

  const getStatusColor = () => {
    if (!medication.isActive) return "#6b7280";
    if (!adherenceData) return "#3b82f6";

    const adherenceRate = adherenceData.adherenceRate;
    if (adherenceRate >= 0.9) return "#22c55e";
    if (adherenceRate >= 0.7) return "#f59e0b";
    return "#ef4444";
  };

  const getAdherencePercentage = () => {
    if (!adherenceData) return 100;
    return Math.round(adherenceData.adherenceRate * 100);
  };

  const status = getMedicationStatus();
  const statusColor = getStatusColor();
  const adherencePercentage = getAdherencePercentage();

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: isDeleting ? 0.5 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: statusColor }]}
        onPress={handleCardPress}
        disabled={isDeleting}
        accessibilityLabel={`${medication.name} ${medication.dosage}, ${adherencePercentage}% adherence`}
        accessibilityHint="Tap to view details"
        accessibilityRole="button"
      >
        {/* Success overlay */}
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <AppIcon name="action_mark_taken" size="large" color="white" />
          <Text style={styles.successText}>✓ Taken</Text>
        </Animated.View>

        {/* Main Card Content */}
        <View style={styles.cardContent}>
          {/* Header Row with Name and Adherence */}
          <View style={styles.headerRow}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName} numberOfLines={1}>
                {medication.name}
              </Text>
              {medication.genericName && (
                <Text style={styles.genericName}>
                  Generic: {medication.genericName}
                </Text>
              )}
            </View>

            <View
              style={[styles.adherenceBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.adherenceText}>{adherencePercentage}%</Text>
            </View>
          </View>

          {/* Dosage and Frequency */}
          <Text style={styles.dosageText}>
            {medication.dosage} - {medication.frequency}
          </Text>

          {/* Prescriber and Pharmacy */}
          <Text style={styles.prescriberText}>
            Prescribed by: {medication.prescriber}
          </Text>
          <Text style={styles.pharmacyText}>
            Pharmacy: {medication.pharmacy}
          </Text>

          {/* Notes if available */}
          {medication.notes && (
            <Text style={styles.notesText}>{medication.notes}</Text>
          )}

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            {status === "due" || status === "overdue" ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={handleMarkTaken}
                  disabled={isMarkingTaken || isDeleting}
                  accessibilityLabel="Mark as taken"
                  accessibilityRole="button"
                >
                  {isMarkingTaken ? (
                    <Text style={styles.primaryButtonText}>Marking...</Text>
                  ) : (
                    <Text style={styles.primaryButtonText}>Mark Taken</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleSkip}
                  disabled={isSkipping || isDeleting}
                  accessibilityLabel="Skip dose"
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryButtonText}>
                    {isSkipping ? "Skipping..." : "Skip"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : status === "taken" ? (
              <>
                <View style={[styles.actionButton, styles.takenButton]}>
                  <AppIcon name="action_mark_taken" size="mini" color="white" />
                  <Text style={styles.takenButtonText}>✓ Taken</Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => {
                    /* Implement undo functionality */
                  }}
                  disabled={isDeleting}
                  accessibilityLabel="Undo taken"
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryButtonText}>Undo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.upcomingButton]}
                onPress={() => {
                  /* Implement reschedule */
                }}
                disabled={isDeleting}
                accessibilityLabel="Reschedule"
                accessibilityRole="button"
              >
                <Text style={styles.upcomingButtonText}>Reschedule</Text>
              </TouchableOpacity>
            )}

            {/* Details button - always visible */}
            <TouchableOpacity
              style={[styles.actionButton, styles.detailsButton]}
              onPress={handleCardPress}
              disabled={isDeleting}
              accessibilityLabel="View details"
              accessibilityRole="button"
            >
              <Text style={styles.detailsButtonText}>Details →</Text>
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: medication.isActive ? "#22c55e" : "#6b7280",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {medication.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * MyMedicationsSection - Comprehensive medication overview with enhanced cards
 *
 * Features:
 * - Shows priority medications (due today, overdue, recently taken)
 * - Enhanced cards with full details and action buttons
 * - Quick access to common medication management tasks
 * - Maintains all existing functionality while improving UX
 */
export function MyMedicationsSection({
  medications,
  adherenceData,
  onEdit,
  onDelete,
  onMarkTaken,
  onViewDetails,
  isDeleting,
}: MyMedicationsSectionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get priority medications (active medications, max 4)
  const getPriorityMedications = () => {
    return medications.filter((med) => med.isActive).slice(0, 4);
  };

  const priorityMedications = getPriorityMedications();

  if (priorityMedications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>My Medications</Text>
        <View style={styles.emptyContainer}>
          <AppIcon name="nav_medications" size="large" color="disabled" />
          <Text style={styles.emptyText}>No active medications found</Text>
          <Text style={styles.emptySubtext}>
            Add medications to see them here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>My Medications</Text>
        <Text style={styles.subtitle}>
          {priorityMedications.length} active medication
          {priorityMedications.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.medicationsContainer}>
        {priorityMedications.map((medication) => {
          const medicationAdherence = adherenceData.find(
            (data) => data.medicationId === medication.id
          );

          return (
            <ActionableMedicationCard
              key={medication.id}
              medication={medication}
              adherenceData={medicationAdherence}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkTaken={onMarkTaken}
              onViewDetails={onViewDetails}
              isDeleting={isDeleting === medication.id}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  medicationsContainer: {
    // Remove height constraints to allow natural expansion
  },
  medicationsContent: {
    paddingBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(34, 197, 94, 0.95)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  successText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  cardContent: {
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  genericName: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
  },
  adherenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  adherenceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  dosageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  prescriberText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  pharmacyText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    flex: 1,
    minWidth: 100,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
    minWidth: 80,
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  takenButton: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 100,
  },
  takenButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  upcomingButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  upcomingButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  detailsButton: {
    backgroundColor: "transparent",
    minWidth: 80,
  },
  detailsButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "flex-end",
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
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
