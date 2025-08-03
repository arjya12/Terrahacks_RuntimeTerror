import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}

interface CriticalInteractionModalProps {
  visible: boolean;
  onClose: () => void;
  interactions: DrugInteraction[];
  onViewAllAlerts: () => void;
  onContactProvider: () => void;
}

export default function CriticalInteractionModal({
  visible,
  onClose,
  interactions,
  onViewAllAlerts,
  onContactProvider,
}: CriticalInteractionModalProps) {
  const criticalInteractions = interactions.filter(
    (interaction) => interaction.severity === "high"
  );

  if (criticalInteractions.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#dc2626";
      case "moderate":
        return "#ea580c";
      case "low":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <AppIcon name="status_error" size="large" color="#dc2626" />
            <ThemedText style={styles.title}>
              Critical Drug Interaction
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AppIcon name="action_close" size="medium" color="secondary" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Warning Banner */}
          <ThemedView style={styles.warningBanner}>
            <AppIcon name="status_error" size="medium" color="#dc2626" />
            <View style={styles.warningContent}>
              <ThemedText style={styles.warningTitle}>
                High-Risk Interaction Detected
              </ThemedText>
              <ThemedText style={styles.warningText}>
                The combination of these medications may cause serious health
                risks. Please contact your healthcare provider immediately.
              </ThemedText>
            </View>
          </ThemedView>

          {/* Interaction Details */}
          {criticalInteractions.map((interaction, index) => (
            <ThemedView key={index} style={styles.interactionCard}>
              <View style={styles.interactionHeader}>
                <View style={styles.drugPair}>
                  <ThemedText style={styles.drugName}>
                    {interaction.drug1}
                  </ThemedText>
                  <AppIcon name="nav_forward" size="small" color="#dc2626" />
                  <ThemedText style={styles.drugName}>
                    {interaction.drug2}
                  </ThemedText>
                </View>
                <View style={styles.severityBadge}>
                  <ThemedText style={styles.severityText}>High Risk</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.interactionDescription}>
                {interaction.description}
              </ThemedText>
            </ThemedView>
          ))}

          {/* Recommendations */}
          <ThemedView style={styles.recommendationsCard}>
            <ThemedText style={styles.recommendationsTitle}>
              Immediate Actions Required:
            </ThemedText>

            <View style={styles.recommendationsList}>
              <View style={styles.recommendationItem}>
                <AppIcon name="status_error" size="small" color="#dc2626" />
                <ThemedText style={styles.recommendationText}>
                  Do not take both medications together without medical
                  supervision
                </ThemedText>
              </View>

              <View style={styles.recommendationItem}>
                <AppIcon name="medical_contact" size="small" color="#dc2626" />
                <ThemedText style={styles.recommendationText}>
                  Contact your healthcare provider immediately
                </ThemedText>
              </View>

              <View style={styles.recommendationItem}>
                <AppIcon name="medical_note" size="small" color="#dc2626" />
                <ThemedText style={styles.recommendationText}>
                  Discuss alternative medications with your doctor
                </ThemedText>
              </View>

              <View style={styles.recommendationItem}>
                <AppIcon name="schedule" size="small" color="#dc2626" />
                <ThemedText style={styles.recommendationText}>
                  Monitor for symptoms and seek immediate care if needed
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Emergency Symptoms */}
          <ThemedView style={styles.emergencyCard}>
            <ThemedText style={styles.emergencyTitle}>
              ⚠️ Seek Emergency Care If You Experience:
            </ThemedText>

            <View style={styles.symptomsList}>
              <ThemedText style={styles.symptomText}>
                • Severe dizziness or fainting
              </ThemedText>
              <ThemedText style={styles.symptomText}>
                • Difficulty breathing
              </ThemedText>
              <ThemedText style={styles.symptomText}>
                • Rapid or irregular heartbeat
              </ThemedText>
              <ThemedText style={styles.symptomText}>
                • Severe nausea or vomiting
              </ThemedText>
              <ThemedText style={styles.symptomText}>
                • Swelling of face, lips, or throat
              </ThemedText>
              <ThemedText style={styles.symptomText}>
                • Extreme weakness or confusion
              </ThemedText>
            </View>
          </ThemedView>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onContactProvider}
          >
            <AppIcon name="medical_contact" size="medium" color="white" />
            <ThemedText style={styles.primaryButtonText}>
              Contact Provider
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onViewAllAlerts}
          >
            <ThemedText style={styles.secondaryButtonText}>
              View All Alerts
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={onClose}
          >
            <ThemedText style={styles.dismissButtonText}>
              I Understand
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#dc2626",
    lineHeight: 20,
  },
  interactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  interactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  drugPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  drugName: {
    fontSize: 16,
    fontWeight: "600",
  },
  severityBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  interactionDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#dc2626",
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  emergencyCard: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 12,
  },
  symptomsList: {
    gap: 6,
  },
  symptomText: {
    fontSize: 14,
    color: "#dc2626",
    lineHeight: 20,
  },
  actionButtons: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#dc2626",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  dismissButton: {
    backgroundColor: "transparent",
  },
  dismissButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
});
