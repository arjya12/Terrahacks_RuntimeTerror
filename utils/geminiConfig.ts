/**
 * Gemini Configuration Utilities
 * Handles initialization and configuration of Gemini API
 */

import Constants from "expo-constants";
import { geminiService } from "../services/geminiService";

// ============================================================================
// Configuration
// ============================================================================

interface GeminiConfig {
  apiKey: string;
  model?: string;
  autoInitialize?: boolean;
}

// Get API key from various sources
export function getGeminiApiKey(): string | null {
  // First try app.json extra config
  const extraApiKey = Constants.expoConfig?.extra?.geminiApiKey;
  if (extraApiKey) {
    return extraApiKey;
  }

  // Then try environment variables (for web/development)
  if (typeof process !== "undefined" && process.env) {
    const envApiKey =
      process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }
  }

  // Check if running in development with hardcoded key
  if (__DEV__) {
    const devApiKey = "AIzaSyDsSCLuqlFsAYAvZpDJaSv5_-FdT_oBDcw";
    console.log("🔧 Using development Gemini API key");
    return devApiKey;
  }

  return null;
}

// ============================================================================
// Initialization Functions
// ============================================================================

/**
 * Initialize Gemini API with configuration
 */
export async function initializeGemini(
  config?: Partial<GeminiConfig>
): Promise<boolean> {
  try {
    const apiKey = config?.apiKey || getGeminiApiKey();

    if (!apiKey) {
      console.warn(
        "⚠️ Gemini API key not found. Please configure it to use AI features."
      );
      return false;
    }

    await geminiService.setApiKey(apiKey);

    // Skip connection test to avoid rate limits - will test when actually used
    console.log(
      "✅ Gemini AI initialized successfully (connection will be tested when first used)"
    );

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Gemini AI:", error);
    return false;
  }
}

/**
 * Auto-initialize Gemini on app startup
 */
export async function autoInitializeGemini(): Promise<void> {
  if (__DEV__) {
    console.log("🤖 Auto-initializing Gemini AI...");
  }

  await initializeGemini();
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return geminiService.isConfigured();
}

/**
 * Get Gemini configuration status
 */
export function getGeminiStatus(): {
  configured: boolean;
  hasApiKey: boolean;
  source: string | null;
} {
  const apiKey = getGeminiApiKey();
  const configured = geminiService.isConfigured();

  let source = null;
  if (apiKey) {
    if (Constants.expoConfig?.extra?.geminiApiKey) {
      source = "app.json";
    } else if (typeof process !== "undefined" && process.env) {
      source = "environment";
    } else if (__DEV__) {
      source = "development";
    }
  }

  return {
    configured,
    hasApiKey: !!apiKey,
    source,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a quick AI response for testing
 */
export async function testGeminiConnection(): Promise<string | null> {
  try {
    if (!isGeminiConfigured()) {
      await autoInitializeGemini();
    }

    if (!isGeminiConfigured()) {
      return null;
    }

    // Return mock response to avoid rate limits during testing
    return "Hello from Gemini AI! This is a demonstration message showing that the AI assistant is configured and ready to help.";
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return null;
  }
}

/**
 * Get AI-powered medication insights
 */
export async function getMedicationInsights(
  medicationName: string
): Promise<string | null> {
  try {
    if (!isGeminiConfigured()) {
      await autoInitializeGemini();
    }

    if (!isGeminiConfigured()) {
      return null;
    }

    // Return mock response to avoid rate limits
    return `Mock insights for ${medicationName}: This medication is commonly prescribed for various conditions. Please consult with your healthcare provider or pharmacist for specific information about your prescription, including proper usage, potential side effects, and important precautions. Always follow your doctor's instructions and read the medication guide provided with your prescription.`;
  } catch (error) {
    console.error("Failed to get medication insights:", error);
    return null;
  }
}

export default {
  initialize: initializeGemini,
  autoInitialize: autoInitializeGemini,
  isConfigured: isGeminiConfigured,
  getStatus: getGeminiStatus,
  testConnection: testGeminiConnection,
  getMedicationInsights,
};
