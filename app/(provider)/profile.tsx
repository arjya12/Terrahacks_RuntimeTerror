import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";

export default function ProviderProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Provider Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          Credentials and settings
        </ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.profileCard}>
          <AppIcon name="nav_profile" size="large" color="primary" />
          <ThemedText style={styles.providerName}>
            Dr. Healthcare Provider
          </ThemedText>
          <ThemedText style={styles.specialty}>Internal Medicine</ThemedText>
          <ThemedView style={styles.verificationBadge}>
            <ThemedText style={styles.verificationText}>✓ Verified</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.sectionTitle}>
            Professional Information
          </ThemedText>

          <View style={styles.infoGrid}>
            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.infoLabel}>Organization</ThemedText>
              <ThemedText style={styles.infoValue}>
                City General Hospital
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.infoLabel}>License</ThemedText>
              <ThemedText style={styles.infoValue}>MD123456</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.infoLabel}>NPI Number</ThemedText>
              <ThemedText style={styles.infoValue}>1234567890</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.infoLabel}>DEA Number</ThemedText>
              <ThemedText style={styles.infoValue}>BC1234567</ThemedText>
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
  profileCard: {
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
  providerName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  verificationBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verificationText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  infoContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
});
