/**
 * Gemini Initialization for React Native
 * Auto-initializes Gemini API on app startup
 */

import { geminiService } from "../services/geminiService";

// Store initialization status
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

/**
 * Initialize Gemini with your API key
 * This is called automatically when the app starts
 */
export async function initializeGeminiAPI(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  console.log("🤖 Initializing Gemini AI...");

  initPromise = (async () => {
    try {
      // Set the API key directly
      const apiKey = "AIzaSyDsSCLuqlFsAYAvZpDJaSv5_-FdT_oBDcw";
      await geminiService.setApiKey(apiKey);

      console.log("✅ Gemini API key configured");

      // Skip connection test to avoid rate limits - will test when actually used
      console.log(
        "✅ Gemini AI configured (connection will be tested when first used)"
      );
      isInitialized = true;
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Gemini AI:", error);
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Check if Gemini is ready to use
 */
export function isGeminiReady(): boolean {
  return isInitialized && geminiService.isConfigured();
}

/**
 * Get initialization status
 */
export function getGeminiInitStatus(): {
  initialized: boolean;
  configured: boolean;
  ready: boolean;
} {
  return {
    initialized: isInitialized,
    configured: geminiService.isConfigured(),
    ready: isGeminiReady(),
  };
}

// Auto-initialize when module is imported
if (typeof window !== "undefined" || typeof global !== "undefined") {
  // Only in React Native environment, not during static analysis
  setTimeout(() => {
    initializeGeminiAPI().catch(console.error);
  }, 1000); // Small delay to ensure app is ready
}

export default {
  initialize: initializeGeminiAPI,
  isReady: isGeminiReady,
  getStatus: getGeminiInitStatus,
};
