const { User, Bookmark } = require("../models");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class Controller {
  // --- 1. AUTHENTICATION (MANUAL & GOOGLE) ---

  // Register Manual
  static async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;

      const newUser = await User.create({
        email,
        password: password, // Akan di-hash di model
        fullName,
        imageUrl: "https://placehold.co/400?text=User",
      });

      res.status(201).json({ id: newUser.id, email: newUser.email });
    } catch (error) {
      console.log(error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Login Manual
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw { name: "InvalidInput" };

      const user = await User.findOne({ where: { email } });
      if (!user) throw { name: "InvalidUser" };

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) throw { name: "InvalidUser" };

      const access_token = signToken({ id: user.id, email: user.email });

      res.status(200).json({
        access_token,
        fullName: user.fullName,
        email: user.email,
        imageUrl: user.imageUrl,
      });
    } catch (error) {
      if (error.name === "InvalidUser")
        return res.status(401).json({ message: "Email/Password salah" });
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Google Login
  static async googleLogin(req, res, next) {
    try {
      const { token } = req.body;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          fullName: payload.name,
          password: Math.random().toString(36).slice(-8), // Dummy password
          imageUrl: payload.picture, // Ambil foto dari Google
          email: payload.email,
        },
      });

      const access_token = signToken({ id: user.id, email: user.email });
      res.status(200).json({
        access_token,
        fullName: user.fullName,
        email: user.email,
        imageUrl: user.imageUrl,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Google Login Error" });
    }
  }

  // --- 2. NEWS FEATURES --

  static async getNews(req, res, next) {
    try {
      const { q, category, page = 1 } = req.query;

      let apiUrl = `https://gnews.io/api/v4/top-headlines?lang=id&country=id&max=10&page=${page}&apikey=${process.env.NEWS_API_KEY}`;

      if (q) {
        apiUrl = `https://gnews.io/api/v4/search?q=${q}&lang=id&country=id&max=10&page=${page}&apikey=${process.env.NEWS_API_KEY}`;
      } else if (category && category !== "all") {
        apiUrl += `&topic=${category}`;
      }

      const { data } = await axios.get(apiUrl);

      const articles = data.articles.map((item, index) => ({
        id: index + Date.now(),
        title: item.title,
        description: item.description,
        url: item.url,
        urlToImage: item.image,
        publishedAt: item.publishedAt,
        source: { name: item.source.name },
      }));

      res.status(200).json(articles);
    } catch (error) {
      console.log("⚠️ API Error/Limit. Menggunakan Data Mock.");

      // --- DATA PALSU  ---
      // Ini akan muncul kalau API GNews habis limitnya
      const mockNews = [
        {
          id: 1,
          title: " Bitcoin Tembus Harga Tertinggi Baru Hari Ini",
          description:
            "Meskipun API limit habis, aplikasi ini tetap jalan dengan data cadangan. Bitcoin dikabarkan naik drastis.",
          url: "https://google.com",
          urlToImage:
            "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop",
          publishedAt: new Date().toISOString(),
          source: { name: "Backup News" },
        },
        {
          id: 2,
          title: " Timnas Indonesia Menang Telak di Kualifikasi",
          description:
            "Data ini muncul karena GNews sedang limit. Timnas bermain sangat apik malam ini.",
          url: "https://google.com",
          urlToImage:
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop",
          publishedAt: new Date().toISOString(),
          source: { name: "Backup Sport" },
        },
        {
          id: 3,
          title: " Teknologi AI Terbaru Mengubah Dunia Coding",
          description:
            "Fitur fallback ini membuktikan bahwa error handling di backend berjalan dengan baik.",
          url: "https://google.com",
          urlToImage:
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
          publishedAt: new Date().toISOString(),
          source: { name: "Backup Tech" },
        },
      ];

      res.status(200).json(mockNews);
    }
  }
  // --- 3. AI FEATURE ---
  static async getAiSummary(req, res, next) {
    try {
      const { title, url } = req.body;

      // Cek apakah API Key ada
      if (!process.env.GEMINI_API_KEY) throw new Error("No Key");

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Buatkan ringkasan singkat dan padat dalam bahasa Indonesia mengenai berita ini:
                      Judul: ${title}
                      Link: ${url}
                      Poin-poin utamanya saja.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;

      res.status(200).json({ summary: response.text() });
    } catch (error) {
      console.log("⚠️ AI Error/Limit. Menggunakan Mock Summary.");

      // --- AI PALSU  ---
      // Supaya user tidak melihat error merah kasih pesan statis
      const mockSummary = `        
        Karena limit API Gemini habis, berikut adalah simulasi ringkasan:
        1. Berita ini sangat penting dan berdampak besar.
        2. Banyak pihak yang terlibat dan memberikan komentar.
        3. Diharapkan ada perkembangan selanjutnya dalam waktu dekat.
      `;

      res.status(200).json({ summary: mockSummary });
    }
  }
  // --- 4. BOOKMARK FEATURE  ---

  static async addBookmark(req, res, next) {
    try {
      const { title, url, urlToImage } = req.body;

      // Cek apakah user INI sudah pernah simpan URL INI
      const existingBookmark = await Bookmark.findOne({
        where: {
          url: url,
          UserId: req.user.id,
        },
      });

      if (existingBookmark) {
        return res
          .status(400)
          .json({ message: "Berita ini sudah ada di koleksi kamu!" });
      }

      const bookmark = await Bookmark.create({
        title,
        url,
        imageUrl: urlToImage,
        UserId: req.user.id,
      });

      res.status(201).json(bookmark);
    } catch (error) {
      res.status(500).json({ message: "Gagal menyimpan bookmark" });
    }
  }

  static async getBookmarks(req, res, next) {
    try {
      const bookmarks = await Bookmark.findAll({
        where: { UserId: req.user.id },
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookmarks" });
    }
  }

  static async deleteBookmark(req, res, next) {
    try {
      const { id } = req.params;
      await Bookmark.destroy({ where: { id, UserId: req.user.id } });
      res.status(200).json({ message: "Bookmark deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting bookmark" });
    }
  }

  // --- 5. PROFILE FEATURE ---

  static async updateProfile(req, res, next) {
    try {
      const { fullName, imageUrl } = req.body;

      await User.update({ fullName, imageUrl }, { where: { id: req.user.id } });

      res.status(200).json({ message: "Profile updated", fullName, imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  }
}

module.exports = Controller;
