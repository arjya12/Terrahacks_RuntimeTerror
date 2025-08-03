import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { mockDataService } from "@/mocks/mockService";
import { Medication, PatientProfile, SharingToken } from "@/mocks/types";

interface MedicationListModalProps {
  visible: boolean;
  token: SharingToken | null;
  medications: Medication[];
  patient: PatientProfile | null;
  onClose: () => void;
}

/**
 * MedicationListModal - Displays scanned patient medication data in a modal view
 *
 * @param visible - Whether the modal is visible
 * @param token - The sharing token containing permissions and metadata
 * @param medications - Array of patient medications to display
 * @param patient - Patient profile information
 * @param onClose - Callback to close the modal
 *
 * Features:
 * - Patient information display with contact details
 * - Conditional allergies and medical conditions based on permissions
 * - Comprehensive medication list with status indicators
 * - Share token metadata and expiration details
 * - Responsive modal layout with scrollable content
 */
function MedicationListModal({
  visible,
  token,
  medications,
  patient,
  onClose,
}: MedicationListModalProps) {
  if (!token || !patient) return null;

  const canViewAllergies = token.permissions.includes("view_allergies");
  const canViewConditions = token.permissions.includes("view_conditions");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Patient Medications</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Patient Info */}
          <ThemedView style={styles.patientSection}>
            <ThemedText style={styles.sectionTitle}>
              Patient Information
            </ThemedText>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>
                {patient.firstName} {patient.lastName}
              </Text>
              <Text style={styles.patientDetail}>
                DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </Text>
              <Text style={styles.patientDetail}>Email: {patient.email}</Text>
              {patient.phoneNumber && (
                <Text style={styles.patientDetail}>
                  Phone: {patient.phoneNumber}
                </Text>
              )}
            </View>
          </ThemedView>

          {/* Allergies */}
          {canViewAllergies &&
            patient.allergies &&
            patient.allergies.length > 0 && (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Allergies</ThemedText>
                <View style={styles.allergiesContainer}>
                  {patient.allergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyBadge}>
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </ThemedView>
            )}

          {/* Medical Conditions */}
          {canViewConditions &&
            patient.conditions &&
            patient.conditions.length > 0 && (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Medical Conditions
                </ThemedText>
                {patient.conditions.map((condition, index) => (
                  <Text key={index} style={styles.conditionItem}>
                    • {condition}
                  </Text>
                ))}
              </ThemedView>
            )}

          {/* Medications */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Medications ({medications.length})
            </ThemedText>
            {medications.map((medication) => (
              <ThemedView key={medication.id} style={styles.medicationItem}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: medication.isActive
                          ? "#10b981"
                          : "#6b7280",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {medication.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                {medication.genericName && (
                  <Text style={styles.medicationGeneric}>
                    Generic: {medication.genericName}
                  </Text>
                )}
                <Text style={styles.medicationDosage}>
                  {medication.dosage} - {medication.frequency}
                </Text>
                <Text style={styles.medicationPrescriber}>
                  Prescribed by: {medication.prescriber}
                </Text>
                {medication.notes && (
                  <Text style={styles.medicationNotes}>{medication.notes}</Text>
                )}
              </ThemedView>
            ))}
          </ThemedView>

          {/* Share Info */}
          <ThemedView style={styles.shareInfo}>
            <ThemedText style={styles.shareInfoTitle}>
              Share Information
            </ThemedText>
            <Text style={styles.shareInfoText}>
              Expires: {new Date(token.expiresAt).toLocaleDateString()}
            </Text>
            <Text style={styles.shareInfoText}>
              Permissions: {token.permissions.join(", ")}
            </Text>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/**
 * ScanShareScreen - Provider interface for scanning QR codes to access patient medications
 *
 * Features:
 * - Camera-based QR code scanning with real-time detection
 * - Manual code entry option for backup access
 * - Comprehensive camera permission handling with user-friendly prompts
 * - Secure token validation and patient data retrieval
 * - Modal display of patient medications with permission-based access
 * - Loading states and error handling for all scanning operations
 * - Visual scanning frame with corner indicators for better UX
 *
 * Security:
 * - Validates sharing tokens before displaying data
 * - Respects permission-based data access (allergies, conditions)
 * - Handles expired and invalid tokens gracefully
 */
export default function ScanShareScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);

  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [scannedToken, setScannedToken] = useState<SharingToken | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      handleCodeScanned(data);
    }
  };

  const handleCodeScanned = async (code: string) => {
    try {
      const result = await mockDataService.getSharedMedicationList(code);
      setMedications(result.medications);
      setPatient(result.patient);

      // Create a mock token for display purposes
      const token: SharingToken = {
        id: "scanned_token",
        token: code,
        patientId: result.patient.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        permissions: ["view_medications", "view_basic_info"],
        isActive: true,
      };
      setScannedToken(token);
      setShowMedicationModal(true);
    } catch {
      Alert.alert(
        "Invalid Code",
        "This sharing code is not valid or has expired."
      );
    } finally {
      setScanned(false); // Reset for next scan
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert("Error", "Please enter a sharing code.");
      return;
    }

    handleCodeScanned(manualCode.trim());
    setManualCode("");
    setShowManualInput(false);
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <IconSymbol name="camera.fill" size={64} color="#6b7280" />
          <ThemedText style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            Camera access is needed to scan QR codes for medication sharing.
          </ThemedText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Medication Share</Text>
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setShowManualInput(true)}
        >
          <IconSymbol name="keyboard" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <CameraView
        ref={camera}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ["qr"],
        }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Scan QR Code</Text>
          <Text style={styles.instructionText}>
            Position the QR code within the frame to access patient medications
          </Text>
        </View>

        {/* Scanning frame */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* Manual Input Modal */}
      <Modal visible={showManualInput} animationType="slide" transparent>
        <View style={styles.manualModalOverlay}>
          <ThemedView style={styles.manualModal}>
            <Text style={styles.manualModalTitle}>Enter Share Code</Text>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Enter medication share code"
              autoCapitalize="none"
            />
            <View style={styles.manualModalButtons}>
              <TouchableOpacity
                style={styles.manualCancelButton}
                onPress={() => {
                  setShowManualInput(false);
                  setManualCode("");
                }}
              >
                <Text style={styles.manualCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualSubmitButton}
                onPress={handleManualSubmit}
              >
                <Text style={styles.manualSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Medication List Modal */}
      <MedicationListModal
        visible={showMedicationModal}
        token={scannedToken}
        medications={medications}
        patient={patient}
        onClose={() => setShowMedicationModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f3f4f6",
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  manualButton: {
    padding: 8,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  instructionContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  instructionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#3b82f6",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  manualModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  manualModal: {
    width: "100%",
    padding: 24,
    borderRadius: 12,
  },
  manualModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  manualModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  manualCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#6b7280",
    alignItems: "center",
  },
  manualCancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  manualSubmitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  manualSubmitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  modalCloseText: {
    color: "#6b7280",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  patientSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  patientInfo: {
    gap: 4,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  patientDetail: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  allergiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergyBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "600",
  },
  conditionItem: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  medicationItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  medicationGeneric: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  medicationPrescriber: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  medicationNotes: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  shareInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
  },
  shareInfoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e40af",
  },
  shareInfoText: {
    fontSize: 12,
    color: "#1e40af",
    marginBottom: 2,
  },
});
