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
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import CustomSplashScreen from "@/components/CustomSplashScreen";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function prepare() {
      if (loaded) {
        // Minimum display time for premium experience
        await new Promise((resolve) => setTimeout(resolve, 2200));
        setIsAppReady(true);
      }
    }
    prepare();
  }, [loaded]);

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  const handleCustomSplashComplete = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  if (!isAppReady) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(home)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" options={{ headerShown: true }} />
          </Stack>
          <StatusBar style="auto" />
        </View>

        {showCustomSplash && (
          <CustomSplashScreen
            onAnimationComplete={handleCustomSplashComplete}
          />
        )}
      </ThemeProvider>
    </ClerkProvider>
  );
}
