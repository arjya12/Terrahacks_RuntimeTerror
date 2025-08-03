/**
 * API service for MedReconcile Pro
 * Handles all backend API communication
 */

const API_BASE_URL = __DEV__
  ? "http://localhost:8000/api/v1"
  : "https://your-production-api.com/api/v1";

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
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
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
   * Make an authenticated API request
   */
  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add authentication token if available
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    try {
      console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.error ||
            errorData.detail ||
            `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);

      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
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
   * Health check - test if API is responding
   */
  async healthCheck(): Promise<Record<string, unknown>> {
    return fetch(`${this.baseUrl.replace("/api/v1", "")}/health`)
      .then((response) => response.json())
      .catch((error) => {
        console.warn("API health check failed:", error);
        return { status: "unavailable", error: error.message };
      });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
