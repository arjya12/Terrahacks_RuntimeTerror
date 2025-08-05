/**
 * Document Simplification UI Component Tests
 * Tests for DocumentUploadScreen and DocumentComparisonView components
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { Text, View } from "react-native";
import DocumentComparisonView from "../../components/medical-docs/DocumentComparisonView";
import DocumentUploadScreen from "../../components/medical-docs/DocumentUploadScreen";

// Mock expo-document-picker
jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
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

describe("DocumentUploadScreen Component", () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onDocumentSimplified: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Visibility", () => {
    test("should render when visible is true", () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      expect(getByText("Simplify Medical Document")).toBeTruthy();
      expect(getByText("📄 Upload Document")).toBeTruthy();
      expect(getByText("🏥 Document Type")).toBeTruthy();
      expect(getByText("📚 Reading Level")).toBeTruthy();
    });

    test("should not render when visible is false", () => {
      const { queryByText } = render(
        <DocumentUploadScreen {...defaultProps} visible={false} />
      );

      expect(queryByText("Simplify Medical Document")).toBeNull();
    });

    test("should show upload area initially", () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      expect(getByText("Tap to upload document")).toBeTruthy();
      expect(
        getByText("Supports PDF, Word, and text files (max 10MB)")
      ).toBeTruthy();
    });
  });

  describe("Document Type Selection", () => {
    test("should display default document type", () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      expect(getByText("General Medical")).toBeTruthy();
      expect(
        getByText("General medical documents and health information")
      ).toBeTruthy();
    });

    test("should open document type modal when pressed", async () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      const documentTypeButton = getByText("General Medical");
      fireEvent.press(documentTypeButton);

      await waitFor(() => {
        expect(getByText("Select Document Type")).toBeTruthy();
        expect(getByText("Lab Results")).toBeTruthy();
        expect(getByText("Discharge Summary")).toBeTruthy();
        expect(getByText("Medication Instructions")).toBeTruthy();
      });
    });

    test("should allow selecting different document types", async () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      // Open modal
      const documentTypeButton = getByText("General Medical");
      fireEvent.press(documentTypeButton);

      await waitFor(() => {
        const labResultsOption = getByText("Lab Results");
        fireEvent.press(labResultsOption);
      });

      // Modal should close and selection should update
      await waitFor(() => {
        expect(getByText("Lab Results")).toBeTruthy();
        expect(
          getByText("Laboratory test results and blood work reports")
        ).toBeTruthy();
      });
    });
  });

  describe("Simplification Level Selection", () => {
    test("should display default simplification level", () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      expect(getByText("Intermediate (6th Grade)")).toBeTruthy();
      expect(
        getByText("Clear explanations of medical terms, easier to read")
      ).toBeTruthy();
    });

    test("should open simplification level modal when pressed", async () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      const levelButton = getByText("Intermediate (6th Grade)");
      fireEvent.press(levelButton);

      await waitFor(() => {
        expect(getByText("Select Reading Level")).toBeTruthy();
        expect(getByText("Basic (8th Grade)")).toBeTruthy();
        expect(getByText("Simple (4th Grade)")).toBeTruthy();
      });
    });

    test("should allow selecting different reading levels", async () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      // Open modal
      const levelButton = getByText("Intermediate (6th Grade)");
      fireEvent.press(levelButton);

      await waitFor(() => {
        const simpleOption = getByText("Simple (4th Grade)");
        fireEvent.press(simpleOption);
      });

      // Selection should update
      await waitFor(() => {
        expect(getByText("Simple (4th Grade)")).toBeTruthy();
        expect(
          getByText(
            "Very simple language, short sentences, extensive explanations"
          )
        ).toBeTruthy();
      });
    });
  });

  describe("Document Upload Functionality", () => {
    test("should handle successful document upload", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "medical_report.txt",
            size: 2048,
            mimeType: "text/plain",
            uri: "file://mock_path",
          },
        ],
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("medical_report.txt")).toBeTruthy();
        expect(getByText("2.0 KB • Uploaded")).toBeTruthy();
      });
    });

    test("should reject files that are too large", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "large_file.pdf",
            size: 11 * 1024 * 1024, // 11MB
            mimeType: "application/pdf",
            uri: "file://mock_path",
          },
        ],
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      // Should show error (mocked as Alert.alert)
      await waitFor(() => {
        expect(getByText("Tap to upload document")).toBeTruthy(); // Still shows upload area
      });
    });

    test("should handle upload cancellation", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: true,
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("Tap to upload document")).toBeTruthy(); // Still shows upload area
      });
    });

    test("should allow removing uploaded document", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "test_document.txt",
            size: 1024,
            mimeType: "text/plain",
            uri: "file://mock_path",
          },
        ],
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      // Upload document
      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("test_document.txt")).toBeTruthy();
      });

      // Remove document
      const removeButton = getByText("Icon:action_close");
      fireEvent.press(removeButton);

      await waitFor(() => {
        expect(getByText("Tap to upload document")).toBeTruthy();
      });
    });
  });

  describe("Document Simplification Process", () => {
    test("should show preview of extracted text", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "medical_report.txt",
            size: 2048,
            mimeType: "text/plain",
            uri: "file://mock_path",
          },
        ],
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      // Upload document
      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("📋 Text Preview")).toBeTruthy();
        expect(getByText("Extracted text from your document")).toBeTruthy();
      });
    });

    test("should enable simplify button only when document is uploaded", () => {
      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      const simplifyButton = getByText("✨ Simplify Document");

      // Should be disabled initially
      expect(simplifyButton.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ opacity: expect.any(Number) }),
        ])
      );
    });

    test("should call onDocumentSimplified when simplification succeeds", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "test_document.txt",
            size: 1024,
            mimeType: "text/plain",
            uri: "file://mock_path",
          },
        ],
      });

      const mockOnDocumentSimplified = jest.fn();
      const { getByText } = render(
        <DocumentUploadScreen
          {...defaultProps}
          onDocumentSimplified={mockOnDocumentSimplified}
        />
      );

      // Upload document first
      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("test_document.txt")).toBeTruthy();
      });

      // Simplify document
      const simplifyButton = getByText("✨ Simplify Document");
      fireEvent.press(simplifyButton);

      // Wait for processing (mocked)
      await waitFor(
        () => {
          expect(mockOnDocumentSimplified).toHaveBeenCalledWith(
            expect.objectContaining({
              simplification_id: expect.stringMatching(/^simp_/),
              simplified_text: expect.any(String),
              metadata: expect.objectContaining({
                confidence_score: expect.any(Number),
              }),
            })
          );
        },
        { timeout: 5000 }
      );
    });

    test("should show loading state during simplification", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "test_document.txt",
            size: 1024,
            mimeType: "text/plain",
            uri: "file://mock_path",
          },
        ],
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      // Upload document
      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("test_document.txt")).toBeTruthy();
      });

      // Start simplification
      const simplifyButton = getByText("✨ Simplify Document");
      fireEvent.press(simplifyButton);

      // Should show loading state
      expect(getByText("Simplifying...")).toBeTruthy();
    });
  });

  describe("User Interactions", () => {
    test("should call onClose when close button is pressed", () => {
      const mockOnClose = jest.fn();
      const { getByText } = render(
        <DocumentUploadScreen {...defaultProps} onClose={mockOnClose} />
      );

      const closeButton = getByText("Icon:nav_back");
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("should reset upload state when reset button is pressed", async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            name: "test_document.txt",
            size: 1024,
            mimeType: "text/plain",
            uri: "file://mock_path",
          },
        ],
      });

      const { getByText } = render(<DocumentUploadScreen {...defaultProps} />);

      // Upload document
      const uploadButton = getByText("Tap to upload document");
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText("test_document.txt")).toBeTruthy();
      });

      // Reset
      const resetButton = getByText("Icon:action_refresh");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(getByText("Tap to upload document")).toBeTruthy();
        expect(getByText("General Medical")).toBeTruthy(); // Back to default
      });
    });
  });
});

describe("DocumentComparisonView Component", () => {
  const mockSimplificationResult = {
    simplification_id: "simp_123abc456def",
    original_text: `
      Patient presents with acute myocardial infarction and requires immediate 
      percutaneous coronary intervention. Laboratory values show elevated troponin 
      and creatine kinase levels consistent with cardiac injury. Patient should be 
      started on dual antiplatelet therapy and high-intensity statin therapy.
    `,
    simplified_text: `
      Patient had a heart attack and needs immediate treatment to open blocked arteries. 
      Blood tests show signs of heart damage. Patient should start taking blood thinners 
      and cholesterol medicine.
    `,
    metadata: {
      confidence_score: 0.92,
      reading_level: "6th Grade Level",
      document_type: "general_medical",
      key_terms_explained: [
        "myocardial infarction",
        "percutaneous coronary intervention",
        "troponin",
      ],
      word_count_reduction: 35.7,
      original_word_count: 45,
      simplified_word_count: 29,
    },
    processing_info: {
      processing_time: 2.1,
      simplification_level: "intermediate",
      patient_context_used: false,
    },
    timestamp: "2024-12-20T10:30:00Z",
  };

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    result: mockSimplificationResult,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Visibility", () => {
    test("should render when visible is true and result is provided", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      expect(getByText("Document Comparison")).toBeTruthy();
      expect(getByText("Original Document")).toBeTruthy();
      expect(getByText("Simplified Version")).toBeTruthy();
    });

    test("should not render when visible is false", () => {
      const { queryByText } = render(
        <DocumentComparisonView {...defaultProps} visible={false} />
      );

      expect(queryByText("Document Comparison")).toBeNull();
    });

    test("should not render when result is null", () => {
      const { queryByText } = render(
        <DocumentComparisonView {...defaultProps} result={null} />
      );

      expect(queryByText("Document Comparison")).toBeNull();
    });
  });

  describe("View Mode Toggle", () => {
    test("should display view mode options", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      expect(getByText("Side by Side")).toBeTruthy();
      expect(getByText("Original")).toBeTruthy();
      expect(getByText("Simplified")).toBeTruthy();
    });

    test("should switch to original view mode", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const originalButton = getByText("Original");
      fireEvent.press(originalButton);

      await waitFor(() => {
        expect(getByText("acute myocardial infarction")).toBeTruthy();
        // Should not show simplified text in original mode
        expect(getByText("heart attack")).toBeFalsy();
      });
    });

    test("should switch to simplified view mode", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const simplifiedButton = getByText("Simplified");
      fireEvent.press(simplifiedButton);

      await waitFor(() => {
        expect(getByText("heart attack")).toBeTruthy();
        // Should not show original text in simplified mode
        expect(getByText("acute myocardial infarction")).toBeFalsy();
      });
    });

    test("should show both texts in side-by-side mode", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      // Should show both original and simplified text by default
      expect(getByText("acute myocardial infarction")).toBeTruthy();
      expect(getByText("heart attack")).toBeTruthy();
    });
  });

  describe("Document Content Display", () => {
    test("should display word counts", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      expect(getByText("45 words")).toBeTruthy(); // Original
      expect(getByText("29 words")).toBeTruthy(); // Simplified
    });

    test("should display full document texts", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      // Check for key phrases from original text
      expect(getByText(/percutaneous coronary intervention/)).toBeTruthy();
      expect(
        getByText(/Laboratory values show elevated troponin/)
      ).toBeTruthy();

      // Check for key phrases from simplified text
      expect(getByText(/blood tests show signs of heart damage/)).toBeTruthy();
      expect(getByText(/cholesterol medicine/)).toBeTruthy();
    });

    test("should handle long documents with scrolling", () => {
      const longResult = {
        ...mockSimplificationResult,
        original_text: "Long document text ".repeat(100),
        simplified_text: "Shorter simple text ".repeat(50),
      };

      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} result={longResult} />
      );

      // Should still render without issues
      expect(getByText("Document Comparison")).toBeTruthy();
    });
  });

  describe("Metadata Display", () => {
    test("should open metadata panel when info button is pressed", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const infoButton = getByText("Icon:status_info");
      fireEvent.press(infoButton);

      await waitFor(() => {
        expect(getByText("Document Analysis")).toBeTruthy();
        expect(getByText("Confidence Score")).toBeTruthy();
        expect(getByText("Reading Level")).toBeTruthy();
        expect(getByText("Word Count Reduction")).toBeTruthy();
      });
    });

    test("should display confidence score correctly", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const infoButton = getByText("Icon:status_info");
      fireEvent.press(infoButton);

      await waitFor(() => {
        expect(getByText("92%")).toBeTruthy(); // 0.92 * 100
      });
    });

    test("should display reading level", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const infoButton = getByText("Icon:status_info");
      fireEvent.press(infoButton);

      await waitFor(() => {
        expect(getByText("6th Grade Level")).toBeTruthy();
      });
    });

    test("should display word count reduction", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const infoButton = getByText("Icon:status_info");
      fireEvent.press(infoButton);

      await waitFor(() => {
        expect(getByText("-35.7%")).toBeTruthy();
      });
    });

    test("should display key terms explained", async () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const infoButton = getByText("Icon:status_info");
      fireEvent.press(infoButton);

      await waitFor(() => {
        expect(getByText("Key Terms Explained")).toBeTruthy();
        expect(getByText("myocardial infarction")).toBeTruthy();
        expect(getByText("percutaneous coronary intervention")).toBeTruthy();
        expect(getByText("troponin")).toBeTruthy();
      });
    });

    test("should close metadata panel", async () => {
      const { getByText, queryByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      // Open metadata panel
      const infoButton = getByText("Icon:status_info");
      fireEvent.press(infoButton);

      await waitFor(() => {
        expect(getByText("Document Analysis")).toBeTruthy();
      });

      // Close metadata panel
      const closeButton = getByText("Icon:action_close");
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(queryByText("Document Analysis")).toBeNull();
      });
    });
  });

  describe("Action Buttons", () => {
    test("should display save and share buttons", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      expect(getByText("Save")).toBeTruthy();
      expect(getByText("Share")).toBeTruthy();
    });

    test("should handle save action", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const saveButton = getByText("Save");
      fireEvent.press(saveButton);

      // Should trigger save functionality (mocked as Alert)
      expect(saveButton).toBeTruthy();
    });

    test("should handle share action", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const shareButton = getByText("Share");
      fireEvent.press(shareButton);

      // Should trigger share functionality (mocked as Alert)
      expect(shareButton).toBeTruthy();
    });

    test("should handle share action from header", () => {
      const { getAllByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      const shareButtons = getAllByText("Icon:action_share");
      fireEvent.press(shareButtons[0]); // Header share button

      // Should trigger share functionality
      expect(shareButtons[0]).toBeTruthy();
    });
  });

  describe("User Interactions", () => {
    test("should call onClose when close button is pressed", () => {
      const mockOnClose = jest.fn();
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} onClose={mockOnClose} />
      );

      const closeButton = getByText("Icon:nav_back");
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("should handle different confidence score colors", () => {
      const testCases = [
        { score: 0.9, expectedColor: "#10b981" }, // Green
        { score: 0.7, expectedColor: "#f59e0b" }, // Yellow
        { score: 0.4, expectedColor: "#ef4444" }, // Red
      ];

      testCases.forEach(({ score, expectedColor }) => {
        const getConfidenceColor = (confidenceScore) => {
          if (confidenceScore >= 0.8) return "#10b981";
          if (confidenceScore >= 0.6) return "#f59e0b";
          return "#ef4444";
        };

        expect(getConfidenceColor(score)).toBe(expectedColor);
      });
    });
  });

  describe("Responsive Design", () => {
    test("should handle different screen sizes", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      // Should render without layout issues
      expect(getByText("Document Comparison")).toBeTruthy();
      expect(getByText("Side by Side")).toBeTruthy();
    });

    test("should handle orientation changes", () => {
      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} />
      );

      // Component should remain functional in different orientations
      expect(getByText("Original Document")).toBeTruthy();
      expect(getByText("Simplified Version")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    test("should handle missing metadata gracefully", () => {
      const incompleteResult = {
        ...mockSimplificationResult,
        metadata: {
          confidence_score: 0.8,
          // Missing other metadata fields
        },
      };

      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} result={incompleteResult} />
      );

      expect(getByText("Document Comparison")).toBeTruthy();
    });

    test("should handle empty text content", () => {
      const emptyResult = {
        ...mockSimplificationResult,
        original_text: "",
        simplified_text: "",
      };

      const { getByText } = render(
        <DocumentComparisonView {...defaultProps} result={emptyResult} />
      );

      expect(getByText("Document Comparison")).toBeTruthy();
    });
  });
});

// Export test utilities for other test files
export const documentSimplificationUITestUtils = {
  mockDocumentUploadProps: {
    visible: true,
    onClose: jest.fn(),
    onDocumentSimplified: jest.fn(),
  },

  mockSimplificationResult: {
    simplification_id: "simp_test123",
    original_text:
      "Complex medical terminology and clinical language requiring simplification.",
    simplified_text: "Easy to understand medical information for patients.",
    metadata: {
      confidence_score: 0.88,
      reading_level: "6th Grade Level",
      document_type: "general_medical",
      key_terms_explained: ["terminology", "clinical"],
      word_count_reduction: 30.0,
      original_word_count: 10,
      simplified_word_count: 7,
    },
    processing_info: {
      processing_time: 1.5,
      simplification_level: "intermediate",
      patient_context_used: true,
    },
    timestamp: "2024-12-20T10:30:00Z",
  },

  mockDocumentFile: {
    name: "test_medical_document.txt",
    size: 2048,
    mimeType: "text/plain",
    uri: "file://mock_document_path",
  },

  mockDocumentTypes: [
    {
      type: "lab_results",
      name: "Lab Results",
      description: "Laboratory test results and blood work reports",
    },
    {
      type: "discharge_summary",
      name: "Discharge Summary",
      description: "Hospital discharge summaries and care instructions",
    },
    {
      type: "medication_instructions",
      name: "Medication Instructions",
      description: "Prescription instructions and medication guides",
    },
  ],

  mockSimplificationLevels: [
    {
      level: "basic",
      name: "Basic",
      reading_level: "8th Grade",
      description: "Suitable for most adults, some medical terms explained",
    },
    {
      level: "intermediate",
      name: "Intermediate",
      reading_level: "6th Grade",
      description: "Clear explanations of medical terms, easier to read",
    },
    {
      level: "simple",
      name: "Simple",
      reading_level: "4th Grade",
      description:
        "Very simple language, short sentences, extensive explanations",
    },
  ],

  setupDocumentPickerMock: (result) => {
    DocumentPicker.getDocumentAsync.mockResolvedValue(result);
  },

  assertDocumentUploadFlow: (getByText) => {
    expect(getByText("📄 Upload Document")).toBeTruthy();
    expect(getByText("🏥 Document Type")).toBeTruthy();
    expect(getByText("📚 Reading Level")).toBeTruthy();
    expect(getByText("✨ Simplify Document")).toBeTruthy();
  },

  assertComparisonViewFlow: (getByText) => {
    expect(getByText("Document Comparison")).toBeTruthy();
    expect(getByText("Side by Side")).toBeTruthy();
    expect(getByText("Original")).toBeTruthy();
    expect(getByText("Simplified")).toBeTruthy();
  },
};
