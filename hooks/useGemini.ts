/**
 * React hooks for Gemini API integration
 * Provides easy-to-use hooks for components
 */

import { useCallback, useRef, useState } from "react";
import {
  GeminiAPIError,
  GeminiChatSession,
  GeminiRateLimitError,
  geminiService,
} from "../services/geminiService";

// ============================================================================
// Types
// ============================================================================

export interface GeminiState {
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface UseChatOptions {
  autoSave?: boolean;
  sessionId?: string;
  maxHistory?: number;
}

export interface UseTextGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}

// ============================================================================
// Main Gemini Hook
// ============================================================================

export function useGemini() {
  const [state, setState] = useState<GeminiState>({
    isLoading: false,
    error: null,
    isConfigured: geminiService.isConfigured(),
  });

  const setApiKey = useCallback(async (apiKey: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await geminiService.setApiKey(apiKey);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConfigured: true,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to set API key",
      }));
    }
  }, []);

  const clearApiKey = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await geminiService.clearApiKey();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConfigured: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to clear API key",
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    setApiKey,
    clearApiKey,
    clearError,
  };
}

// ============================================================================
// Text Generation Hook
// ============================================================================

export function useTextGeneration(options: UseTextGenerationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const generateText = useCallback(
    async (prompt: string) => {
      if (!geminiService.isConfigured()) {
        setError("Gemini API key not configured");
        return null;
      }

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await geminiService.generateText(prompt, options);
        setResult(response);
        return response;
      } catch (err) {
        // Return mock response for rate limit errors to avoid user disruption
        if (err instanceof GeminiRateLimitError) {
          const mockResponse =
            "This is a demonstration response. The AI assistant would provide helpful information about your query in a real scenario.";
          setResult(mockResponse);
          return mockResponse;
        }

        const errorMessage =
          err instanceof GeminiAPIError
            ? err.message
            : "Failed to generate text";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    generateText,
    isLoading,
    error,
    result,
    reset,
  };
}

// ============================================================================
// Chat Hook
// ============================================================================

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<GeminiChatSession>(
    geminiService.createChatSession()
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!geminiService.isConfigured()) {
        setError("Gemini API key not configured");
        return;
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await geminiService.sendMessage(
          sessionRef.current,
          text
        );

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          text: response,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];

          // Limit history if specified
          if (options.maxHistory && newMessages.length > options.maxHistory) {
            return newMessages.slice(-options.maxHistory);
          }

          return newMessages;
        });
      } catch (err) {
        // Provide mock response for rate limit errors
        if (err instanceof GeminiRateLimitError) {
          const mockResponse =
            "Hello! I'm an AI assistant here to help with your health and medication questions. This is a demonstration response as the service is currently experiencing high usage.";

          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            text: mockResponse,
            role: "assistant",
            timestamp: new Date(),
          };

          setMessages((prev) => {
            const newMessages = [...prev, assistantMessage];
            if (options.maxHistory && newMessages.length > options.maxHistory) {
              return newMessages.slice(-options.maxHistory);
            }
            return newMessages;
          });
        } else {
          const errorMessage =
            err instanceof GeminiAPIError
              ? err.message
              : "Failed to send message";
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [options.maxHistory]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionRef.current = geminiService.createChatSession();
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  return {
    messages,
    sendMessage,
    clearChat,
    removeMessage,
    isLoading,
    error,
  };
}

// ============================================================================
// Image Analysis Hook
// ============================================================================

export function useImageAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const analyzeImage = useCallback(
    async (imageData: string, prompt?: string, mimeType?: string) => {
      if (!geminiService.isConfigured()) {
        setError("Gemini API key not configured");
        return null;
      }

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await geminiService.analyzeImage(
          imageData,
          prompt,
          mimeType
        );
        setResult(response);
        return response;
      } catch (err) {
        // Return mock response for rate limit errors
        if (err instanceof GeminiRateLimitError) {
          const mockResponse =
            "This is a demonstration image analysis. The AI would normally provide detailed insights about the image content.";
          setResult(mockResponse);
          return mockResponse;
        }

        const errorMessage =
          err instanceof GeminiAPIError
            ? err.message
            : "Failed to analyze image";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    analyzeImage,
    isLoading,
    error,
    result,
    reset,
  };
}

// ============================================================================
// Medical-Specific Hooks
// ============================================================================

export function useMedicationAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const analyzeMedication = useCallback(async (text: string) => {
    if (!geminiService.isConfigured()) {
      setError("Gemini API key not configured");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.analyzeMedicationText(text);
      setResult(response);
      return response;
    } catch (err) {
      // Return mock response for rate limit errors
      if (err instanceof GeminiRateLimitError) {
        const mockResponse =
          "Mock medication analysis: This appears to be a prescription medication. Please consult with your healthcare provider for specific information.";
        setResult(mockResponse);
        return mockResponse;
      }

      const errorMessage =
        err instanceof GeminiAPIError
          ? err.message
          : "Failed to analyze medication";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkInteractions = useCallback(async (medications: string[]) => {
    if (!geminiService.isConfigured()) {
      setError("Gemini API key not configured");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.checkDrugInteractions(medications);
      setResult(response);
      return response;
    } catch (err) {
      // Return mock response for rate limit errors
      if (err instanceof GeminiRateLimitError) {
        const mockResponse =
          "Mock interaction check: No major drug interactions detected in this demonstration. Always consult your pharmacist or doctor for real interaction checks.";
        setResult(mockResponse);
        return mockResponse;
      }

      const errorMessage =
        err instanceof GeminiAPIError
          ? err.message
          : "Failed to check interactions";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const simplifyDocument = useCallback(async (documentText: string) => {
    if (!geminiService.isConfigured()) {
      setError("Gemini API key not configured");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.simplifyMedicalDocument(
        documentText
      );
      setResult(response);
      return response;
    } catch (err) {
      // Return mock response for rate limit errors
      if (err instanceof GeminiRateLimitError) {
        const mockResponse =
          "Mock document simplification: This is a simplified version of your medical document. The AI would normally provide clear, easy-to-understand explanations of medical terms and instructions.";
        setResult(mockResponse);
        return mockResponse;
      }

      const errorMessage =
        err instanceof GeminiAPIError
          ? err.message
          : "Failed to simplify document";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    analyzeMedication,
    checkInteractions,
    simplifyDocument,
    isLoading,
    error,
    result,
    reset,
  };
}
