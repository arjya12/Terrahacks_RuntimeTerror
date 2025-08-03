import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { ButtonLogo } from "../Logo";

interface LogoButtonProps {
  /**
   * Button text
   */
  title: string;

  /**
   * Button press handler
   */
  onPress: () => void;

  /**
   * Logo size
   * @default 20
   */
  logoSize?: number;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "outline" | "ghost";

  /**
   * Button size
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";

  /**
   * Whether button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether button is loading
   * @default false
   */
  loading?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom text style
   */
  textStyle?: TextStyle;

  /**
   * Logo position
   * @default 'left'
   */
  logoPosition?: "left" | "right";
}

const VARIANT_STYLES = {
  primary: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
    textColor: "#FFFFFF",
  },
  secondary: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    textColor: "#374151",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#4F46E5",
    textColor: "#4F46E5",
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    textColor: "#4F46E5",
  },
} as const;

const SIZE_STYLES = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    logoSize: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    logoSize: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    logoSize: 24,
  },
} as const;

/**
 * Button component with integrated logo
 * Perfect for primary actions and branded interactions
 */
export const LogoButton: React.FC<LogoButtonProps> = ({
  title,
  onPress,
  logoSize,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  logoPosition = "left",
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const finalLogoSize = logoSize || sizeStyle.logoSize;

  const buttonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor: variantStyle.backgroundColor,
    borderColor: variantStyle.borderColor,
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    opacity: disabled ? 0.6 : 1,
  };

  const buttonTextStyle: TextStyle = {
    ...styles.buttonText,
    color: variantStyle.textColor,
    fontSize: sizeStyle.fontSize,
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const LogoComponent = () => (
    <ButtonLogo
      size={finalLogoSize}
      animated={loading}
      gradientColors={
        variant === "primary"
          ? ["#4F46E5", "#7C3AED"]
          : variant === "outline" || variant === "ghost"
          ? ["#4F46E5", "#7C3AED"]
          : ["#6B7280", "#374151"]
      }
    />
  );

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {logoPosition === "left" && <LogoComponent />}
      <Text style={[buttonTextStyle, textStyle]}>
        {loading ? "Loading..." : title}
      </Text>
      {logoPosition === "right" && <LogoComponent />}
    </TouchableOpacity>
  );
};

/**
 * Icon-only button with logo
 */
export const LogoIconButton: React.FC<{
  onPress: () => void;
  size?: number;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}> = ({
  onPress,
  size = 40,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const logoSize = size * 0.5; // Logo is 50% of button size

  const buttonStyle: ViewStyle = {
    ...styles.iconButton,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: variantStyle.backgroundColor,
    borderColor: variantStyle.borderColor,
    opacity: disabled ? 0.6 : 1,
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <ButtonLogo
        size={logoSize}
        animated={loading}
        gradientColors={
          variant === "primary"
            ? ["#4F46E5", "#7C3AED"]
            : variant === "outline" || variant === "ghost"
            ? ["#4F46E5", "#7C3AED"]
            : ["#6B7280", "#374151"]
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default LogoButton;
