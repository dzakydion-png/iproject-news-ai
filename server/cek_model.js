require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Testing Model Gemini Pro...");
    
    const result = await model.generateContent("Tes halo?");
    const response = await result.response;
    console.log("✅ SUKSES! Respon AI:", response.text());
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.log("\n⚠️ Jika error 404, coba ganti model ke 'gemini-pro' atau 'gemini-1.0-pro'");
  }
}

checkModels();