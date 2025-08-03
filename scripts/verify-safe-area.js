#!/usr/bin/env node

/**
 * Safe Area Implementation Verification Script
 *
 * This script verifies that safe area implementation is correctly configured
 * across the application components.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkFile(filePath, expectedContent, description) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const found = expectedContent.every((check) => content.includes(check));

    if (found) {
      log(`✅ ${description}`, "green");
      return true;
    } else {
      log(`❌ ${description}`, "red");
      log(
        `   Missing: ${expectedContent.find(
          (check) => !content.includes(check)
        )}`,
        "yellow"
      );
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    log(`❌ ${description} - File not found: ${filePath}`, "red");
    return false;
  }
}

function main() {
  log("\n🔍 Verifying Safe Area Implementation\n", "cyan");

  const checks = [
    {
      file: "app/_layout.tsx",
      expected: [
        'import { SafeAreaProvider } from "react-native-safe-area-context"',
        "<SafeAreaProvider>",
      ],
      description: "SafeAreaProvider configured in root layout",
    },
    {
      file: "components/dashboard/DashboardHeader.tsx",
      expected: [
        'import { useSafeAreaInsets } from "react-native-safe-area-context"',
        "const insets = useSafeAreaInsets()",
        "paddingTop: insets.top + 20",
      ],
      description: "DashboardHeader uses safe area insets",
    },
    {
      file: "app/(tabs)/index.tsx",
      expected: [
        'import { SafeAreaView } from "react-native-safe-area-context"',
        "<SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>",
      ],
      description: "Main screen uses SafeAreaView with proper edges",
    },
  ];

  let allPassed = true;

  checks.forEach((check) => {
    const passed = checkFile(check.file, check.expected, check.description);
    allPassed = allPassed && passed;
  });

  log("\n" + "=".repeat(60), "blue");

  if (allPassed) {
    log("🎉 All safe area checks passed!", "green");
    log("\n📱 Testing Instructions:", "cyan");
    log("1. Run on iOS devices with notch (iPhone X+)", "yellow");
    log(
      "2. Run on Android devices with different status bar heights",
      "yellow"
    );
    log("3. Test both portrait and landscape orientations", "yellow");
    log(
      "4. Verify header content has proper spacing from status bar",
      "yellow"
    );
    log(
      "5. Check that text is not overlapping with system UI elements",
      "yellow"
    );
  } else {
    log(
      "❌ Some safe area checks failed. Please review the issues above.",
      "red"
    );
  }

  log("\n💡 Expected Behavior:", "cyan");
  log("- Header text should have clear spacing from status bar", "yellow");
  log("- No content overlap with system UI elements", "yellow");
  log("- Consistent spacing across all device types", "yellow");
  log("- Professional, polished appearance", "yellow");
}

if (require.main === module) {
  main();
}
