import { clearAuthCache } from "@/utils/authUtils";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
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
  const { signOut } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isClearing, setIsClearing] = React.useState(false);

  // Function to clear existing session and retry login
  const clearSessionAndRetry = async () => {
    try {
      setIsClearing(true);
      console.log("🧹 Clearing existing session and cache...");

      // Sign out first
      try {
        await signOut();
      } catch (error) {
        console.warn("⚠️ Sign out failed (might not be signed in):", error);
      }

      // Clear all authentication cache
      await clearAuthCache();

      // Delay to ensure everything is cleared
      setTimeout(async () => {
        console.log("🔄 Retrying sign in after cache clear...");
        await onSignInPress();
        setIsClearing(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Error clearing session:", error);
      setIsClearing(false);
      Alert.alert(
        "Error",
        "Failed to clear session. Please close and reopen the app.",
        [{ text: "OK" }]
      );
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded || isClearing) return;

    try {
      console.log("🔐 Attempting sign in...");

      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        console.log("✅ Sign in successful");
        await setActive({ session: signInAttempt.createdSessionId });

        // Navigate to main app after successful authentication
        console.log("🎯 Navigating to main app after successful login");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Sign in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Sign in error:", err);

      const errorMessage = err.errors?.[0]?.message || "Sign in failed";

      // Handle "Session already exists" error specifically
      if (
        errorMessage.includes("Session already exists") ||
        errorMessage.includes("session_exists")
      ) {
        Alert.alert(
          "Session Conflict",
          "A session already exists. Would you like to clear it and try again?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Clear & Retry",
              onPress: clearSessionAndRetry,
            },
          ]
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

      <TouchableOpacity
        style={[styles.button, isClearing && styles.buttonDisabled]}
        onPress={onSignInPress}
        disabled={isClearing}
      >
        <Text style={styles.buttonText}>
          {isClearing ? "Clearing Session..." : "Continue"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearSessionAndRetry}
        disabled={isClearing}
      >
        <Text style={styles.clearButtonText}>Clear Session & Sign In</Text>
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
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#FF6B6B",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  clearButtonText: {
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
