import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { FormValidation } from "@/mocks/types";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface HealthcareDetailsStepProps {
  data: {
    prescriber: string;
    pharmacy: string;
  };
  onUpdate: (data: Partial<typeof data>) => void;
  validation: FormValidation;
}

// Common doctor types and names for suggestions
const PRESCRIBER_SUGGESTIONS = [
  "Dr. Smith",
  "Dr. Johnson",
  "Dr. Williams",
  "Dr. Brown",
  "Dr. Jones",
  "Dr. Garcia",
  "Dr. Miller",
  "Dr. Davis",
  "Dr. Rodriguez",
  "Dr. Martinez",
  "Family Medicine Clinic",
  "Internal Medicine Associates",
  "Cardiology Center",
  "Endocrinology Specialists",
  "Neurology Group",
  "Orthopedic Associates",
];

// Common pharmacy chains and local pharmacies
const PHARMACY_SUGGESTIONS = [
  "CVS Pharmacy",
  "Walgreens",
  "Rite Aid",
  "Walmart Pharmacy",
  "Target Pharmacy",
  "Kroger Pharmacy",
  "Safeway Pharmacy",
  "Costco Pharmacy",
  "Sam's Club Pharmacy",
  "Publix Pharmacy",
  "Meijer Pharmacy",
  "H-E-B Pharmacy",
  "Local Community Pharmacy",
  "Independent Pharmacy",
  "Hospital Pharmacy",
];

/**
 * HealthcareDetailsStep - Step 2 of medication entry flow
 *
 * Features:
 * - Auto-complete for prescriber names
 * - Pharmacy suggestions with common chains
 * - Smart filtering based on user input
 * - Skip option for quick entry
 * - Professional healthcare context
 */
export function HealthcareDetailsStep({
  data,
  onUpdate,
  validation,
}: HealthcareDetailsStepProps) {
  const [showPrescriberSuggestions, setShowPrescriberSuggestions] =
    useState(false);
  const [showPharmacySuggestions, setShowPharmacySuggestions] = useState(false);

  // Filter prescriber suggestions based on input
  const filteredPrescriberSuggestions = useMemo(() => {
    if (!data.prescriber || data.prescriber.length < 2) return [];
    return PRESCRIBER_SUGGESTIONS.filter((prescriber) =>
      prescriber.toLowerCase().includes(data.prescriber.toLowerCase())
    ).slice(0, 5);
  }, [data.prescriber]);

  // Filter pharmacy suggestions based on input
  const filteredPharmacySuggestions = useMemo(() => {
    if (!data.pharmacy || data.pharmacy.length < 2) return [];
    return PHARMACY_SUGGESTIONS.filter((pharmacy) =>
      pharmacy.toLowerCase().includes(data.pharmacy.toLowerCase())
    ).slice(0, 5);
  }, [data.pharmacy]);

  const handlePrescriberChange = (text: string) => {
    onUpdate({ prescriber: text });
    setShowPrescriberSuggestions(
      text.length >= 2 && filteredPrescriberSuggestions.length > 0
    );
  };

  const handlePharmacyChange = (text: string) => {
    onUpdate({ pharmacy: text });
    setShowPharmacySuggestions(
      text.length >= 2 && filteredPharmacySuggestions.length > 0
    );
  };

  const selectPrescriber = (prescriber: string) => {
    onUpdate({ prescriber });
    setShowPrescriberSuggestions(false);
  };

  const selectPharmacy = (pharmacy: string) => {
    onUpdate({ pharmacy });
    setShowPharmacySuggestions(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.card}>
        <View style={styles.stepHeader}>
          <AppIcon name="provider_doctor" size="large" color="success" />
          <View style={styles.stepHeaderText}>
            <ThemedText style={styles.stepTitle}>Healthcare Details</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Tell us about your doctor and pharmacy
            </ThemedText>
          </View>
        </View>

        {/* Prescriber Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Prescribing Doctor <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <AppIcon name="provider_doctor" size="small" color="default" />
              <TextInput
                style={[
                  styles.textInput,
                  styles.textInputWithIcon,
                  validation.errors.prescriber && styles.inputError,
                ]}
                value={data.prescriber}
                onChangeText={handlePrescriberChange}
                placeholder="Dr. Smith, Family Medicine..."
                placeholderTextColor="#9ca3af"
                accessibilityLabel="Prescribing doctor input"
                accessibilityHint="Enter the name of the doctor who prescribed this medication"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
            {data.prescriber.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onUpdate({ prescriber: "" })}
                accessibilityLabel="Clear prescriber name"
                accessibilityRole="button"
              >
                <AppIcon name="control_close" size="small" color="disabled" />
              </TouchableOpacity>
            )}
          </View>

          {validation.errors.prescriber && (
            <Text style={styles.errorText}>{validation.errors.prescriber}</Text>
          )}

          {/* Prescriber Suggestions */}
          {showPrescriberSuggestions &&
            filteredPrescriberSuggestions.length > 0 && (
              <View style={styles.suggestionsList}>
                {filteredPrescriberSuggestions.map((prescriber, index) => (
                  <TouchableOpacity
                    key={prescriber}
                    style={[
                      styles.suggestionItem,
                      index === filteredPrescriberSuggestions.length - 1 &&
                        styles.suggestionItemLast,
                    ]}
                    onPress={() => selectPrescriber(prescriber)}
                    accessibilityLabel={`Select ${prescriber}`}
                    accessibilityRole="button"
                  >
                    <IconSymbol
                      name="person.circle"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.suggestionText}>{prescriber}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          <View style={styles.fieldHint}>
            <AppIcon name="profile_help" size="small" color="default" />
            <Text style={styles.hintText}>
              Include the doctor's full name and specialty if known (e.g., "Dr.
              Smith, Cardiology")
            </Text>
          </View>
        </View>

        {/* Pharmacy Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Pharmacy <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <AppIcon name="provider_pharmacy" size="small" color="default" />
              <TextInput
                style={[
                  styles.textInput,
                  styles.textInputWithIcon,
                  validation.errors.pharmacy && styles.inputError,
                ]}
                value={data.pharmacy}
                onChangeText={handlePharmacyChange}
                placeholder="CVS, Walgreens, Local Pharmacy..."
                placeholderTextColor="#9ca3af"
                accessibilityLabel="Pharmacy input"
                accessibilityHint="Enter the name of the pharmacy where you get this medication"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
            {data.pharmacy.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onUpdate({ pharmacy: "" })}
                accessibilityLabel="Clear pharmacy name"
                accessibilityRole="button"
              >
                <IconSymbol
                  name="xmark.circle.fill"
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            )}
          </View>

          {validation.errors.pharmacy && (
            <Text style={styles.errorText}>{validation.errors.pharmacy}</Text>
          )}

          {/* Pharmacy Suggestions */}
          {showPharmacySuggestions &&
            filteredPharmacySuggestions.length > 0 && (
              <View style={styles.suggestionsList}>
                {filteredPharmacySuggestions.map((pharmacy, index) => (
                  <TouchableOpacity
                    key={pharmacy}
                    style={[
                      styles.suggestionItem,
                      index === filteredPharmacySuggestions.length - 1 &&
                        styles.suggestionItemLast,
                    ]}
                    onPress={() => selectPharmacy(pharmacy)}
                    accessibilityLabel={`Select ${pharmacy}`}
                    accessibilityRole="button"
                  >
                    <IconSymbol name="building.2" size={16} color="#6b7280" />
                    <Text style={styles.suggestionText}>{pharmacy}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          <View style={styles.fieldHint}>
            <IconSymbol name="info.circle" size={14} color="#6b7280" />
            <Text style={styles.hintText}>
              Include location if you have multiple locations (e.g., "CVS - Main
              Street")
            </Text>
          </View>
        </View>

        {/* Quick Fill Options */}
        <View style={styles.quickFillContainer}>
          <Text style={styles.quickFillTitle}>Quick Fill Options</Text>
          <Text style={styles.quickFillDescription}>
            Tap to use your most recent healthcare providers
          </Text>

          <View style={styles.quickFillButtons}>
            <TouchableOpacity
              style={styles.quickFillButton}
              onPress={() => {
                onUpdate({
                  prescriber: "Dr. Smith, Family Medicine",
                  pharmacy: "CVS Pharmacy - Main St",
                });
              }}
              accessibilityLabel="Use most recent providers"
              accessibilityRole="button"
            >
              <IconSymbol
                name="clock.arrow.circlepath"
                size={16}
                color="#3b82f6"
              />
              <Text style={styles.quickFillButtonText}>Use Recent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickFillButton, styles.quickFillButtonSecondary]}
              onPress={() => {
                onUpdate({
                  prescriber: "General Practitioner",
                  pharmacy: "Local Pharmacy",
                });
              }}
              accessibilityLabel="Use generic providers"
              accessibilityRole="button"
            >
              <IconSymbol
                name="questionmark.circle"
                size={16}
                color="#6b7280"
              />
              <Text
                style={[
                  styles.quickFillButtonText,
                  styles.quickFillButtonTextSecondary,
                ]}
              >
                Use Generic
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpContainer}>
          <View style={styles.helpHeader}>
            <IconSymbol name="questionmark.circle" size={20} color="#3b82f6" />
            <Text style={styles.helpTitle}>
              Why do we need this information?
            </Text>
          </View>
          <View style={styles.helpContent}>
            <View style={styles.helpItem}>
              <IconSymbol name="checkmark.circle" size={16} color="#10b981" />
              <Text style={styles.helpItemText}>
                Helps identify the source of your prescription
              </Text>
            </View>
            <View style={styles.helpItem}>
              <IconSymbol name="checkmark.circle" size={16} color="#10b981" />
              <Text style={styles.helpItemText}>
                Enables better coordination with your healthcare team
              </Text>
            </View>
            <View style={styles.helpItem}>
              <IconSymbol name="checkmark.circle" size={16} color="#10b981" />
              <Text style={styles.helpItemText}>
                Useful for pharmacy transfers and refills
              </Text>
            </View>
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
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  required: {
    color: "#ef4444",
  },
  inputContainer: {
    position: "relative",
  },
  inputIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingLeft: 16,
    minHeight: 48,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
    minHeight: 48,
  },
  textInputWithIcon: {
    borderWidth: 0,
    flex: 1,
    marginLeft: 12,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  fieldHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  hintText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  suggestionsList: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  quickFillContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quickFillTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  quickFillDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  quickFillButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickFillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  quickFillButtonSecondary: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  quickFillButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
    marginLeft: 8,
  },
  quickFillButtonTextSecondary: {
    color: "#6b7280",
  },
  helpContainer: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0369a1",
    marginLeft: 8,
  },
  helpContent: {
    gap: 8,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  helpItemText: {
    fontSize: 14,
    color: "#0c4a6e",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
