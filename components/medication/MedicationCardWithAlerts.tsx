import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { Medication } from "@/mocks/types";

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}

interface MedicationCardWithAlertsProps {
  medication: Medication;
  onPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
}

export default function MedicationCardWithAlerts({
  medication,
  onPress,
  onEditPress,
  onDeletePress,
}: MedicationCardWithAlertsProps) {
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkMedicationInteractions();
  }, [medication.id]);

  const checkMedicationInteractions = async () => {
    try {
      setIsLoading(true);
      // Use mock data directly to avoid API errors
      if (medication.name === "Lisinopril") {
        setInteractions([
          {
            drug1: "Lisinopril",
            drug2: "Ibuprofen",
            severity: "moderate",
            description:
              "NSAIDs may reduce the antihypertensive effect of ACE inhibitors",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasInteractions = interactions.length > 0;
  const highestSeverity = interactions.reduce((highest, interaction) => {
    if (interaction.severity === "high") return "high";
    if (interaction.severity === "moderate" && highest !== "high")
      return "moderate";
    if (interaction.severity === "low" && highest === "low") return "low";
    return highest;
  }, "low" as "high" | "moderate" | "low");

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return "status_error";
      case "moderate":
        return "status_warning";
      case "low":
        return "status_info";
      default:
        return "status_info";
    }
  };

  const showInteractionDetails = () => {
    if (!hasInteractions) return;

    const interactionText = interactions
      .map(
        (interaction) =>
          `${interaction.drug1} ↔ ${interaction.drug2}\n${interaction.description}`
      )
      .join("\n\n");

    Alert.alert(
      "Drug Interactions",
      `${interactions.length} interaction${
        interactions.length > 1 ? "s" : ""
      } found:\n\n${interactionText}`,
      [
        {
          text: "View All Alerts",
          onPress: () => {
            /* Navigate to alerts tab */
          },
        },
        { text: "OK", style: "default" },
      ]
    );
  };

  const formatDosage = (medication: Medication) => {
    return `${medication.dosage}${medication.dosageUnit} - ${medication.frequency}`;
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return "#10b981";
    if (adherence >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView
        style={[
          styles.card,
          hasInteractions && {
            borderLeftWidth: 4,
            borderLeftColor: getSeverityColor(highestSeverity),
          },
        ]}
      >
        {/* Main medication info */}
        <View style={styles.header}>
          <View style={styles.medicationInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.medicationName}>
                {medication.name}
              </ThemedText>
              {hasInteractions && (
                <TouchableOpacity
                  style={styles.interactionBadge}
                  onPress={showInteractionDetails}
                >
                  <AppIcon
                    name={getSeverityIcon(highestSeverity)}
                    size="small"
                    color={getSeverityColor(highestSeverity)}
                  />
                  <ThemedText
                    style={[
                      styles.interactionCount,
                      { color: getSeverityColor(highestSeverity) },
                    ]}
                  >
                    {interactions.length}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <ThemedText style={styles.dosage}>
              {formatDosage(medication)}
            </ThemedText>

            {medication.prescribedBy && (
              <ThemedText style={styles.prescriber}>
                Prescribed by: {medication.prescribedBy}
              </ThemedText>
            )}
          </View>

          <View style={styles.actions}>
            {onEditPress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEditPress}
              >
                <AppIcon name="action_edit" size="medium" color="secondary" />
              </TouchableOpacity>
            )}
            {onDeletePress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDeletePress}
              >
                <AppIcon
                  name="action_delete"
                  size="medium"
                  color="destructive"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Interaction warning banner */}
        {hasInteractions && (
          <TouchableOpacity
            style={[
              styles.interactionBanner,
              { backgroundColor: `${getSeverityColor(highestSeverity)}10` },
            ]}
            onPress={showInteractionDetails}
          >
            <AppIcon
              name={getSeverityIcon(highestSeverity)}
              size="small"
              color={getSeverityColor(highestSeverity)}
            />
            <ThemedText
              style={[
                styles.interactionText,
                { color: getSeverityColor(highestSeverity) },
              ]}
            >
              {interactions.length} drug interaction
              {interactions.length > 1 ? "s" : ""} found
            </ThemedText>
            <AppIcon
              name="nav_forward"
              size="small"
              color={getSeverityColor(highestSeverity)}
            />
          </TouchableOpacity>
        )}

        {/* Adherence indicator */}
        {medication.adherence && (
          <View style={styles.adherenceRow}>
            <ThemedText style={styles.adherenceLabel}>Adherence:</ThemedText>
            <View style={styles.adherenceBar}>
              <View
                style={[
                  styles.adherenceProgress,
                  {
                    width: `${medication.adherence}%`,
                    backgroundColor: getAdherenceColor(medication.adherence),
                  },
                ]}
              />
            </View>
            <ThemedText
              style={[
                styles.adherenceText,
                { color: getAdherenceColor(medication.adherence) },
              ]}
            >
              {medication.adherence}%
            </ThemedText>
          </View>
        )}

        {/* Next dose info */}
        {medication.nextDose && (
          <View style={styles.nextDoseRow}>
            <AppIcon name="schedule" size="small" color="secondary" />
            <ThemedText style={styles.nextDoseText}>
              Next dose:{" "}
              {new Date(medication.nextDose).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  interactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  interactionCount: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  dosage: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  prescriber: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  interactionBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  interactionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  adherenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  adherenceLabel: {
    fontSize: 12,
    color: "#6b7280",
    minWidth: 60,
  },
  adherenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  adherenceProgress: {
    height: "100%",
    borderRadius: 3,
  },
  adherenceText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 30,
  },
  nextDoseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nextDoseText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
