/**
 * Gemini API Service for MedReconcile Pro
 * Provides AI-powered features using Google's Gemini API
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";

// ============================================================================
// Types and Schemas
// ============================================================================

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string; // base64 encoded
    };
  }>;
}

export interface GeminiChatSession {
  history: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index?: number; // Optional - not always returned by API
    avgLogprobs?: number; // Actually returned by API
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>; // Optional - not always returned by API
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion?: string;
  responseId?: string;
}

export interface StreamingResponse {
  text: string;
  isComplete: boolean;
  error?: string;
}

// Validation schemas
const GeminiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string() })),
        role: z.string(),
      }),
      finishReason: z.string(),
      index: z.number().optional(), // Made optional - not always returned
      avgLogprobs: z.number().optional(), // Actually returned by API
      safetyRatings: z
        .array(
          z.object({
            category: z.string(),
            probability: z.string(),
          })
        )
        .optional(), // Made optional - not always returned
    })
  ),
  usageMetadata: z
    .object({
      promptTokenCount: z.number(),
      candidatesTokenCount: z.number(),
      totalTokenCount: z.number(),
    })
    .optional(),
  modelVersion: z.string().optional(),
  responseId: z.string().optional(),
});

// ============================================================================
// Error Classes
// ============================================================================

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = "GeminiAPIError";
  }
}

export class GeminiRateLimitError extends GeminiAPIError {
  constructor(retryAfter?: number) {
    super("Rate limit exceeded. Please try again later.");
    this.name = "GeminiRateLimitError";
    this.statusCode = 429;
    this.errorCode = "RATE_LIMIT_EXCEEDED";
  }
}

export class GeminiContentFilterError extends GeminiAPIError {
  constructor() {
    super("Content was blocked by safety filters.");
    this.name = "GeminiContentFilterError";
    this.statusCode = 400;
    this.errorCode = "CONTENT_FILTERED";
  }
}

// ============================================================================
// Main Gemini Service Class
// ============================================================================

class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  private defaultModel = "gemini-1.5-flash";
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 4000; // 4 seconds (15 RPM = 4s intervals)

  constructor() {
    this.initializeApiKey();
  }

  // ============================================================================
  // Initialization and Authentication
  // ============================================================================

  private async initializeApiKey() {
    try {
      // Try to get from secure storage first
      const secureKey = await SecureStore.getItemAsync("GEMINI_API_KEY");
      if (secureKey) {
        this.apiKey = secureKey;
        return;
      }

      // Fallback to AsyncStorage (less secure but more compatible)
      const storageKey = await AsyncStorage.getItem("GEMINI_API_KEY");
      if (storageKey) {
        this.apiKey = storageKey;
        // Migrate to secure storage
        await this.setApiKey(storageKey);
      }
    } catch (error) {
      console.warn("Failed to load Gemini API key from storage:", error);
    }
  }

  /**
   * Set the Gemini API key securely
   */
  async setApiKey(apiKey: string): Promise<void> {
    try {
      this.apiKey = apiKey;

      // Store in secure storage
      await SecureStore.setItemAsync("GEMINI_API_KEY", apiKey);

      // Remove from less secure AsyncStorage if it exists
      await AsyncStorage.removeItem("GEMINI_API_KEY");

      console.log("✅ Gemini API key stored securely");
    } catch (error) {
      console.error("❌ Failed to store Gemini API key:", error);
      throw new GeminiAPIError("Failed to store API key securely");
    }
  }

  /**
   * Clear the stored API key
   */
  async clearApiKey(): Promise<void> {
    try {
      this.apiKey = null;
      await SecureStore.deleteItemAsync("GEMINI_API_KEY");
      await AsyncStorage.removeItem("GEMINI_API_KEY");
      console.log("🗑️ Gemini API key cleared");
    } catch (error) {
      console.warn("Failed to clear Gemini API key:", error);
    }
  }

  /**
   * Check if API key is available
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  // ============================================================================
  // Rate Limiting and Request Management
  // ============================================================================

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  private async addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          await this.waitForRateLimit();
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
      }
    }

    this.isProcessingQueue = false;
  }

  // ============================================================================
  // Core API Methods
  // ============================================================================

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new GeminiAPIError("Gemini API key not configured");
    }

    const url = `${this.baseUrl}/${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      console.log(
        `🤖 Gemini API Request: ${options.method || "GET"} ${endpoint}`
      );

      const response = await fetch(`${url}?key=${this.apiKey}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data = await response.json();
      console.log("✅ Gemini API Response received");

      // Log response structure in development for debugging
      if (__DEV__) {
        console.log("🔍 Response structure preview:", {
          hasCandidates: !!data.candidates,
          candidatesCount: data.candidates?.length || 0,
          hasUsageMetadata: !!data.usageMetadata,
          modelVersion: data.modelVersion,
        });
      }

      return data;
    } catch (error) {
      // Only log non-rate-limit errors to reduce console noise
      if (!(error instanceof GeminiRateLimitError)) {
        console.error("❌ Gemini API Error:", error);
      }

      if (error instanceof GeminiAPIError) {
        throw error;
      }

      throw new GeminiAPIError(
        error instanceof Error ? error.message : "Unknown API error"
      );
    }
  }

  private async handleApiError(response: Response): Promise<void> {
    const errorData = await response.json().catch(() => ({
      error: { message: `HTTP ${response.status}: ${response.statusText}` },
    }));

    const errorMessage = errorData.error?.message || "Unknown API error";

    switch (response.status) {
      case 429:
        // Don't log rate limit errors to console to reduce noise
        throw new GeminiRateLimitError();
      case 400:
        if (errorMessage.includes("SAFETY")) {
          throw new GeminiContentFilterError();
        }
        throw new GeminiAPIError(errorMessage, 400);
      case 401:
        throw new GeminiAPIError("Invalid API key", 401, "INVALID_API_KEY");
      case 403:
        throw new GeminiAPIError("API access forbidden", 403, "FORBIDDEN");
      default:
        throw new GeminiAPIError(errorMessage, response.status);
    }
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  /**
   * Generate text from a prompt
   */
  async generateText(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxOutputTokens?: number;
    } = {}
  ): Promise<string> {
    const model = options.model || this.defaultModel;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
      },
    };

    return this.addToQueue(async () => {
      const response = await this.makeRequest<GeminiResponse>(
        `${model}:generateContent`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      // Validate response with enhanced error handling
      try {
        const validatedResponse = GeminiResponseSchema.parse(response);

        if (!validatedResponse.candidates[0]?.content?.parts[0]?.text) {
          throw new GeminiAPIError("No content generated in response");
        }

        console.log("✅ Gemini response validated successfully");
        return validatedResponse.candidates[0].content.parts[0].text;
      } catch (validationError) {
        // Enhanced validation error handling
        console.error("❌ Gemini response validation failed:", validationError);
        console.error(
          "🔍 Raw response structure:",
          JSON.stringify(response, null, 2)
        );

        // Try to extract text even if validation fails (fallback)
        if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.warn(
            "⚠️ Using fallback text extraction despite validation failure"
          );
          return response.candidates[0].content.parts[0].text;
        }

        throw new GeminiAPIError(
          `Response validation failed: ${
            validationError instanceof Error
              ? validationError.message
              : "Unknown validation error"
          }`
        );
      }
    });
  }

  /**
   * Start a chat session
   */
  createChatSession(history: GeminiMessage[] = []): GeminiChatSession {
    return {
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };
  }

  /**
   * Send a message in a chat session
   */
  async sendMessage(
    session: GeminiChatSession,
    message: string,
    options: { model?: string } = {}
  ): Promise<string> {
    const model = options.model || this.defaultModel;

    const userMessage: GeminiMessage = {
      role: "user",
      parts: [{ text: message }],
    };

    const requestBody = {
      contents: [...session.history, userMessage],
      generationConfig: session.generationConfig,
    };

    return this.addToQueue(async () => {
      const response = await this.makeRequest<GeminiResponse>(
        `${model}:generateContent`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      const validatedResponse = GeminiResponseSchema.parse(response);

      if (!validatedResponse.candidates[0]?.content?.parts[0]?.text) {
        throw new GeminiAPIError("No content generated");
      }

      const responseText =
        validatedResponse.candidates[0].content.parts[0].text;

      // Update session history
      session.history.push(userMessage);
      session.history.push({
        role: "model",
        parts: [{ text: responseText }],
      });

      return responseText;
    });
  }

  /**
   * Analyze an image with optional text prompt
   */
  async analyzeImage(
    imageData: string, // base64 encoded
    prompt: string = "Describe this image",
    mimeType: string = "image/jpeg",
    options: { model?: string } = {}
  ): Promise<string> {
    const model = options.model || this.defaultModel;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    };

    return this.addToQueue(async () => {
      const response = await this.makeRequest<GeminiResponse>(
        `${model}:generateContent`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      const validatedResponse = GeminiResponseSchema.parse(response);

      if (!validatedResponse.candidates[0]?.content?.parts[0]?.text) {
        throw new GeminiAPIError("No content generated");
      }

      return validatedResponse.candidates[0].content.parts[0].text;
    });
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    return this.addToQueue(async () => {
      const response = await this.makeRequest<any>("", {
        method: "GET",
      });

      return response.models?.map((model: any) => model.name) || [];
    });
  }

  // ============================================================================
  // Medical-Specific Helper Methods
  // ============================================================================

  /**
   * Analyze medication information from text
   */
  async analyzeMedicationText(text: string): Promise<string> {
    const prompt = `
Analyze the following text for medication information. Extract and organize any medication details including:
- Medication names (brand and generic)
- Dosages and strengths
- Frequencies and administration instructions
- Prescriber information
- Pharmacy information
- Any warnings or special instructions

Text to analyze: "${text}"

Please provide a structured response with clear sections for each medication found.
`;

    return this.generateText(prompt, { temperature: 0.3 });
  }

  /**
   * Check for potential drug interactions
   */
  async checkDrugInteractions(medications: string[]): Promise<string> {
    const medicationList = medications.join(", ");
    const prompt = `
As a clinical decision support tool, analyze the following medications for potential drug interactions:

Medications: ${medicationList}

Please provide:
1. Any significant drug-drug interactions
2. Severity levels (mild, moderate, severe)
3. Clinical recommendations
4. Monitoring suggestions

Important: This is for informational purposes only and should not replace professional medical advice.
`;

    return this.generateText(prompt, { temperature: 0.2 });
  }

  /**
   * Simplify medical documentation
   */
  async simplifyMedicalDocument(documentText: string): Promise<string> {
    const prompt = `
Please simplify the following medical document into plain, patient-friendly language while preserving all important medical information:

Original text: "${documentText}"

Guidelines:
- Use simple, everyday language
- Explain medical terms in parentheses
- Maintain accuracy of all medical information
- Organize information clearly with sections
- Keep it comprehensive but easy to understand
`;

    return this.generateText(prompt, { temperature: 0.4 });
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
