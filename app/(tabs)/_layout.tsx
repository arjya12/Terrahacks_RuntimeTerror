import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { AppIcon } from "@/components/icons/IconSystem";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { mockDataService } from "@/mocks/mockService";

/**
 * TabLayout - PRIMARY app navigation with bottom tabs
 *
 * This is the main interface users see after authentication.
 * Provides easy access to core app features:
 * - Medications: Full medication management with add/edit/delete
 * - Scan: Camera-based medication bottle scanning with OCR
 * - Profile: User profile, preferences, and quick actions
 *
 * Features enhanced loading states, error handling, and comprehensive UX
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [alertsCount, setAlertsCount] = useState<number>(0);

  useEffect(() => {
    // Load alerts count for badge
    loadAlertsCount();

    // Set up interval to check for new alerts
    const interval = setInterval(loadAlertsCount, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadAlertsCount = async () => {
    try {
      // Check for drug interactions
      const interactions =
        await mockDataService.checkAllMedicationInteractions();
      let count = interactions.interactions_found || 0;

      // Add other alert types (missed doses, refills, etc.)
      // Get unread notifications count
      const unreadNotifications =
        await mockDataService.getUnreadNotifications();
      count += unreadNotifications.length;

      setAlertsCount(count);
    } catch (error) {
      console.error("Failed to load alerts count:", error);
      setAlertsCount(0);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Medications",
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="nav_medications"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
          tabBarBadge: undefined, // Could show medication count
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Scan",
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="nav_scan"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="nav_alerts"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
          tabBarBadge: alertsCount > 0 ? alertsCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="nav_profile"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="gemini"
        options={{
          title: "AI Assistant",
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="nav_ai_assistant"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
