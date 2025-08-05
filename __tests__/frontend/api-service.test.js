/**
 * Frontend API Service Tests
 * Tests the API service layer that handles backend communication
 */

import apiService from "../../services/api";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Service Tests", () => {
  const mockToken = "test-jwt-token";

  beforeEach(() => {
    fetch.mockClear();
    apiService.clearAuthToken();
  });

  describe("Authentication Token Management", () => {
    test("should set and use authentication token", () => {
      apiService.setAuthToken(mockToken);
      expect(apiService.authToken).toBe(mockToken);
    });

    test("should clear authentication token", () => {
      apiService.setAuthToken(mockToken);
      apiService.clearAuthToken();
      expect(apiService.authToken).toBe(null);
    });

    test("should include auth token in requests", async () => {
      apiService.setAuthToken(mockToken);

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ authenticated: true }),
      });

      await apiService.getAuthStatus();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/status"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });
  });

  describe("Authentication API Methods", () => {
    beforeEach(() => {
      apiService.setAuthToken(mockToken);
    });

    test("should get authentication status", async () => {
      const mockResponse = {
        authenticated: true,
        user: {
          id: "user123",
          email: "test@example.com",
          role: "patient",
        },
        message: "Authenticated",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.getAuthStatus();

      expect(result.authenticated).toBe(true);
      expect(result.user.role).toBe("patient");
    });

    test("should register new user", async () => {
      const userData = {
        clerk_id: "clerk_123",
        email: "newuser@example.com",
        first_name: "John",
        last_name: "Doe",
        role: "patient",
      };

      const mockResponse = {
        success: true,
        message: "User registered successfully",
        data: { id: "user456", ...userData },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.registerUser(userData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register-user"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(userData),
        })
      );
    });

    test("should validate token", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      });

      await apiService.validateToken();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/validate-token"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("User Management API Methods", () => {
    beforeEach(() => {
      apiService.setAuthToken(mockToken);
    });

    test("should get current user profile", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "patient",
        first_name: "John",
        last_name: "Doe",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await apiService.getCurrentUserProfile();

      expect(result.email).toBe("test@example.com");
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/me"),
        expect.any(Object)
      );
    });

    test("should update user profile", async () => {
      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await apiService.updateUserProfile(updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/me"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
    });

    test("should get user role info", async () => {
      const mockRoleInfo = {
        role: "provider",
        permissions: ["read:patients"],
        provider_details: {
          npi_number: "1234567890",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoleInfo),
      });

      const result = await apiService.getUserRoleInfo();

      expect(result.role).toBe("provider");
    });
  });

  describe("Medication Management API Methods", () => {
    beforeEach(() => {
      apiService.setAuthToken(mockToken);
    });

    test("should get all medications", async () => {
      const mockMedications = [
        {
          id: "med1",
          name: "Aspirin",
          dosage: "81mg",
          frequency: "Once daily",
        },
        {
          id: "med2",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMedications),
      });

      const result = await apiService.getMedications();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Aspirin");
    });

    test("should get medications with status filter", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await apiService.getMedications("active");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/medications?status_filter=active"),
        expect.any(Object)
      );
    });

    test("should get specific medication", async () => {
      const medicationId = "med123";
      const mockMedication = {
        id: medicationId,
        name: "Metformin",
        dosage: "500mg",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMedication),
      });

      const result = await apiService.getMedication(medicationId);

      expect(result.id).toBe(medicationId);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/medications/${medicationId}`),
        expect.any(Object)
      );
    });

    test("should create new medication", async () => {
      const medicationData = {
        name: "Hydrochlorothiazide",
        dosage: "25mg",
        frequency: "Once daily",
        prescriber: "Dr. Smith",
      };

      const mockResponse = {
        success: true,
        data: { id: "med456", ...medicationData },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.createMedication(medicationData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/medications"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(medicationData),
        })
      );
    });

    test("should update medication", async () => {
      const medicationId = "med123";
      const updateData = {
        dosage: "50mg",
        notes: "Increased dosage",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await apiService.updateMedication(medicationId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/medications/${medicationId}`),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
    });

    test("should delete medication", async () => {
      const medicationId = "med123";

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await apiService.deleteMedication(medicationId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/medications/${medicationId}`),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    test("should scan medication bottle", async () => {
      const mockFormData = new FormData();
      const mockResponse = {
        success: true,
        extracted_data: {
          name: "Atorvastatin",
          dosage: "20mg",
          confidence: 0.92,
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.scanMedicationBottle(mockFormData);

      expect(result.success).toBe(true);
      expect(result.extracted_data.name).toBe("Atorvastatin");
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/medications/scan"),
        expect.objectContaining({
          method: "POST",
          body: mockFormData,
        })
      );
    });

    test("should check medication interactions", async () => {
      const medicationId = "med123";
      const mockInteractions = {
        interactions: [
          {
            drug1: "Aspirin",
            drug2: "Warfarin",
            severity: "major",
            description: "Increased bleeding risk",
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInteractions),
      });

      const result = await apiService.checkMedicationInteractions(medicationId);

      expect(result.interactions).toHaveLength(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/medications/${medicationId}/interactions`),
        expect.any(Object)
      );
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      apiService.setAuthToken(mockToken);
    });

    test("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(apiService.getMedications()).rejects.toThrow(
        "Network error"
      );
    });

    test("should handle HTTP errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      });

      await expect(apiService.getMedication("nonexistent")).rejects.toThrow();
    });

    test("should handle authentication errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "Unauthorized" }),
      });

      await expect(apiService.getAuthStatus()).rejects.toThrow();
    });

    test("should handle validation errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            detail: [{ loc: ["name"], msg: "field required" }],
          }),
      });

      await expect(apiService.createMedication({})).rejects.toThrow();
    });

    test("should handle malformed JSON responses", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(apiService.getMedications()).rejects.toThrow();
    });
  });

  describe("Health Check", () => {
    test("should perform health check", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "healthy" }),
      });

      const result = await apiService.healthCheck();

      expect(result.status).toBe("healthy");
    });

    test("should handle health check failure", async () => {
      fetch.mockRejectedValueOnce(new Error("Service unavailable"));

      const result = await apiService.healthCheck();

      expect(result.status).toBe("unavailable");
      expect(result.error).toBe("Service unavailable");
    });
  });
});
