require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listMyModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ ERROR: API Key belum terbaca dari .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    const data = await response.json();

    if (data.error) {
      console.log("❌ ERROR DARI GOOGLE:", data.error.message);
    } else if (data.models) {
      console.log("✅ BERHASIL! Ini daftar model yang BISA kamu pakai:");
      console.log("==================================================");
      
      const availableModels = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace("models/", "")); 

      availableModels.forEach(name => console.log(`👉 "${name}"`));
      
      console.log("==================================================");
      console.log("TIPS: Copy salah satu nama di atas (yang tanpa 'models/') ke Controller.js kamu.");
    } else {
      console.log("⚠️ Aneh, tidak ada error tapi tidak ada model yang muncul.");
    }

  } catch (error) {
    console.error("❌ ERROR KONEKSI:", error.message);
  }
}

listMyModels();