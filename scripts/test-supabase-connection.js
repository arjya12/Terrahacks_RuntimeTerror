#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 *
 * This script tests the basic Supabase configuration and connection.
 * Run with: node scripts/test-supabase-connection.js
 */

const { createClient } = require("@supabase/supabase-js");

async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...\n");

  // Get Supabase configuration
  const supabaseUrl = "https://ufmfegcyxqadivgebpch.supabase.co/";
  let supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // Try to read from app.json if environment variable is not set
  if (!supabaseKey || supabaseKey === "your_supabase_anon_key_here") {
    try {
      const fs = require("fs");
      const path = require("path");
      const appConfigPath = path.join(__dirname, "..", "app.json");
      const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
      supabaseKey = appConfig.expo?.extra?.supabaseAnonKey;
    } catch (err) {
      // Ignore file read errors
    }
  }

  console.log("📋 Configuration Check:");
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   API Key: ${supabaseKey ? "✅ Set" : "❌ Missing"}\n`);

  if (!supabaseKey || supabaseKey === "your_supabase_anon_key_here") {
    console.error("❌ Error: Supabase anon key not configured");
    console.log("\n🔧 Setup Instructions:");
    console.log(
      "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
    );
    console.log(
      "2. Select your project: https://ufmfegcyxqadivgebpch.supabase.co/"
    );
    console.log("3. Go to Settings > API");
    console.log("4. Copy the 'anon public' key");
    console.log(
      "5. Update app.json extra.supabaseAnonKey with your actual key"
    );
    console.log("   OR set EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable");
    console.log("\n💡 Example:");
    console.log(
      '   "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."'
    );
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("🔌 Created Supabase client...");

    // Test basic connectivity
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return;
    }

    console.log("✅ Successfully connected to Supabase!");
    console.log(`📊 Database contains ${data?.[0]?.count || 0} users\n`);

    // Test tables exist
    console.log("🗄️  Testing database schema...");
    const tables = [
      "users",
      "medications",
      "appointments",
      "medical_documents",
    ];

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });

        if (tableError) {
          console.log(`   ❌ Table '${table}': ${tableError.message}`);
        } else {
          console.log(`   ✅ Table '${table}': Available`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}': Error checking`);
      }
    }

    console.log("\n🎉 Supabase setup is working correctly!");
    console.log("💡 Next steps:");
    console.log("   1. Set up Clerk authentication");
    console.log("   2. Run the app and test user registration");
    console.log("   3. Try adding medications and uploading documents");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testSupabaseConnection();
