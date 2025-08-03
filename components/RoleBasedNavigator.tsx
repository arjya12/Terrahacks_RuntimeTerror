import apiService from "@/services/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface RoleBasedNavigatorProps {
  children?: React.ReactNode;
}

export default function RoleBasedNavigator({
  children,
}: RoleBasedNavigatorProps) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRoleAndNavigate = async () => {
      if (!isLoaded) return;

      console.log("🎭 Role-based navigation check:", {
        isSignedIn,
        hasUser: !!user,
      });

      if (!isSignedIn || !user) {
        console.log("🔐 User not authenticated, redirecting to auth");
        router.replace("/(auth)/sign-in");
        setIsCheckingRole(false);
        return;
      }

      try {
        // Get session token and set it for API service
        const token = await getToken();
        if (token) {
          apiService.setAuthToken(token);

          // Get user role from backend
          console.log("🔍 Fetching user role from backend...");
          const roleInfo = await apiService.getUserRoleInfo();
          const role = roleInfo.role;

          console.log("👤 User role determined:", role);
          setUserRole(role);

          // Navigate based on role
          if (role === "provider") {
            console.log("🏥 Navigating to provider interface");
            router.replace("/(provider)");
          } else {
            console.log("👨‍⚕️ Navigating to patient interface");
            router.replace("/(tabs)");
          }
        } else {
          console.warn("⚠️ No session token available");
          router.replace("/(auth)/sign-in");
        }
      } catch (error) {
        console.warn(
          "⚠️ Role check failed, defaulting to patient interface:",
          error
        );
        // Default to patient interface if backend is unavailable
        setUserRole("patient");
        router.replace("/(tabs)");
      }

      setIsCheckingRole(false);
    };

    checkUserRoleAndNavigate();
  }, [isSignedIn, isLoaded, user, router, getToken]);

  // Show loading while checking authentication and role
  if (!isLoaded || isCheckingRole) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <ThemedText style={styles.loadingText}>
          {!isLoaded ? "Loading..." : "Checking user role..."}
        </ThemedText>
        {userRole && (
          <ThemedText style={styles.roleText}>Role: {userRole}</ThemedText>
        )}
      </ThemedView>
    );
  }

  // Render children (fallback, usually won't be reached due to navigation)
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  roleText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.5,
    textAlign: "center",
  },
});
