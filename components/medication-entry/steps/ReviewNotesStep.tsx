import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { FormValidation, StepFormData } from "@/mocks/types";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ReviewNotesStepProps {
  allData: StepFormData;
  onUpdate: (data: Partial<StepFormData["step3"]>) => void;
  onEditStep: (step: number) => void;
  validation: FormValidation;
}

/**
 * ReviewNotesStep - Step 3 of medication entry flow
 *
 * Features:
 * - Complete review of all entered information
 * - Quick edit access to previous steps
 * - Optional notes and generic name entry
 * - Active/inactive medication toggle
 * - Final validation before save
 */
export function ReviewNotesStep({
  allData,
  onUpdate,
  onEditStep,
  validation,
}: ReviewNotesStepProps) {
  const { step1, step2, step3 } = allData;

  const reviewItems = [
    {
      label: "Medication",
      value: step1.name,
      step: 1,
      icon: "pills.fill" as const,
      required: true,
    },
    {
      label: "Dosage",
      value: step1.dosage,
      step: 1,
      icon: "scalemass" as const,
      required: true,
    },
    {
      label: "Frequency",
      value: step1.frequency,
      step: 1,
      icon: "clock" as const,
      required: true,
    },
    {
      label: "Prescriber",
      value: step2.prescriber,
      step: 2,
      icon: "person.badge.plus" as const,
      required: true,
    },
    {
      label: "Pharmacy",
      value: step2.pharmacy,
      step: 2,
      icon: "cross.fill" as const,
      required: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.card}>
        <View style={styles.stepHeader}>
          <AppIcon name="feedback_completed" size="large" color="success" />
          <View style={styles.stepHeaderText}>
            <ThemedText style={styles.stepTitle}>Review & Finalize</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Review your information and add any additional details
            </ThemedText>
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Review Information</Text>
          <Text style={styles.sectionDescription}>
            Check that everything looks correct. Tap any item to edit.
          </Text>

          <View style={styles.reviewGrid}>
            {reviewItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={styles.reviewItem}
                onPress={() => onEditStep(item.step)}
                accessibilityLabel={`Edit ${item.label}: ${item.value}`}
                accessibilityRole="button"
                accessibilityHint="Tap to edit this information"
              >
                <View style={styles.reviewItemHeader}>
                  <AppIcon name="action_edit" size="small" color="default" />
                  <Text style={styles.reviewItemLabel}>{item.label}</Text>
                  {item.required && (
                    <Text style={styles.reviewItemRequired}>*</Text>
                  )}
                  <AppIcon
                    name="control_forward"
                    size="mini"
                    color="disabled"
                  />
                </View>
                <Text
                  style={[
                    styles.reviewItemValue,
                    !item.value && styles.reviewItemValueEmpty,
                  ]}
                  numberOfLines={2}
                >
                  {item.value || "Not provided"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Details Section */}
        <View style={styles.additionalSection}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <Text style={styles.sectionDescription}>
            Optional information to help with medication management
          </Text>

          {/* Generic Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Generic Name (Optional)</Text>
            <View style={styles.inputContainer}>
              <AppIcon name="nav_medications" size="small" color="default" />
              <TextInput
                style={styles.textInputWithIcon}
                value={step3.genericName || ""}
                onChangeText={(text) => onUpdate({ genericName: text })}
                placeholder="e.g., Ibuprofen for Advil"
                placeholderTextColor="#9ca3af"
                accessibilityLabel="Generic medication name input"
                accessibilityHint="Enter the generic name of this medication if known"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
            <Text style={styles.fieldHint}>
              The active ingredient name (useful for identifying alternatives)
            </Text>
          </View>

          {/* Notes Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                value={step3.notes || ""}
                onChangeText={(text) => onUpdate({ notes: text })}
                placeholder="Any additional information about this medication..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Medication notes input"
                accessibilityHint="Add any additional notes about this medication"
              />
            </View>
            <Text style={styles.fieldHint}>
              Include special instructions, side effects, or other reminders
            </Text>
          </View>

          {/* Active Status Toggle */}
          <View style={styles.fieldGroup}>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleInfo}>
                <Text style={styles.fieldLabel}>Medication Status</Text>
                <Text style={styles.toggleDescription}>
                  {step3.isActive
                    ? "This medication is currently active"
                    : "This medication is inactive or discontinued"}
                </Text>
              </View>
              <View style={styles.toggleWrapper}>
                <Switch
                  value={step3.isActive}
                  onValueChange={(value) => onUpdate({ isActive: value })}
                  trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                  thumbColor={step3.isActive ? "#ffffff" : "#f3f4f6"}
                  accessibilityLabel="Medication active status toggle"
                  accessibilityHint={
                    step3.isActive
                      ? "Turn off to mark as inactive"
                      : "Turn on to mark as active"
                  }
                />
              </View>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <AppIcon name="profile_help" size="medium" color="active" />
            <Text style={styles.summaryTitle}>Medication Summary</Text>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryBold}>{step1.name}</Text>
              {step3.genericName && ` (${step3.genericName})`}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryBold}>Dosage:</Text> {step1.dosage} •{" "}
              {step1.frequency}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryBold}>Prescribed by:</Text>{" "}
              {step2.prescriber}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryBold}>Pharmacy:</Text> {step2.pharmacy}
            </Text>
            {step3.notes && (
              <Text style={styles.summaryText}>
                <Text style={styles.summaryBold}>Notes:</Text> {step3.notes}
              </Text>
            )}

            <View style={styles.summaryStatus}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: step3.isActive ? "#10b981" : "#6b7280" },
                ]}
              >
                <Text style={styles.statusText}>
                  {step3.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionButtons}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => onEditStep(1)}
              accessibilityLabel="Edit medication details"
              accessibilityRole="button"
            >
              <AppIcon name="nav_medications" size="small" color="active" />
              <Text style={styles.quickActionText}>Edit Medication</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => onEditStep(2)}
              accessibilityLabel="Edit healthcare providers"
              accessibilityRole="button"
            >
              <AppIcon name="provider_doctor" size="small" color="active" />
              <Text style={styles.quickActionText}>Edit Providers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stepHeaderText: {
    marginLeft: 16,
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  reviewGrid: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  reviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewItemLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginLeft: 8,
    flex: 1,
  },
  reviewItemRequired: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
  reviewItemValue: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  reviewItemValueEmpty: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  additionalSection: {
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingLeft: 16,
    minHeight: 48,
  },
  textInputWithIcon: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
  },
  notesContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  notesInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    color: "#374151",
  },
  fieldHint: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 18,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  toggleWrapper: {
    marginLeft: 16,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  summaryBold: {
    fontWeight: "600",
    color: "#1e293b",
  },
  summaryStatus: {
    flexDirection: "row",
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  quickActions: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  quickActionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
    marginLeft: 8,
  },
});
