import apiService from "@/services/api";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      console.log("🔐 Attempting sign in...");

      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        console.log("✅ Sign in successful");
        await setActive({ session: signInAttempt.createdSessionId });

        // Get session token and connect to backend
        try {
          const session = signInAttempt.createdSession;
          if (session) {
            // Set auth token for API service
            const token = await session.getToken();
            if (token) {
              apiService.setAuthToken(token);

              // Validate token with backend
              console.log("🔗 Connecting to backend API...");
              const authStatus = await apiService.getAuthStatus();
              console.log("✅ Backend connection successful:", authStatus);

              // Get user profile from backend
              if (authStatus.authenticated) {
                const userProfile = await apiService.getCurrentUserProfile();
                console.log("👤 User profile loaded:", userProfile);
              }
            }
          }
        } catch (backendError) {
          console.warn(
            "⚠️ Backend connection failed (continuing anyway):",
            backendError
          );
          // Don't block login if backend is unavailable
        }

        // Navigate to main app after successful authentication
        console.log("🎯 Navigating to main app after successful login");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Sign in failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("❌ Sign in error:", err);

      const errorMessage =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
        "Sign in failed";

      // Handle "Session already exists" error specifically
      if (
        errorMessage.includes("Session already exists") ||
        errorMessage.includes("session_exists")
      ) {
        Alert.alert(
          "Session Conflict",
          "A session already exists. Please close the app completely and try again, or sign out from your account settings.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />

      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don&apos;t have an account?</Text>
        <Link href="/(auth)/sign-up" style={styles.link}>
          <Text style={styles.linkTextBold}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    textDecorationLine: "none",
  },
  linkTextBold: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
