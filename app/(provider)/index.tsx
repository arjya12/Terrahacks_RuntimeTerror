import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";

export default function ProviderDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Provider Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>
            Healthcare Provider Portal
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.welcomeCard}>
          <AppIcon name="stethoscope" size="large" color="primary" />
          <ThemedText style={styles.welcomeTitle}>
            Welcome, Healthcare Provider!
          </ThemedText>
          <ThemedText style={styles.welcomeText}>
            Access patient medication records, review drug interactions, and
            provide clinical decision support.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.featuresContainer}>
          <ThemedText style={styles.sectionTitle}>Provider Features</ThemedText>

          <View style={styles.featureGrid}>
            <ThemedView style={styles.featureCard}>
              <AppIcon name="nav_medications" size="medium" color="secondary" />
              <ThemedText style={styles.featureTitle}>
                Patient Records
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                Review shared medication lists from patients
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.featureCard}>
              <AppIcon name="feedback_warning" size="medium" color="warning" />
              <ThemedText style={styles.featureTitle}>
                Drug Interactions
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                Real-time interaction checking and alerts
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.featureCard}>
              <AppIcon name="action_help" size="medium" color="info" />
              <ThemedText style={styles.featureTitle}>
                Clinical Support
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                Evidence-based decision support tools
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.featureCard}>
              <AppIcon name="nav_profile" size="medium" color="success" />
              <ThemedText style={styles.featureTitle}>
                Provider Profile
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                Manage credentials and verification status
              </ThemedText>
            </ThemedView>
          </View>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Quick Stats</ThemedText>

          <View style={styles.statsGrid}>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Active Patients</ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>
                Medication Reviews
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>
                Interactions Found
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
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 18,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
