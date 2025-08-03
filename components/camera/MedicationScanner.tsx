import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

interface ExtractedMedicationData {
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
  confidence: number;
  field_confidences: Record<string, number>;
  needs_review: boolean;
}

interface ScanResult {
  success: boolean;
  extracted_data?: ExtractedMedicationData;
  needs_review?: boolean;
  processing_time?: string;
  message?: string;
  user_id?: string;
  image_size?: number;
  image_type?: string;
  timestamp?: string;
  raw_text?: string;
}

export default function MedicationScanner() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Request media library permissions for saving photos
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Media library permission not granted");
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      console.log("📸 Taking picture...");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (photo) {
        console.log("✅ Photo captured:", photo.uri);
        setCapturedImage(photo.uri);

        // Process the image with backend API
        await processImage(photo.uri);
      }
    } catch (error) {
      console.error("❌ Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      console.log("🔍 Processing image with backend...");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "medication-bottle.jpg",
      } as File);

      // Use mock data for scanning to avoid API errors
      const result = await mockDataService.scanMedication();
      console.log("✅ Mock OCR processing complete:", result);

      setScanResult({ success: true, extracted_data: result });

      if (result) {
        const confidence = Math.round((result.confidence || 0.95) * 100);
        const needsReview = result.needs_review || confidence < 80;

        if (needsReview) {
          // Low confidence - show review alert
          Alert.alert(
            "Scan Complete - Review Required ⚠️",
            `Medication: ${result.extracted_data.name}\nDosage: ${result.extracted_data.dosage}\nConfidence: ${confidence}%\n\nThe scan quality requires manual review before saving.`,
            [
              {
                text: "Review & Correct",
                onPress: () => navigateToReview(result.extracted_data!, true),
                style: "default",
              },
              {
                text: "Scan Again",
                onPress: resetScanner,
                style: "cancel",
              },
            ]
          );
        } else {
          // High confidence - show success alert
          Alert.alert(
            "Scan Successful! 📋",
            `Medication: ${result.extracted_data.name}\nDosage: ${
              result.extracted_data.dosage
            }\nConfidence: ${confidence}%\n\nProcessing time: ${
              result.processing_time || "N/A"
            }`,
            [
              {
                text: "Review & Save",
                onPress: () => navigateToReview(result.extracted_data!),
              },
              {
                text: "Scan Another",
                onPress: resetScanner,
              },
            ]
          );
        }
      } else {
        Alert.alert(
          "Scan Failed ❌",
          result.message ||
            "Could not extract medication data from the image. Please try again with better lighting or a clearer image.",
          [
            {
              text: "Try Again",
              onPress: resetScanner,
            },
            {
              text: "Manual Entry",
              onPress: () => router.push("/(tabs)/medications"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Image processing failed:", error);
      Alert.alert(
        "Processing Failed",
        "Unable to process the image. Please check your connection and try again.",
        [
          {
            text: "Try Again",
            onPress: resetScanner,
          },
          {
            text: "Manual Entry",
            onPress: () => router.push("/(tabs)/medications"),
          },
        ]
      );
    }
  };

  const navigateToReview = (
    medicationData: ExtractedMedicationData,
    requiresReview = false
  ) => {
    // Navigate to medication review screen with extracted data
    console.log("📝 Navigating to review with data:", medicationData);

    const title = requiresReview ? "Review Required ⚠️" : "Review & Save";
    const message = requiresReview
      ? "Please review and correct the extracted medication information before saving."
      : "Review the extracted medication information and save if correct.";

    Alert.alert(
      title,
      `${message}\n\nMedication: ${medicationData.name}\nDosage: ${medicationData.dosage}\nFrequency: ${medicationData.frequency}\nPrescriber: ${medicationData.prescriber}`,
      [
        {
          text: requiresReview ? "Cancel" : "Edit",
          style: "cancel",
          onPress: () => router.push("/(tabs)/medications"),
        },
        {
          text: requiresReview ? "Save Anyway" : "Save",
          onPress: () => {
            // In a full implementation, save the medication data
            console.log("💾 Saving medication data:", medicationData);
            router.push("/(tabs)/medications");
          },
        },
      ]
    );
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    setIsProcessing(false);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      const modes: FlashMode[] = ["off", "on", "auto"];
      const currentIndex = modes.indexOf(current);
      return modes[(currentIndex + 1) % modes.length];
    });
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <AppIcon name="action_help" size="large" color="warning" />
          <ThemedText style={styles.permissionTitle}>
            Camera Access Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            We need access to your camera to scan medication bottle labels.
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
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AppIcon name="nav_back" size="medium" color="primary" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Scan Medication</ThemedText>
        <View style={styles.headerSpacer} />
      </ThemedView>

      {/* Camera or Captured Image */}
      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: capturedImage }}
              style={styles.capturedImage}
            />
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.processingText}>Processing image...</Text>
              </View>
            )}
          </View>
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
          >
            {/* Camera Overlay */}
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <View
                  style={styles.corner}
                  style={[styles.corner, styles.topLeft]}
                />
                <View
                  style={styles.corner}
                  style={[styles.corner, styles.topRight]}
                />
                <View
                  style={styles.corner}
                  style={[styles.corner, styles.bottomLeft]}
                />
                <View
                  style={styles.corner}
                  style={[styles.corner, styles.bottomRight]}
                />
              </View>
              <ThemedText style={styles.instructionText}>
                Position the medication label within the frame
              </ThemedText>
            </View>
          </CameraView>
        )}
      </View>

      {/* Controls */}
      <ThemedView style={styles.controls}>
        {capturedImage ? (
          <View style={styles.captureControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={resetScanner}
              disabled={isProcessing}
            >
              <AppIcon name="action_refresh" size="medium" color="secondary" />
              <Text style={styles.controlButtonText}>Retake</Text>
            </TouchableOpacity>

            {scanResult && (
              <TouchableOpacity
                style={[styles.controlButton, styles.saveButton]}
                onPress={() =>
                  scanResult.extracted_data &&
                  navigateToReview(scanResult.extracted_data)
                }
                disabled={isProcessing}
              >
                <AppIcon name="action_save" size="medium" color="success" />
                <Text style={[styles.controlButtonText, styles.saveButtonText]}>
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <AppIcon
                name={flash === "off" ? "flash_off" : "flash_on"}
                size="medium"
                color="secondary"
              />
              <Text style={styles.controlButtonText}>Flash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner}>
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <AppIcon name="camera" size="large" color="white" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <AppIcon name="camera_flip" size="medium" color="secondary" />
              <Text style={styles.controlButtonText}>Flip</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
  },
  headerSpacer: {
    width: 44,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  scanArea: {
    width: 280,
    height: 180,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#ffffff",
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
  instructionText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imagePreview: {
    flex: 1,
    position: "relative",
  },
  capturedImage: {
    flex: 1,
    width: "100%",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  processingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 16,
  },
  controls: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  captureControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  controlButton: {
    alignItems: "center",
    padding: 12,
  },
  controlButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#666666",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "600",
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
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
