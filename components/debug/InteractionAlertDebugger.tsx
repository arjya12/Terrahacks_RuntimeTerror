import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { clearDismissedInteractions } from "@/components/dashboard/InteractionAlertBanner";

/**
 * Debug component for testing interaction alert dismissal functionality
 * Add this temporarily to your main screen to test dismissal behavior
 */
export default function InteractionAlertDebugger() {
  const [dismissedCount, setDismissedCount] = useState<number>(0);

  const checkDismissedInteractions = async () => {
    try {
      const stored = await AsyncStorage.getItem("@dismissed_interactions");
      const dismissedArray = stored ? JSON.parse(stored) : [];
      setDismissedCount(dismissedArray.length);

      Alert.alert(
        "Dismissed Interactions",
        `Found ${
          dismissedArray.length
        } dismissed interactions:\n${dismissedArray.join("\n")}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to check dismissed interactions");
    }
  };

  const clearDismissals = async () => {
    try {
      await clearDismissedInteractions();
      setDismissedCount(0);
      Alert.alert("Success", "All dismissed interactions cleared");
    } catch (error) {
      Alert.alert("Error", "Failed to clear dismissed interactions");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>🐛 Alert Debug Panel</ThemedText>
      <ThemedText style={styles.count}>Dismissed: {dismissedCount}</ThemedText>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={checkDismissedInteractions}
        >
          <ThemedText style={styles.buttonText}>Check Dismissed</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.debugButton} onPress={clearDismissals}>
          <ThemedText style={styles.buttonText}>Clear All</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  debugButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
