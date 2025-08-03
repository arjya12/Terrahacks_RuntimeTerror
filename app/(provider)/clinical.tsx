import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";

export default function ClinicalToolsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Clinical Tools</ThemedText>
        <ThemedText style={styles.subtitle}>
          Decision support and analysis
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.toolsContainer}>
          <View style={styles.toolGrid}>
            <ThemedView style={styles.toolCard}>
              <AppIcon name="feedback_warning" size="medium" color="warning" />
              <ThemedText style={styles.toolTitle}>
                Drug Interactions
              </ThemedText>
              <ThemedText style={styles.toolDescription}>
                Check for dangerous drug combinations
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.toolCard}>
              <AppIcon name="action_help" size="medium" color="info" />
              <ThemedText style={styles.toolTitle}>
                Clinical Guidelines
              </ThemedText>
              <ThemedText style={styles.toolDescription}>
                Evidence-based prescribing guidelines
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.toolCard}>
              <AppIcon name="feedback_info" size="medium" color="primary" />
              <ThemedText style={styles.toolTitle}>Drug Information</ThemedText>
              <ThemedText style={styles.toolDescription}>
                Comprehensive medication database
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.toolCard}>
              <AppIcon name="feedback_error" size="medium" color="error" />
              <ThemedText style={styles.toolTitle}>Allergy Alerts</ThemedText>
              <ThemedText style={styles.toolDescription}>
                Patient allergy and contraindication alerts
              </ThemedText>
            </ThemedView>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollContent: {
    padding: 16,
  },
  toolsContainer: {
    marginBottom: 24,
  },
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  toolCard: {
    flex: 1,
    minWidth: "45%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  toolDescription: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
  },
});
