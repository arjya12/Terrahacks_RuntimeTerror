import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";
import { DailySchedule, MedicationSchedule } from "@/mocks/types";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TodaysScheduleProps {
  onMedicationPress?: (medication: MedicationSchedule) => void;
}

/**
 * TodaysSchedule - Timeline view of today's medication schedule
 *
 * Features:
 * - Chronological timeline of medication doses
 * - Visual status indicators (taken, pending, missed)
 * - Quick action to mark medications as taken
 * - Critical medication highlighting
 * - Smooth animations and interactions
 */
export function TodaysSchedule({ onMedicationPress }: TodaysScheduleProps) {
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markingTaken, setMarkingTaken] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const todaySchedule = await mockDataService.getTodaySchedule();
      setSchedule(todaySchedule);

      // Animate timeline entrance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Failed to load today's schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsTaken = async (medication: MedicationSchedule) => {
    if (medication.taken || markingTaken) return;

    try {
      setMarkingTaken(`${medication.medicationId}-${medication.scheduledTime}`);

      // Optimistic update
      setSchedule((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          medications: prev.medications.map((med) =>
            med.medicationId === medication.medicationId &&
            med.scheduledTime === medication.scheduledTime
              ? {
                  ...med,
                  taken: true,
                  takenAt: new Date().toISOString(),
                  missed: false,
                }
              : med
          ),
        };
      });

      await mockDataService.markMedicationTaken(
        medication.medicationId,
        medication.scheduledTime
      );

      // Show success feedback
      Alert.alert(
        "✅ Medication Taken",
        `${medication.medicationName} marked as taken`,
        [{ text: "Great!", style: "default" }]
      );
    } catch (error) {
      console.error("Failed to mark medication as taken:", error);
      // Revert optimistic update
      loadSchedule();
      Alert.alert(
        "Error",
        "Failed to mark medication as taken. Please try again."
      );
    } finally {
      setMarkingTaken(null);
    }
  };

  const getMedicationStatus = (medication: MedicationSchedule) => {
    if (medication.taken) return "taken";
    if (medication.missed) return "missed";

    const now = new Date();
    const scheduled = new Date();
    const [hours, minutes] = medication.scheduledTime.split(":").map(Number);
    scheduled.setHours(hours, minutes, 0, 0);

    if (scheduled <= now) return "due";
    return "upcoming";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "taken":
        return {
          dot: { backgroundColor: "#22c55e" },
          background: { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
          text: { color: "#166534" },
        };
      case "missed":
        return {
          dot: { backgroundColor: "#ef4444" },
          background: { backgroundColor: "#fee2e2", borderColor: "#ef4444" },
          text: { color: "#dc2626" },
        };
      case "due":
        return {
          dot: { backgroundColor: "#f59e0b" },
          background: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
          text: { color: "#d97706" },
        };
      case "upcoming":
        return {
          dot: { backgroundColor: "#3b82f6" },
          background: { backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
          text: { color: "#2563eb" },
        };
      default:
        return {
          dot: { backgroundColor: "#6b7280" },
          background: { backgroundColor: "#f3f4f6", borderColor: "#6b7280" },
          text: { color: "#374151" },
        };
    }
  };

  const getTimeFromNow = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = new Date();
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    scheduled.setHours(hours, minutes, 0, 0);

    const diffMinutes =
      Math.abs(scheduled.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 60) {
      return `${Math.round(diffMinutes)}m`;
    } else {
      return `${Math.round(diffMinutes / 60)}h`;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingItem} />
          <View style={styles.loadingItem} />
          <View style={styles.loadingItem} />
        </View>
      </View>
    );
  }

  if (!schedule || schedule.medications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.emptyContainer}>
          <AppIcon name="control_calendar" size="large" color="disabled" />
          <Text style={styles.emptyText}>
            No medications scheduled for today
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.adherenceContainer}>
          <Text style={styles.adherenceText}>
            {schedule.adherencePercentage}% completed
          </Text>
          <View style={styles.adherenceBar}>
            <View
              style={[
                styles.adherenceFill,
                { width: `${schedule.adherencePercentage}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.timeline}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
      >
        {schedule.medications.map((medication, index) => {
          const status = getMedicationStatus(medication);
          const statusStyle = getStatusStyle(status);
          const isMarkingThis =
            markingTaken ===
            `${medication.medicationId}-${medication.scheduledTime}`;

          return (
            <View
              key={`${medication.medicationId}-${medication.scheduledTime}`}
              style={styles.timelineItem}
            >
              {/* Timeline connector */}
              {index < schedule.medications.length - 1 && (
                <View style={styles.timelineConnector} />
              )}

              {/* Time indicator */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{medication.scheduledTime}</Text>
                {status === "due" && (
                  <Text style={styles.timeFromNow}>
                    {getTimeFromNow(medication.scheduledTime)} ago
                  </Text>
                )}
              </View>

              {/* Status dot */}
              <View style={[styles.statusDot, statusStyle.dot]}>
                {medication.taken && (
                  <AppIcon name="action_mark_taken" size="mini" color="white" />
                )}
                {medication.missed && (
                  <AppIcon name="control_close" size="mini" color="white" />
                )}
              </View>

              {/* Medication card */}
              <TouchableOpacity
                style={[
                  styles.medicationCard,
                  statusStyle.background,
                  medication.isCritical && styles.criticalMedication,
                  isMarkingThis && styles.markingCard,
                ]}
                onPress={() => onMedicationPress?.(medication)}
                disabled={isMarkingThis}
                accessibilityLabel={`${medication.medicationName} ${medication.dosage}, scheduled for ${medication.scheduledTime}`}
                accessibilityHint={
                  medication.taken
                    ? "Already taken"
                    : "Tap to view details or mark as taken"
                }
              >
                <View style={styles.medicationInfo}>
                  <View style={styles.medicationHeader}>
                    <Text style={[styles.medicationName, statusStyle.text]}>
                      {medication.medicationName}
                    </Text>
                    {medication.isCritical && (
                      <View style={styles.criticalBadge}>
                        <AppIcon
                          name="status_needs_attention"
                          size="mini"
                          color="error"
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.medicationDosage}>
                    {medication.dosage}
                  </Text>

                  {medication.taken && medication.takenAt && (
                    <Text style={styles.takenTime}>
                      Taken at{" "}
                      {new Date(medication.takenAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>

                {/* Quick action button */}
                {!medication.taken && status !== "upcoming" && (
                  <TouchableOpacity
                    style={styles.markTakenButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMarkAsTaken(medication);
                    }}
                    disabled={isMarkingThis}
                    accessibilityLabel="Mark as taken"
                    accessibilityRole="button"
                  >
                    {isMarkingThis ? (
                      <Text style={styles.markTakenText}>Marking...</Text>
                    ) : (
                      <>
                        <AppIcon
                          name="action_mark_taken"
                          size="small"
                          color="success"
                        />
                        <Text style={styles.markTakenText}>Mark Taken</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
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
    marginBottom: 8,
  },
  adherenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adherenceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  adherenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
  adherenceFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 2,
  },
  timeline: {
    maxHeight: 400,
  },
  timelineContent: {
    paddingBottom: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  timelineConnector: {
    position: "absolute",
    left: 76,
    top: 32,
    width: 2,
    height: 32,
    backgroundColor: "#e2e8f0",
    zIndex: 0,
  },
  timeContainer: {
    width: 60,
    alignItems: "flex-end",
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  timeFromNow: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  medicationCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  criticalMedication: {
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  markingCard: {
    opacity: 0.7,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  criticalBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  takenTime: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "500",
  },
  markTakenButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    gap: 4,
  },
  markTakenText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  loadingContainer: {
    gap: 12,
  },
  loadingItem: {
    height: 60,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
});
