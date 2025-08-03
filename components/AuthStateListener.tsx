import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/**
 * AuthStateListener - Handles post-authentication navigation
 *
 * FIXED: Removed conflicting navigation that caused infinite loops
 * This component now only handles navigation TO authenticated areas
 * AuthWrapper handles initial auth redirects to prevent loops
 */
export default function AuthStateListener() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Only navigate to main app when user successfully authenticates
    // Do NOT handle sign-out navigation (AuthWrapper handles that)
    if (isSignedIn && user) {
      console.log("🔐 User authenticated, navigating to main app");
      router.replace("/(tabs)");
    }
  }, [isSignedIn, user, isLoaded, router]);

  // This component doesn't render anything - it just listens
  return null;
}
