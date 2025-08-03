import { ThemedText } from "@/components/ThemedText";
import { AppIcon } from "@/components/icons/IconSystem";
import {
  FormValidation,
  Medication,
  MedicationFormData,
  StepFormData,
} from "@/mocks/types";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HealthcareDetailsStep } from "./steps/HealthcareDetailsStep";
import { MedicationInfoStep } from "./steps/MedicationInfoStep";
import { ReviewNotesStep } from "./steps/ReviewNotesStep";

const { width } = Dimensions.get("window");

interface MedicationEntryFlowProps {
  visible: boolean;
  medication?: Medication | null;
  onClose: () => void;
  onSave: (data: MedicationFormData) => void;
  isSaving: boolean;
}

/**
 * MedicationEntryFlow - Modern 3-step medication entry interface
 *
 * Features:
 * - Progressive disclosure across 3 focused steps
 * - Smart input suggestions and validation
 * - Smooth animations and transitions
 * - Accessibility compliant design
 * - Mobile-optimized touch targets
 */
export function MedicationEntryFlow({
  visible,
  medication,
  onClose,
  onSave,
  isSaving,
}: MedicationEntryFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StepFormData>({
    step1: { name: "", dosage: "", frequency: "" },
    step2: { prescriber: "", pharmacy: "" },
    step3: { genericName: "", notes: "", isActive: true },
  });
  const [validation, setValidation] = useState<FormValidation>({
    isValid: true,
    errors: {},
  });

  const slideAnim = useRef(new Animated.Value(width)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Initialize form data when editing existing medication
  useEffect(() => {
    if (medication && visible) {
      setFormData({
        step1: {
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
        },
        step2: {
          prescriber: medication.prescriber,
          pharmacy: medication.pharmacy,
        },
        step3: {
          genericName: medication.genericName || "",
          notes: medication.notes || "",
          isActive: medication.isActive ?? true,
        },
      });
    } else if (visible && !medication) {
      // Reset form for new medication
      setFormData({
        step1: { name: "", dosage: "", frequency: "" },
        step2: { prescriber: "", pharmacy: "" },
        step3: { genericName: "", notes: "", isActive: true },
      });
      setCurrentStep(1);
    }
  }, [medication, visible]);

  // Handle modal animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: (currentStep - 1) / 2,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, currentStep, slideAnim, progressAnim]);

  const validateStep = (step: number): FormValidation => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.step1.name.trim()) {
          errors.name = "Medication name is required";
        }
        if (!formData.step1.dosage.trim()) {
          errors.dosage = "Dosage is required";
        }
        if (!formData.step1.frequency.trim()) {
          errors.frequency = "Frequency is required";
        }
        break;
      case 2:
        if (!formData.step2.prescriber.trim()) {
          errors.prescriber = "Prescriber is required";
        }
        if (!formData.step2.pharmacy.trim()) {
          errors.pharmacy = "Pharmacy is required";
        }
        break;
      case 3:
        // Step 3 validation is optional since it's mainly review
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const handleNext = () => {
    const stepValidation = validateStep(currentStep);
    setValidation(stepValidation);

    if (stepValidation.isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: currentStep / 2,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        handleSave();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidation({ isValid: true, errors: {} });
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: (currentStep - 2) / 2,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSave = () => {
    const allStepsValid = [1, 2, 3].every((step) => validateStep(step).isValid);

    if (!allStepsValid) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const combinedData: MedicationFormData = {
      name: formData.step1.name,
      dosage: formData.step1.dosage,
      frequency: formData.step1.frequency,
      prescriber: formData.step2.prescriber,
      pharmacy: formData.step2.pharmacy,
      genericName: formData.step3.genericName || undefined,
      notes: formData.step3.notes || undefined,
      isActive: formData.step3.isActive,
    };

    onSave(combinedData);
  };

  const updateStepData = (step: number, data: Partial<any>) => {
    setFormData((prev) => ({
      ...prev,
      [`step${step}`]: {
        ...prev[`step${step}` as keyof StepFormData],
        ...data,
      },
    }));
    // Clear validation errors when user starts typing
    if (validation.errors && Object.keys(validation.errors).length > 0) {
      setValidation({ isValid: true, errors: {} });
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Medication Info";
      case 2:
        return "Healthcare Details";
      case 3:
        return "Review & Notes";
      default:
        return "";
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MedicationInfoStep
            data={formData.step1}
            onUpdate={(data) => updateStepData(1, data)}
            validation={validation}
          />
        );
      case 2:
        return (
          <HealthcareDetailsStep
            data={formData.step2}
            onUpdate={(data) => updateStepData(2, data)}
            validation={validation}
          />
        );
      case 3:
        return (
          <ReviewNotesStep
            allData={formData}
            onUpdate={(data) => updateStepData(3, data)}
            onEditStep={setCurrentStep}
            validation={validation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerButton}
              accessibilityLabel="Cancel medication entry"
              accessibilityRole="button"
            >
              <AppIcon name="control_close" size="medium" color="default" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <ThemedText style={styles.headerTitle}>
                {getStepTitle()}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Step {currentStep} of 3
              </ThemedText>
            </View>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.headerButton, isSaving && styles.disabledButton]}
              disabled={isSaving}
              accessibilityLabel={
                currentStep === 3 ? "Save medication" : "Go to next step"
              }
              accessibilityRole="button"
            >
              {isSaving ? (
                <Text style={styles.headerButtonText}>Saving...</Text>
              ) : (
                <Text style={styles.headerButtonText}>
                  {currentStep === 3 ? "Save" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["33.33%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.stepIndicators}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.stepIndicator,
                    currentStep >= step && styles.stepIndicatorActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepIndicatorText,
                      currentStep >= step && styles.stepIndicatorTextActive,
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Step Content */}
          <View style={styles.content}>{renderCurrentStep()}</View>

          {/* Navigation Footer */}
          {currentStep > 1 && (
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                accessibilityLabel="Go back to previous step"
                accessibilityRole="button"
              >
                <AppIcon name="control_back" size="small" color="active" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerButton: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepIndicatorActive: {
    backgroundColor: "#3b82f6",
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  stepIndicatorTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
