import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { ViewStyle } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export interface LogoProps {
  /**
   * Size of the logo in pixels
   * @default 48
   */
  size?: number;

  /**
   * Additional styles for the container
   */
  style?: ViewStyle;

  /**
   * Whether to show animated rotation (for loading states)
   * @default false
   */
  animated?: boolean;

  /**
   * Logo variant for different use cases
   * @default 'default'
   */
  variant?: "default" | "icon" | "splash" | "button";

  /**
   * Animation duration in milliseconds
   * @default 2000
   */
  animationDuration?: number;

  /**
   * Custom gradient colors
   */
  gradientColors?: [string, string];

  /**
   * Center circle color
   * @default '#FFFFFF'
   */
  centerColor?: string;
}

const GRADIENT_COLORS = {
  start: "#4F46E5", // Blue
  end: "#7C3AED", // Purple
} as const;

const VARIANT_CONFIGS = {
  default: {
    centerRatio: 0.45,
    strokeWidth: 0,
  },
  icon: {
    centerRatio: 0.4,
    strokeWidth: 1,
  },
  splash: {
    centerRatio: 0.42,
    strokeWidth: 0,
  },
  button: {
    centerRatio: 0.35,
    strokeWidth: 1,
  },
} as const;

/**
 * Reusable Logo component with gradient design
 * Features: TypeScript support, animations, multiple variants, responsive sizing
 */
export const Logo: React.FC<LogoProps> = ({
  size = 48,
  style,
  animated = false,
  variant = "default",
  animationDuration = 2000,
  gradientColors = [GRADIENT_COLORS.start, GRADIENT_COLORS.end],
  centerColor = "#FFFFFF",
}) => {
  // Memoized calculations for performance
  const logoConfig = useMemo(() => {
    const config = VARIANT_CONFIGS[variant];
    const radius = size / 2;
    const centerRadius = radius * config.centerRatio;
    const strokeWidth = config.strokeWidth;

    return {
      radius,
      centerRadius,
      strokeWidth,
      viewBox: `0 0 ${size} ${size}`,
    };
  }, [size, variant]);

  // Animation setup
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      rotation.value = withRepeat(
        withTiming(360, { duration: animationDuration }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [animated, animationDuration, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          rotation.value,
          [0, 360],
          [0, 360],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    ...style,
  };

  return (
    <Animated.View style={[containerStyle, animated && animatedStyle]}>
      <Svg
        width={size}
        height={size}
        viewBox={logoConfig.viewBox}
        style={{ position: "absolute" }}
      >
        <Defs>
          <LinearGradient
            id={`gradient-${size}-${variant}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>

        {/* Outer gradient circle */}
        <Circle
          cx={logoConfig.radius}
          cy={logoConfig.radius}
          r={logoConfig.radius - logoConfig.strokeWidth / 2}
          fill={`url(#gradient-${size}-${variant})`}
          stroke={logoConfig.strokeWidth > 0 ? "rgba(255,255,255,0.2)" : "none"}
          strokeWidth={logoConfig.strokeWidth}
        />

        {/* Inner white circle */}
        <Circle
          cx={logoConfig.radius}
          cy={logoConfig.radius}
          r={logoConfig.centerRadius}
          fill={centerColor}
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * Alternative implementation using ExpoLinearGradient for better performance in some cases
 */
export const LogoWithGradientView: React.FC<LogoProps> = ({
  size = 48,
  style,
  animated = false,
  variant = "default",
  animationDuration = 2000,
  gradientColors = [GRADIENT_COLORS.start, GRADIENT_COLORS.end],
  centerColor = "#FFFFFF",
}) => {
  const logoConfig = useMemo(() => {
    const config = VARIANT_CONFIGS[variant];
    const radius = size / 2;
    const centerRadius = radius * config.centerRatio;

    return {
      radius,
      centerRadius,
      borderRadius: radius,
      centerBorderRadius: centerRadius,
    };
  }, [size, variant]);

  // Animation setup
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      rotation.value = withRepeat(
        withTiming(360, { duration: animationDuration }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [animated, animationDuration, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          rotation.value,
          [0, 360],
          [0, 360],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    ...style,
  };

  const centerStyle: ViewStyle = {
    position: "absolute",
    width: logoConfig.centerRadius * 2,
    height: logoConfig.centerRadius * 2,
    borderRadius: logoConfig.centerBorderRadius,
    backgroundColor: centerColor,
    top: (size - logoConfig.centerRadius * 2) / 2,
    left: (size - logoConfig.centerRadius * 2) / 2,
  };

  return (
    <Animated.View style={[containerStyle, animated && animatedStyle]}>
      <ExpoLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: logoConfig.borderRadius,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View style={centerStyle} />
      </ExpoLinearGradient>
    </Animated.View>
  );
};

// Pre-configured logo components for common use cases
export const AppLogo = (props: Omit<LogoProps, "variant">) => (
  <Logo {...props} variant="default" />
);

export const IconLogo = (props: Omit<LogoProps, "variant">) => (
  <Logo {...props} variant="icon" />
);

export const SplashLogo = (props: Omit<LogoProps, "variant">) => (
  <Logo {...props} variant="splash" />
);

export const ButtonLogo = (props: Omit<LogoProps, "variant">) => (
  <Logo {...props} variant="button" />
);

export const LoadingLogo = (props: Omit<LogoProps, "animated">) => (
  <Logo {...props} animated={true} />
);

export default Logo;
