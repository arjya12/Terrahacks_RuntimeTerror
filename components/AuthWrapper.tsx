import { useAuth, useUser } from "@clerk/clerk-expo";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * AuthWrapper - Simple auth state provider
 *
 * FIXED: Removed ALL navigation logic to prevent infinite loops
 * This component only provides auth state and loading screens
 * Navigation is handled by the parent layout
 */
export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Debug logging to track auth state changes
  console.log("🔄 AuthWrapper render:", {
    isSignedIn,
    isLoaded,
    hasUser: !!user,
  });

  // Auth state still loading
  if (!isLoaded) {
    console.log("⏳ Auth loading...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Always render children - let Stack handle routing
  console.log("✅ Auth loaded, rendering app structure");
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
});
