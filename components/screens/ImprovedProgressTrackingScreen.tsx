/**
 * ImprovedProgressTrackingScreen - Enhanced "Progress Tracking" screen with analytics focus
 *
 * PRESERVES ALL EXISTING FUNCTIONALITY:
 * - All medication adherence data and percentages
 * - Progress bars with exact percentages
 * - Streak counters and historical data
 * - Warning indicators and alert systems
 * - Add Medication functionality
 * - Navigation and tab structure
 *
 * ENHANCEMENTS:
 * - Renamed from "All Medications" to "Progress Tracking"
 * - Analytics-focused header with weekly overview
 * - Enhanced progress visualization and trends
 * - Motivational elements and achievement tracking
 * - Better organization of progress data
 * - Contextual insights and recommendations
 */

import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppIcon } from "../icons/IconSystem";
import { ImprovedProgressTrackingCard } from "../medication/ImprovedProgressTrackingCard";

const { width } = Dimensions.get("window");

// PRESERVED: All existing types and interfaces
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

interface ImprovedProgressTrackingScreenProps {
  medications: Medication[];
  adherenceData?: { [medicationId: string]: AdherenceData };
  onMedicationPress?: (medication: Medication) => void;
  onAddMedication?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

export function ImprovedProgressTrackingScreen({
  medications = [],
  adherenceData = {},
  onMedicationPress,
  onAddMedication,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
}: ImprovedProgressTrackingScreenProps) {
  // PRESERVED: Active medications filtering
  const activeMedications = medications.filter((med) => med.active);

  // Calculate overall progress metrics
  const overallMetrics = useMemo(() => {
    if (activeMedications.length === 0) {
      return {
        averageAdherence: 0,
        totalStreak: 0,
        perfectDays: 0,
        totalMedications: 0,
        excellentMedications: 0,
      };
    }

    let totalAdherence = 0;
    let totalStreak = 0;
    let excellentCount = 0;

    activeMedications.forEach((medication) => {
      const data = adherenceData[medication.id];
      if (data) {
        totalAdherence += data.adherenceRate;
        totalStreak += data.streak;
        if (data.adherenceRate >= 0.9) excellentCount++;
      }
    });

    const averageAdherence = Math.round(
      (totalAdherence / activeMedications.length) * 100
    );
    const averageStreak = Math.round(totalStreak / activeMedications.length);

    return {
      averageAdherence,
      totalStreak: averageStreak,
      perfectDays: Math.min(
        ...activeMedications.map((m) => adherenceData[m.id]?.streak || 0)
      ),
      totalMedications: activeMedications.length,
      excellentMedications: excellentCount,
    };
  }, [activeMedications, adherenceData]);

  // Group medications by adherence level
  const medicationsByPerformance = useMemo(() => {
    const groups = {
      excellent: [] as Medication[],
      good: [] as Medication[],
      needsAttention: [] as Medication[],
    };

    activeMedications.forEach((medication) => {
      const data = adherenceData[medication.id];
      const rate = data ? data.adherenceRate : 0;

      if (rate >= 0.9) {
        groups.excellent.push(medication);
      } else if (rate >= 0.7) {
        groups.good.push(medication);
      } else {
        groups.needsAttention.push(medication);
      }
    });

    return groups;
  }, [activeMedications, adherenceData]);

  // Get achievement level
  const getAchievementLevel = () => {
    const { averageAdherence, excellentMedications, totalMedications } =
      overallMetrics;

    if (averageAdherence >= 95 && excellentMedications === totalMedications) {
      return {
        level: "champion",
        emoji: "🏆",
        text: "Medication Champion!",
        color: "#FFD700",
      };
    } else if (averageAdherence >= 90) {
      return {
        level: "expert",
        emoji: "🌟",
        text: "Adherence Expert",
        color: "#4A90E2",
      };
    } else if (averageAdherence >= 75) {
      return {
        level: "good",
        emoji: "👍",
        text: "Good Progress",
        color: "#27AE60",
      };
    } else if (averageAdherence >= 50) {
      return {
        level: "improving",
        emoji: "📈",
        text: "Improving",
        color: "#F39C12",
      };
    } else {
      return {
        level: "start",
        emoji: "🌱",
        text: "Getting Started",
        color: "#6B7280",
      };
    }
  };

  // PRESERVED: All handler functions
  const handleMedicationPress = (medication: Medication) => {
    onMedicationPress?.(medication);
  };

  const handleAddMedication = () => {
    onAddMedication?.();
  };

  // Navigate to take medications
  const handleTakeMedications = () => {
    router.push("/(tabs)/index"); // Assuming this goes to take medications
  };

  // Check if any medications need attention
  const hasWarnings = medicationsByPerformance.needsAttention.length > 0;

  // Render performance group
  const renderPerformanceGroup = (
    title: string,
    medications: Medication[],
    icon: string,
    color: string,
    description: string
  ) => {
    if (medications.length === 0) return null;

    return (
      <View style={styles.performanceGroup}>
        <View style={styles.groupHeader}>
          <View style={styles.groupTitleContainer}>
            <AppIcon name={icon as any} size="small" color={color} />
            <View style={styles.groupTitleInfo}>
              <Text style={[styles.groupTitle, { color }]}>{title}</Text>
              <Text style={styles.groupDescription}>{description}</Text>
            </View>
            <View style={[styles.groupBadge, { backgroundColor: color }]}>
              <Text style={styles.groupBadgeText}>{medications.length}</Text>
            </View>
          </View>
        </View>

        {medications.map((medication) => (
          <ImprovedProgressTrackingCard
            key={medication.id}
            medication={medication}
            adherenceData={adherenceData[medication.id]}
            onPress={handleMedicationPress}
            hasWarning={medicationsByPerformance.needsAttention.includes(
              medication
            )}
          />
        ))}
      </View>
    );
  };

  // PRESERVED: Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading progress data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const achievement = getAchievementLevel();

  return (
    <SafeAreaView style={styles.container}>
      {/* ENHANCED: Analytics-Focused Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <Text style={styles.screenTitle}>Progress Tracking</Text>
            <Text style={styles.screenSubtitle}>
              Monitor your medication adherence
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddMedication}
            style={styles.addButton}
            accessibilityLabel="Add new medication"
            accessibilityRole="button"
          >
            <AppIcon name="add" size="medium" color="primary" />
          </TouchableOpacity>
        </View>

        {/* Overall Progress Dashboard */}
        <View style={styles.dashboardCard}>
          {/* Achievement Badge */}
          <View style={styles.achievementSection}>
            <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
            <View style={styles.achievementInfo}>
              <Text
                style={[styles.achievementTitle, { color: achievement.color }]}
              >
                {achievement.text}
              </Text>
              <Text style={styles.achievementSubtitle}>
                This week: {overallMetrics.averageAdherence}% adherence
              </Text>
            </View>
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {overallMetrics.averageAdherence}%
              </Text>
              <Text style={styles.metricLabel}>Average Adherence</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {overallMetrics.totalStreak}
              </Text>
              <Text style={styles.metricLabel}>Average Streak</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {overallMetrics.excellentMedications}
              </Text>
              <Text style={styles.metricLabel}>Excellent Meds</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.primaryAction]}
              onPress={handleTakeMedications}
            >
              <AppIcon name="nav_medications" size="mini" color="white" />
              <Text style={styles.primaryActionText}>Take Medications</Text>
            </TouchableOpacity>

            {hasWarnings && (
              <TouchableOpacity
                style={[styles.quickActionButton, styles.warningAction]}
              >
                <AppIcon
                  name="status_needs_attention"
                  size="mini"
                  color="white"
                />
                <Text style={styles.warningActionText}>Needs Attention</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ENHANCED: Progress Groups */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#4A90E2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Excellent Performance */}
        {renderPerformanceGroup(
          "Excellent",
          medicationsByPerformance.excellent,
          "success",
          "#27AE60",
          "90%+ adherence rate"
        )}

        {/* Good Performance */}
        {renderPerformanceGroup(
          "Good Progress",
          medicationsByPerformance.good,
          "status_in_progress",
          "#4A90E2",
          "70-89% adherence rate"
        )}

        {/* Needs Attention */}
        {renderPerformanceGroup(
          "Needs Attention",
          medicationsByPerformance.needsAttention,
          "status_needs_attention",
          "#E74C3C",
          "Below 70% adherence rate"
        )}

        {/* PRESERVED: Empty State */}
        {activeMedications.length === 0 && (
          <View style={styles.emptyState}>
            <AppIcon name="analytics" size="large" color="disabled" />
            <Text style={styles.emptyTitle}>No Progress Data</Text>
            <Text style={styles.emptyText}>
              Add medications to start tracking your adherence progress
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={handleAddMedication}
            >
              <Text style={styles.emptyActionText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Insights Section */}
        {activeMedications.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsTitle}>📊 Insights</Text>

            {overallMetrics.averageAdherence >= 90 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  🎉 Excellent adherence! You're taking{" "}
                  {overallMetrics.excellentMedications} out of{" "}
                  {overallMetrics.totalMedications} medications consistently.
                </Text>
              </View>
            )}

            {hasWarnings && (
              <View style={[styles.insightCard, styles.warningInsight]}>
                <Text style={styles.insightText}>
                  💡 {medicationsByPerformance.needsAttention.length}{" "}
                  medication(s) need attention. Consider setting reminders or
                  talking to your doctor.
                </Text>
              </View>
            )}

            {overallMetrics.totalStreak >= 7 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  🔥 Great streak! You've maintained an average{" "}
                  {overallMetrics.totalStreak}-day streak across your
                  medications.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  screenSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F7FF",
  },
  dashboardCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  achievementSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  metricsGrid: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  primaryAction: {
    backgroundColor: "#4A90E2",
  },
  warningAction: {
    backgroundColor: "#E74C3C",
  },
  primaryActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  warningActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  performanceGroup: {
    marginTop: 24,
  },
  groupHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  groupTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupTitleInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 12,
    color: "#666666",
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
  },
  emptyText: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyActionButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyActionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  insightsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  insightCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  warningInsight: {
    borderLeftColor: "#E74C3C",
  },
  insightText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
