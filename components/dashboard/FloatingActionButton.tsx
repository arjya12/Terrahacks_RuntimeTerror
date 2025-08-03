import { AppIcon } from "@/components/icons/IconSystem";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
  isVisible?: boolean;
  loading?: boolean;
}

/**
 * FloatingActionButton - Prominent Add Medication CTA
 *
 * Features:
 * - Always accessible primary action
 * - Smooth entrance/exit animations
 * - Loading state support
 * - Accessibility optimized
 * - Material Design 3.0 styling
 */
export function FloatingActionButton({
  onPress,
  isVisible = true,
  loading = false,
}: FloatingActionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isVisible ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isVisible, scaleAnim]);

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading, rotateAnim]);

  const handlePress = () => {
    // Create a satisfying press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (!loading) {
      onPress();
    }
  };

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.fab, loading && styles.fabLoading]}
        onPress={handlePress}
        disabled={loading}
        accessibilityLabel="Add new medication"
        accessibilityHint="Opens the medication entry form"
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        <View style={styles.fabContent}>
          {loading ? (
            <Animated.View
              style={[
                styles.loadingIcon,
                {
                  transform: [{ rotate: spinInterpolate }],
                },
              ]}
            >
              <AppIcon name="feedback_retry" size="small" color="white" />
            </Animated.View>
          ) : (
            <AppIcon name="action_add_medication" size="small" color="white" />
          )}
          <Text style={styles.fabText}>
            {loading ? "Adding..." : "Add Medication"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    backgroundColor: "#3b82f6",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
    minHeight: 56,
  },
  fabLoading: {
    backgroundColor: "#6b7280",
    shadowColor: "#6b7280",
  },
  fabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fabText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
