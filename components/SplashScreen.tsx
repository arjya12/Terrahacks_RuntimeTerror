import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const LoadingDots: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDots = () => {
      dot1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      dot2.value = withDelay(
        200,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );

      dot3.value = withDelay(
        400,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );
    };

    animateDots();
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

export default function SplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Start animations
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Title animation with delay
    titleTranslateY.value = withDelay(
      400,
      withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    titleOpacity.value = withDelay(
      400,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    // Tagline animation
    taglineOpacity.value = withDelay(
      800,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    // Auto-hide after minimum display time
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        {
          duration: 500,
          easing: Easing.in(Easing.ease),
        },
        () => {
          runOnJS(onAnimationComplete)();
        }
      );
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6B35"
        translucent
      />

      <LinearGradient
        colors={["#FF6B35", "#F7931E"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image
                  source={require("../assets/logo-white.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Title */}
              <Animated.View style={titleAnimatedStyle}>
                <Text style={styles.title}>QuickBites</Text>
              </Animated.View>

              {/* Tagline */}
              <Animated.View style={taglineAnimatedStyle}>
                <Text style={styles.tagline}>
                  Delivering happiness to your door
                </Text>
              </Animated.View>
            </View>

            {/* Loading Section */}
            <View style={styles.loadingSection}>
              <LoadingDots />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  logoSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Poppins-Bold",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  loadingSection: {
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
});
