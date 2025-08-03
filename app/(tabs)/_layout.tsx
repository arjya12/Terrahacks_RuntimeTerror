import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { AppIcon } from "@/components/icons/IconSystem";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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
          tabBarIcon: ({ color, focused }) => (
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
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="nav_scan"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="nav_profile"
              size="large"
              color={focused ? "active" : "default"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
