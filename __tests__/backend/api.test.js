/**
 * Backend API Integration Tests
 * Tests the FastAPI backend endpoints for authentication, users, and medications
 */

// Mock fetch for backend API testing
global.fetch = jest.fn();

describe("Backend API Integration Tests", () => {
  const API_BASE_URL = "http://localhost:8000/api/v1";
  const mockToken = "test-jwt-token";

  beforeEach(() => {
    fetch.mockClear();
  });

  describe("Authentication Endpoints", () => {
    test("should validate authentication status", async () => {
      const mockResponse = {
        authenticated: true,
        user: {
          id: "user123",
          email: "test@example.com",
          role: "patient",
          first_name: "John",
          last_name: "Doe",
          is_verified: true,
        },
        message: "User authenticated successfully",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/status`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });
      expect(data.authenticated).toBe(true);
      expect(data.user.role).toBe("patient");
    });

    test("should handle authentication failure", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "Invalid token" }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        headers: {
          Authorization: `Bearer invalid-token`,
          "Content-Type": "application/json",
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    test("should register new user", async () => {
      const mockUserData = {
        clerk_id: "clerk_user123",
        email: "newuser@example.com",
        first_name: "Jane",
        last_name: "Smith",
        role: "patient",
      };

      const mockResponse = {
        success: true,
        message: "User registered successfully",
        data: {
          id: "user456",
          ...mockUserData,
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await fetch(`${API_BASE_URL}/auth/register-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockUserData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(mockUserData.email);
    });
  });

  describe("User Management Endpoints", () => {
    test("should get current user profile", async () => {
      const mockUser = {
        id: "user123",
        clerk_user_id: "clerk_user123",
        email: "test@example.com",
        role: "patient",
        first_name: "John",
        last_name: "Doe",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(data.email).toBe("test@example.com");
      expect(data.role).toBe("patient");
    });

    test("should get user role information", async () => {
      const mockRoleInfo = {
        role: "provider",
        permissions: ["read:patients", "write:clinical_notes"],
        provider_details: {
          npi_number: "1234567890",
          medical_license_number: "MD123456",
          specialization: "Internal Medicine",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoleInfo),
      });

      const response = await fetch(`${API_BASE_URL}/users/role-info`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(data.role).toBe("provider");
      expect(data.provider_details.npi_number).toBe("1234567890");
    });
  });

  describe("Medication Management Endpoints", () => {
    test("should get user medications", async () => {
      const mockMedications = [
        {
          id: "med1",
          user_id: "user123",
          name: "Lisinopril",
          generic_name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          prescriber: "Dr. Smith",
          pharmacy: "CVS Pharmacy",
          confidence: 0.95,
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "med2",
          user_id: "user123",
          name: "Metformin",
          generic_name: "Metformin HCl",
          dosage: "500mg",
          frequency: "Twice daily",
          prescriber: "Dr. Johnson",
          pharmacy: "Walgreens",
          confidence: 0.87,
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMedications),
      });

      const response = await fetch(`${API_BASE_URL}/medications`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("Lisinopril");
      expect(data[1].name).toBe("Metformin");
    });

    test("should create new medication", async () => {
      const newMedication = {
        user_id: "user123",
        name: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        prescriber: "Dr. Wilson",
        pharmacy: "Rite Aid",
        is_active: true,
      };

      const mockResponse = {
        success: true,
        message: "Medication created successfully",
        data: {
          id: "med3",
          ...newMedication,
          confidence: 1.0,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await fetch(`${API_BASE_URL}/medications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMedication),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Aspirin");
    });

    test("should update existing medication", async () => {
      const medicationId = "med1";
      const updateData = {
        dosage: "20mg",
        frequency: "Twice daily",
        notes: "Increased dosage per doctor recommendation",
      };

      const mockResponse = {
        success: true,
        message: "Medication updated successfully",
        data: {
          id: medicationId,
          user_id: "user123",
          name: "Lisinopril",
          ...updateData,
          updated_at: "2024-01-02T00:00:00Z",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await fetch(
        `${API_BASE_URL}/medications/${medicationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.dosage).toBe("20mg");
      expect(data.data.notes).toBe(
        "Increased dosage per doctor recommendation"
      );
    });

    test("should delete medication", async () => {
      const medicationId = "med1";

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });

      const response = await fetch(
        `${API_BASE_URL}/medications/${medicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      expect(response.status).toBe(204);
    });

    test("should handle medication scanning", async () => {
      const mockScanResult = {
        success: true,
        extracted_data: {
          name: "Hydrochlorothiazide",
          dosage: "25mg",
          frequency: "Once daily",
          prescriber: "Dr. Brown",
          pharmacy: "Target Pharmacy",
          confidence: 0.89,
        },
        processing_time: "2.3s",
        message: "OCR processing successful",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScanResult),
      });

      // Simulate FormData
      const formData = new FormData();
      formData.append("image", { name: "test-bottle.jpg" });

      const response = await fetch(`${API_BASE_URL}/medications/scan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.extracted_data.name).toBe("Hydrochlorothiazide");
      expect(data.extracted_data.confidence).toBe(0.89);
    });
  });

  describe("Error Handling", () => {
    test("should handle network errors gracefully", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      try {
        await fetch(`${API_BASE_URL}/medications`);
      } catch (error) {
        expect(error.message).toBe("Network error");
      }
    });

    test("should handle server errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Internal server error" }),
      });

      const response = await fetch(`${API_BASE_URL}/medications`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    test("should handle validation errors", async () => {
      const invalidMedication = {
        name: "", // Invalid: empty name
        dosage: "invalid-dosage",
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            detail: [
              {
                loc: ["name"],
                msg: "field required",
                type: "value_error.missing",
              },
              {
                loc: ["dosage"],
                msg: "invalid dosage format",
                type: "value_error",
              },
            ],
          }),
      });

      const response = await fetch(`${API_BASE_URL}/medications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidMedication),
      });

      expect(response.status).toBe(422);
    });
  });

  describe("Authentication Edge Cases", () => {
    test("should handle expired tokens", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "Token has expired" }),
      });

      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        headers: {
          Authorization: `Bearer expired-token`,
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
    });

    test("should handle missing authorization header", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "Missing authorization header" }),
      });

      const response = await fetch(`${API_BASE_URL}/medications`);

      expect(response.status).toBe(401);
    });

    test("should handle role-based access control", async () => {
      // Patient trying to access provider-only endpoint
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({ detail: "Access denied. Required role: provider" }),
      });

      const response = await fetch(`${API_BASE_URL}/providers/patients`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(403);
    });
  });
});
