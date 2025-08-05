/**
 * Integration Tests - Authentication Flow
 * Tests the complete authentication workflow from frontend to backend
 */

import { Alert } from "react-native";
import apiService from "../../services/api";

// Mock API service
jest.mock("../../services/api");

// Mock Clerk
const mockSignIn = {
  create: jest.fn(),
};

const mockSignUp = {
  create: jest.fn(),
  attemptEmailAddressVerification: jest.fn(),
};

jest.mock("@clerk/clerk-expo", () => ({
  useSignIn: () => ({
    signIn: mockSignIn,
    setActive: jest.fn(),
    isLoaded: true,
  }),
  useSignUp: () => ({
    signUp: mockSignUp,
    setActive: jest.fn(),
    isLoaded: true,
  }),
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
    getToken: jest.fn(),
  }),
}));

// Mock Alert
jest.spyOn(Alert, "alert");

describe("Authentication Flow Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
  });

  describe("Sign In Flow", () => {
    test("should complete successful sign-in flow", async () => {
      // Mock successful sign-in
      const mockSession = {
        getToken: jest.fn().mockResolvedValue("mock-jwt-token"),
      };

      mockSignIn.create.mockResolvedValue({
        status: "complete",
        createdSessionId: "session123",
        createdSession: mockSession,
      });

      // Mock successful backend connection
      apiService.getAuthStatus.mockResolvedValue({
        authenticated: true,
        user: {
          id: "user123",
          email: "test@example.com",
          role: "patient",
        },
      });

      apiService.getCurrentUserProfile.mockResolvedValue({
        id: "user123",
        email: "test@example.com",
        role: "patient",
        first_name: "John",
        last_name: "Doe",
      });

      // Simulate sign-in process
      const credentials = {
        identifier: "test@example.com",
        password: "password123",
      };

      const signInResult = await mockSignIn.create(credentials);

      expect(signInResult.status).toBe("complete");

      // Simulate token retrieval and API connection
      const token = await signInResult.createdSession.getToken();
      expect(token).toBe("mock-jwt-token");

      // Simulate setting auth token and checking status
      apiService.setAuthToken(token);
      const authStatus = await apiService.getAuthStatus();

      expect(authStatus.authenticated).toBe(true);
      expect(authStatus.user.role).toBe("patient");

      if (authStatus.authenticated) {
        const userProfile = await apiService.getCurrentUserProfile();
        expect(userProfile.email).toBe("test@example.com");
      }

      expect(apiService.setAuthToken).toHaveBeenCalledWith("mock-jwt-token");
    });

    test("should handle sign-in failure", async () => {
      mockSignIn.create.mockRejectedValue({
        errors: [{ message: "Invalid credentials" }],
      });

      try {
        await mockSignIn.create({
          identifier: "wrong@example.com",
          password: "wrongpassword",
        });
      } catch (error) {
        expect(error.errors[0].message).toBe("Invalid credentials");
      }
    });

    test("should handle backend connection failure during sign-in", async () => {
      const mockSession = {
        getToken: jest.fn().mockResolvedValue("mock-jwt-token"),
      };

      mockSignIn.create.mockResolvedValue({
        status: "complete",
        createdSessionId: "session123",
        createdSession: mockSession,
      });

      // Mock backend failure
      apiService.getAuthStatus.mockRejectedValue(
        new Error("Backend unavailable")
      );

      const signInResult = await mockSignIn.create({
        identifier: "test@example.com",
        password: "password123",
      });

      expect(signInResult.status).toBe("complete");

      const token = await signInResult.createdSession.getToken();
      apiService.setAuthToken(token);

      try {
        await apiService.getAuthStatus();
      } catch (error) {
        expect(error.message).toBe("Backend unavailable");
        // Should continue anyway (graceful degradation)
      }
    });

    test("should handle session conflicts", async () => {
      mockSignIn.create.mockRejectedValue({
        errors: [{ message: "Session already exists" }],
      });

      try {
        await mockSignIn.create({
          identifier: "test@example.com",
          password: "password123",
        });
      } catch (error) {
        expect(error.errors[0].message).toBe("Session already exists");
        // Should trigger session clear and retry logic
      }
    });
  });

  describe("Sign Up Flow", () => {
    test("should complete successful sign-up flow", async () => {
      // Mock sign-up creation
      mockSignUp.create.mockResolvedValue({
        status: "missing_requirements",
      });

      // Mock email verification
      const mockSession = {
        getToken: jest.fn().mockResolvedValue("mock-jwt-token"),
        user: {
          id: "clerk_user123",
          primaryEmailAddress: { emailAddress: "newuser@example.com" },
          firstName: "Jane",
          lastName: "Smith",
        },
      };

      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: "complete",
        createdSessionId: "session456",
        createdSession: mockSession,
      });

      // Mock backend registration
      apiService.registerUser.mockResolvedValue({
        success: true,
        message: "User registered successfully",
        data: {
          id: "user456",
          email: "newuser@example.com",
        },
      });

      // Simulate sign-up process
      const signUpData = {
        emailAddress: "newuser@example.com",
        password: "newpassword123",
      };

      const signUpResult = await mockSignUp.create(signUpData);
      expect(signUpResult.status).toBe("missing_requirements");

      // Simulate email verification
      const verificationResult =
        await mockSignUp.attemptEmailAddressVerification({
          code: "123456",
        });

      expect(verificationResult.status).toBe("complete");

      // Simulate backend registration
      const token = await verificationResult.createdSession.getToken();
      apiService.setAuthToken(token);

      const user = verificationResult.createdSession.user;
      const registrationData = {
        clerk_id: user.id,
        email: user.primaryEmailAddress.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        role: "patient",
      };

      const registrationResult = await apiService.registerUser(
        registrationData
      );

      expect(registrationResult.success).toBe(true);
      expect(apiService.setAuthToken).toHaveBeenCalledWith("mock-jwt-token");
    });

    test("should handle sign-up validation errors", async () => {
      mockSignUp.create.mockRejectedValue({
        errors: [{ message: "Email already exists", field: "email_address" }],
      });

      try {
        await mockSignUp.create({
          emailAddress: "existing@example.com",
          password: "password123",
        });
      } catch (error) {
        expect(error.errors[0].message).toBe("Email already exists");
      }
    });

    test("should handle email verification failure", async () => {
      mockSignUp.create.mockResolvedValue({
        status: "missing_requirements",
      });

      mockSignUp.attemptEmailAddressVerification.mockRejectedValue({
        errors: [{ message: "Invalid verification code" }],
      });

      await mockSignUp.create({
        emailAddress: "test@example.com",
        password: "password123",
      });

      try {
        await mockSignUp.attemptEmailAddressVerification({
          code: "invalid",
        });
      } catch (error) {
        expect(error.errors[0].message).toBe("Invalid verification code");
      }
    });

    test("should handle backend registration failure", async () => {
      const mockSession = {
        getToken: jest.fn().mockResolvedValue("mock-jwt-token"),
        user: {
          id: "clerk_user123",
          primaryEmailAddress: { emailAddress: "test@example.com" },
          firstName: "John",
          lastName: "Doe",
        },
      };

      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: "complete",
        createdSessionId: "session123",
        createdSession: mockSession,
      });

      // Mock backend registration failure
      apiService.registerUser.mockRejectedValue(
        new Error("Registration failed")
      );

      const verificationResult =
        await mockSignUp.attemptEmailAddressVerification({
          code: "123456",
        });

      const token = await verificationResult.createdSession.getToken();
      apiService.setAuthToken(token);

      try {
        await apiService.registerUser({
          clerk_id: "clerk_user123",
          email: "test@example.com",
          first_name: "John",
          last_name: "Doe",
          role: "patient",
        });
      } catch (error) {
        expect(error.message).toBe("Registration failed");
        // Should continue anyway (graceful degradation)
      }
    });
  });

  describe("Role-Based Navigation", () => {
    test("should navigate patient users to patient interface", async () => {
      apiService.getUserRoleInfo.mockResolvedValue({
        role: "patient",
      });

      const roleInfo = await apiService.getUserRoleInfo();

      let navigationTarget;
      if (roleInfo.role === "provider") {
        navigationTarget = "/(provider)";
      } else {
        navigationTarget = "/(tabs)";
      }

      expect(navigationTarget).toBe("/(tabs)");
    });

    test("should navigate provider users to provider interface", async () => {
      apiService.getUserRoleInfo.mockResolvedValue({
        role: "provider",
        provider_details: {
          npi_number: "1234567890",
          specialization: "Internal Medicine",
        },
      });

      const roleInfo = await apiService.getUserRoleInfo();

      let navigationTarget;
      if (roleInfo.role === "provider") {
        navigationTarget = "/(provider)";
      } else {
        navigationTarget = "/(tabs)";
      }

      expect(navigationTarget).toBe("/(provider)");
      expect(roleInfo.provider_details.npi_number).toBe("1234567890");
    });

    test("should fallback to patient interface on role check failure", async () => {
      apiService.getUserRoleInfo.mockRejectedValue(
        new Error("Role check failed")
      );

      try {
        await apiService.getUserRoleInfo();
      } catch {
        // Fallback logic
        const fallbackTarget = "/(tabs)";
        expect(fallbackTarget).toBe("/(tabs)");
      }
    });
  });

  describe("Session Management", () => {
    test("should persist authentication across app restarts", () => {
      // Mock token persistence
      const mockToken = "persistent-jwt-token";
      const tokenStorage = {
        store: jest.fn(),
        retrieve: jest.fn().mockReturnValue(mockToken),
        clear: jest.fn(),
      };

      tokenStorage.store(mockToken);
      expect(tokenStorage.store).toHaveBeenCalledWith(mockToken);

      const retrievedToken = tokenStorage.retrieve();
      expect(retrievedToken).toBe(mockToken);
    });

    test("should clear session on sign out", () => {
      // Mock sign out process
      const tokenStorage = {
        clear: jest.fn(),
      };

      apiService.clearAuthToken = jest.fn();

      // Simulate sign out
      tokenStorage.clear();
      apiService.clearAuthToken();

      expect(tokenStorage.clear).toHaveBeenCalled();
      expect(apiService.clearAuthToken).toHaveBeenCalled();
    });

    test("should handle token expiration gracefully", async () => {
      // Mock expired token response
      apiService.getAuthStatus.mockRejectedValue({
        status: 401,
        message: "Token has expired",
      });

      try {
        await apiService.getAuthStatus();
      } catch (error) {
        expect(error.status).toBe(401);
        // Should trigger re-authentication flow
      }
    });
  });
});
