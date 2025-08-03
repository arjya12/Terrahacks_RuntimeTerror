import { clearAuthCache, debugAuthCache } from "@/utils/authUtils";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Root Index - Authentication router
 *
 * FIXED: Proper auth routing without navigation conflicts
 * ADDED: Force login on every app open (no session persistence)
 * Uses imperative navigation with proper guards
 */
export default function RootIndex() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Enhanced debugging
  console.log("📱 RootIndex render:", {
    isSignedIn,
    isLoaded,
    hasUser: !!user,
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
    userId: user?.id,
  });

  // Clear any existing session on app start (additional safety measure)
  useEffect(() => {
    const clearSessionOnStart = async () => {
      if (isLoaded) {
        console.log("🔄 App started - implementing forced login policy");

        if (isSignedIn) {
          console.log("🧹 Found existing session - clearing for forced login");
          try {
            await signOut();
            await clearAuthCache();
            console.log("✅ Existing session cleared - fresh login required");
          } catch (error) {
            console.error("❌ Error clearing session on start:", error);
          }
        } else {
          console.log("✅ No existing session - proceeding to login screen");
        }
      }
    };

    clearSessionOnStart();
  }, [isLoaded]); // Only run when auth state is loaded

  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load

    // Debug authentication cache state
    debugAuthCache();

    console.log("🎯 RootIndex navigation effect:", {
      isSignedIn,
      isLoaded,
      hasUser: !!user,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
    });

    const timeoutId = setTimeout(() => {
      // With forced login policy, we always redirect to auth screens first
      // Users must authenticate fresh each time they open the app
      console.log("🔒 Forced login policy: Redirecting to authentication");
      router.replace("/(auth)/sign-in");
    }, 500); // Slightly longer delay to allow session clearing to complete

    return () => clearTimeout(timeoutId);
  }, [isLoaded, router]); // Removed isSignedIn and user dependencies since we always go to auth

  // Force logout when app goes to background (implements "login every time")
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      console.log("📱 App state changed to:", nextAppState);

      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log("🚪 App backgrounded - clearing session for forced login");

        try {
          // Sign out to clear the session
          await signOut();
          // Clear all cached authentication data
          await clearAuthCache();
          console.log(
            "✅ Session cleared - user will need to login again on next app open"
          );
        } catch (error) {
          console.error("❌ Error clearing session on background:", error);
        }
      }
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup function
    return () => {
      subscription?.remove();
    };
  }, [signOut]);

  // Show loading while determining where to navigate
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  text: {
    fontSize: 16,
    color: "#64748b",
  },
});
