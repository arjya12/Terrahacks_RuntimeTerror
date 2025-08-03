import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";
import { NotificationData } from "@/mocks/types";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * DashboardHeader - Enhanced header with dynamic greeting and smart notifications
 *
 * Features:
 * - Time-based dynamic greeting
 * - Prominent date display
 * - Smart notifications banner
 * - Optional weather integration placeholder
 * - Clean, focused design removing clutter
 */
export function DashboardHeader() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadNotifications();

    // Animate header entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const loadNotifications = async () => {
    try {
      const unreadNotifications =
        await mockDataService.getUnreadNotifications();
      setNotifications(unreadNotifications.slice(0, 2)); // Show max 2 notifications
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const getDynamicGreeting = () => {
    const hour = currentTime.getHours();
    const firstName = user?.firstName || "User";

    if (hour < 12) return `Good morning, ${firstName}`;
    if (hour < 17) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return currentTime.toLocaleDateString("en-US", options);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    try {
      await mockDataService.markNotificationAsRead(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      // Handle different notification types
      switch (notification.type) {
        case "missed_dose":
          Alert.alert(
            "Missed Dose",
            "Would you like to mark this medication as taken now?",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Mark as Taken",
                onPress: () => {
                  if (notification.medicationId) {
                    mockDataService.markMedicationTaken(
                      notification.medicationId,
                      new Date().toISOString()
                    );
                  }
                },
              },
            ]
          );
          break;
        case "upcoming_dose":
          Alert.alert("Upcoming Dose", notification.message);
          break;
        default:
          Alert.alert(notification.title, notification.message);
      }
    } catch (error) {
      console.error("Failed to handle notification:", error);
    }
  };

  const getNotificationPriorityColor = (
    priority: NotificationData["priority"]
  ) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          // Remove safe area padding since it's handled by ScrollView now
          paddingTop: 20, // Just additional spacing
        },
      ]}
    >
      {/* Main Header */}
      <View style={styles.headerMain}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getDynamicGreeting()}</Text>
          <Text style={styles.date}>{getFormattedDate()}</Text>
        </View>

        {/* Weather placeholder - can be enabled later */}
        <View style={styles.weatherSection}>
          <AppIcon name="time_afternoon" size="medium" color="warning" />
          <Text style={styles.temperature}>72°</Text>
        </View>
      </View>

      {/* Smart Notifications Banner */}
      {notifications.length > 0 && (
        <View style={styles.notificationsContainer}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationBanner,
                {
                  borderLeftColor: getNotificationPriorityColor(
                    notification.priority
                  ),
                },
              ]}
              onPress={() => handleNotificationPress(notification)}
              accessibilityLabel={`Notification: ${notification.title}`}
              accessibilityHint="Tap to view details"
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <View
                    style={[
                      styles.priorityIndicator,
                      {
                        backgroundColor: getNotificationPriorityColor(
                          notification.priority
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
              </View>
              <AppIcon name="control_forward" size="mini" color="disabled" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  weatherSection: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  temperature: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
    marginTop: 2,
  },
  notificationsContainer: {
    gap: 8,
  },
  notificationBanner: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
});
