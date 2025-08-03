import { Stack } from "expo-router";

/**
 * HomeLayout - Secondary navigation for specific features
 *
 * This layout provides navigation for:
 * - Detailed medication management
 * - Medication sharing with QR codes
 * - QR code scanning for providers
 *
 * Primary navigation uses tabs - this is for specialized features
 */
export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="medications"
        options={{
          title: "Take Medications",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#3b82f6",
          },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#ef4444",
          },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="sharing"
        options={{
          title: "Share Medications",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#f59e0b",
          },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="scan-share"
        options={{
          title: "Scan Share Code",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
