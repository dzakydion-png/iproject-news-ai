import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../helpers/swal";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  
  //cek localStorage dulu, kalau gak ada default 'dark'
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Simpan ke memory browser
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_fullname");
    showToast('success', 'Berhasil Logout');
    navigate("/login");
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-ai-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-neon-blue dark:to-neon-purple hover:scale-105 transition-transform">
              VIRAL NEWS <span className="text-gray-600 dark:text-white text-sm font-light tracking-widest">Gemini 2.5 Flash</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* MENU LINKS */}
            <div className="hidden md:flex items-baseline space-x-4">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Profile
              </Link>
            </div>

            {/* TOMBOL GANTI TEMA (Matahari / Bulan) */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 transition-all hover:scale-110"
              title="Ganti Tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* TOMBOL LOGOUT */}
            <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all hover:-translate-y-1"
              >
                Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}