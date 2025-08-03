/**
 * Gemini Components Export
 * Central export for all Gemini-related components
 */

export { GeminiChat } from "./GeminiChat";
export { GeminiDemo } from "./GeminiDemo";
export { GeminiProvider, useGeminiContext } from "./GeminiProvider";
export { GeminiSetup } from "./GeminiSetup";

// Re-export services and hooks for convenience
export { geminiService } from "../../services/geminiService";
export type {
  GeminiAPIError,
  GeminiChatSession,
  GeminiContentFilterError,
  GeminiMessage,
  GeminiRateLimitError,
  GeminiResponse,
} from "../../services/geminiService";

export {
  useChat,
  useGemini,
  useImageAnalysis,
  useMedicationAnalysis,
  useTextGeneration,
} from "../../hooks/useGemini";

export type {
  ChatMessage,
  UseChatOptions,
  UseTextGenerationOptions,
} from "../../hooks/useGemini";
