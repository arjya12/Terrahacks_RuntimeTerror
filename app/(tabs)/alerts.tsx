import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import { mockDataService } from "@/mocks/mockService";

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}

interface InteractionSummary {
  interactions_found: number;
  interactions: DrugInteraction[];
  severity_summary: {
    high: number;
    moderate: number;
    low: number;
    unknown: number;
  };
  recommendations: string[];
  last_checked: string;
}

interface MedicationAlert {
  id: string;
  type: "interaction" | "reminder" | "refill" | "side_effect";
  severity: "high" | "moderate" | "low";
  title: string;
  description: string;
  medications: string[];
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
}

export default function AlertsScreen() {
  const [interactions, setInteractions] = useState<InteractionSummary | null>(
    null
  );
  const [alerts, setAlerts] = useState<MedicationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);

      // Load interaction data from mock service (same as tab layout)
      const interactionData =
        await mockDataService.checkAllMedicationInteractions();
      setInteractions(interactionData);

      // Convert interactions to alerts
      const interactionAlerts: MedicationAlert[] =
        interactionData.interactions.map((interaction, index) => ({
          id: `interaction_${index}`,
          type: "interaction",
          severity: interaction.severity,
          title: `Drug Interaction: ${interaction.drug1} & ${interaction.drug2}`,
          description: interaction.description,
          medications: [interaction.drug1, interaction.drug2],
          timestamp: new Date().toISOString(),
          isRead: false,
          actionRequired: interaction.severity === "high",
        }));

      // Add mock alerts for other types
      const mockAlerts: MedicationAlert[] = [
        {
          id: "reminder_1",
          type: "reminder",
          severity: "low",
          title: "Missed Dose Reminder",
          description: "You missed your morning Lisinopril dose",
          medications: ["Lisinopril"],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isRead: false,
          actionRequired: false,
        },
        {
          id: "refill_1",
          type: "refill",
          severity: "moderate",
          title: "Refill Needed",
          description: "Atorvastatin prescription expires in 3 days",
          medications: ["Atorvastatin"],
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isRead: true,
          actionRequired: true,
        },
      ];

      setAlerts([...interactionAlerts, ...mockAlerts]);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const markAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interaction":
        return "medical_alert";
      case "reminder":
        return "schedule";
      case "refill":
        return "pharmacy";
      case "side_effect":
        return "medical_warning";
      default:
        return "status_info";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const renderAlert = ({ item }: { item: MedicationAlert }) => (
    <TouchableOpacity
      style={[
        styles.alertCard,
        !item.isRead && styles.unreadAlert,
        item.actionRequired && styles.actionRequiredAlert,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <AppIcon
            name={getTypeIcon(item.type)}
            size="medium"
            color={getSeverityColor(item.severity)}
          />
          <AppIcon
            name={getSeverityIcon(item.severity)}
            size="small"
            color={getSeverityColor(item.severity)}
            style={styles.severityBadge}
          />
        </View>

        <View style={styles.alertContent}>
          <View style={styles.alertTitleRow}>
            <ThemedText style={styles.alertTitle}>{item.title}</ThemedText>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <ThemedText style={styles.alertDescription}>
            {item.description}
          </ThemedText>

          <View style={styles.alertMeta}>
            <ThemedText style={styles.alertTimestamp}>
              {formatTimestamp(item.timestamp)}
            </ThemedText>
            {item.actionRequired && (
              <ThemedText style={styles.actionRequired}>
                Action Required
              </ThemedText>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;
  const highSeverityCount = alerts.filter(
    (alert) => alert.severity === "high"
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.screenTitle}>Health Alerts</ThemedText>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <ThemedText style={styles.unreadBadgeText}>
              {unreadCount}
            </ThemedText>
          </View>
        )}
      </View>

      {highSeverityCount > 0 && (
        <ThemedView style={styles.criticalBanner}>
          <AppIcon name="status_error" size="medium" color="#dc2626" />
          <ThemedText style={styles.criticalText}>
            {highSeverityCount} critical alert{highSeverityCount > 1 ? "s" : ""}{" "}
            require immediate attention
          </ThemedText>
        </ThemedView>
      )}

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        style={styles.alertsList}
        contentContainerStyle={styles.alertsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <AppIcon name="check_circle" size="large" color="#10b981" />
            <ThemedText style={styles.emptyTitle}>All Clear!</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              No current health alerts. We'll notify you if anything needs your
              attention.
            </ThemedText>
          </ThemedView>
        }
      />
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  unreadBadge: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  criticalBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
    borderWidth: 1,
    borderRadius: 8,
    margin: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  criticalText: {
    flex: 1,
    color: "#dc2626",
    fontWeight: "600",
  },
  alertsList: {
    flex: 1,
  },
  alertsListContent: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  actionRequiredAlert: {
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  alertIconContainer: {
    position: "relative",
  },
  severityBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  alertMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertTimestamp: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionRequired: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
