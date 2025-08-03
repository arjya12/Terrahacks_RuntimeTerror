import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import ErrorBoundary from "@/components/ErrorBoundary";
import { GeminiProvider } from "@/components/gemini/GeminiProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryProvider } from "@/providers/QueryProvider";
import { initializeGeminiAPI } from "@/utils/geminiInit";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
      // Initialize Gemini AI
      initializeGeminiAPI();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <QueryProvider>
          <GeminiProvider autoInitialize={true}>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(home)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(provider)" />
                  <Stack.Screen
                    name="+not-found"
                    options={{ headerShown: true }}
                  />
                </Stack>
                <StatusBar style="auto" />
              </View>
            </ThemeProvider>
          </GeminiProvider>
        </QueryProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
