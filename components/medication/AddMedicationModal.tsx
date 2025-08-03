import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { Database } from "@/config/supabase";
import { useAddMedication } from "@/hooks/useSupabase";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MedicationInsert = Database["public"]["Tables"]["medications"]["Insert"];

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  instructions: string;
  prescriber: string;
  rx_number: string;
  pharmacy: string;
}

const frequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Weekly",
  "Monthly",
];

export function AddMedicationModal({
  visible,
  onClose,
}: AddMedicationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dosage: "",
    frequency: "Once daily",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    instructions: "",
    prescriber: "",
    rx_number: "",
    pharmacy: "",
  });

  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const addMedication = useAddMedication();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Medication name is required");
      return;
    }

    if (!formData.dosage.trim()) {
      Alert.alert("Error", "Dosage is required");
      return;
    }

    try {
      const medicationData: Omit<MedicationInsert, "user_id"> = {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        instructions: formData.instructions.trim() || null,
        prescriber: formData.prescriber.trim() || null,
        rx_number: formData.rx_number.trim() || null,
        pharmacy: formData.pharmacy.trim() || null,
        active: true,
      };

      await addMedication.mutateAsync(medicationData);

      Alert.alert("Success", "Medication added successfully");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to add medication:", error);
      Alert.alert("Error", "Failed to add medication. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      frequency: "Once daily",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      instructions: "",
      prescriber: "",
      rx_number: "",
      pharmacy: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Add Medication</ThemedText>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.saveButton,
                addMedication.isPending && styles.saveButtonDisabled,
              ]}
              disabled={addMedication.isPending}
            >
              <ThemedText style={styles.saveText}>
                {addMedication.isPending ? "Saving..." : "Save"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Medication Name */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Medication Name *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="Enter medication name"
                autoFocus
              />
            </View>

            {/* Dosage */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Dosage *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.dosage}
                onChangeText={(value) => handleInputChange("dosage", value)}
                placeholder="e.g., 10mg, 1 tablet"
              />
            </View>

            {/* Frequency */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Frequency</ThemedText>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <ThemedText style={styles.pickerText}>
                  {formData.frequency}
                </ThemedText>
                <AppIcon
                  name="actions_arrow_down"
                  size="small"
                  color="default"
                />
              </TouchableOpacity>

              {showFrequencyPicker && (
                <View style={styles.pickerOptions}>
                  {frequencyOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.pickerOption}
                      onPress={() => {
                        handleInputChange("frequency", option);
                        setShowFrequencyPicker(false);
                      }}
                    >
                      <ThemedText style={styles.pickerOptionText}>
                        {option}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Start Date */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Start Date</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.start_date}
                onChangeText={(value) => handleInputChange("start_date", value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* End Date */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>End Date (Optional)</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.end_date}
                onChangeText={(value) => handleInputChange("end_date", value)}
                placeholder="YYYY-MM-DD (Leave empty if ongoing)"
              />
            </View>

            {/* Prescriber */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Prescriber</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.prescriber}
                onChangeText={(value) => handleInputChange("prescriber", value)}
                placeholder="Doctor's name"
              />
            </View>

            {/* Pharmacy */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Pharmacy</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.pharmacy}
                onChangeText={(value) => handleInputChange("pharmacy", value)}
                placeholder="Pharmacy name"
              />
            </View>

            {/* RX Number */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Prescription Number</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.rx_number}
                onChangeText={(value) => handleInputChange("rx_number", value)}
                placeholder="RX number"
              />
            </View>

            {/* Instructions */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Instructions</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={(value) =>
                  handleInputChange("instructions", value)
                }
                placeholder="Additional instructions or notes"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#6b7280",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  pickerText: {
    fontSize: 16,
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "white",
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerOptionText: {
    fontSize: 16,
  },
});
