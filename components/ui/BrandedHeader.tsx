import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { IconLogo } from "../Logo";

interface BrandedHeaderProps {
  /**
   * App name to display
   * @default 'MediTrack'
   */
  title?: string;

  /**
   * Subtitle or tagline
   */
  subtitle?: string;

  /**
   * Logo size
   * @default 32
   */
  logoSize?: number;

  /**
   * Header variant
   * @default 'default'
   */
  variant?: "default" | "compact" | "minimal";

  /**
   * Color theme
   * @default 'light'
   */
  theme?: "light" | "dark";

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Show logo
   * @default true
   */
  showLogo?: boolean;
}

const THEME_STYLES = {
  light: {
    backgroundColor: "#FFFFFF",
    titleColor: "#1F2937",
    subtitleColor: "#6B7280",
    borderColor: "#E5E7EB",
  },
  dark: {
    backgroundColor: "#1F2937",
    titleColor: "#FFFFFF",
    subtitleColor: "#9CA3AF",
    borderColor: "#374151",
  },
} as const;

/**
 * Branded header component with logo and title
 * Perfect for navigation headers and page titles
 */
export const BrandedHeader: React.FC<BrandedHeaderProps> = ({
  title = "MediTrack",
  subtitle,
  logoSize = 32,
  variant = "default",
  theme = "light",
  style,
  showLogo = true,
}) => {
  const themeStyle = THEME_STYLES[theme];

  const containerStyle: ViewStyle = {
    ...styles.container,
    backgroundColor: themeStyle.backgroundColor,
    borderBottomColor: themeStyle.borderColor,
    ...(variant === "compact" && styles.compactContainer),
    ...(variant === "minimal" && styles.minimalContainer),
  };

  const titleStyle = {
    ...styles.title,
    color: themeStyle.titleColor,
    ...(variant === "compact" && styles.compactTitle),
    ...(variant === "minimal" && styles.minimalTitle),
  };

  const subtitleStyle = {
    ...styles.subtitle,
    color: themeStyle.subtitleColor,
  };

  return (
    <View style={[containerStyle, style]}>
      <View style={styles.content}>
        {showLogo && (
          <IconLogo size={variant === "compact" ? logoSize * 0.8 : logoSize} />
        )}
        <View style={styles.textContainer}>
          <Text style={titleStyle}>{title}</Text>
          {subtitle && variant !== "minimal" && (
            <Text style={subtitleStyle}>{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * Navigation header with logo
 */
export const NavigationHeader: React.FC<{
  title?: string;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}> = ({ title = "MediTrack", onBackPress, rightElement, style }) => (
  <View style={[styles.navHeader, style]}>
    <View style={styles.navLeft}>
      {onBackPress && (
        <Text style={styles.backButton} onPress={onBackPress}>
          ← Back
        </Text>
      )}
    </View>

    <View style={styles.navCenter}>
      <IconLogo size={24} />
      <Text style={styles.navTitle}>{title}</Text>
    </View>

    <View style={styles.navRight}>{rightElement}</View>
  </View>
);

/**
 * Simple logo with text for inline usage
 */
export const InlineBrand: React.FC<{
  size?: "small" | "medium" | "large";
  showText?: boolean;
  style?: ViewStyle;
}> = ({ size = "medium", showText = true, style }) => {
  const sizeConfig = {
    small: { logoSize: 20, fontSize: 14 },
    medium: { logoSize: 24, fontSize: 16 },
    large: { logoSize: 32, fontSize: 20 },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.inlineBrand, style]}>
      <IconLogo size={config.logoSize} />
      {showText && (
        <Text style={[styles.inlineText, { fontSize: config.fontSize }]}>
          MediTrack
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    paddingVertical: 12,
  },
  minimalContainer: {
    paddingVertical: 8,
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  compactTitle: {
    fontSize: 18,
  },
  minimalTitle: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: "400",
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  navCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "center",
  },
  navRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  backButton: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "500",
  },
  inlineBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  inlineText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default BrandedHeader;
