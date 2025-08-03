import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";

const { width, height } = Dimensions.get("window");

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to MedReconcile Pro",
    description:
      "Manage your medications with confidence tracking, secure sharing, and smart scanning features.",
    icon: "pills.fill",
    color: "#3b82f6",
  },
  {
    title: "Smart Medication Management",
    description:
      "View your medications with confidence scores, add new ones manually, and track active vs inactive prescriptions.",
    icon: "list.bullet.rectangle",
    color: "#10b981",
  },
  {
    title: "Camera Scanning",
    description:
      "Scan pill bottles with your camera to automatically extract medication information using OCR technology.",
    icon: "camera.fill",
    color: "#f59e0b",
  },
  {
    title: "Secure Sharing",
    description:
      "Generate QR codes to securely share your medication list with healthcare providers when needed.",
    icon: "qrcode",
    color: "#8b5cf6",
  },
];

interface OnboardingFlowProps {
  visible: boolean;
  onComplete: () => void;
}

/**
 * OnboardingFlow - Simple 4-step introduction for new users
 *
 * Features:
 * - 4 key app features introduction
 * - Swipe/tap navigation between steps
 * - Skip option for returning users
 * - Smooth transitions and visual design
 * - Completion callback to start main app
 */
export default function OnboardingFlow({
  visible,
  onComplete,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={skipOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index <= currentStep ? currentStepData.color : "#e5e7eb",
                  },
                ]}
              />
            ))}
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBackground,
                { backgroundColor: `${currentStepData.color}20` },
              ]}
            >
              <AppIcon name="nav_medications" size="large" color="active" />
            </View>
          </View>

          <ThemedView style={styles.textContainer}>
            <ThemedText style={styles.title}>
              {currentStepData.title}
            </ThemedText>
            <ThemedText style={styles.description}>
              {currentStepData.description}
            </ThemedText>
          </ThemedView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: currentStepData.color },
            ]}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            <AppIcon
              name={
                currentStep === onboardingSteps.length - 1
                  ? "feedback_completed"
                  : "control_forward"
              }
              size="small"
              color="white"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
