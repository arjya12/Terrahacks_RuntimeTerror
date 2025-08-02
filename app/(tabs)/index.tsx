import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
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
import { Medication } from "@/mocks/types";

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function MedicationCard({
  medication,
  onEdit,
  onDelete,
  isDeleting,
}: MedicationCardProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const confidenceColor =
    medication.confidence > 0.9
      ? "#10b981"
      : medication.confidence > 0.8
      ? "#f59e0b"
      : "#ef4444";

  const handleDelete = () => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(medication.id),
        },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ThemedView style={styles.medicationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <ThemedText style={styles.medicationName}>
              {medication.name}
            </ThemedText>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: confidenceColor },
              ]}
            >
              <Text style={styles.confidenceText}>
                {Math.round(medication.confidence * 100)}%
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(medication)}
              accessibilityLabel={`Edit ${medication.name}`}
              accessibilityHint="Opens edit form for this medication"
            >
              <IconSymbol name="pencil" size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isDeleting && styles.actionButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
              accessibilityLabel={`Delete ${medication.name}`}
              accessibilityHint="Removes this medication from your list"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <IconSymbol name="trash" size={16} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {medication.genericName && (
          <ThemedText style={styles.genericName}>
            Generic: {medication.genericName}
          </ThemedText>
        )}

        <ThemedText style={styles.dosageText}>
          {medication.dosage} - {medication.frequency}
        </ThemedText>
        <ThemedText style={styles.prescriberText}>
          Prescribed by: {medication.prescriber}
        </ThemedText>
        <ThemedText style={styles.pharmacyText}>
          Pharmacy: {medication.pharmacy}
        </ThemedText>

        {medication.notes && (
          <ThemedText style={styles.notesText}>{medication.notes}</ThemedText>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: medication.isActive ? "#10b981" : "#6b7280" },
            ]}
          >
            <Text style={styles.statusText}>
              {medication.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </ThemedView>
    </Animated.View>
  );
}

interface MedicationFormData {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
  notes?: string;
  isActive: boolean;
}

interface EditModalProps {
  visible: boolean;
  medication: Medication | null;
  onClose: () => void;
  onSave: (data: MedicationFormData) => void;
  isSaving?: boolean;
}

function EditModal({
  visible,
  medication,
  onClose,
  onSave,
  isSaving,
}: EditModalProps) {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  const [formData, setFormData] = useState<MedicationFormData>({
    name: "",
    genericName: "",
    dosage: "",
    frequency: "",
    prescriber: "",
    pharmacy: "",
    notes: "",
    isActive: true,
  });

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  React.useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        genericName: medication.genericName || "",
        dosage: medication.dosage,
        frequency: medication.frequency,
        prescriber: medication.prescriber,
        pharmacy: medication.pharmacy,
        notes: medication.notes || "",
        isActive: medication.isActive,
      });
    }
  }, [medication]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Medication name is required");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      transparent={true}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {medication ? "Edit Medication" : "Add Medication"}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={[isSaving && styles.disabledButton]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Medication Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter medication name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Generic Name</Text>
              <TextInput
                style={styles.formInput}
                value={formData.genericName}
                onChangeText={(text) =>
                  setFormData({ ...formData, genericName: text })
                }
                placeholder="Enter generic name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dosage</Text>
              <TextInput
                style={styles.formInput}
                value={formData.dosage}
                onChangeText={(text) =>
                  setFormData({ ...formData, dosage: text })
                }
                placeholder="e.g., 10mg, 500mg"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Frequency</Text>
              <TextInput
                style={styles.formInput}
                value={formData.frequency}
                onChangeText={(text) =>
                  setFormData({ ...formData, frequency: text })
                }
                placeholder="e.g., Once daily, Twice daily"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prescriber</Text>
              <TextInput
                style={styles.formInput}
                value={formData.prescriber}
                onChangeText={(text) =>
                  setFormData({ ...formData, prescriber: text })
                }
                placeholder="Enter doctor's name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pharmacy</Text>
              <TextInput
                style={styles.formInput}
                value={formData.pharmacy}
                onChangeText={(text) =>
                  setFormData({ ...formData, pharmacy: text })
                }
                placeholder="Enter pharmacy name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.toggleContainer}
                onPress={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
              >
                <Text style={styles.formLabel}>Active Medication</Text>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: formData.isActive
                        ? "#3b82f6"
                        : "#d1d5db",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [{ translateX: formData.isActive ? 18 : 2 }],
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (medications.length === 0 && !isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [medications.length, isLoading, pulseAnim]);

  const loadMedications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      const allMedications = mockDataService.getMedications();
      setMedications(allMedications);
    } catch (error) {
      Alert.alert("Error", "Failed to load medications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load medications on component mount
  React.useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const handleAddMedication = () => {
    setEditingMedication(null);
    setShowEditModal(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowEditModal(true);
  };

  const handleSaveMedication = async (formData: MedicationFormData) => {
    setIsSaving(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (editingMedication) {
        // Update existing medication
        mockDataService.updateMedication(editingMedication.id, {
          ...formData,
          genericName: formData.genericName || undefined,
          notes: formData.notes || undefined,
        });
        Alert.alert("Success", "Medication updated successfully.");
      } else {
        // Add new medication
        mockDataService.addMedication({
          ...formData,
          genericName: formData.genericName || undefined,
          notes: formData.notes || undefined,
          dateCreated: new Date().toISOString(),
          confidence: 1.0, // Manual entry gets full confidence
        });
        Alert.alert("Success", "Medication added successfully.");
      }
      await loadMedications();
      setShowEditModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save medication. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    const medication = medications.find((med) => med.id === id);
    if (!medication) return;

    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(id);
            try {
              // Simulate API delay
              await new Promise((resolve) => setTimeout(resolve, 500));
              mockDataService.deleteMedication(id);
              await loadMedications();
              Alert.alert("Success", "Medication deleted successfully.");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete medication. Please try again."
              );
            } finally {
              setIsDeleting(null);
            }
          },
        },
      ]
    );
  };

  const activeMedications = medications.filter((med) => med.isActive);
  const inactiveMedications = medications.filter((med) => !med.isActive);

  const renderMedication = ({ item }: { item: Medication }) => (
    <MedicationCard
      medication={item}
      onEdit={handleEditMedication}
      onDelete={handleDeleteMedication}
      isDeleting={isDeleting === item.id}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={styles.loadingText}>
            Loading medications...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.headerTitle}>My Medications</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {activeMedications.length} active, {inactiveMedications.length}{" "}
              inactive
            </ThemedText>
          </View>
          <Animated.View
            style={[
              {
                transform: [
                  { scale: medications.length === 0 ? pulseAnim : 1 },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMedication}
              accessibilityLabel="Add new medication"
              accessibilityHint="Opens a form to add a new medication manually"
            >
              <IconSymbol name="plus" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ThemedView>

      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="pills" size={64} color="#d1d5db" />
            <ThemedText style={styles.emptyTitle}>No Medications</ThemedText>
            <ThemedText style={styles.emptyText}>
              Start building your medication list to keep track of your
              prescriptions
            </ThemedText>
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={handleAddMedication}
              >
                <IconSymbol name="plus" size={20} color="white" />
                <Text style={styles.emptyActionText}>Add Manually</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.emptyActionButton,
                  styles.emptyActionButtonSecondary,
                ]}
                onPress={() => router.push("/(tabs)/explore")}
              >
                <IconSymbol name="camera" size={20} color="#3b82f6" />
                <Text
                  style={[
                    styles.emptyActionText,
                    styles.emptyActionTextSecondary,
                  ]}
                >
                  Scan Bottle
                </Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        }
      />

      <EditModal
        visible={showEditModal}
        medication={editingMedication}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveMedication}
        isSaving={isSaving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  addButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  medicationCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  genericName: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 4,
  },
  dosageText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  prescriberText: {
    fontSize: 14,
    marginBottom: 2,
  },
  pharmacyText: {
    fontSize: 14,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 100,
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
  modalCancelText: {
    color: "#6b7280",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSaveText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  formTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  emptyActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  emptyActionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  emptyActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyActionTextSecondary: {
    color: "#3b82f6",
  },
});
