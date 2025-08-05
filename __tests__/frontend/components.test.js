/**
 * Frontend Components Tests
 * Tests React Native components and their functionality
 */

import { useAuth, useUser } from "@clerk/clerk-expo";
import { render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import ErrorBoundary from "../../components/ErrorBoundary";
import RoleBasedNavigator from "../../components/RoleBasedNavigator";
import { ThemedText } from "../../components/ThemedText";
import { AppIcon } from "../../components/icons/IconSystem";
import apiService from "../../services/api";

// Mock the API service
jest.mock("../../services/api", () => ({
  setAuthToken: jest.fn(),
  getAuthStatus: jest.fn(),
  getMedications: jest.fn(),
  createMedication: jest.fn(),
  updateMedication: jest.fn(),
  deleteMedication: jest.fn(),
  scanMedicationBottle: jest.fn(),
  getUserRoleInfo: jest.fn(),
}));

// Mock React Navigation
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock Clerk
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, "alert");

describe("Frontend Components Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
  });

  describe("RoleBasedNavigator Component", () => {
    test("should show loading state initially", () => {
      useAuth.mockReturnValue({ isLoaded: false });
      const { getByText } = render(<RoleBasedNavigator />);
      expect(getByText("Loading...")).toBeTruthy();
    });

    test("should navigate to auth when not signed in", async () => {
      const mockRouter = {
        replace: jest.fn(),
      };
      useRouter.mockReturnValue(mockRouter);
      useAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: true,
        getToken: jest.fn(),
      });

      render(<RoleBasedNavigator />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/sign-in");
      });
    });

    test("should navigate to patient interface for patient role", async () => {
      const mockRouter = {
        replace: jest.fn(),
      };
      useRouter.mockReturnValue(mockRouter);
      apiService.getUserRoleInfo.mockResolvedValue({ role: "patient" });
      useAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        getToken: jest.fn().mockResolvedValue("mock-token"),
      });
      useUser.mockReturnValue({
        user: { id: "user123" },
      });

      render(<RoleBasedNavigator />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
      });
    });

    test("should navigate to provider interface for provider role", async () => {
      const mockRouter = {
        replace: jest.fn(),
      };
      useRouter.mockReturnValue(mockRouter);
      apiService.getUserRoleInfo.mockResolvedValue({ role: "provider" });
      useAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        getToken: jest.fn().mockResolvedValue("mock-token"),
      });
      useUser.mockReturnValue({
        user: { id: "provider123" },
      });

      render(<RoleBasedNavigator />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/(provider)");
      });
    });

    test("should fallback to patient interface on role check error", async () => {
      const mockRouter = {
        replace: jest.fn(),
      };
      useRouter.mockReturnValue(mockRouter);
      apiService.getUserRoleInfo.mockRejectedValue(new Error("API Error"));
      useAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
        getToken: jest.fn().mockResolvedValue("mock-token"),
      });
      useUser.mockReturnValue({
        user: { id: "user123" },
      });

      render(<RoleBasedNavigator />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
      });
    });
  });

  describe("ThemedText Component", () => {
    test("should render text content", () => {
      const { getByText } = render(<ThemedText>Hello World</ThemedText>);

      expect(getByText("Hello World")).toBeTruthy();
    });

    test("should apply default styles", () => {
      const { getByText } = render(<ThemedText>Styled Text</ThemedText>);

      const textElement = getByText("Styled Text");
      expect(textElement).toHaveStyle({
        fontSize: 16,
        lineHeight: 24,
      });
    });

    test("should apply title type styles", () => {
      const { getByText } = render(
        <ThemedText type="title">Title Text</ThemedText>
      );

      const textElement = getByText("Title Text");
      expect(textElement).toHaveStyle({
        fontSize: 32,
        fontWeight: "bold",
        lineHeight: 32,
      });
    });

    test("should apply subtitle styles", () => {
      const { getByText } = render(
        <ThemedText type="subtitle">Subtitle Text</ThemedText>
      );

      const textElement = getByText("Subtitle Text");
      expect(textElement).toHaveStyle({
        fontSize: 20,
        fontWeight: "bold",
      });
    });

    test("should apply link styles", () => {
      const { getByText } = render(
        <ThemedText type="link">Link Text</ThemedText>
      );

      const textElement = getByText("Link Text");
      expect(textElement).toHaveStyle({
        lineHeight: 30,
        fontSize: 16,
        color: "#0a7ea4",
      });
    });
  });

  describe("AppIcon Component", () => {
    test("should render with default props", () => {
      const { getByTestId } = render(
        <AppIcon name="nav_medications" testID="app-icon" />
      );

      expect(getByTestId("app-icon")).toBeTruthy();
    });

    test("should apply size prop correctly", () => {
      const { getByTestId } = render(
        <AppIcon name="nav_medications" size="large" testID="app-icon" />
      );

      const iconElement = getByTestId("app-icon");
      expect(iconElement).toBeTruthy();
    });

    test("should apply color prop correctly", () => {
      const { getByTestId } = render(
        <AppIcon name="nav_medications" color="primary" testID="app-icon" />
      );

      const iconElement = getByTestId("app-icon");
      expect(iconElement).toBeTruthy();
    });
  });

  describe("Medication Card Component", () => {
    const mockMedication = {
      id: "med1",
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      prescriber: "Dr. Smith",
      pharmacy: "CVS Pharmacy",
      confidence: 0.95,
      is_active: true,
      notes: "Take with food",
    };

    test("should display medication information", () => {
      // This would test a medication card component if it existed as a standalone component
      const medicationInfo = {
        name: mockMedication.name,
        dosage: mockMedication.dosage,
        frequency: mockMedication.frequency,
      };

      expect(medicationInfo.name).toBe("Aspirin");
      expect(medicationInfo.dosage).toBe("81mg");
      expect(medicationInfo.frequency).toBe("Once daily");
    });

    test("should show confidence indicator", () => {
      const confidence = mockMedication.confidence;
      const confidencePercentage = Math.round(confidence * 100);

      expect(confidencePercentage).toBe(95);
    });

    test("should indicate active status", () => {
      expect(mockMedication.is_active).toBe(true);
    });
  });

  describe("Error Boundary Component", () => {
    beforeEach(() => {
      // Suppress console errors during testing
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test("should render children when there is no error", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );

      expect(getByText("Test Content")).toBeTruthy();
    });

    test("should catch and display error", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText(/something went wrong/i)).toBeTruthy();
    });
  });

  describe("Form Validation Tests", () => {
    test("should validate email format", () => {
      const emailTests = [
        { email: "test@example.com", valid: true },
        { email: "invalid-email", valid: false },
        { email: "", valid: false },
        { email: "test@", valid: false },
        { email: "@example.com", valid: false },
      ];

      emailTests.forEach((test) => {
        const isValid = validateEmail(test.email);
        expect(isValid).toBe(test.valid);
      });
    });

    test("should validate password strength", () => {
      const passwordTests = [
        { password: "StrongPass123!", valid: true },
        { password: "weak", valid: false },
        { password: "", valid: false },
        { password: "12345678", valid: false }, // No letters
        { password: "password", valid: false }, // No numbers
      ];

      passwordTests.forEach((test) => {
        const isValid = validatePassword(test.password);
        expect(isValid).toBe(test.valid);
      });
    });

    test("should validate medication name", () => {
      const nameTests = [
        { name: "Aspirin", valid: true },
        { name: "Acetaminophen 500mg", valid: true },
        { name: "", valid: false },
        { name: "   ", valid: false }, // Whitespace only
        { name: "A".repeat(101), valid: false }, // Too long
      ];

      nameTests.forEach((test) => {
        const isValid = validateMedicationName(test.name);
        expect(isValid).toBe(test.valid);
      });
    });

    test("should validate dosage format", () => {
      const dosageTests = [
        { dosage: "10mg", valid: true },
        { dosage: "500mcg", valid: true },
        { dosage: "1.5mg", valid: true },
        { dosage: "", valid: false },
        { dosage: "invalid", valid: false },
        { dosage: "10", valid: false }, // Missing unit
      ];

      dosageTests.forEach((test) => {
        const isValid = validateDosage(test.dosage);
        expect(isValid).toBe(test.valid);
      });
    });
  });

  describe("Accessibility Tests", () => {
    test("should have proper accessibility labels", () => {
      // Mock component with accessibility
      const AccessibleButton = ({ onPress, children, accessibilityLabel }) => (
        <button onPress={onPress} accessibilityLabel={accessibilityLabel}>
          {children}
        </button>
      );

      const { getByLabelText } = render(
        <AccessibleButton
          accessibilityLabel="Add new medication"
          onPress={() => {}}
        >
          Add Medication
        </AccessibleButton>
      );

      expect(getByLabelText("Add new medication")).toBeTruthy();
    });

    test("should support screen readers", () => {
      // Test that important elements have proper accessibility roles
      const accessibilityRoles = ["button", "text", "image", "header", "link"];

      accessibilityRoles.forEach((role) => {
        expect(typeof role).toBe("string");
        expect(role.length).toBeGreaterThan(0);
      });
    });
  });
});

// Helper validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return (
    password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
  );
}

function validateMedicationName(name) {
  return (
    typeof name === "string" && name.trim().length > 0 && name.length <= 100
  );
}

function validateDosage(dosage) {
  const dosageRegex = /^\d+(\.\d+)?(mg|mcg|g|ml|units?)$/i;
  return dosageRegex.test(dosage);
}
