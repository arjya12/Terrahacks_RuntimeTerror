import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { DosageOption, FormValidation, FrequencyOption } from "@/mocks/types";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MedicationInfoStepProps {
  data: {
    name: string;
    dosage: string;
    frequency: string;
  };
  onUpdate: (data: Partial<typeof data>) => void;
  validation: FormValidation;
}

// Common medication suggestions for auto-complete
const MEDICATION_SUGGESTIONS = [
  "Lisinopril",
  "Atorvastatin",
  "Metformin",
  "Amlodipine",
  "Metoprolol",
  "Omeprazole",
  "Simvastatin",
  "Losartan",
  "Levothyroxine",
  "Hydrochlorothiazide",
  "Gabapentin",
  "Sertraline",
  "Furosemide",
  "Pantoprazole",
  "Prednisone",
  "Tramadol",
  "Trazodone",
  "Meloxicam",
  "Clonazepam",
  "Cyclobenzaprine",
];

// Common dosage options
const DOSAGE_OPTIONS: DosageOption[] = [
  { value: "5mg", label: "5 mg", unit: "mg" },
  { value: "10mg", label: "10 mg", unit: "mg" },
  { value: "25mg", label: "25 mg", unit: "mg" },
  { value: "50mg", label: "50 mg", unit: "mg" },
  { value: "100mg", label: "100 mg", unit: "mg" },
  { value: "250mg", label: "250 mg", unit: "mg" },
  { value: "500mg", label: "500 mg", unit: "mg" },
  { value: "1000mg", label: "1000 mg", unit: "mg" },
  { value: "1mg", label: "1 mg", unit: "mg" },
  { value: "2mg", label: "2 mg", unit: "mg" },
];

// Common frequency options
const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: "once_daily",
    label: "Once daily",
    description: "Take once per day",
  },
  {
    value: "twice_daily",
    label: "Twice daily",
    description: "Take twice per day",
  },
  {
    value: "three_times_daily",
    label: "Three times daily",
    description: "Take three times per day",
  },
  {
    value: "four_times_daily",
    label: "Four times daily",
    description: "Take four times per day",
  },
  {
    value: "every_other_day",
    label: "Every other day",
    description: "Take every 48 hours",
  },
  { value: "weekly", label: "Weekly", description: "Take once per week" },
  {
    value: "as_needed",
    label: "As needed",
    description: "Take as needed for symptoms",
  },
];

/**
 * MedicationInfoStep - Step 1 of medication entry flow
 *
 * Features:
 * - Smart medication name suggestions
 * - Quick-select dosage options
 * - Preset frequency choices
 * - Real-time validation with inline errors
 * - Accessible form controls
 */
export function MedicationInfoStep({
  data,
  onUpdate,
  validation,
}: MedicationInfoStepProps) {
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showDosageOptions, setShowDosageOptions] = useState(false);
  const [showFrequencyOptions, setShowFrequencyOptions] = useState(false);

  // Filter medication suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!data.name || data.name.length < 2) return [];
    return MEDICATION_SUGGESTIONS.filter((med) =>
      med.toLowerCase().includes(data.name.toLowerCase())
    ).slice(0, 5);
  }, [data.name]);

  const handleNameChange = (text: string) => {
    onUpdate({ name: text });
    setShowNameSuggestions(text.length >= 2 && filteredSuggestions.length > 0);
  };

  const selectMedication = (medication: string) => {
    onUpdate({ name: medication });
    setShowNameSuggestions(false);
  };

  const selectDosage = (dosage: string) => {
    onUpdate({ dosage });
    setShowDosageOptions(false);
  };

  const selectFrequency = (freq: FrequencyOption) => {
    onUpdate({ frequency: freq.label });
    setShowFrequencyOptions(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.card}>
        <View style={styles.stepHeader}>
          <AppIcon name="nav_medications" size="large" color="active" />
          <View style={styles.stepHeaderText}>
            <ThemedText style={styles.stepTitle}>
              Essential Information
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Enter the basic details about your medication
            </ThemedText>
          </View>
        </View>

        {/* Medication Name Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Medication Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                validation.errors.name && styles.inputError,
              ]}
              value={data.name}
              onChangeText={handleNameChange}
              placeholder="Start typing medication name..."
              placeholderTextColor="#9ca3af"
              accessibilityLabel="Medication name input"
              accessibilityHint="Type the name of your medication"
              autoCorrect={false}
              autoCapitalize="words"
            />
            {data.name.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onUpdate({ name: "" })}
                accessibilityLabel="Clear medication name"
                accessibilityRole="button"
              >
                <AppIcon name="control_close" size="small" color="disabled" />
              </TouchableOpacity>
            )}
          </View>

          {validation.errors.name && (
            <Text style={styles.errorText}>{validation.errors.name}</Text>
          )}

          {/* Medication Suggestions */}
          {showNameSuggestions && filteredSuggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {filteredSuggestions.map((medication, index) => (
                <TouchableOpacity
                  key={medication}
                  style={[
                    styles.suggestionItem,
                    index === filteredSuggestions.length - 1 &&
                      styles.suggestionItemLast,
                  ]}
                  onPress={() => selectMedication(medication)}
                  accessibilityLabel={`Select ${medication}`}
                  accessibilityRole="button"
                >
                  <AppIcon name="med_type_pill" size="small" color="default" />
                  <Text style={styles.suggestionText}>{medication}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Dosage Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Dosage <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.selectInput,
              validation.errors.dosage && styles.inputError,
            ]}
            onPress={() => setShowDosageOptions(!showDosageOptions)}
            accessibilityLabel="Select dosage"
            accessibilityRole="button"
            accessibilityHint="Tap to choose from common dosage options"
          >
            <Text
              style={[
                styles.selectInputText,
                !data.dosage && styles.placeholderText,
              ]}
            >
              {data.dosage || "Select dosage amount"}
            </Text>
            <AppIcon
              name={showDosageOptions ? "control_back" : "control_forward"}
              size="small"
              color="default"
            />
          </TouchableOpacity>

          {validation.errors.dosage && (
            <Text style={styles.errorText}>{validation.errors.dosage}</Text>
          )}

          {/* Dosage Options */}
          {showDosageOptions && (
            <View style={styles.optionsList}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {DOSAGE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dosageOption,
                      data.dosage === option.value &&
                        styles.dosageOptionSelected,
                    ]}
                    onPress={() => selectDosage(option.value)}
                    accessibilityLabel={`Select ${option.label}`}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.dosageOptionText,
                        data.dosage === option.value &&
                          styles.dosageOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.customDosageContainer}>
                <Text style={styles.customDosageLabel}>Custom dosage:</Text>
                <TextInput
                  style={styles.customDosageInput}
                  placeholder="e.g., 7.5mg, 1/2 tablet"
                  value={
                    DOSAGE_OPTIONS.find((o) => o.value === data.dosage)
                      ? ""
                      : data.dosage
                  }
                  onChangeText={(text) => onUpdate({ dosage: text })}
                  accessibilityLabel="Custom dosage input"
                />
              </View>
            </View>
          )}
        </View>

        {/* Frequency Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            How often do you take this? <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.selectInput,
              validation.errors.frequency && styles.inputError,
            ]}
            onPress={() => setShowFrequencyOptions(!showFrequencyOptions)}
            accessibilityLabel="Select frequency"
            accessibilityRole="button"
            accessibilityHint="Tap to choose how often you take this medication"
          >
            <Text
              style={[
                styles.selectInputText,
                !data.frequency && styles.placeholderText,
              ]}
            >
              {data.frequency || "Select frequency"}
            </Text>
            <AppIcon
              name={showFrequencyOptions ? "control_back" : "control_forward"}
              size="small"
              color="default"
            />
          </TouchableOpacity>

          {validation.errors.frequency && (
            <Text style={styles.errorText}>{validation.errors.frequency}</Text>
          )}

          {/* Frequency Options */}
          {showFrequencyOptions && (
            <View style={styles.optionsList}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    data.frequency === option.label &&
                      styles.frequencyOptionSelected,
                  ]}
                  onPress={() => selectFrequency(option)}
                  accessibilityLabel={`Select ${option.label} - ${option.description}`}
                  accessibilityRole="button"
                >
                  <View style={styles.frequencyOptionContent}>
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        data.frequency === option.label &&
                          styles.frequencyOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.frequencyOptionDescription,
                        data.frequency === option.label &&
                          styles.frequencyOptionDescriptionSelected,
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {data.frequency === option.label && (
                    <AppIcon
                      name="feedback_completed"
                      size="small"
                      color="active"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <AppIcon name="profile_help" size="small" color="warning" />
          <Text style={styles.helpText}>
            Don't see your medication? You can type any name. Common dosages and
            frequencies are shown for quick selection.
          </Text>
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
  selectInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  selectInputText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  placeholderText: {
    color: "#9ca3af",
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
  optionsList: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  dosageOption: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    minWidth: 60,
    alignItems: "center",
  },
  dosageOptionSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  dosageOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  dosageOptionTextSelected: {
    color: "#ffffff",
  },
  customDosageContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
  },
  customDosageLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  customDosageInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
  frequencyOption: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  frequencyOptionSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  frequencyOptionContent: {
    flex: 1,
  },
  frequencyOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  frequencyOptionTextSelected: {
    color: "#3b82f6",
  },
  frequencyOptionDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  frequencyOptionDescriptionSelected: {
    color: "#2563eb",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
