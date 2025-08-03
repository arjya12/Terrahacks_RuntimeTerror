import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SimplificationResult {
  simplification_id: string;
  original_text: string;
  simplified_text: string;
  metadata: {
    confidence_score: number;
    reading_level: string;
    document_type: string;
    key_terms_explained: string[];
    word_count_reduction: number;
    original_word_count: number;
    simplified_word_count: number;
  };
  processing_info: {
    processing_time: number;
    simplification_level: string;
    patient_context_used: boolean;
  };
  timestamp: string;
}

interface DocumentType {
  type: string;
  name: string;
  description: string;
}

interface SimplificationLevel {
  level: string;
  name: string;
  reading_level: string;
  description: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  extractedText: string;
  uploadedAt: string;
}

interface DocumentUploadScreenProps {
  visible: boolean;
  onClose: () => void;
  onDocumentSimplified: (result: SimplificationResult) => void;
}

export default function DocumentUploadScreen({
  visible,
  onClose,
  onDocumentSimplified,
}: DocumentUploadScreenProps) {
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<string>("general_medical");
  const [selectedLevel, setSelectedLevel] = useState<string>("intermediate");
  const [uploadedDocument, setUploadedDocument] =
    useState<UploadedDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDocumentTypes, setShowDocumentTypes] = useState(false);
  const [showSimplificationLevels, setShowSimplificationLevels] =
    useState(false);

  // Mock data - in production, these would be fetched from API
  const documentTypes: DocumentType[] = [
    {
      type: "general_medical",
      name: "General Medical",
      description: "General medical documents and health information",
    },
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
    {
      type: "radiology_report",
      name: "Radiology Report",
      description: "X-ray, MRI, CT scan, and other imaging reports",
    },
    {
      type: "consultation_note",
      name: "Consultation Note",
      description: "Specialist consultation notes and recommendations",
    },
  ];

  const simplificationLevels: SimplificationLevel[] = [
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
  ];

  const handleDocumentPick = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "application/pdf", "application/msword", "*/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const document = result.assets[0];

        // Validate file size (10MB limit)
        if (document.size && document.size > 10 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select a file smaller than 10MB.",
            [{ text: "OK" }]
          );
          return;
        }

        // Mock document upload
        const mockUploadedDoc: UploadedDocument = {
          id: `doc_${Date.now()}`,
          name: document.name,
          size: document.size || 0,
          type: document.mimeType || "unknown",
          extractedText: generateMockExtractedText(selectedDocumentType),
          uploadedAt: new Date().toISOString(),
        };

        setUploadedDocument(mockUploadedDoc);

        Alert.alert(
          "Document Uploaded ✅",
          `Successfully uploaded "${document.name}". Text has been extracted and is ready for simplification.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Failed to pick document:", error);
      Alert.alert(
        "Upload Failed ❌",
        "Failed to upload document. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const generateMockExtractedText = (docType: string): string => {
    const mockTexts = {
      lab_results: `
LABORATORY RESULTS

Patient: John Doe
Date: December 20, 2024
Provider: Dr. Smith

Complete Blood Count (CBC):
- White Blood Cells: 7.2 K/uL (Normal: 4.0-11.0)
- Red Blood Cells: 4.5 M/uL (Normal: 4.2-5.4)
- Hemoglobin: 14.2 g/dL (Normal: 12.0-16.0)
- Hematocrit: 42.1% (Normal: 36.0-46.0)
- Platelets: 285 K/uL (Normal: 150-450)

Basic Metabolic Panel:
- Glucose: 95 mg/dL (Normal: 70-100)
- Blood Urea Nitrogen: 18 mg/dL (Normal: 7-20)
- Creatinine: 1.0 mg/dL (Normal: 0.6-1.2)
- Sodium: 140 mEq/L (Normal: 136-145)
- Potassium: 4.2 mEq/L (Normal: 3.5-5.0)

All values are within normal limits. Continue current medications and follow up in 6 months.
      `,
      discharge_summary: `
DISCHARGE SUMMARY

Patient: Jane Smith
Admission Date: December 18, 2024
Discharge Date: December 20, 2024
Attending Physician: Dr. Johnson

REASON FOR ADMISSION:
Patient presented with acute exacerbation of chronic obstructive pulmonary disease (COPD) with dyspnea and productive cough.

HOSPITAL COURSE:
Patient was treated with bronchodilators, corticosteroids, and oxygen therapy. Chest X-ray showed hyperinflation consistent with COPD but no acute infiltrates. Patient responded well to treatment with improvement in respiratory status.

DISCHARGE MEDICATIONS:
1. Albuterol inhaler - 2 puffs every 4 hours as needed
2. Prednisone 20mg daily for 5 days
3. Continue home medications

FOLLOW-UP:
Schedule appointment with pulmonologist within 2 weeks. Return to emergency department if breathing worsens.
      `,
      general_medical: `
MEDICAL CONSULTATION REPORT

Patient presents with complaints of fatigue, weight gain, and cold intolerance over the past 6 months. Physical examination reveals bradycardia, dry skin, and delayed reflexes. Laboratory studies show elevated TSH (thyroid stimulating hormone) at 12.5 mIU/L and low T4 at 4.2 mcg/dL, consistent with primary hypothyroidism.

ASSESSMENT AND PLAN:
Primary hypothyroidism, likely autoimmune etiology. Initiate levothyroxine 50 mcg daily. Recheck thyroid function tests in 6-8 weeks. Patient counseled on medication compliance and expected timeline for symptom improvement. Follow-up scheduled in 2 months.
      `,
    };

    return (
      mockTexts[docType as keyof typeof mockTexts] || mockTexts.general_medical
    );
  };

  const handleSimplifyDocument = async () => {
    if (!uploadedDocument) {
      Alert.alert("No Document", "Please upload a document first.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setIsProcessing(true);

      // Mock API call for document simplification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockSimplifiedResult = {
        simplification_id: `simp_${Date.now()}`,
        original_text: uploadedDocument.extractedText,
        simplified_text: generateMockSimplifiedText(
          uploadedDocument.extractedText,
          selectedLevel
        ),
        metadata: {
          confidence_score: 0.92,
          reading_level:
            simplificationLevels.find((l) => l.level === selectedLevel)
              ?.reading_level || "6th Grade",
          document_type: selectedDocumentType,
          key_terms_explained: [
            "medical terminology",
            "test results",
            "follow-up instructions",
          ],
          word_count_reduction: 35.2,
          original_word_count: uploadedDocument.extractedText.split(" ").length,
          simplified_word_count: Math.floor(
            uploadedDocument.extractedText.split(" ").length * 0.65
          ),
        },
        processing_info: {
          processing_time: 1.8,
          simplification_level: selectedLevel,
          patient_context_used: false,
        },
        timestamp: new Date().toISOString(),
      };

      // Call the callback to show results
      onDocumentSimplified(mockSimplifiedResult);

      Alert.alert(
        "Simplification Complete! 🎉",
        "Your document has been successfully simplified. You can now view the side-by-side comparison.",
        [
          {
            text: "View Results",
            onPress: onClose,
          },
        ]
      );
    } catch (error) {
      console.error("Failed to simplify document:", error);
      Alert.alert(
        "Simplification Failed ❌",
        "Failed to simplify the document. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockSimplifiedText = (
    originalText: string,
    level: string
  ): string => {
    const levelReplacements = {
      simple: {
        "Laboratory Results": "Lab Test Results",
        "Complete Blood Count": "Blood Test",
        "within normal limits": "normal",
        "acute exacerbation": "sudden worsening",
        dyspnea: "trouble breathing",
        "productive cough": "cough with mucus",
        bronchodilators: "breathing medicines",
        corticosteroids: "anti-inflammatory medicines",
        hyperinflation: "over-expanded lungs",
        infiltrates: "infections",
        "thyroid stimulating hormone":
          "TSH (a hormone that controls your thyroid)",
        hypothyroidism: "underactive thyroid",
        "autoimmune etiology": "caused by your immune system",
        levothyroxine: "thyroid medicine",
      },
      intermediate: {
        "acute exacerbation": "sudden worsening",
        dyspnea: "shortness of breath",
        bronchodilators: "medicines that open airways",
        hyperinflation: "over-expanded lungs",
        "thyroid stimulating hormone": "TSH hormone",
        hypothyroidism: "underactive thyroid",
        "autoimmune etiology": "immune system cause",
      },
      basic: {
        "acute exacerbation": "sudden flare-up",
        dyspnea: "breathing difficulty",
        hypothyroidism: "underactive thyroid gland",
      },
    };

    let simplified = originalText;
    const replacements =
      levelReplacements[level as keyof typeof levelReplacements] || {};

    Object.entries(replacements).forEach(([complex, simple]) => {
      const regex = new RegExp(complex, "gi");
      simplified = simplified.replace(regex, simple);
    });

    // Add explanatory notes for simple level
    if (level === "simple") {
      simplified += "\n\nKey Information:\n";
      simplified += "• Normal lab values means your tests look good\n";
      simplified += "• Follow-up means see your doctor again\n";
      simplified +=
        "• Medications are medicines your doctor wants you to take\n";
      simplified += "• If you have questions, ask your doctor or nurse";
    }

    return simplified;
  };

  const getSelectedDocumentType = () => {
    return documentTypes.find((dt) => dt.type === selectedDocumentType);
  };

  const getSelectedLevel = () => {
    return simplificationLevels.find((sl) => sl.level === selectedLevel);
  };

  const resetUpload = () => {
    setUploadedDocument(null);
    setSelectedDocumentType("general_medical");
    setSelectedLevel("intermediate");
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AppIcon name="nav_back" size="medium" color="primary" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Simplify Medical Document
          </ThemedText>
          <TouchableOpacity onPress={resetUpload} style={styles.resetButton}>
            <AppIcon name="action_refresh" size="medium" color="secondary" />
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Upload Section */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              📄 Upload Document
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Upload a medical document to make it easier to understand
            </ThemedText>

            {!uploadedDocument ? (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleDocumentPick}
                disabled={isUploading}
              >
                <AppIcon
                  name="action_upload"
                  size="large"
                  color={isUploading ? "disabled" : "primary"}
                />
                <ThemedText style={styles.uploadText}>
                  {isUploading ? "Uploading..." : "Tap to upload document"}
                </ThemedText>
                <ThemedText style={styles.uploadSubtext}>
                  Supports PDF, Word, and text files (max 10MB)
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <ThemedView style={styles.uploadedFile}>
                <View style={styles.fileInfo}>
                  <AppIcon name="nav_profile" size="medium" color="success" />
                  <View style={styles.fileDetails}>
                    <ThemedText style={styles.fileName}>
                      {uploadedDocument.name}
                    </ThemedText>
                    <ThemedText style={styles.fileSize}>
                      {(uploadedDocument.size / 1024).toFixed(1)} KB • Uploaded
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setUploadedDocument(null)}
                >
                  <AppIcon name="action_close" size="small" color="error" />
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>

          {/* Document Type Selection */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              🏥 Document Type
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Select the type of medical document for better results
            </ThemedText>

            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowDocumentTypes(true)}
            >
              <View style={styles.selectionContent}>
                <View>
                  <ThemedText style={styles.selectionTitle}>
                    {getSelectedDocumentType()?.name}
                  </ThemedText>
                  <ThemedText style={styles.selectionDescription}>
                    {getSelectedDocumentType()?.description}
                  </ThemedText>
                </View>
                <AppIcon name="nav_forward" size="small" color="secondary" />
              </View>
            </TouchableOpacity>
          </ThemedView>

          {/* Simplification Level */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              📚 Reading Level
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Choose how simple you want the language to be
            </ThemedText>

            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowSimplificationLevels(true)}
            >
              <View style={styles.selectionContent}>
                <View>
                  <ThemedText style={styles.selectionTitle}>
                    {getSelectedLevel()?.name} (
                    {getSelectedLevel()?.reading_level})
                  </ThemedText>
                  <ThemedText style={styles.selectionDescription}>
                    {getSelectedLevel()?.description}
                  </ThemedText>
                </View>
                <AppIcon name="nav_forward" size="small" color="secondary" />
              </View>
            </TouchableOpacity>
          </ThemedView>

          {/* Extracted Text Preview */}
          {uploadedDocument && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                📋 Text Preview
              </ThemedText>
              <ThemedText style={styles.sectionDescription}>
                Extracted text from your document
              </ThemedText>

              <ThemedView style={styles.textPreview}>
                <ThemedText style={styles.previewText}>
                  {uploadedDocument.extractedText.substring(0, 200)}
                  {uploadedDocument.extractedText.length > 200 ? "..." : ""}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}

          {/* Simplify Button */}
          <TouchableOpacity
            style={[
              styles.simplifyButton,
              (!uploadedDocument || isProcessing) &&
                styles.simplifyButtonDisabled,
            ]}
            onPress={handleSimplifyDocument}
            disabled={!uploadedDocument || isProcessing}
          >
            <ThemedText style={styles.simplifyButtonText}>
              {isProcessing ? "Simplifying..." : "✨ Simplify Document"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Document Type Selection Modal */}
        <Modal
          visible={showDocumentTypes}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDocumentTypes(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Select Document Type
                </ThemedText>
                <TouchableOpacity onPress={() => setShowDocumentTypes(false)}>
                  <AppIcon
                    name="action_close"
                    size="medium"
                    color="secondary"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList}>
                {documentTypes.map((docType) => (
                  <TouchableOpacity
                    key={docType.type}
                    style={[
                      styles.modalItem,
                      selectedDocumentType === docType.type &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedDocumentType(docType.type);
                      setShowDocumentTypes(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <ThemedText style={styles.modalItemTitle}>
                        {docType.name}
                      </ThemedText>
                      <ThemedText style={styles.modalItemDescription}>
                        {docType.description}
                      </ThemedText>
                    </View>
                    {selectedDocumentType === docType.type && (
                      <AppIcon
                        name="status_check"
                        size="small"
                        color="primary"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          </View>
        </Modal>

        {/* Simplification Level Selection Modal */}
        <Modal
          visible={showSimplificationLevels}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSimplificationLevels(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Select Reading Level
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setShowSimplificationLevels(false)}
                >
                  <AppIcon
                    name="action_close"
                    size="medium"
                    color="secondary"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList}>
                {simplificationLevels.map((level) => (
                  <TouchableOpacity
                    key={level.level}
                    style={[
                      styles.modalItem,
                      selectedLevel === level.level && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedLevel(level.level);
                      setShowSimplificationLevels(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <ThemedText style={styles.modalItemTitle}>
                        {level.name} ({level.reading_level})
                      </ThemedText>
                      <ThemedText style={styles.modalItemDescription}>
                        {level.description}
                      </ThemedText>
                    </View>
                    {selectedLevel === level.level && (
                      <AppIcon
                        name="status_check"
                        size="small"
                        color="primary"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  uploadedFile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#6b7280",
  },
  removeButton: {
    padding: 4,
  },
  selectionButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  selectionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  selectionDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  textPreview: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  simplifyButton: {
    backgroundColor: "#3b82f6",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simplifyButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  simplifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemSelected: {
    backgroundColor: "#f0f9ff",
  },
  modalItemContent: {
    flex: 1,
    marginRight: 12,
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  modalItemDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
});
