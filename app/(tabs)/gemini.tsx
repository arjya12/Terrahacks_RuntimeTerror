/**
 * Gemini AI Demo Tab
 * Showcases AI features and allows users to interact with Gemini
 */

import { GeminiDemo } from "@/components/gemini/GeminiDemo";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GeminiScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <GeminiDemo />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
