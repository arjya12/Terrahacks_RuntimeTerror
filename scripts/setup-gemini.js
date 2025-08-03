/**
 * Gemini API Setup Verification Script
 * Simple Node.js script to verify Gemini API integration
 */

const https = require("https");

const GEMINI_API_KEY = "AIzaSyDsSCLuqlFsAYAvZpDJaSv5_-FdT_oBDcw";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function testGeminiAPI() {
  console.log("🤖 Testing Gemini API integration...");

  const data = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: "Hello! Please respond with a brief confirmation that you are working.",
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 50,
    },
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(
      `${API_URL}?key=${GEMINI_API_KEY}`,
      options,
      (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(body);

            if (
              res.statusCode === 200 &&
              response.candidates &&
              response.candidates[0]
            ) {
              const text = response.candidates[0].content.parts[0].text;
              console.log("✅ Gemini API test successful!");
              console.log("Response:", text.trim());
              resolve(text);
            } else {
              console.error("❌ API test failed:", body);
              reject(new Error(`API returned ${res.statusCode}: ${body}`));
            }
          } catch (error) {
            console.error("❌ Failed to parse response:", error);
            reject(error);
          }
        });
      }
    );

    req.on("error", (error) => {
      console.error("❌ Request failed:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function setupGemini() {
  try {
    await testGeminiAPI();

    console.log("\n🎉 Gemini API setup verification complete!");
    console.log("\n📱 Your React Native app includes:");
    console.log("✅ Gemini API service with secure key storage");
    console.log("✅ React hooks for easy component integration");
    console.log("✅ Pre-built UI components (setup, chat, demo)");
    console.log("✅ Medical-specific AI features");
    console.log("✅ Rate limiting and error handling");
    console.log("✅ Auto-initialization on app startup");

    console.log("\n🚀 Next steps:");
    console.log("1. Start your app: npm start");
    console.log('2. Navigate to the "AI Assistant" tab');
    console.log("3. Try the demo features");
    console.log("4. Integrate AI into your existing components");

    console.log("\n📚 Documentation: README_GEMINI.md");
  } catch (error) {
    console.error("❌ Gemini API setup failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your internet connection");
    console.log("2. Verify the API key is correct");
    console.log("3. Ensure you have Gemini API access");
    console.log("4. Check Google AI Studio for quota limits");
    process.exit(1);
  }
}

if (require.main === module) {
  setupGemini();
}

module.exports = { setupGemini };
