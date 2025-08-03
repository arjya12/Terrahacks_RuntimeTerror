/**
 * Gemini Provider Component
 * Provides Gemini API context to child components
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { geminiService } from "../../services/geminiService";

// ============================================================================
// Types
// ============================================================================

interface GeminiContextValue {
  isConfigured: boolean;
  isInitializing: boolean;
  setApiKey: (apiKey: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const GeminiContext = createContext<GeminiContextValue | null>(null);

export function useGeminiContext() {
  const context = useContext(GeminiContext);
  if (!context) {
    throw new Error("useGeminiContext must be used within a GeminiProvider");
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

interface GeminiProviderProps {
  children: React.ReactNode;
  autoInitialize?: boolean;
}

export function GeminiProvider({
  children,
  autoInitialize = true,
}: GeminiProviderProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isInitializing, setIsInitializing] = useState(autoInitialize);

  useEffect(() => {
    if (autoInitialize) {
      initializeGemini();
    }
  }, [autoInitialize]);

  const initializeGemini = async () => {
    try {
      setIsInitializing(true);

      // Check if API key is already configured
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);

      if (!configured) {
        console.log("🤖 Gemini API not configured. Please set your API key.");
      } else {
        console.log("✅ Gemini API configured and ready");
      }
    } catch (error) {
      console.warn("Failed to initialize Gemini:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const setApiKey = async (apiKey: string) => {
    try {
      await geminiService.setApiKey(apiKey);
      setIsConfigured(true);
      console.log("✅ Gemini API key configured successfully");
    } catch (error) {
      console.error("❌ Failed to set Gemini API key:", error);
      throw error;
    }
  };

  const clearApiKey = async () => {
    try {
      await geminiService.clearApiKey();
      setIsConfigured(false);
      console.log("🗑️ Gemini API key cleared");
    } catch (error) {
      console.error("❌ Failed to clear Gemini API key:", error);
      throw error;
    }
  };

  const value: GeminiContextValue = {
    isConfigured,
    isInitializing,
    setApiKey,
    clearApiKey,
  };

  return (
    <GeminiContext.Provider value={value}>{children}</GeminiContext.Provider>
  );
}

export default GeminiProvider;
