import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";

/**
 * ScanScreen - Camera interface for scanning medication bottles with OCR processing
 *
 * Features:
 * - Real-time camera preview with capture functionality
 * - Mock OCR processing with confidence scoring
 * - Loading states during image processing
 * - User confirmation flow for extracted medication data
 * - Automatic medication addition to user's list
 * - Comprehensive error handling for camera and processing failures
 * - Permission management with graceful degradation
 *
 * User Experience:
 * - Visual guidance during scanning process
 * - Clear loading indicators during OCR processing
 * - Confirmation dialog with extracted data preview
 * - Option to retake photo or accept results
 * - Seamless navigation back to medication list after adding
 */
export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const takePicture = async () => {
    if (!camera.current || isProcessing) return;

    setIsProcessing(true);
    setShowGuide(false);

    try {
      const photo = await camera.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      // Process the image with mock OCR
      const extractedData = await mockDataService.scanMedication(photo.uri);

      // Show results and navigate to medication management
      Alert.alert(
        "Medication Detected",
        `Found: ${extractedData.name || "Unknown medication"}\nDosage: ${
          extractedData.dosage || "Unknown"
        }\nConfidence: ${Math.round((extractedData.confidence || 0) * 100)}%`,
        [
          {
            text: "Retake",
            style: "cancel",
            onPress: () => {
              setIsProcessing(false);
              setShowGuide(true);
            },
          },
          {
            text: "Add to List",
            onPress: async () => {
              try {
                // Add medication to the list
                await mockDataService.addMedication({
                  name: extractedData.name || "Unknown Medication",
                  dosage: extractedData.dosage || "Unknown",
                  frequency: extractedData.frequency || "As prescribed",
                  prescriber: extractedData.prescriber || "Unknown Doctor",
                  pharmacy: extractedData.pharmacy || "Unknown Pharmacy",
                  dateAdded: new Date().toISOString(),
                  notes: `Added via camera scan (Confidence: ${Math.round(
                    (extractedData.confidence || 0) * 100
                  )}%)`,
                });

                // Show success message
                Alert.alert(
                  "Success",
                  "Medication added to your list successfully!"
                );

                // Navigate to medications tab
                router.push("/(tabs)/");
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Failed to add medication. Please try again."
                );
              } finally {
                setIsProcessing(false);
                setShowGuide(true);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to take picture:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
      setIsProcessing(false);
      setShowGuide(true);
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <AppIcon name="nav_scan" size="large" color="disabled" />
          <ThemedText style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            MedReconcile Pro needs camera access to scan pill bottles and
            extract medication information.
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

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={styles.permissionTitle}>
            Loading Camera...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView ref={camera} style={styles.camera} facing="back" />

        {/* Overlay with scanning guide */}
        <View style={styles.overlay}>
          {showGuide && (
            <View style={styles.guideContainer}>
              <ThemedText style={styles.guideTitle}>
                Scan Pill Bottle
              </ThemedText>
              <ThemedText style={styles.guideText}>
                Position the medication label within the frame below
              </ThemedText>
            </View>
          )}

          {/* Scanning frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.processingText}>Processing image...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)/")}
            >
              <AppIcon name="control_back" size="medium" color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={() =>
                Alert.alert(
                  "Scanning Tips",
                  "• Ensure good lighting\n• Hold steady\n• Position label clearly in frame\n• Avoid glare and shadows"
                )
              }
            >
              <AppIcon name="profile_help" size="medium" color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  cameraContainer: {
    flex: 1,
    position: "relative",
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
  },
  guideContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  guideTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  guideText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
  scanFrame: {
    width: 280,
    height: 200,
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
  processingContainer: {
    position: "absolute",
    alignItems: "center",
  },
  processingText: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "600",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
