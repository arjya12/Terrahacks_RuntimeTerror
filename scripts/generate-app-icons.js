#!/usr/bin/env node

/**
 * App Icon Generation Script
 *
 * This script helps generate all required app icon sizes for iOS and Android
 * from a single high-resolution source image.
 *
 * Prerequisites:
 * - Install sharp: npm install sharp
 * - Create a 1024x1024 base icon (icon-1024.png) in assets/images/
 *
 * Usage: node scripts/generate-app-icons.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const path = require("path");

// Icon sizes for different platforms
const IOS_ICON_SIZES = [
  { size: 20, name: "icon-20.png" },
  { size: 29, name: "icon-29.png" },
  { size: 40, name: "icon-40.png" },
  { size: 58, name: "icon-58.png" },
  { size: 60, name: "icon-60.png" },
  { size: 80, name: "icon-80.png" },
  { size: 87, name: "icon-87.png" },
  { size: 120, name: "icon-120.png" },
  { size: 180, name: "icon-180.png" },
  { size: 1024, name: "icon-1024.png" },
];

const ANDROID_ICON_SIZES = [
  { size: 36, density: "ldpi", folder: "mipmap-ldpi" },
  { size: 48, density: "mdpi", folder: "mipmap-mdpi" },
  { size: 72, density: "hdpi", folder: "mipmap-hdpi" },
  { size: 96, density: "xhdpi", folder: "mipmap-xhdpi" },
  { size: 144, density: "xxhdpi", folder: "mipmap-xxhdpi" },
  { size: 192, density: "xxxhdpi", folder: "mipmap-xxxhdpi" },
];

const EXPO_SIZES = [
  { size: 48, name: "icon.png" },
  { size: 192, name: "adaptive-icon.png" },
  { size: 1024, name: "icon-1024.png" },
];

function generateIconInstructions() {
  console.log("\n🎨 App Icon Generation Guide\n");

  console.log("📋 STEP 1: Create Base Icon");
  console.log("Create a 1024x1024 PNG file with your logo design:");
  console.log("- Circular gradient from blue (#4F46E5) to purple (#7C3AED)");
  console.log("- White center circle");
  console.log("- High resolution (1024x1024)");
  console.log("- Save as: assets/images/icon-1024.png\n");

  console.log("📋 STEP 2: Install Dependencies");
  console.log("npm install sharp\n");

  console.log("📋 STEP 3: Required Icon Sizes");
  console.log("\n📱 iOS Icon Sizes:");
  IOS_ICON_SIZES.forEach((icon) => {
    console.log(`  ${icon.size}x${icon.size} → ${icon.name}`);
  });

  console.log("\n🤖 Android Icon Sizes:");
  ANDROID_ICON_SIZES.forEach((icon) => {
    console.log(
      `  ${icon.size}x${icon.size} → ${icon.folder}/ic_launcher.png (${icon.density})`
    );
  });

  console.log("\n⚡ Expo Icon Sizes:");
  EXPO_SIZES.forEach((icon) => {
    console.log(`  ${icon.size}x${icon.size} → ${icon.name}`);
  });

  console.log("\n📋 STEP 4: Generation Script");
  console.log(
    "If you have sharp installed, uncomment the generation code below"
  );
  console.log("and run: node scripts/generate-app-icons.js\n");

  console.log("📋 STEP 5: Manual Alternative");
  console.log("You can use online tools like:");
  console.log("- https://icon.kitchen/");
  console.log("- https://appicon.co/");
  console.log("- https://makeappicon.com/\n");

  console.log("📋 STEP 6: Update app.json");
  console.log("Update your app.json with the new icon paths:");
  console.log(`{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash-icon.png"
    },
    "ios": {
      "icon": "./assets/images/icon.png"
    },
    "android": {
      "icon": "./assets/images/adaptive-icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundImage": "./assets/images/adaptive-icon.png"
      }
    }
  }
}`);
}

// Uncomment this function if you have sharp installed
/*
async function generateIcons() {
  try {
    const sharp = require('sharp');
    const baseIconPath = path.join(__dirname, '../assets/images/icon-1024.png');
    
    if (!fs.existsSync(baseIconPath)) {
      console.error('❌ Base icon not found at:', baseIconPath);
      console.log('Please create a 1024x1024 icon first');
      return;
    }
    
    // Create directories
    const assetsDir = path.join(__dirname, '../assets/images');
    
    console.log('🎨 Generating app icons...\n');
    
    // Generate Expo icons
    for (const icon of EXPO_SIZES) {
      const outputPath = path.join(assetsDir, icon.name);
      await sharp(baseIconPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    console.log('\n🎉 Icon generation complete!');
    console.log('Don\'t forget to update your app.json configuration');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('Make sure you have sharp installed: npm install sharp');
  }
}
*/

if (require.main === module) {
  generateIconInstructions();
  // Uncomment the line below if you have sharp installed and icon-1024.png ready
  // generateIcons();
}
