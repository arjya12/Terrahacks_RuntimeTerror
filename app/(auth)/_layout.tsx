import { Stack } from "expo-router";

/**
 * Auth Routes Layout - Handles authentication screens
 *
 * Since AuthWrapper handles authentication state checking,
 * this layout only renders when user needs to authenticate.
 */
export default function AuthRoutesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
