import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";
import { AdherenceData, Medication } from "@/mocks/types";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EnhancedMedicationCardProps {
  medication: Medication;
  adherenceData?: AdherenceData;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onMarkTaken?: (medicationId: string) => void;
  onViewDetails?: (medication: Medication) => void;
  isDeleting?: boolean;
}

/**
 * EnhancedMedicationCard - Redesigned medication cards with improved UX
 *
 * Features:
 * - Improved information hierarchy (Name, Next Dose, Dosage+Frequency, Adherence)
 * - Interactive elements (Quick Actions Row, Swipe Actions)
 * - Status indicators (color-coded dots)
 * - Adherence visualization
 * - Smooth animations and micro-interactions
 * - Accessibility optimized
 */
export function EnhancedMedicationCard({
  medication,
  adherenceData,
  onEdit,
  onDelete,
  onMarkTaken,
  onViewDetails,
  isDeleting,
}: EnhancedMedicationCardProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isMarkingTaken, setIsMarkingTaken] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;

  const handleCardPress = () => {
    // Animate card press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onViewDetails?.(medication);
  };

  const handleLongPress = () => {
    // Toggle quick actions
    const isShowing = !showQuickActions;
    setShowQuickActions(isShowing);

    Animated.timing(quickActionsAnim, {
      toValue: isShowing ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleMarkTaken = async () => {
    if (isMarkingTaken) return;

    setIsMarkingTaken(true);
    try {
      await mockDataService.markMedicationTaken(
        medication.id,
        new Date().toISOString()
      );
      onMarkTaken?.(medication.id);

      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert("✅ Marked as Taken", `${medication.name} has been recorded`);
    } catch (error) {
      console.error("Failed to mark medication as taken:", error);
      Alert.alert("Error", "Failed to mark medication as taken");
    } finally {
      setIsMarkingTaken(false);
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

  const getStatusColor = () => {
    if (!medication.isActive) return "#6b7280"; // Inactive - gray
    if (!adherenceData) return "#3b82f6"; // Default - blue

    const adherenceRate = adherenceData.adherenceRate;
    if (adherenceRate >= 0.9) return "#22c55e"; // Excellent - green
    if (adherenceRate >= 0.7) return "#f59e0b"; // Good - yellow
    return "#ef4444"; // Needs improvement - red
  };

  const getNextDoseTime = () => {
    const freq = medication.frequency.toLowerCase();
    const now = new Date();

    if (freq.includes("once")) {
      const nextDose = new Date(now);
      nextDose.setHours(8, 0, 0, 0);
      if (nextDose <= now) nextDose.setDate(nextDose.getDate() + 1);
      return nextDose.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (freq.includes("twice")) {
      const morning = new Date(now);
      morning.setHours(8, 0, 0, 0);
      const evening = new Date(now);
      evening.setHours(20, 0, 0, 0);

      if (now < morning)
        return morning.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      if (now < evening)
        return evening.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      const nextMorning = new Date(now);
      nextMorning.setDate(nextMorning.getDate() + 1);
      nextMorning.setHours(8, 0, 0, 0);
      return nextMorning.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "View schedule";
  };

  const getAdherenceDisplayText = () => {
    if (!adherenceData) return "No data";
    const rate = Math.round(adherenceData.adherenceRate * 100);
    return `${rate}% adherence`;
  };

  const statusColor = getStatusColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { translateX: slideAnim }],
          opacity: isDeleting ? 0.5 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: statusColor }]}
        onPress={handleCardPress}
        onLongPress={handleLongPress}
        disabled={isDeleting}
        accessibilityLabel={`${medication.name} ${medication.dosage}, ${medication.frequency}`}
        accessibilityHint="Tap to view details, long press for quick actions"
        accessibilityRole="button"
      >
        {/* Status Indicator */}
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName} numberOfLines={1}>
                {medication.name}
              </Text>
              <Text style={styles.nextDose}>Next: {getNextDoseTime()}</Text>
            </View>

            {/* Critical medication indicator */}
            {medication.name.toLowerCase().includes("lisinopril") && (
              <View style={styles.criticalBadge}>
                <AppIcon
                  name="status_needs_attention"
                  size="mini"
                  color="error"
                />
              </View>
            )}
          </View>

          {/* Dosage and Frequency */}
          <View style={styles.dosageRow}>
            <Text style={styles.dosageText}>{medication.dosage}</Text>
            <Text style={styles.frequencyText}>{medication.frequency}</Text>
          </View>

          {/* Adherence Indicator */}
          <View style={styles.adherenceRow}>
            <View style={styles.adherenceBar}>
              <View
                style={[
                  styles.adherenceFill,
                  {
                    width: `${
                      adherenceData ? adherenceData.adherenceRate * 100 : 0
                    }%`,
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.adherenceText, { color: statusColor }]}>
              {getAdherenceDisplayText()}
            </Text>
          </View>

          {/* Streak indicator */}
          {adherenceData && adherenceData.streakDays > 0 && (
            <View style={styles.streakRow}>
              <AppIcon name="stats_day_streak" size="small" color="warning" />
              <Text style={styles.streakText}>
                {adherenceData.streakDays} day streak
              </Text>
            </View>
          )}
        </View>

        {/* Quick Mark Taken Button */}
        <TouchableOpacity
          style={[
            styles.quickMarkButton,
            isMarkingTaken && styles.quickMarkButtonLoading,
          ]}
          onPress={handleMarkTaken}
          disabled={isMarkingTaken || !medication.isActive}
          accessibilityLabel="Mark as taken"
          accessibilityRole="button"
        >
          {isMarkingTaken ? (
            <AppIcon name="feedback_retry" size="small" color="default" />
          ) : (
            <AppIcon
              name="action_mark_taken"
              size="small"
              color={medication.isActive ? "success" : "disabled"}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Quick Actions Row */}
      <Animated.View
        style={[
          styles.quickActions,
          {
            opacity: quickActionsAnim,
            transform: [
              {
                translateY: quickActionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={showQuickActions ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => onEdit(medication)}
          accessibilityLabel="Edit medication"
          accessibilityRole="button"
        >
          <AppIcon name="action_edit" size="small" color="active" />
          <Text style={styles.quickActionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleMarkTaken}
          disabled={!medication.isActive}
          accessibilityLabel="Mark as taken"
          accessibilityRole="button"
        >
          <AppIcon
            name="action_mark_taken"
            size="small"
            color={medication.isActive ? "success" : "disabled"}
          />
          <Text
            style={[
              styles.quickActionText,
              !medication.isActive && styles.disabledText,
            ]}
          >
            Mark Taken
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => onViewDetails?.(medication)}
          accessibilityLabel="View details"
          accessibilityRole="button"
        >
          <AppIcon name="action_view_details" size="small" color="default" />
          <Text style={styles.quickActionText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleDelete}
          accessibilityLabel="Delete medication"
          accessibilityRole="button"
        >
          <AppIcon name="action_delete" size="small" color="error" />
          <Text style={[styles.quickActionText, styles.deleteText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 16,
  },
  mainContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  nextDose: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  criticalBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  dosageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 16,
  },
  dosageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  frequencyText: {
    fontSize: 14,
    color: "#6b7280",
  },
  adherenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  adherenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
  adherenceFill: {
    height: "100%",
    borderRadius: 2,
  },
  adherenceText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 80,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
  },
  quickMarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  quickMarkButtonLoading: {
    backgroundColor: "#e2e8f0",
  },
  quickActions: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 8,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  disabledText: {
    color: "#9ca3af",
  },
  deleteText: {
    color: "#ef4444",
  },
});
