import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import NewsCard from "../components/NewsCard";
import {
  fetchNews,
  summarizeNews,
  clearAiResult,
  addBookmark,
  setPage,
} from "../store/newsSlice";
import { showToast } from "../helpers/swal";

export default function Home() {
  //State Management / Redux
  const dispatch = useDispatch();
  const { articles, loading, aiResult, currentPage } = useSelector(
    (state) => state.news,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = [
    "all",
    "breaking-news",
    "world",
    "technology",
    "business",
    "sports",
    "science",
    "health",
    "entertainment",
  ];

  // Fungsi ganti halaman
  const changePage = (newPage) => {
    if (newPage < 1) return;
    dispatch(setPage(newPage));

    dispatch(
      fetchNews({
        page: newPage,
        q: searchQuery,
        category: activeCategory,
      }),
    );

    // Scroll ke atas
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    dispatch(fetchNews({ category: "all" }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchNews({ q: searchQuery }));
    setActiveCategory("search-result");
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSearchQuery(""); // Reset search
    dispatch(fetchNews({ category: cat }));
  };

  const handleBookmark = async (news) => {
    try {
      await dispatch(addBookmark(news)).unwrap();
      showToast("success", "Berita berhasil disimpan!");
    } catch (errorMessage) {
      showToast("warning", errorMessage); 
    }
  };

  // Ambil berita saat halaman dibuka
  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const handleAskAI = (newsPayload) => {
    dispatch(clearAiResult());
    dispatch(summarizeNews(newsPayload));
  };


  return (
    <>
      <Navbar />

      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto min-h-screen">
        {/* --- FITUR SEARCH & CATEGORY --- */}
        <div className="mb-10 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Cari berita apa hari ini?..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
            >
              🔍
            </button>
          </form>

          {/* Category Pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 justify-start md:justify-center scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? // Active State
                      "bg-blue-600 dark:bg-neon-blue text-white dark:text-black border-blue-600 dark:border-neon-blue shadow-md"
                    : // Inactive State
                      "bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:border-gray-500 dark:hover:text-white"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ---  HOLOGRAPHIC AI PANEL --- */}
        {aiResult && (
          <div className="mb-12 relative animate-fade-in-up">
            {/* Efek Cahaya Belakang (Glow) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl opacity-30 blur-xl group-hover:opacity-50 transition duration-1000"></div>

            {/* Panel Kaca Utama */}
            <div className="relative bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header Mewah */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </div>
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 font-bold text-lg tracking-wide">
                    GEMINI INTELLIGENCE
                  </h3>
                </div>

                <button
                  onClick={() => dispatch(clearAiResult())}
                  className="group relative px-3 py-1 text-xs font-medium text-gray-400 transition-colors hover:text-white"
                >
                  <span className="absolute inset-0 bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  CLOSE ANALYSIS
                </button>
              </div>

              {/* Isi Konten*/}
              <div className="p-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200 text-lg leading-relaxed font-light tracking-wide whitespace-pre-line border-l-4 border-cyan-500/50 pl-6">
                    {aiResult}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-3 h-3 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                  </svg>
                  Model: Gemini 2.5 Flash
                </span>
                <span>Processing Time: 0.4s</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((news, index) => (
              <NewsCard
                key={index}
                news={news}
                onSummarize={handleAskAI}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}
        {/* --- PAGINATION CONTROLS --- */}
        {!loading && articles.length > 0 && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-6 py-2 bg-gray-800 text-white rounded-full disabled:opacity-50 hover:bg-neon-blue hover:text-black transition-all font-bold"
            >
              ← Previous
            </button>

            <span className="text-neon-blue font-mono text-xl">
              Page {currentPage}
            </span>

            <button
              onClick={() => changePage(currentPage + 1)}
              className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-neon-blue hover:text-black transition-all font-bold"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
