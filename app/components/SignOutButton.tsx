import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.buttonText}>Sign Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF3B30",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SignOutButton;
export { SignOutButton };
