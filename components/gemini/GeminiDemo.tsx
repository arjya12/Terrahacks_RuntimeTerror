/**
 * Gemini Demo Component
 * Demonstrates various Gemini AI features
 */

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import {
  useGemini,
  useMedicationAnalysis,
  useTextGeneration,
} from "../../hooks/useGemini";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { GeminiChat } from "./GeminiChat";
import { GeminiSetup } from "./GeminiSetup";

// ============================================================================
// Component
// ============================================================================

export function GeminiDemo() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const { isConfigured } = useGemini();
  const {
    generateText,
    isLoading: isGenerating,
    result: generatedText,
  } = useTextGeneration();
  const {
    analyzeMedication,
    checkInteractions,
    simplifyDocument,
    isLoading: isMedicationAnalyzing,
    result: medicationResult,
  } = useMedicationAnalysis();

  // Demo functions
  const handleTextGeneration = async () => {
    setActiveDemo("text");
    await generateText(
      "Explain the importance of medication adherence in simple terms for patients."
    );
  };

  const handleMedicationAnalysis = async () => {
    setActiveDemo("medication");
    await analyzeMedication(
      "Take Lisinopril 10mg once daily by mouth. Prescribed by Dr. Smith. " +
        "Refill at CVS Pharmacy. Take with or without food. Monitor blood pressure."
    );
  };

  const handleInteractionCheck = async () => {
    setActiveDemo("interactions");
    await checkInteractions([
      "Lisinopril 10mg",
      "Metformin 500mg",
      "Aspirin 81mg",
      "Atorvastatin 20mg",
    ]);
  };

  const handleDocumentSimplification = async () => {
    setActiveDemo("document");
    await simplifyDocument(
      "The patient presents with acute exacerbation of chronic obstructive pulmonary disease " +
        "manifesting as dyspnea, productive cough with purulent sputum, and decreased exercise tolerance. " +
        "Recommend bronchodilator therapy and corticosteroid administration."
    );
  };

  const demoButtons = [
    {
      title: "Text Generation",
      subtitle: "Generate helpful medical content",
      onPress: handleTextGeneration,
      active: activeDemo === "text",
    },
    {
      title: "Medication Analysis",
      subtitle: "Analyze medication information",
      onPress: handleMedicationAnalysis,
      active: activeDemo === "medication",
    },
    {
      title: "Drug Interactions",
      subtitle: "Check for medication interactions",
      onPress: handleInteractionCheck,
      active: activeDemo === "interactions",
    },
    {
      title: "Document Simplification",
      subtitle: "Simplify medical documents",
      onPress: handleDocumentSimplification,
      active: activeDemo === "document",
    },
  ];

  if (!isConfigured) {
    return <GeminiSetup />;
  }

  if (showChat) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.background }]}
          onPress={() => setShowChat(false)}
        >
          <Text style={{ color: colors.tint }}>← Back to Demo</Text>
        </TouchableOpacity>
        <GeminiChat />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.title}>
          Gemini AI Demo
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Explore the AI-powered features available in your app
        </ThemedText>
      </ThemedView>

      {/* Demo Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Try These Features:
        </ThemedText>

        {demoButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.demoButton,
              {
                backgroundColor: button.active
                  ? colors.tint
                  : colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={button.onPress}
            disabled={isGenerating || isMedicationAnalyzing}
          >
            <Text
              style={[
                styles.buttonTitle,
                { color: button.active ? "white" : colors.text },
              ]}
            >
              {button.title}
            </Text>
            <Text
              style={[
                styles.buttonSubtitle,
                {
                  color: button.active
                    ? "rgba(255,255,255,0.8)"
                    : colors.tabIconDefault,
                },
              ]}
            >
              {button.subtitle}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Chat Button */}
        <TouchableOpacity
          style={[styles.chatButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowChat(true)}
        >
          <Text style={styles.chatButtonText}>💬 Open AI Chat</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Loading State */}
      {(isGenerating || isMedicationAnalyzing) && (
        <ThemedView style={styles.section}>
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text
              style={[styles.loadingText, { color: colors.tabIconDefault }]}
            >
              AI is processing your request...
            </Text>
          </View>
        </ThemedView>
      )}

      {/* Results */}
      {(generatedText || medicationResult) && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            AI Response:
          </ThemedText>
          <View
            style={[
              styles.resultContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.resultText, { color: colors.text }]}>
              {generatedText || medicationResult}
            </Text>
          </View>
        </ThemedView>
      )}

      {/* Status */}
      <ThemedView style={styles.section}>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusIcon, { color: colors.tint }]}>✅</Text>
          <ThemedText style={styles.statusText}>
            Gemini AI is active and ready
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  demoButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  resultContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default GeminiDemo;
