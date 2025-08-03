import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { AppIcon } from "../icons/IconSystem";

interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  prescriber?: string;
  pharmacy?: string;
  confidence?: number;
  is_active: boolean;
  notes?: string;
  created_at?: string;
}

interface EnhancedMedicationCardProps {
  medication: Medication;
  onEdit?: (medication: Medication) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  showActions?: boolean;
}

export function EnhancedMedicationCard({
  medication,
  onEdit,
  onDelete,
  onToggleActive,
  showActions = true,
}: EnhancedMedicationCardProps) {
  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "#6b7280";
    if (confidence >= 0.9) return "#10b981";
    if (confidence >= 0.7) return "#f59e0b";
    return "#ef4444";
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return "Manual Entry";
    if (confidence >= 0.9) return "High Confidence";
    if (confidence >= 0.7) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <ThemedView
      style={[styles.container, !medication.is_active && styles.inactive]}
    >
      {/* Header with status and confidence */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: medication.is_active ? "#10b981" : "#6b7280" },
            ]}
          />
          <ThemedText style={styles.statusText}>
            {medication.is_active ? "Active" : "Inactive"}
          </ThemedText>
        </View>

        {medication.confidence !== undefined && (
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(medication.confidence) },
            ]}
          >
            <ThemedText style={styles.confidenceText}>
              {Math.round(medication.confidence * 100)}%
            </ThemedText>
          </View>
        )}
      </View>

      {/* Main medication info */}
      <View style={styles.mainInfo}>
        <ThemedText style={styles.medicationName}>{medication.name}</ThemedText>

        {medication.generic_name &&
          medication.generic_name !== medication.name && (
            <ThemedText style={styles.genericName}>
              Generic: {medication.generic_name}
            </ThemedText>
          )}

        <View style={styles.dosageRow}>
          <AppIcon name="pill" size="small" color="secondary" />
          <ThemedText style={styles.dosageText}>
            {medication.dosage} • {medication.frequency}
          </ThemedText>
        </View>
      </View>

      {/* Provider info */}
      {(medication.prescriber || medication.pharmacy) && (
        <View style={styles.providerInfo}>
          {medication.prescriber && (
            <View style={styles.infoRow}>
              <AppIcon name="doctor" size="small" color="secondary" />
              <ThemedText style={styles.infoText}>
                Prescribed by {medication.prescriber}
              </ThemedText>
            </View>
          )}

          {medication.pharmacy && (
            <View style={styles.infoRow}>
              <AppIcon name="pharmacy" size="small" color="secondary" />
              <ThemedText style={styles.infoText}>
                From {medication.pharmacy}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      {medication.notes && (
        <View style={styles.notesSection}>
          <ThemedText style={styles.notesLabel}>Notes:</ThemedText>
          <ThemedText style={styles.notesText}>{medication.notes}</ThemedText>
        </View>
      )}

      {/* Confidence explanation */}
      {medication.confidence !== undefined && (
        <View style={styles.confidenceInfo}>
          <AppIcon name="info" size="small" color="info" />
          <ThemedText style={styles.confidenceExplanation}>
            {getConfidenceText(medication.confidence)} -
            {medication.confidence >= 0.9
              ? " OCR extraction was very accurate"
              : medication.confidence >= 0.7
              ? " OCR extraction may need review"
              : " Please verify extracted information"}
          </ThemedText>
        </View>
      )}

      {/* Action buttons */}
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(medication)}
            >
              <AppIcon name="edit" size="small" color="primary" />
              <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          )}

          {onToggleActive && (
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={() =>
                onToggleActive(medication.id, !medication.is_active)
              }
            >
              <AppIcon
                name={medication.is_active ? "pause" : "play"}
                size="small"
                color="secondary"
              />
              <ThemedText style={styles.actionButtonText}>
                {medication.is_active ? "Pause" : "Resume"}
              </ThemedText>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(medication.id)}
            >
              <AppIcon name="action_delete" size="small" color="error" />
              <ThemedText style={[styles.actionButtonText, styles.deleteText]}>
                Delete
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inactive: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  confidenceText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  mainInfo: {
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  genericName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    fontStyle: "italic",
  },
  dosageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dosageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  providerInfo: {
    marginBottom: 12,
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
  },
  notesSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confidenceInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 12,
    padding: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 6,
  },
  confidenceExplanation: {
    fontSize: 12,
    opacity: 0.8,
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
    flex: 1,
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  toggleButton: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteText: {
    color: "#ef4444",
  },
});
