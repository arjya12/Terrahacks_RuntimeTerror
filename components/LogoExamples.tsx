import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AppLogo,
  ButtonLogo,
  IconLogo,
  LoadingLogo,
  Logo,
  LogoWithGradientView,
  SplashLogo,
} from "./Logo";

/**
 * Demo component showing all logo variations and usage examples
 * Use this for testing and as a reference guide
 */
export const LogoExamples: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Logo System Demo</Text>

        {/* Size Variations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size Variations</Text>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <Logo size={24} />
              <Text style={styles.label}>24px</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo size={32} />
              <Text style={styles.label}>32px</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo size={48} />
              <Text style={styles.label}>48px (default)</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo size={64} />
              <Text style={styles.label}>64px</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo size={96} />
              <Text style={styles.label}>96px</Text>
            </View>
          </View>
        </View>

        {/* Variant Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo Variants</Text>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <Logo variant="default" size={64} />
              <Text style={styles.label}>Default</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo variant="icon" size={64} />
              <Text style={styles.label}>Icon</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo variant="splash" size={64} />
              <Text style={styles.label}>Splash</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo variant="button" size={64} />
              <Text style={styles.label}>Button</Text>
            </View>
          </View>
        </View>

        {/* Pre-configured Components */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pre-configured Components</Text>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <AppLogo size={48} />
              <Text style={styles.label}>AppLogo</Text>
            </View>
            <View style={styles.logoContainer}>
              <IconLogo size={48} />
              <Text style={styles.label}>IconLogo</Text>
            </View>
            <View style={styles.logoContainer}>
              <SplashLogo size={48} />
              <Text style={styles.label}>SplashLogo</Text>
            </View>
            <View style={styles.logoContainer}>
              <ButtonLogo size={48} />
              <Text style={styles.label}>ButtonLogo</Text>
            </View>
          </View>
        </View>

        {/* Animated Logos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animated Loading States</Text>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <LoadingLogo size={48} />
              <Text style={styles.label}>Loading (2s)</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo size={48} animated animationDuration={1000} />
              <Text style={styles.label}>Fast (1s)</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo size={48} animated animationDuration={3000} />
              <Text style={styles.label}>Slow (3s)</Text>
            </View>
          </View>
        </View>

        {/* Alternative Implementation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternative Implementation</Text>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <Logo size={64} />
              <Text style={styles.label}>SVG Version</Text>
            </View>
            <View style={styles.logoContainer}>
              <LogoWithGradientView size={64} />
              <Text style={styles.label}>Gradient View</Text>
            </View>
            <View style={styles.logoContainer}>
              <LogoWithGradientView size={64} animated />
              <Text style={styles.label}>Animated Gradient</Text>
            </View>
          </View>
        </View>

        {/* Custom Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Color Variations</Text>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <Logo
                size={48}
                gradientColors={["#10B981", "#059669"]}
                centerColor="#FFFFFF"
              />
              <Text style={styles.label}>Green Theme</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo
                size={48}
                gradientColors={["#F59E0B", "#D97706"]}
                centerColor="#FFFFFF"
              />
              <Text style={styles.label}>Orange Theme</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo
                size={48}
                gradientColors={["#EF4444", "#DC2626"]}
                centerColor="#FFFFFF"
              />
              <Text style={styles.label}>Red Theme</Text>
            </View>
            <View style={styles.logoContainer}>
              <Logo
                size={48}
                gradientColors={["#6B7280", "#374151"]}
                centerColor="#F9FAFB"
              />
              <Text style={styles.label}>Dark Mode</Text>
            </View>
          </View>
        </View>

        {/* Usage in Different Contexts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Contexts</Text>

          <View style={styles.contextExample}>
            <Text style={styles.contextTitle}>Header Navigation</Text>
            <View style={styles.headerExample}>
              <IconLogo size={32} />
              <Text style={styles.headerTitle}>MediTrack</Text>
            </View>
          </View>

          <View style={styles.contextExample}>
            <Text style={styles.contextTitle}>Button with Logo</Text>
            <View style={styles.buttonExample}>
              <ButtonLogo size={20} />
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
          </View>

          <View style={styles.contextExample}>
            <Text style={styles.contextTitle}>Loading State</Text>
            <View style={styles.loadingExample}>
              <LoadingLogo size={40} />
              <Text style={styles.loadingText}>
                Loading your medications...
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 20,
  },
  logoContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  contextExample: {
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  headerExample: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  buttonExample: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingExample: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#6B7280",
  },
});

export default LogoExamples;
