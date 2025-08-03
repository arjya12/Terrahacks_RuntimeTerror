import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * PersonalizedWelcome - Shows user-specific welcome message
 *
 * Displays personalized greeting and user information
 */
export default function PersonalizedWelcome() {
  const { user } = useUser();

  if (!user) return null;

  const firstName = user.firstName || "User";
  const email = user.emailAddresses?.[0]?.emailAddress || "";

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back, {firstName}!</Text>
      <Text style={styles.emailText}>{email}</Text>
      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Account Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
});
