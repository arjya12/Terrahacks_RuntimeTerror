/**
 * API service for MedReconcile Pro
 * UPDATED: Graceful fallbacks since backend is removed
 * Auth handled by Clerk+Supabase, other features return mock data
 */

// Backend removed - using fallback responses
const BACKEND_REMOVED = true;

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
  };
  message: string;
}

interface Medication {
  id: string;
  user_id: string;
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  route?: string;
  prescriber: string;
  pharmacy: string;
  status: string;
  source: string;
  confidence?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private authToken: string | null = null;

  constructor() {
    // Backend removed - constructor simplified
  }

  /**
   * Set the authentication token for API requests
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * UPDATED: Return graceful fallbacks since backend is removed
   */
  private async makeRequest<T = unknown>(
    endpoint: string,
    _options: RequestInit = {}
  ): Promise<T> {
    if (BACKEND_REMOVED) {
      console.log(`🚫 Backend removed - returning fallback for: ${endpoint}`);

      // Return appropriate fallback responses based on endpoint
      const fallbackData = this.getFallbackResponse(endpoint);
      return fallbackData as T;
    }

    // This code is unreachable now but kept for future reference
    throw new Error("Backend removed");
  }

  /**
   * Get appropriate fallback responses for different endpoints
   */
  private getFallbackResponse(endpoint: string): unknown {
    console.log(`📋 Generating fallback for endpoint: ${endpoint}`);

    // Auth endpoints - return basic success responses
    if (endpoint.includes("/auth/status")) {
      return {
        authenticated: true,
        message: "Using Clerk authentication",
        user: {
          id: "clerk-user",
          email: "user@example.com",
          role: "patient", // Default to patient role
          first_name: "User",
          last_name: "Name",
          is_verified: true,
        },
      };
    }

    if (endpoint.includes("/auth/profile") || endpoint.includes("/users/me")) {
      return {
        id: "clerk-user",
        email: "user@example.com",
        role: "patient",
        first_name: "User",
        last_name: "Name",
        is_verified: true,
      };
    }

    if (endpoint.includes("/users/role-info")) {
      return {
        role: "patient",
        permissions: ["read_medications", "write_medications"],
      };
    }

    if (endpoint.includes("/users/providers")) {
      return [];
    }

    // Medication endpoints - return empty arrays/success responses
    if (endpoint.includes("/medications")) {
      if (endpoint.includes("/interactions")) {
        return { interactions: [], warnings: [] };
      }
      if (endpoint.includes("/scan")) {
        return {
          success: false,
          message: "Medication scanning requires backend API",
        };
      }
      return []; // Empty medications list
    }

    // Health check
    if (endpoint.includes("/health")) {
      return {
        status: "backend_removed",
        message: "Using Clerk+Supabase authentication only",
      };
    }

    // Default fallback
    return {
      success: true,
      message: "Backend removed - using fallback response",
      data: null,
    };
  }

  // ============================================================================
  // Authentication API
  // ============================================================================

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<AuthStatus> {
    return this.makeRequest<AuthStatus>("/auth/status");
  }

  /**
   * Get authenticated user profile
   */
  async getUserProfile(): Promise<AuthStatus> {
    return this.makeRequest("/auth/profile");
  }

  /**
   * Validate authentication token
   */
  async validateToken(): Promise<ApiResponse> {
    return this.makeRequest("/auth/validate-token", {
      method: "POST",
    });
  }

  /**
   * Register a new user (called after Clerk signup)
   */
  async registerUser(userData: {
    clerk_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/auth/register-user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // ============================================================================
  // User Management API
  // ============================================================================

  /**
   * Get current user's detailed profile
   */
  async getCurrentUserProfile(): Promise<Record<string, unknown>> {
    return this.makeRequest("/users/me");
  }

  /**
   * Update current user's profile
   */
  async updateUserProfile(
    updateData: Record<string, unknown>
  ): Promise<ApiResponse> {
    return this.makeRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Get user role information
   */
  async getUserRoleInfo(): Promise<Record<string, unknown>> {
    return this.makeRequest("/users/role-info");
  }

  /**
   * Get list of verified providers
   */
  async getProviders(): Promise<Record<string, unknown>[]> {
    return this.makeRequest("/users/providers");
  }

  // ============================================================================
  // Medication Management API
  // ============================================================================

  /**
   * Get all medications for the current user
   */
  async getMedications(statusFilter?: string): Promise<Medication[]> {
    const endpoint = statusFilter
      ? `/medications?status_filter=${statusFilter}`
      : "/medications";
    return this.makeRequest<Medication[]>(endpoint);
  }

  /**
   * Get a specific medication by ID
   */
  async getMedication(medicationId: string): Promise<Medication> {
    return this.makeRequest<Medication>(`/medications/${medicationId}`);
  }

  /**
   * Create a new medication
   */
  async createMedication(
    medicationData: Omit<Medication, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<Medication>> {
    return this.makeRequest("/medications", {
      method: "POST",
      body: JSON.stringify(medicationData),
    });
  }

  /**
   * Update a medication
   */
  async updateMedication(
    medicationId: string,
    updateData: Partial<Medication>
  ): Promise<ApiResponse<Medication>> {
    return this.makeRequest(`/medications/${medicationId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Delete a medication
   */
  async deleteMedication(medicationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/medications/${medicationId}`, {
      method: "DELETE",
    });
  }

  /**
   * Upload and scan a pill bottle image
   */
  async scanMedicationBottle(imageFile: File | Blob): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return this.makeRequest("/medications/scan", {
      method: "POST",
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
      body: formData,
    });
  }

  /**
   * Check drug interactions for a medication
   */
  async checkMedicationInteractions(
    medicationId: string
  ): Promise<Record<string, unknown>> {
    return this.makeRequest(`/medications/${medicationId}/interactions`);
  }

  /**
   * Check drug interactions for all user medications
   */
  async checkAllMedicationInteractions(): Promise<Record<string, unknown>> {
    return this.makeRequest("/medications/interactions/check-all");
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  /**
   * Health check - return backend removed status
   */
  async healthCheck(): Promise<Record<string, unknown>> {
    return {
      status: "backend_removed",
      message: "Backend removed - using Clerk+Supabase authentication only",
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
