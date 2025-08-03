/**
 * ImprovedProgressTrackingCard - Enhanced medication card for the "Progress Tracking" screen
 *
 * PRESERVES ALL EXISTING FUNCTIONALITY:
 * - All medication adherence data and percentages
 * - Progress bars with exact percentages
 * - Streak counters (4 day, 5 day, 21 day streaks)
 * - "Next: 8:00 AM" timing displays
 * - Warning indicators (triangle alerts)
 * - Compact card layout structure
 * - All data synchronization
 *
 * ENHANCEMENTS:
 * - Improved progress visualization with animated bars
 * - Better streak display with achievement styling
 * - Enhanced warning indicator design
 * - Clearer typography and information hierarchy
 * - Motivational elements and visual feedback
 * - Better color coding for progress states
 */

import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppIcon } from "../icons/IconSystem";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  prescriber?: string;
  pharmacy?: string;
  active: boolean;
  start_date: string;
  end_date?: string;
}

interface AdherenceData {
  adherenceRate: number;
  streak: number;
  totalDoses: number;
  takenDoses: number;
  weeklyData?: number[];
  monthlyData?: number[];
}

interface ImprovedProgressTrackingCardProps {
  medication: Medication;
  adherenceData?: AdherenceData;
  onPress?: (medication: Medication) => void;
  hasWarning?: boolean;
}

export function ImprovedProgressTrackingCard({
  medication,
  adherenceData,
  onPress,
  hasWarning = false,
}: ImprovedProgressTrackingCardProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate progress bar on mount
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: adherenceData ? adherenceData.adherenceRate : 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [adherenceData]);

  const handlePress = () => {
    Haptics.selectionAsync();

    // Card press animation
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

    onPress?.(medication);
  };

  // Get next dose time (preserved logic)
  const getNextDoseTime = () => {
    const freq = medication.frequency.toLowerCase();
    const now = new Date();
    const hour = now.getHours();

    if (freq.includes("bedtime") || freq.includes("evening")) {
      return hour >= 20 ? "Now" : "8:00 PM Tonight";
    }
    if (freq.includes("morning")) {
      return hour < 9 ? "Now" : "8:00 AM Tomorrow";
    }
    if (freq.includes("twice")) {
      if (hour < 9) return "8:00 AM Today";
      if (hour < 21) return "8:00 PM Today";
      return "8:00 AM Tomorrow";
    }
    return "8:00 AM Tomorrow";
  };

  // Get adherence color based on percentage
  const getAdherenceColor = () => {
    if (!adherenceData) return "#E0E0E0";
    const rate = adherenceData.adherenceRate * 100;
    if (rate >= 90) return "#27AE60"; // Green
    if (rate >= 70) return "#F39C12"; // Orange
    return "#E74C3C"; // Red
  };

  // Get streak achievement level
  const getStreakLevel = () => {
    if (!adherenceData) return "none";
    const streak = adherenceData.streak;
    if (streak >= 21) return "champion";
    if (streak >= 14) return "expert";
    if (streak >= 7) return "good";
    if (streak >= 3) return "start";
    return "none";
  };

  // Get achievement emoji and color
  const getStreakDisplay = () => {
    const level = getStreakLevel();
    const streak = adherenceData?.streak || 0;

    switch (level) {
      case "champion":
        return { emoji: "🏆", color: "#FFD700", text: `${streak} day streak` };
      case "expert":
        return { emoji: "🔥", color: "#FF6B35", text: `${streak} day streak` };
      case "good":
        return { emoji: "⭐", color: "#4A90E2", text: `${streak} day streak` };
      case "start":
        return { emoji: "🌱", color: "#27AE60", text: `${streak} day streak` };
      default:
        return { emoji: "📅", color: "#6B7280", text: "Start your streak" };
    }
  };

  // Get weekly progress summary
  const getWeeklyProgress = () => {
    if (!adherenceData) return "No data";
    const taken = adherenceData.takenDoses;
    const total = adherenceData.totalDoses;
    return `${taken}/${total} doses taken`;
  };

  const adherencePercentage = adherenceData
    ? Math.round(adherenceData.adherenceRate * 100)
    : 0;
  const adherenceColor = getAdherenceColor();
  const streakDisplay = getStreakDisplay();
  const nextDose = getNextDoseTime();

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: adherenceColor }]}
        onPress={handlePress}
        accessibilityLabel={`${medication.name} progress: ${adherencePercentage}% adherence`}
        accessibilityHint="Tap to view detailed progress"
        accessibilityRole="button"
      >
        {/* ENHANCED: Header with Warning Indicator */}
        <View style={styles.header}>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName} numberOfLines={1}>
              {medication.name}
            </Text>
            <Text style={styles.nextDoseText}>Next: {nextDose}</Text>
          </View>

          {/* PRESERVED: Warning Indicator */}
          {hasWarning && (
            <View style={styles.warningContainer}>
              <AppIcon
                name="status_needs_attention"
                size="small"
                color="error"
              />
            </View>
          )}
        </View>

        {/* PRESERVED: Dosage Information */}
        <View style={styles.dosageSection}>
          <Text style={styles.dosageText}>{medication.dosage}</Text>
          <Text style={styles.frequencyText}>{medication.frequency}</Text>
        </View>

        {/* ENHANCED: Streak Display */}
        <View style={styles.streakSection}>
          <Text style={styles.streakEmoji}>{streakDisplay.emoji}</Text>
          <Text style={[styles.streakText, { color: streakDisplay.color }]}>
            {streakDisplay.text}
          </Text>
        </View>

        {/* ENHANCED: Progress Visualization */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Adherence</Text>
            <Text
              style={[styles.progressPercentage, { color: adherenceColor }]}
            >
              {adherencePercentage}%
            </Text>
          </View>

          {/* PRESERVED: Progress Bar with Animation */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: adherenceColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* ENHANCED: Weekly Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>This week:</Text>
            <Text style={styles.summaryValue}>{getWeeklyProgress()}</Text>
          </View>

          {/* Achievement badges for milestones */}
          {adherencePercentage >= 90 && (
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementText}>Excellent!</Text>
            </View>
          )}
        </View>

        {/* ENHANCED: Status Indicator Dot */}
        <View style={[styles.statusDot, { backgroundColor: adherenceColor }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  nextDoseText: {
    fontSize: 13,
    color: "#4A90E2",
    fontWeight: "500",
  },
  warningContainer: {
    backgroundColor: "#FFF2F2",
    padding: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  dosageSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  dosageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  frequencyText: {
    fontSize: 13,
    color: "#666666",
  },
  streakSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarContainer: {
    position: "relative",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F0F0F0",
  },
  progressBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 3,
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
  },
  achievementBadge: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27AE60",
  },
  achievementText: {
    fontSize: 11,
    color: "#27AE60",
    fontWeight: "600",
  },
  statusDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
