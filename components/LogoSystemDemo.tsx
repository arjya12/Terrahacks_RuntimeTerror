import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AppLogo,
  ButtonLogo,
  IconLogo,
  LoadingLogo,
  Logo,
  SplashLogo,
} from "./Logo";
import {
  BrandedHeader,
  InlineBrand,
  NavigationHeader,
} from "./ui/BrandedHeader";
import { InlineLoader, LoadingSpinner } from "./ui/LoadingSpinner";
import { LogoButton, LogoIconButton } from "./ui/LogoButton";

/**
 * Complete demo of the logo system
 * Use this component to test and showcase all logo variations
 */
export const LogoSystemDemo: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title="Logo System Demo"
        rightElement={
          <LogoIconButton
            size={32}
            variant="outline"
            onPress={() => console.log("Icon pressed")}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Branded Header Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Branded Headers</Text>
          <BrandedHeader
            title="MediTrack"
            subtitle="Your Health, Simplified"
            variant="default"
          />
          <View style={styles.spacer} />
          <BrandedHeader title="Medications" variant="compact" theme="light" />
        </View>

        {/* Logo Sizes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo Sizes</Text>
          <View style={styles.logoGrid}>
            {[20, 32, 48, 64, 96].map((size) => (
              <View key={size} style={styles.logoItem}>
                <Logo size={size} />
                <Text style={styles.logoLabel}>{size}px</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logo Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo Variants</Text>
          <View style={styles.logoGrid}>
            <View style={styles.logoItem}>
              <Logo variant="default" size={48} />
              <Text style={styles.logoLabel}>Default</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo variant="icon" size={48} />
              <Text style={styles.logoLabel}>Icon</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo variant="splash" size={48} />
              <Text style={styles.logoLabel}>Splash</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo variant="button" size={48} />
              <Text style={styles.logoLabel}>Button</Text>
            </View>
          </View>
        </View>

        {/* Pre-configured Components */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pre-configured Components</Text>
          <View style={styles.logoGrid}>
            <View style={styles.logoItem}>
              <AppLogo size={48} />
              <Text style={styles.logoLabel}>AppLogo</Text>
            </View>
            <View style={styles.logoItem}>
              <IconLogo size={48} />
              <Text style={styles.logoLabel}>IconLogo</Text>
            </View>
            <View style={styles.logoItem}>
              <SplashLogo size={48} />
              <Text style={styles.logoLabel}>SplashLogo</Text>
            </View>
            <View style={styles.logoItem}>
              <ButtonLogo size={48} />
              <Text style={styles.logoLabel}>ButtonLogo</Text>
            </View>
          </View>
        </View>

        {/* Animated Logos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animated Loading States</Text>
          <View style={styles.logoGrid}>
            <View style={styles.logoItem}>
              <LoadingLogo size={48} />
              <Text style={styles.logoLabel}>Loading (2s)</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo size={48} animated animationDuration={1000} />
              <Text style={styles.logoLabel}>Fast (1s)</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo size={48} animated animationDuration={3000} />
              <Text style={styles.logoLabel}>Slow (3s)</Text>
            </View>
          </View>
        </View>

        {/* Loading Spinners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loading Spinners</Text>
          <View style={styles.logoGrid}>
            <LoadingSpinner size={48} message="Loading..." variant="primary" />
            <LoadingSpinner size={48} message="Success!" variant="success" />
            <LoadingSpinner size={48} message="Warning" variant="warning" />
            <LoadingSpinner size={48} message="Error" variant="error" />
          </View>

          <View style={styles.inlineLoaderDemo}>
            <InlineLoader size={20} message="Saving..." />
          </View>
        </View>

        {/* Logo Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo Buttons</Text>
          <View style={styles.buttonGrid}>
            <LogoButton
              title="Get Started"
              onPress={handleButtonPress}
              variant="primary"
              size="large"
              loading={loading}
            />
            <LogoButton
              title="Learn More"
              onPress={() => console.log("Learn more")}
              variant="outline"
              size="medium"
              logoPosition="right"
            />
            <LogoButton
              title="Secondary"
              onPress={() => console.log("Secondary")}
              variant="secondary"
              size="small"
            />
            <LogoButton
              title="Ghost Button"
              onPress={() => console.log("Ghost")}
              variant="ghost"
              size="medium"
            />
          </View>

          <View style={styles.iconButtonGrid}>
            <LogoIconButton
              size={48}
              variant="primary"
              onPress={() => console.log("Primary icon")}
            />
            <LogoIconButton
              size={48}
              variant="outline"
              onPress={() => console.log("Outline icon")}
            />
            <LogoIconButton
              size={48}
              variant="secondary"
              onPress={() => console.log("Secondary icon")}
            />
          </View>
        </View>

        {/* Custom Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Color Variations</Text>
          <View style={styles.logoGrid}>
            <View style={styles.logoItem}>
              <Logo size={48} gradientColors={["#10B981", "#059669"]} />
              <Text style={styles.logoLabel}>Green</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo size={48} gradientColors={["#F59E0B", "#D97706"]} />
              <Text style={styles.logoLabel}>Orange</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo size={48} gradientColors={["#EF4444", "#DC2626"]} />
              <Text style={styles.logoLabel}>Red</Text>
            </View>
            <View style={styles.logoItem}>
              <Logo
                size={48}
                gradientColors={["#6B7280", "#374151"]}
                centerColor="#F9FAFB"
              />
              <Text style={styles.logoLabel}>Dark</Text>
            </View>
          </View>
        </View>

        {/* Inline Brand Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inline Brand Components</Text>
          <View style={styles.inlineBrandGrid}>
            <InlineBrand size="small" />
            <InlineBrand size="medium" />
            <InlineBrand size="large" />
          </View>
        </View>

        {/* Context Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage in Context</Text>

          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Navigation Bar</Text>
            <View style={styles.navExample}>
              <IconLogo size={24} />
              <Text style={styles.navTitle}>MediTrack</Text>
              <TouchableOpacity>
                <Text style={styles.navAction}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Card Header</Text>
            <View style={styles.cardHeaderExample}>
              <IconLogo size={20} />
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Daily Medications</Text>
                <Text style={styles.cardSubtitle}>3 doses remaining</Text>
              </View>
            </View>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>Loading State</Text>
            <View style={styles.loadingStateExample}>
              <LoadingLogo size={32} />
              <Text style={styles.loadingText}>
                Syncing your health data...
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  logoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 16,
  },
  logoItem: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
  },
  logoLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  buttonGrid: {
    gap: 12,
    marginBottom: 16,
  },
  iconButtonGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  inlineLoaderDemo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  inlineBrandGrid: {
    gap: 16,
    alignItems: "flex-start",
  },
  contextCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contextTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  navExample: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginLeft: 12,
  },
  navAction: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  cardHeaderExample: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderText: {
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  loadingStateExample: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 16,
    fontSize: 14,
    color: "#6B7280",
  },
  spacer: {
    height: 16,
  },
});

export default LogoSystemDemo;
