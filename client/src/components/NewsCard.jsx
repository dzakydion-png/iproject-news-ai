export default function NewsCard({ news, onSummarize, onBookmark }) {
  return (
    <div className="group relative bg-white dark:bg-ai-card rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full shadow-md 
    
    {/* TAMBAHAN EFEK NEON KHUSUS DARK MODE DI SINI: */}
    dark:hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] dark:hover:border-neon-blue
    ">
      
      {/* Gambar */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={news.urlToImage || "https://placehold.co/600x400?text=No+Image"} 
          alt={news.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Error"; }}
        />
        <span className="absolute top-2 right-2 bg-blue-600 dark:bg-black/60 text-white dark:text-neon-blue px-2 py-1 text-xs rounded-full shadow-sm border border-transparent dark:border-neon-blue">
          NEWS
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Judul */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-neon-blue transition-colors">
          {news.title}
        </h3>
        
        {/* Deskripsi */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
          {news.description || "Klik link di bawah untuk membaca lengkap."}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onClick={() => onSummarize(news)} 
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
          >
            ✨ Ask AI
          </button>
          
          <button 
            onClick={() => onBookmark(news)} 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-neon-blue dark:hover:bg-cyan-400 text-white dark:text-black font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-md dark:shadow-[0_0_10px_rgba(0,242,255,0.4)]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}