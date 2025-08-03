import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = "large",
  color = "#3b82f6",
  text,
  overlay = false,
}: LoadingSpinnerProps) {
  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator size={size} color={color} />
      {text && <ThemedText style={styles.text}>{text}</ThemedText>}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlayWrapper}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  overlayWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    margin: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
});
