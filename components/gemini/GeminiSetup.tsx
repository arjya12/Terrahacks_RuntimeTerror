/**
 * Gemini Setup Component
 * Allows users to configure their Gemini API key
 */

import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { useGemini } from "../../hooks/useGemini";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

// ============================================================================
// Types
// ============================================================================

interface GeminiSetupProps {
  onSetupComplete?: () => void;
  showTitle?: boolean;
  style?: any;
}

// ============================================================================
// Component
// ============================================================================

export function GeminiSetup({
  onSetupComplete,
  showTitle = true,
  style,
}: GeminiSetupProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const { setApiKey: saveApiKey, isLoading, error, isConfigured } = useGemini();

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API key");
      return;
    }

    try {
      await saveApiKey(apiKey.trim());
      setApiKey("");
      Alert.alert("Success", "Gemini API key configured successfully!", [
        {
          text: "OK",
          onPress: () => onSetupComplete?.(),
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        "Failed to configure API key. Please check your key and try again."
      );
    }
  };

  const handleShowInfo = () => {
    Alert.alert(
      "About Gemini API Key",
      "To get your Gemini API key:\n\n" +
        "1. Visit Google AI Studio (makersuite.google.com)\n" +
        "2. Sign in with your Google account\n" +
        "3. Create a new API key\n" +
        "4. Copy and paste it here\n\n" +
        "Your API key will be stored securely on your device.",
      [{ text: "OK" }]
    );
  };

  if (isConfigured) {
    return (
      <ThemedView style={[styles.container, style]}>
        <View style={styles.successContainer}>
          <Text style={[styles.successIcon, { color: colors.tint }]}>✅</Text>
          <ThemedText style={styles.successText}>
            Gemini AI is configured and ready!
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, style]}>
      {showTitle && (
        <ThemedText type="title" style={styles.title}>
          Configure Gemini AI
        </ThemedText>
      )}

      <ThemedText style={styles.description}>
        Enter your Gemini API key to enable AI-powered features like medication
        analysis and document simplification.
      </ThemedText>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text,
            },
          ]}
          placeholder="Enter your Gemini API key"
          placeholderTextColor={colors.tabIconDefault}
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
        />

        <TouchableOpacity
          style={styles.visibilityButton}
          onPress={() => setIsVisible(!isVisible)}
        >
          <Text style={{ color: colors.tint }}>{isVisible ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={[styles.errorText, { color: "#FF6B6B" }]}>{error}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.tint },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleSetApiKey}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Configuring..." : "Save API Key"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.infoButton, { borderColor: colors.border }]}
          onPress={handleShowInfo}
        >
          <Text style={[styles.infoButtonText, { color: colors.tint }]}>
            How to get API key?
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    minHeight: 50,
  },
  visibilityButton: {
    position: "absolute",
    right: 16,
    top: 15,
    padding: 4,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  successText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default GeminiSetup;
