import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface CustomSplashScreenProps {
  onAnimationComplete: () => void;
}

const PremiumLoadingIndicator = () => {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Smooth progress animation
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );

    // Gentle rotation for sophistication
    rotation.value = withRepeat(withTiming(360, { duration: 3000 }), -1, false);
  }, []);

  const progressStyle = useAnimatedStyle(() => {
    const strokeDashoffset = interpolate(progress.value, [0, 1], [126, 0]);
    return {
      strokeDashoffset,
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.progressRing}>
        {/* Background circle */}
        <View style={styles.progressBackground} />
        {/* Animated progress */}
        <Animated.View style={[styles.progressForeground, progressStyle]} />
      </View>
    </View>
  );
};

const PulsingIcon = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    const startAnimation = () => {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 15, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 200 })
        ),
        -1,
        false
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200 }),
          withTiming(0.3, { duration: 1200 })
        ),
        -1,
        false
      );
    };

    setTimeout(startAnimation, delay);
  }, [delay]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.iconPulse, pulseStyle]}>
      {/* Glow effect */}
      <Animated.View style={[styles.iconGlow, glowStyle]} />
      {children}
    </Animated.View>
  );
};

export default function CustomSplashScreen({
  onAnimationComplete,
}: CustomSplashScreenProps) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoTranslateY = useSharedValue(20);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(15);

  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(10);

  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo entrance with beautiful spring physics
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    logoScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 18,
        stiffness: 120,
        mass: 1,
      })
    );

    logoTranslateY.value = withDelay(
      300,
      withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 1,
      })
    );

    // Title appears with elegant slide-up
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    titleTranslateY.value = withDelay(
      800,
      withSpring(0, {
        damping: 20,
        stiffness: 140,
      })
    );

    // Subtitle follows with subtle delay
    subtitleOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));

    subtitleTranslateY.value = withDelay(
      1100,
      withSpring(0, {
        damping: 20,
        stiffness: 140,
      })
    );

    // Premium exit animation after 2.8 seconds
    setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onAnimationComplete)();
      });
    }, 2800);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={["#fafafa", "#f1f5f9"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <PulsingIcon delay={1000}>
              <View style={styles.logoWrapper}>
                <View style={styles.logoInnerShadow}>
                  <Image
                    source={require("../assets/images/icon.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </PulsingIcon>
          </Animated.View>

          <View style={styles.textContainer}>
            <Animated.View style={titleStyle}>
              <Text style={styles.title}>MedReconcile Pro</Text>
            </Animated.View>

            <Animated.View style={subtitleStyle}>
              <Text style={styles.subtitle}>
                Simplifying medication management
              </Text>
            </Animated.View>
          </View>

          <View style={styles.loadingSection}>
            <PremiumLoadingIndicator />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 48,
  },
  iconPulse: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3b82f6",
    opacity: 0.1,
  },
  logoWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  logoInnerShadow: {
    borderRadius: 20,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  loadingSection: {
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBackground: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  progressForeground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
});
