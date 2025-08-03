import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";
import { DashboardStats } from "@/mocks/types";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StatsCardsProps {
  onCardPress?: (cardType: "due_today" | "adherence" | "streak") => void;
}

/**
 * StatsCards - Actionable insights replacing redundant metrics
 *
 * Features:
 * - Due Today: Shows medications pending for today
 * - Adherence Rate: Current overall adherence percentage
 * - Current Streak: Days of consistent medication taking
 * - Color-coded visual indicators
 * - Tap actions for detailed views
 */
export function StatsCards({ onCardPress }: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    dueToday: 0,
    adherenceRate: 0,
    currentStreak: 0,
    totalMedications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const animatedValues = React.useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const dashboardStats = await mockDataService.getDashboardStats();
      setStats(dashboardStats);

      // Animate cards entrance with staggered timing
      Animated.stagger(150, [
        Animated.spring(animatedValues[0], {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValues[1], {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValues[2], {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDueTodayStyle = () => {
    if (stats.dueToday === 0)
      return { color: "#22c55e", backgroundColor: "#dcfce7" };
    if (stats.dueToday <= 2)
      return { color: "#f59e0b", backgroundColor: "#fef3c7" };
    return { color: "#ef4444", backgroundColor: "#fee2e2" };
  };

  const getAdherenceStyle = () => {
    if (stats.adherenceRate >= 90)
      return { color: "#22c55e", backgroundColor: "#dcfce7" };
    if (stats.adherenceRate >= 70)
      return { color: "#f59e0b", backgroundColor: "#fef3c7" };
    return { color: "#ef4444", backgroundColor: "#fee2e2" };
  };

  const getStreakStyle = () => {
    if (stats.currentStreak >= 7)
      return { color: "#8b5cf6", backgroundColor: "#ede9fe" };
    if (stats.currentStreak >= 3)
      return { color: "#3b82f6", backgroundColor: "#dbeafe" };
    return { color: "#6b7280", backgroundColor: "#f3f4f6" };
  };

  const handleCardPress = (
    cardType: "due_today" | "adherence" | "streak",
    index: number
  ) => {
    // Create a subtle press animation
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onCardPress?.(cardType);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={[styles.card, styles.loadingCard]}>
            <View style={styles.loadingContent} />
          </View>
        ))}
      </View>
    );
  }

  const dueTodayStyle = getDueTodayStyle();
  const adherenceStyle = getAdherenceStyle();
  const streakStyle = getStreakStyle();

  return (
    <View style={styles.container}>
      {/* Due Today Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { scale: animatedValues[0] },
              {
                translateY: animatedValues[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            opacity: animatedValues[0],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleCardPress("due_today", 0)}
          accessibilityLabel={`${stats.dueToday} medications due today`}
          accessibilityHint="Tap to view today's medication schedule"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: dueTodayStyle.backgroundColor },
            ]}
          >
            <AppIcon
              name={
                stats.dueToday === 0 ? "feedback_completed" : "stats_due_today"
              }
              size="small"
              color={stats.dueToday === 0 ? "success" : "warning"}
            />
          </View>
          <Text style={styles.cardNumber}>{stats.dueToday}</Text>
          <Text style={styles.cardLabel}>Due Today</Text>
          {stats.dueToday === 0 && (
            <Text style={styles.cardSubtext}>All caught up! 🎉</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Adherence Rate Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { scale: animatedValues[1] },
              {
                translateY: animatedValues[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            opacity: animatedValues[1],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleCardPress("adherence", 1)}
          accessibilityLabel={`${stats.adherenceRate}% adherence rate`}
          accessibilityHint="Tap to view detailed adherence statistics"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: adherenceStyle.backgroundColor },
            ]}
          >
            <AppIcon
              name="stats_adherence_rate"
              size="small"
              color={
                stats.adherenceRate >= 90
                  ? "success"
                  : stats.adherenceRate >= 70
                  ? "warning"
                  : "error"
              }
            />
          </View>
          <Text style={styles.cardNumber}>{stats.adherenceRate}%</Text>
          <Text style={styles.cardLabel}>Adherence Rate</Text>
          <Text style={styles.cardSubtext}>
            {stats.adherenceRate >= 90
              ? "Excellent!"
              : stats.adherenceRate >= 70
              ? "Good progress"
              : "Needs improvement"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Current Streak Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { scale: animatedValues[2] },
              {
                translateY: animatedValues[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            opacity: animatedValues[2],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleCardPress("streak", 2)}
          accessibilityLabel={`${stats.currentStreak} day current streak`}
          accessibilityHint="Tap to view streak details and history"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: streakStyle.backgroundColor },
            ]}
          >
            <AppIcon
              name="stats_day_streak"
              size="small"
              color={
                stats.currentStreak >= 7
                  ? "active"
                  : stats.currentStreak >= 3
                  ? "active"
                  : "default"
              }
            />
          </View>
          <Text style={styles.cardNumber}>{stats.currentStreak}</Text>
          <Text style={styles.cardLabel}>Day Streak</Text>
          <Text style={styles.cardSubtext}>
            {stats.currentStreak >= 7
              ? "Amazing!"
              : stats.currentStreak >= 3
              ? "Keep it up!"
              : "Just getting started"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    fontWeight: "500",
  },
  loadingCard: {
    backgroundColor: "#f8fafc",
  },
  loadingContent: {
    height: 80,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    opacity: 0.6,
  },
});
