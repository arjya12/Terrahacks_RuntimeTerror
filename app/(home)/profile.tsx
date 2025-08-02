import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SignOutButton } from "@/app/components/SignOutButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { mockDataService } from "@/mocks/mockService";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

function InfoCard({ title, children }: InfoCardProps) {
  return (
    <ThemedView style={styles.infoCard}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      {children}
    </ThemedView>
  );
}

export default function ProfileScreen() {
  const { userId } = useAuth();
  const { user } = useUser();
  const patientProfile = userId
    ? mockDataService.getPatientProfile(userId)
    : null;

  const navigateToMedications = () => {
    router.push("/(home)/medications");
  };

  const navigateToSharing = () => {
    router.push("/(home)/sharing");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {user?.firstName} {user?.lastName}
          </ThemedText>
        </ThemedView>

        <InfoCard title="Personal Information">
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email:</ThemedText>
            <ThemedText style={styles.value}>
              {user?.emailAddresses[0]?.emailAddress}
            </ThemedText>
          </View>
          {patientProfile?.dateOfBirth && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Date of Birth:</ThemedText>
              <ThemedText style={styles.value}>
                {new Date(patientProfile.dateOfBirth).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
          {patientProfile?.phoneNumber && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Phone:</ThemedText>
              <ThemedText style={styles.value}>
                {patientProfile.phoneNumber}
              </ThemedText>
            </View>
          )}
        </InfoCard>

        {patientProfile?.allergies && patientProfile.allergies.length > 0 && (
          <InfoCard title="Allergies">
            {patientProfile.allergies.map((allergy, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.allergyBadge}>
                  <Text style={styles.allergyText}>{allergy}</Text>
                </View>
              </View>
            ))}
          </InfoCard>
        )}

        {patientProfile?.conditions && patientProfile.conditions.length > 0 && (
          <InfoCard title="Medical Conditions">
            {patientProfile.conditions.map((condition, index) => (
              <View key={index} style={styles.listItem}>
                <ThemedText style={styles.conditionText}>
                  • {condition}
                </ThemedText>
              </View>
            ))}
          </InfoCard>
        )}

        {patientProfile?.emergencyContact && (
          <InfoCard title="Emergency Contact">
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Name:</ThemedText>
              <ThemedText style={styles.value}>
                {patientProfile.emergencyContact.name}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Phone:</ThemedText>
              <ThemedText style={styles.value}>
                {patientProfile.emergencyContact.phone}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Relationship:</ThemedText>
              <ThemedText style={styles.value}>
                {patientProfile.emergencyContact.relationship}
              </ThemedText>
            </View>
          </InfoCard>
        )}

        <InfoCard title="Quick Actions">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToMedications}
          >
            <ThemedText style={styles.actionButtonText}>
              View All Medications
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToSharing}
          >
            <ThemedText style={styles.actionButtonText}>
              Manage Sharing
            </ThemedText>
          </TouchableOpacity>
        </InfoCard>

        <ThemedView style={styles.signOutContainer}>
          <SignOutButton />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.7,
    flex: 1,
  },
  value: {
    fontSize: 14,
    flex: 2,
    textAlign: "right",
  },
  listItem: {
    marginBottom: 8,
  },
  allergyBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  allergyText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "600",
  },
  conditionText: {
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  signOutContainer: {
    marginTop: 24,
    backgroundColor: "transparent",
  },
});
