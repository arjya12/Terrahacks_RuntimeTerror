import React, { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { SplashLogo } from "../Logo";

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  appName?: string;
  tagline?: string;
}

/**
 * Animated splash screen component with logo
 * Features fade-in animation, logo rotation, and smooth transitions
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  appName = "MediTrack",
  tagline = "Your Health, Simplified",
}) => {
  // Animation values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const backgroundOpacity = useSharedValue(0);

  // Start animations on mount
  useEffect(() => {
    const animationSequence = () => {
      // Background fade in
      backgroundOpacity.value = withTiming(1, { duration: 300 });

      // Logo animation
      logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      logoScale.value = withDelay(200, withTiming(1, { duration: 600 }));

      // Text animation
      textOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
      textTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }));

      // Complete animation after total duration
      if (onAnimationComplete) {
        setTimeout(() => {
          runOnJS(onAnimationComplete)();
        }, 2000);
      }
    };

    animationSequence();
  }, [
    logoScale,
    logoOpacity,
    textOpacity,
    textTranslateY,
    backgroundOpacity,
    onAnimationComplete,
  ]);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      {
        rotate: `${interpolate(logoOpacity.value, [0, 1], [0, 360])}deg`,
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.background, backgroundStyle]} />

        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <SplashLogo size={120} />
          </Animated.View>

          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.appName}>{appName}</Text>
            <Text style={styles.tagline}>{tagline}</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, textStyle]}>
          <Text style={styles.footerText}>Powered by AI Healthcare</Text>
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#4F46E5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontWeight: "400",
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
});

export default SplashScreen;
