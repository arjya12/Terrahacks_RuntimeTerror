import { tokenCache } from "@clerk/clerk-expo/token-cache";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Authentication Utilities
 *
 * Provides functions to clear authentication cache and resolve session conflicts
 */

/**
 * Clear all Clerk authentication cache
 * Use this when experiencing "Session already exists" errors
 */
export const clearAuthCache = async (): Promise<void> => {
  try {
    console.log("🧹 Clearing all authentication cache...");

    // Clear Clerk token cache
    if (tokenCache && typeof tokenCache.deleteToken === "function") {
      // Clear all possible Clerk cache keys
      const clerkKeys = [
        "clerk-session",
        "clerk-token",
        "clerk-user",
        "clerk-client",
        "clerk-jwt-template",
      ];

      for (const key of clerkKeys) {
        try {
          await tokenCache.deleteToken(key);
        } catch (error) {
          console.warn(`Failed to clear cache key ${key}:`, error);
        }
      }
    }

    // Clear AsyncStorage Clerk-related keys
    const allKeys = await AsyncStorage.getAllKeys();
    const clerkStorageKeys = allKeys.filter(
      (key) =>
        key.includes("clerk") ||
        key.includes("@@auth") ||
        key.includes("session")
    );

    if (clerkStorageKeys.length > 0) {
      await AsyncStorage.multiRemove(clerkStorageKeys);
      console.log("🗑️ Cleared AsyncStorage Clerk keys:", clerkStorageKeys);
    }

    console.log("✅ Authentication cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing auth cache:", error);
    throw new Error("Failed to clear authentication cache");
  }
};

/**
 * Debug function to log current auth cache state
 */
export const debugAuthCache = async (): Promise<void> => {
  try {
    console.log("🔍 Debugging authentication cache...");

    const allKeys = await AsyncStorage.getAllKeys();
    const authKeys = allKeys.filter(
      (key) =>
        key.includes("clerk") || key.includes("auth") || key.includes("session")
    );

    console.log("📦 Auth-related cache keys found:", authKeys);

    for (const key of authKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        console.log(`🔑 ${key}:`, value ? "HAS_VALUE" : "NULL");
      } catch (error) {
        console.warn(`Failed to read key ${key}:`, error);
      }
    }
  } catch (error) {
    console.error("❌ Error debugging auth cache:", error);
  }
};
