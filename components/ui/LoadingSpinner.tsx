import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { LoadingLogo } from "../Logo";

interface LoadingSpinnerProps {
  /**
   * Size of the loading spinner
   * @default 48
   */
  size?: number;

  /**
   * Loading message to display
   */
  message?: string;

  /**
   * Container style
   */
  style?: ViewStyle;

  /**
   * Animation speed in milliseconds
   * @default 1500
   */
  speed?: number;

  /**
   * Color variant
   * @default 'primary'
   */
  variant?: "primary" | "success" | "warning" | "error";
}

const VARIANT_COLORS = {
  primary: ["#4F46E5", "#7C3AED"],
  success: ["#10B981", "#059669"],
  warning: ["#F59E0B", "#D97706"],
  error: ["#EF4444", "#DC2626"],
} as const;

/**
 * Reusable loading spinner component with logo animation
 * Perfect for loading states throughout the app
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 48,
  message,
  style,
  speed = 1500,
  variant = "primary",
}) => {
  const gradientColors = VARIANT_COLORS[variant];

  return (
    <View style={[styles.container, style]}>
      <LoadingLogo
        size={size}
        animationDuration={speed}
        gradientColors={gradientColors}
      />
      {message && (
        <Text style={[styles.message, { color: gradientColors[0] }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

/**
 * Full-screen loading overlay
 */
export const LoadingOverlay: React.FC<{
  visible: boolean;
  message?: string;
  size?: number;
}> = ({ visible, message = "Loading...", size = 64 }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <LoadingSpinner size={size} message={message} />
      </View>
    </View>
  );
};

/**
 * Inline loading component for smaller spaces
 */
export const InlineLoader: React.FC<{
  size?: number;
  message?: string;
}> = ({ size = 24, message }) => (
  <View style={styles.inlineContainer}>
    <LoadingLogo size={size} animationDuration={1000} />
    {message && <Text style={styles.inlineMessage}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  inlineMessage: {
    marginLeft: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default LoadingSpinner;
