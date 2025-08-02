import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SignOutButton } from "../components/SignOutButton";

export default function HomePage() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.title}>Welcome Home!</Text>
        <Text style={styles.userEmail}>
          Hello {user?.emailAddresses[0].emailAddress}
        </Text>
        <View style={styles.buttonContainer}>
          <SignOutButton />
        </View>
      </SignedIn>
      <SignedOut>
        <Text style={styles.title}>Please sign in</Text>
        <View style={styles.linkContainer}>
          <Link href="/(auth)/sign-in" style={styles.link}>
            <Text style={styles.linkText}>Sign in</Text>
          </Link>
          <Link href="/(auth)/sign-up" style={styles.link}>
            <Text style={styles.linkText}>Sign up</Text>
          </Link>
        </View>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 20,
  },
  linkContainer: {
    flexDirection: "column",
    gap: 15,
    alignItems: "center",
  },
  link: {
    textDecorationLine: "none",
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
