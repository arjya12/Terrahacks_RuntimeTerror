import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSyncUser } from "@/hooks/useSupabase";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect } from "react";

interface SupabaseAuthSyncProps {
  children: React.ReactNode;
}

export function SupabaseAuthSync({ children }: SupabaseAuthSyncProps) {
  const { user, isLoaded } = useUser();
  const syncUserMutation = useSyncUser();

  useEffect(() => {
    if (isLoaded && user && !syncUserMutation.data) {
      // Sync user with Supabase when Clerk user is available
      syncUserMutation.mutate(user);
    }
  }, [user, isLoaded]);

  // Show loading while Clerk is loading or while syncing user
  if (!isLoaded || (user && syncUserMutation.isPending)) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <LoadingSpinner size="large" />
        <ThemedText style={{ marginTop: 16, textAlign: "center" }}>
          {!isLoaded ? "Loading..." : "Syncing user data..."}
        </ThemedText>
      </ThemedView>
    );
  }

  // Show error if sync failed
  if (syncUserMutation.isError) {
    return (
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ThemedText
          style={{ color: "red", textAlign: "center", marginBottom: 16 }}
        >
          Failed to sync user data. Please try again.
        </ThemedText>
        <ThemedText style={{ textAlign: "center", fontSize: 12, opacity: 0.7 }}>
          Error: {syncUserMutation.error?.message || "Unknown error"}
        </ThemedText>
      </ThemedView>
    );
  }

  // Render children when everything is ready
  return <>{children}</>;
}

// Helper component for protecting routes that require authentication
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <LoadingSpinner size="large" />
        <ThemedText style={{ marginTop: 16 }}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      fallback || (
        <ThemedView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ThemedText
            style={{ textAlign: "center", fontSize: 18, marginBottom: 8 }}
          >
            Authentication Required
          </ThemedText>
          <ThemedText style={{ textAlign: "center", opacity: 0.7 }}>
            Please sign in to access this content.
          </ThemedText>
        </ThemedView>
      )
    );
  }

  return <SupabaseAuthSync>{children}</SupabaseAuthSync>;
}
