#!/usr/bin/env node

/**
 * 🔍 Authentication Setup Verification Script
 *
 * This script verifies that your Clerk authentication setup is correct
 * and all required files are in place.
 */

const fs = require("fs");
const path = require("path");

console.log("🔐 Verifying Clerk Authentication Setup...\n");

// Check required files
const requiredFiles = [
  "app/_layout.tsx",
  "app/index.tsx",
  "app/(auth)/_layout.tsx",
  "app/(auth)/sign-in.tsx",
  "app/(auth)/sign-up.tsx",
  "app/(tabs)/_layout.tsx",
  "components/AuthWrapper.tsx",
  "components/ErrorBoundary.tsx",
  "components/CustomSplashScreen.tsx",
];

let allFilesExist = true;

console.log("📁 Checking required files:");
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log("\n🔑 Checking environment variables:");

// Check .env file
if (fs.existsSync(".env")) {
  console.log("✅ .env file exists");

  const envContent = fs.readFileSync(".env", "utf8");
  if (envContent.includes("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY")) {
    console.log("✅ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY found in .env");
  } else {
    console.log("❌ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY missing from .env");
    allFilesExist = false;
  }
} else {
  console.log("❌ .env file missing");
  allFilesExist = false;
}

// Check package.json dependencies
console.log("\n📦 Checking package dependencies:");
if (fs.existsSync("package.json")) {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    "@clerk/clerk-expo",
    "expo-router",
    "react-native-reanimated",
    "expo-linear-gradient",
  ];

  requiredDeps.forEach((dep) => {
    if (deps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log("\n🎯 Setup Status:");
if (allFilesExist) {
  console.log("✅ All required files and dependencies are present!");
  console.log("🚀 Your authentication flow should work correctly.");
  console.log("\n📱 To test:");
  console.log("   1. Run: npx expo start --clear");
  console.log("   2. Open in Expo Go or simulator");
  console.log("   3. Check console logs for flow tracking");
} else {
  console.log("❌ Setup incomplete - please fix missing items above.");
}

console.log(
  "\n📖 For detailed setup instructions, see: AUTHENTICATION_SETUP.md"
);
