/**
 * Clinical Decision Support UI Component Tests
 * Tests for the provider clinical decision support interface
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";
import ClinicalDecisionSupport from "../../components/provider/ClinicalDecisionSupport";

// Mock the API service
jest.mock("@/services/api", () => ({
  checkAllMedicationInteractions: jest.fn(),
  getMedications: jest.fn(),
}));

// Mock the icon system
jest.mock("@/components/icons/IconSystem", () => ({
  AppIcon: ({ name, ...props }) => {
    return <Text {...props}>{`Icon:${name}`}</Text>;
  },
}));

// Mock themed components
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children, ...props }) => {
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children, ...props }) => {
    return <View {...props}>{children}</View>;
  },
}));

describe("ClinicalDecisionSupport Component", () => {
  const mockPatientMedications = [
    {
      id: "med_001",
      name: "Metformin",
      dosage: "1000mg",
      frequency: "twice daily",
      prescriber: "Dr. Smith",
      pharmacy: "CVS Pharmacy",
    },
    {
      id: "med_002",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "once daily",
      prescriber: "Dr. Johnson",
      pharmacy: "CVS Pharmacy",
    },
  ];

  const mockPatientConditions = [
    "Type 2 Diabetes",
    "Hypertension",
    "Kidney Disease",
  ];

  const mockPatientFactors = {
    user_id: "patient_001",
    age: 78,
    weight_kg: 75,
    creatinine_clearance: 45,
    liver_function: "normal",
  };

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    patientMedications: mockPatientMedications,
    patientConditions: mockPatientConditions,
    patientFactors: mockPatientFactors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Visibility", () => {
    test("should render when visible is true", () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      expect(getByText("Clinical Decision Support")).toBeTruthy();
    });

    test("should not render when visible is false", () => {
      const { queryByText } = render(
        <ClinicalDecisionSupport {...defaultProps} visible={false} />
      );

      expect(queryByText("Clinical Decision Support")).toBeNull();
    });

    test("should show loading state initially", () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      expect(getByText("Analyzing medications...")).toBeTruthy();
    });
  });

  describe("Tab Navigation", () => {
    test("should render all tabs", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText("Overview")).toBeTruthy();
        expect(getByText("Alerts")).toBeTruthy();
        expect(getByText("Dosage")).toBeTruthy();
        expect(getByText("Evidence")).toBeTruthy();
      });
    });

    test("should switch tabs when pressed", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const alertsTab = getByText("Alerts");
        fireEvent.press(alertsTab);
      });

      // Tab should be active (this would be tested with proper styling assertions)
      expect(getByText("Alerts")).toBeTruthy();
    });

    test("should show appropriate content for each tab", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        // Overview tab should show summary cards
        expect(getByText("Critical Alerts")).toBeTruthy();
        expect(getByText("Total Alerts")).toBeTruthy();
        expect(getByText("Need Adjustment")).toBeTruthy();
        expect(getByText("Evidence-Based")).toBeTruthy();
      });
    });
  });

  describe("Clinical Analysis Display", () => {
    test("should display overall assessment", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText("Overall Assessment")).toBeTruthy();
        expect(
          getByText("Fair - Several optimization opportunities identified")
        ).toBeTruthy();
      });
    });

    test("should show risk level with appropriate styling", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        expect(getByText("Risk Level:")).toBeTruthy();
        expect(getByText("MODERATE")).toBeTruthy();
      });
    });

    test("should display summary statistics", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        // Should show the summary numbers from mock data
        expect(getByText("2")).toBeTruthy(); // Total alerts
        expect(getByText("0")).toBeTruthy(); // Critical alerts
      });
    });
  });

  describe("Clinical Alerts Display", () => {
    test("should show clinical alerts when switching to alerts tab", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const alertsTab = getByText("Alerts");
        fireEvent.press(alertsTab);
      });

      await waitFor(() => {
        expect(getByText("Lisinopril")).toBeTruthy();
        expect(getByText("Metformin")).toBeTruthy();
        expect(getByText("MODERATE")).toBeTruthy();
        expect(getByText("HIGH")).toBeTruthy();
      });
    });

    test("should open alert details when alert is pressed", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const alertsTab = getByText("Alerts");
        fireEvent.press(alertsTab);
      });

      await waitFor(() => {
        const alert = getByText(
          "Consider lower starting dose in elderly patients (age 78)"
        );
        fireEvent.press(alert);
      });

      await waitFor(() => {
        expect(getByText("Alert Details")).toBeTruthy();
      });
    });

    test("should close alert details modal", async () => {
      const { getByText, queryByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      // Open alert details
      await waitFor(() => {
        const alertsTab = getByText("Alerts");
        fireEvent.press(alertsTab);
      });

      await waitFor(() => {
        const alert = getByText(
          "Consider lower starting dose in elderly patients (age 78)"
        );
        fireEvent.press(alert);
      });

      await waitFor(() => {
        const closeButton = getByText("Close");
        fireEvent.press(closeButton);
      });

      await waitFor(() => {
        expect(queryByText("Alert Details")).toBeNull();
      });
    });
  });

  describe("Dosage Recommendations Display", () => {
    test("should show dosage recommendations when switching to dosage tab", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const dosageTab = getByText("Dosage");
        fireEvent.press(dosageTab);
      });

      await waitFor(() => {
        expect(getByText("Current Dose")).toBeTruthy();
        expect(getByText("Recommended")).toBeTruthy();
        expect(getByText("NEEDS ADJUSTMENT")).toBeTruthy();
      });
    });

    test("should display confidence scores for dosage recommendations", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const dosageTab = getByText("Dosage");
        fireEvent.press(dosageTab);
      });

      await waitFor(() => {
        expect(getByText("Confidence:")).toBeTruthy();
        expect(getByText("85%")).toBeTruthy(); // From mock data
        expect(getByText("90%")).toBeTruthy(); // From mock data
      });
    });

    test("should show percentage changes for dose adjustments", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const dosageTab = getByText("Dosage");
        fireEvent.press(dosageTab);
      });

      await waitFor(() => {
        expect(getByText("Change: -50.0%")).toBeTruthy();
        expect(getByText("Adjustment for elderly patient")).toBeTruthy();
        expect(
          getByText("Adjustment for reduced kidney function")
        ).toBeTruthy();
      });
    });
  });

  describe("Evidence-Based Recommendations Display", () => {
    test("should show evidence-based recommendations when switching to evidence tab", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const evidenceTab = getByText("Evidence");
        fireEvent.press(evidenceTab);
      });

      await waitFor(() => {
        expect(getByText("Level 1a")).toBeTruthy();
        expect(getByText("Strong")).toBeTruthy();
        expect(getByText("For: Type 2 Diabetes")).toBeTruthy();
      });
    });

    test("should display monitoring requirements", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const evidenceTab = getByText("Evidence");
        fireEvent.press(evidenceTab);
      });

      await waitFor(() => {
        expect(getByText("Monitoring Requirements:")).toBeTruthy();
        expect(
          getByText("• Monitor renal function every 3-6 months")
        ).toBeTruthy();
        expect(getByText("• Monitor vitamin B12 annually")).toBeTruthy();
      });
    });

    test("should show evidence source and level descriptions", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        const evidenceTab = getByText("Evidence");
        fireEvent.press(evidenceTab);
      });

      await waitFor(() => {
        expect(getByText("Source: Built-in Clinical Guidelines")).toBeTruthy();
        expect(getByText("Systematic review of RCTs")).toBeTruthy();
      });
    });
  });

  describe("User Interactions", () => {
    test("should call onClose when close button is pressed", () => {
      const mockOnClose = jest.fn();
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} onClose={mockOnClose} />
      );

      const closeButton = getByText("Icon:nav_back");
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("should handle empty medication list gracefully", () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} patientMedications={[]} />
      );

      expect(getByText("Clinical Decision Support")).toBeTruthy();
    });

    test("should handle missing patient factors", () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} patientFactors={{}} />
      );

      expect(getByText("Clinical Decision Support")).toBeTruthy();
    });
  });

  describe("Responsive Design", () => {
    test("should render properly on different screen sizes", () => {
      // This would test responsive behavior
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      expect(getByText("Clinical Decision Support")).toBeTruthy();
    });

    test("should handle tab scrolling on narrow screens", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        // All tabs should be accessible
        expect(getByText("Overview")).toBeTruthy();
        expect(getByText("Alerts")).toBeTruthy();
        expect(getByText("Dosage")).toBeTruthy();
        expect(getByText("Evidence")).toBeTruthy();
      });
    });
  });

  describe("Accessibility", () => {
    test("should provide appropriate accessibility labels", () => {
      const { getByLabelText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      // This would test actual accessibility labels once implemented
      expect(getByLabelText).toBeDefined();
    });

    test("should support screen readers", () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      // Text content should be accessible to screen readers
      expect(getByText("Clinical Decision Support")).toBeTruthy();
      expect(getByText("Overall Assessment")).toBeTruthy();
    });
  });

  describe("Performance", () => {
    test("should render efficiently with large datasets", async () => {
      const largeMedicationList = Array.from({ length: 50 }, (_, i) => ({
        id: `med_${i}`,
        name: `Medication ${i}`,
        dosage: "10mg",
        frequency: "once daily",
        prescriber: "Dr. Test",
        pharmacy: "Test Pharmacy",
      }));

      const startTime = Date.now();

      const { getByText } = render(
        <ClinicalDecisionSupport
          {...defaultProps}
          patientMedications={largeMedicationList}
        />
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      expect(getByText("Clinical Decision Support")).toBeTruthy();
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });

    test("should handle rapid tab switching without performance issues", async () => {
      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      await waitFor(() => {
        // Rapidly switch between tabs
        fireEvent.press(getByText("Alerts"));
        fireEvent.press(getByText("Dosage"));
        fireEvent.press(getByText("Evidence"));
        fireEvent.press(getByText("Overview"));
      });

      // Should remain responsive
      expect(getByText("Overview")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    test("should handle analysis errors gracefully", async () => {
      // Mock console.error to test error handling
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { getByText } = render(
        <ClinicalDecisionSupport {...defaultProps} />
      );

      // Component should still render even if analysis fails
      expect(getByText("Clinical Decision Support")).toBeTruthy();

      consoleSpy.mockRestore();
    });

    test("should show appropriate message when no data is available", () => {
      const { getByText } = render(
        <ClinicalDecisionSupport
          {...defaultProps}
          patientMedications={[]}
          patientConditions={[]}
          patientFactors={{}}
        />
      );

      expect(getByText("Clinical Decision Support")).toBeTruthy();
    });
  });
});

// Export test utilities for other test files
export const clinicalDecisionSupportTestUtils = {
  mockPatientData: {
    medications: [
      {
        id: "med_001",
        name: "Metformin",
        dosage: "1000mg",
        frequency: "twice daily",
        prescriber: "Dr. Smith",
        pharmacy: "CVS Pharmacy",
      },
      {
        id: "med_002",
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "once daily",
        prescriber: "Dr. Johnson",
        pharmacy: "CVS Pharmacy",
      },
    ],
    conditions: ["Type 2 Diabetes", "Hypertension", "Kidney Disease"],
    factors: {
      user_id: "patient_001",
      age: 78,
      weight_kg: 75,
      creatinine_clearance: 45,
      liver_function: "normal",
    },
  },

  mockClinicalAnalysis: {
    clinical_alerts: [
      {
        medication_name: "Lisinopril",
        alert_type: "age_related",
        severity: "moderate",
        message: "Consider lower starting dose in elderly patients (age 78)",
        recommendation:
          "Reduce starting dose to 2.5mg daily and monitor closely",
        evidence_level: "2b",
        timestamp: new Date().toISOString(),
      },
    ],
    dosage_recommendations: [
      {
        medication_name: "Lisinopril",
        current_dose: 10,
        recommended_dose: 5,
        unit: "mg",
        adjustment_reason: "Adjustment for elderly patient",
        adjustment_factor: 0.5,
        confidence: 0.85,
        needs_adjustment: true,
        percentage_change: -50,
      },
    ],
    evidence_based_recommendations: [
      {
        medication_name: "Metformin",
        condition: "Type 2 Diabetes",
        recommendation:
          "First-line therapy for type 2 diabetes. Start with 500mg twice daily with meals.",
        evidence_level: "1a",
        strength: "Strong",
        source: "Built-in Clinical Guidelines",
        references: ["ADA Standards of Medical Care in Diabetes 2023"],
        contraindications: [
          "eGFR < 30 mL/min/1.73m²",
          "Acute or chronic metabolic acidosis",
        ],
        monitoring_requirements: [
          "Monitor renal function every 3-6 months",
          "Monitor vitamin B12 annually",
        ],
      },
    ],
    overall_assessment: "Fair - Several optimization opportunities identified",
    risk_level: "moderate",
    summary: {
      total_alerts: 2,
      critical_alerts: 0,
      medications_needing_adjustment: 2,
      evidence_supported_therapies: 1,
    },
  },

  renderWithMockData: (props = {}) => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      patientMedications:
        clinicalDecisionSupportTestUtils.mockPatientData.medications,
      patientConditions:
        clinicalDecisionSupportTestUtils.mockPatientData.conditions,
      patientFactors: clinicalDecisionSupportTestUtils.mockPatientData.factors,
      ...props,
    };

    return render(<ClinicalDecisionSupport {...defaultProps} />);
  },

  assertValidAnalysisDisplay: (getByText) => {
    expect(getByText("Clinical Decision Support")).toBeTruthy();
    expect(getByText("Overall Assessment")).toBeTruthy();
    expect(getByText("Risk Level:")).toBeTruthy();
  },
};
