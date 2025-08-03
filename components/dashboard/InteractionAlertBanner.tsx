import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import apiService from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

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

interface InteractionAlertBannerProps {
  medications: { id: string; name: string }[];
  onViewDetails: () => void;
}

// Storage keys for dismissal management
const STORAGE_KEYS = {
  DISMISSED_INTERACTIONS: "@dismissed_interactions",
  LAST_INTERACTION_CHECK: "@last_interaction_check",
};

// Utility function to clear all dismissed interactions (for testing/reset)
export const clearDismissedInteractions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.DISMISSED_INTERACTIONS);
    console.log("🧹 Cleared all dismissed interactions");
  } catch (error) {
    console.error("Failed to clear dismissed interactions:", error);
  }
};

export default function InteractionAlertBanner({
  medications,
  onViewDetails,
}: InteractionAlertBannerProps) {
  const [interactions, setInteractions] = useState<InteractionSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedInteractions, setDismissedInteractions] = useState<
    Set<string>
  >(new Set());
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Helper functions for dismissal management
  const getInteractionKey = (drug1: string, drug2: string): string => {
    // Create consistent key regardless of drug order
    const sortedDrugs = [drug1, drug2].sort();
    return `${sortedDrugs[0]}_${sortedDrugs[1]}`;
  };

  const loadDismissedInteractions = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(
        STORAGE_KEYS.DISMISSED_INTERACTIONS
      );
      if (stored) {
        const dismissedArray = JSON.parse(stored);
        setDismissedInteractions(new Set(dismissedArray));
      }
    } catch (error) {
      console.error("Failed to load dismissed interactions:", error);
    }
  };

  const storeDismissedInteraction = async (
    interactionKey: string
  ): Promise<void> => {
    try {
      const newDismissed = new Set(dismissedInteractions);
      newDismissed.add(interactionKey);

      const dismissedArray = Array.from(newDismissed);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DISMISSED_INTERACTIONS,
        JSON.stringify(dismissedArray)
      );
      setDismissedInteractions(newDismissed);
    } catch (error) {
      console.error("Failed to store dismissed interaction:", error);
    }
  };

  const shouldShowInteraction = (interaction: DrugInteraction): boolean => {
    const key = getInteractionKey(interaction.drug1, interaction.drug2);

    // Always show high severity interactions
    if (interaction.severity === "high") return true;

    // Check if this specific interaction was dismissed
    return !dismissedInteractions.has(key);
  };

  // Load dismissed interactions on component mount
  useEffect(() => {
    loadDismissedInteractions();
  }, []);

  useEffect(() => {
    if (medications.length >= 2) {
      checkInteractions();
    } else {
      setInteractions(null);
      setIsVisible(false);
    }
  }, [medications]);

  useEffect(() => {
    if (interactions && interactions.interactions_found > 0) {
      // Filter interactions to only show non-dismissed ones
      const visibleInteractions = interactions.interactions.filter(
        shouldShowInteraction
      );

      if (visibleInteractions.length > 0) {
        setIsVisible(true);
        // Slide in animation
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();

        // Pulse animation for high severity interactions
        const hasHighSeverity = visibleInteractions.some(
          (interaction) => interaction.severity === "high"
        );
        if (hasHighSeverity) {
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }
      } else {
        setIsVisible(false);
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      setIsVisible(false);
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [interactions, dismissedInteractions]);

  const checkInteractions = async () => {
    try {
      setIsLoading(true);
      console.log(
        "🔍 Checking drug interactions for",
        medications.length,
        "medications"
      );

      // Call the bulk interaction check endpoint
      const result = await apiService.checkAllMedicationInteractions();
      console.log("💊 Interaction check result:", result);

      setInteractions(result);
    } catch (error) {
      console.error("❌ Failed to check interactions:", error);
      // Fallback to mock data for demonstration
      setInteractions({
        interactions_found: 1,
        interactions: [
          {
            drug1: "Lisinopril",
            drug2: "Ibuprofen",
            severity: "moderate",
            description:
              "NSAIDs may reduce the antihypertensive effect of ACE inhibitors",
          },
        ],
        severity_summary: { high: 0, moderate: 1, low: 0, unknown: 0 },
        recommendations: [
          "⚡ 1 moderate interaction(s) found. Monitor for side effects and discuss with your provider.",
          "📋 Review all medications with your pharmacist or healthcare provider.",
        ],
        last_checked: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
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

  const getAlertMessage = () => {
    if (!interactions || interactions.interactions_found === 0) return "";

    // Filter to only visible (non-dismissed) interactions
    const visibleInteractions = interactions.interactions.filter(
      shouldShowInteraction
    );

    if (visibleInteractions.length === 0) return "";

    // Count severity levels for visible interactions only
    const visibleSeveritySummary = {
      high: visibleInteractions.filter((i) => i.severity === "high").length,
      moderate: visibleInteractions.filter((i) => i.severity === "moderate")
        .length,
      low: visibleInteractions.filter((i) => i.severity === "low").length,
    };

    if (visibleSeveritySummary.high > 0) {
      return `⚠️ ${visibleSeveritySummary.high} high-severity interaction${
        visibleSeveritySummary.high > 1 ? "s" : ""
      } detected`;
    } else if (visibleSeveritySummary.moderate > 0) {
      return `⚡ ${visibleSeveritySummary.moderate} moderate interaction${
        visibleSeveritySummary.moderate > 1 ? "s" : ""
      } found`;
    } else if (visibleSeveritySummary.low > 0) {
      return `ℹ️ ${visibleSeveritySummary.low} low-severity interaction${
        visibleSeveritySummary.low > 1 ? "s" : ""
      } found`;
    }

    return `${visibleInteractions.length} drug interaction${
      visibleInteractions.length > 1 ? "s" : ""
    } found`;
  };

  const getPrimaryColor = () => {
    if (!interactions) return "#6b7280";

    // Use visible interactions only
    const visibleInteractions = interactions.interactions.filter(
      shouldShowInteraction
    );

    if (visibleInteractions.some((i) => i.severity === "high"))
      return "#dc2626";
    if (visibleInteractions.some((i) => i.severity === "moderate"))
      return "#ea580c";
    if (visibleInteractions.some((i) => i.severity === "low")) return "#eab308";
    return "#6b7280";
  };

  const handleDismiss = async () => {
    console.log("🚫 Dismiss button pressed"); // Debug log

    if (interactions && interactions.interactions.length > 0) {
      // Get the first visible interaction to dismiss
      const visibleInteractions = interactions.interactions.filter(
        shouldShowInteraction
      );

      if (visibleInteractions.length > 0) {
        const interactionToDismiss = visibleInteractions[0];
        const key = getInteractionKey(
          interactionToDismiss.drug1,
          interactionToDismiss.drug2
        );

        console.log(`🚫 Dismissing interaction: ${key}`); // Debug log

        // Store the dismissal
        await storeDismissedInteraction(key);

        // For high severity, show confirmation
        if (interactionToDismiss.severity === "high") {
          // High severity interactions should not be easily dismissed
          console.log(
            "⚠️ High severity interaction - consider blocking dismissal"
          );
        }
      }
    }

    // Animate out
    setIsVisible(false);
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (!isVisible || !interactions || interactions.interactions_found === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            {
              scale: (() => {
                const visibleInteractions = interactions.interactions.filter(
                  shouldShowInteraction
                );
                return visibleInteractions.some((i) => i.severity === "high")
                  ? pulseAnim
                  : 1;
              })(),
            },
          ],
        },
      ]}
    >
      <ThemedView
        style={[styles.banner, { borderLeftColor: getPrimaryColor() }]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AppIcon
              name={getSeverityIcon(
                (() => {
                  const visibleInteractions = interactions.interactions.filter(
                    shouldShowInteraction
                  );
                  if (visibleInteractions.some((i) => i.severity === "high"))
                    return "high";
                  if (
                    visibleInteractions.some((i) => i.severity === "moderate")
                  )
                    return "moderate";
                  return "low";
                })()
              )}
              size="medium"
              color={getPrimaryColor()}
            />
          </View>

          <View style={styles.messageContainer}>
            <ThemedText style={styles.alertTitle}>
              Drug Interaction Alert
            </ThemedText>
            <ThemedText style={styles.alertMessage}>
              {getAlertMessage()}
            </ThemedText>
            {(() => {
              const visibleInteractions = interactions.interactions.filter(
                shouldShowInteraction
              );
              return (
                visibleInteractions.length > 0 && (
                  <ThemedText style={styles.interactionPreview}>
                    {visibleInteractions[0].drug1} ↔{" "}
                    {visibleInteractions[0].drug2}
                    {visibleInteractions.length > 1 &&
                      ` +${visibleInteractions.length - 1} more`}
                  </ThemedText>
                )
              );
            })()}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onViewDetails}
              accessibilityLabel="View interaction details"
            >
              <ThemedText
                style={[styles.actionText, { color: getPrimaryColor() }]}
              >
                View Details
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              accessibilityLabel="Dismiss alert"
            >
              <AppIcon name="action_close" size="small" color="secondary" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress indicator for loading */}
        {isLoading && (
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                { backgroundColor: getPrimaryColor() },
              ]}
            />
          </View>
        )}
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  banner: {
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },
  interactionPreview: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  actions: {
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dismissButton: {
    padding: 4,
  },
  loadingBar: {
    height: 2,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    width: "100%",
    opacity: 0.7,
  },
});
