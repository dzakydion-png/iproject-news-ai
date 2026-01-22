import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyBookmarks } from "../store/newsSlice";
import Navbar from "../components/Navbar";
import { showToast } from "../helpers/swal";
import axios from "axios";

export default function Profile() {
  const dispatch = useDispatch();
  const { myBookmarks } = useSelector((state) => state.news);
  
  // Safety check agar tidak crash jika data belum siap
  const safeBookmarks = myBookmarks || [];

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  // State User
  const [userEmail] = useState(localStorage.getItem("user_email") || "user@mail.com");
  const [fullName, setFullName] = useState(localStorage.getItem("user_fullname") || "User");
  const [imageUrl, setImageUrl] = useState(localStorage.getItem("user_image") || "https://placehold.co/400");
  
  // State Edit
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(fullName);
  const [formImage, setFormImage] = useState(imageUrl);

  useEffect(() => {
    dispatch(fetchMyBookmarks());
  }, [dispatch]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${BASE_URL}/profile`, 
        { fullName: formName, imageUrl: formImage, email: userEmail }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }}
      );

      setFullName(data.fullName);
      setImageUrl(data.imageUrl);
      localStorage.setItem("user_fullname", data.fullName);
      localStorage.setItem("user_image", data.imageUrl);
      localStorage.setItem('user_email', data.email);
      
      setIsEditing(false);
      showToast('success', 'Profile Berhasil Diupdate!');
    } catch (error) {
      showToast('error', 'Gagal update profile');
    }
  };

  const handleDelete = async (id) => {
      try {
        await axios.delete(`${BASE_URL}/bookmarks/${id}`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        dispatch(fetchMyBookmarks());
        showToast('success', 'Bookmark dihapus');
      } catch (err) { showToast('error', 'Gagal hapus'); }
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-6xl mx-auto min-h-screen transition-colors duration-300">
        
        {/* --- IDENTITY CARD SECTION --- */}
        <div className="relative mb-12 group">
           {/* Glow Effect (Hanya di Dark Mode biar tidak silau di Light Mode) */}
           <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl blur opacity-0 dark:opacity-25 group-hover:opacity-50 transition duration-1000"></div>
           
           {/* Kartu Utama: Putih di Light, Gelap di Dark */}
           <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start transition-colors duration-300">
              
              {/* Foto Profile */}
              <div className="relative">
                 <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-neon-blue dark:to-purple-600">
                    <img 
                        src={imageUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800"
                        onError={(e) => e.target.src = "https://placehold.co/400?text=No+Image"}
                    />
                 </div>
                 {!isEditing && (
                     <span className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900"></span>
                 )}
              </div>

              {/* Form / Info User */}
              <div className="flex-1 w-full text-center md:text-left">
                  {isEditing ? (
                      <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                          <div>
                             <label className="text-xs text-blue-600 dark:text-neon-blue uppercase font-bold tracking-wider">Full Name</label>
                             <input 
                                type="text" 
                                value={formName} 
                                onChange={(e)=>setFormName(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded p-2 mt-1 focus:border-blue-500 dark:focus:border-neon-blue outline-none transition-colors"
                             />
                          </div>
                          <div>
                             <label className="text-xs text-blue-600 dark:text-neon-blue uppercase font-bold tracking-wider">Image URL</label>
                             <input 
                                type="text" 
                                value={formImage} 
                                onChange={(e)=>setFormImage(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded p-2 mt-1 focus:border-blue-500 dark:focus:border-neon-blue outline-none transition-colors"
                             />
                          </div>
                          <div className="flex gap-3 mt-4 justify-center md:justify-start">
                              <button type="submit" className="bg-blue-600 dark:bg-neon-blue text-white dark:text-black font-bold px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-cyan-300 transition-colors">Save Changes</button>
                              <button type="button" onClick={()=>setIsEditing(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                          </div>
                      </form>
                  ) : (
                      <>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{fullName}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 bg-gray-100 dark:bg-gray-800 inline-block px-3 py-1 rounded-full text-sm font-mono transition-colors">{userEmail}</p>
                        <div>
                            <button onClick={()=>setIsEditing(true)} className="border border-blue-600 dark:border-neon-blue text-blue-600 dark:text-neon-blue px-6 py-2 rounded hover:bg-blue-600 hover:text-white dark:hover:bg-neon-blue dark:hover:text-black transition-all font-medium uppercase tracking-wide text-sm">
                                Edit Identity
                            </button>
                        </div>
                      </>
                  )}
              </div>
           </div>
        </div>

        {/* --- BOOKMARK GRID SECTION --- */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <span className="text-purple-600 dark:text-neon-purple">★</span> SAVED ARTICLES
        </h2>

        {safeBookmarks.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">Belum ada berita yang disimpan.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safeBookmarks.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex gap-4 hover:shadow-lg dark:hover:border-gray-600 transition-all group shadow-sm">
                        <img src={item.imageUrl} className="w-24 h-24 object-cover rounded-lg bg-gray-200 dark:bg-gray-800" alt="news"/>
                        <div className="flex flex-col flex-1">
                            {/* Judul Artikel */}
                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-neon-blue transition-colors">
                                {item.title}
                            </h4>
                            
                            <div className="mt-auto flex justify-between items-center">
                                <a href={item.url} target="_blank" className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white">Read Original</a>
                                <button onClick={()=>handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-bold uppercase">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </>
  );
}