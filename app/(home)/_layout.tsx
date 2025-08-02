import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function HomeLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="medications"
        options={{
          title: "Medications",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="sharing"
        options={{
          title: "Medication Sharing",
          headerShown: true,
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
