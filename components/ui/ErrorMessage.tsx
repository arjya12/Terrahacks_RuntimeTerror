import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { AppIcon } from "../icons/IconSystem";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  type?: "error" | "warning" | "info";
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
  type = "error",
}: ErrorMessageProps) {
  const getIconName = () => {
    switch (type) {
      case "warning":
        return "feedback_warning";
      case "info":
        return "feedback_info";
      default:
        return "feedback_error";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "error";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <AppIcon name={getIconName()} size="large" color={getIconColor()} />

      <ThemedText style={styles.title}>{title}</ThemedText>

      <ThemedText style={styles.message}>{message}</ThemedText>

      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <AppIcon name="action_refresh" size="medium" color="primary" />
          <ThemedText style={styles.retryText}>{retryText}</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
