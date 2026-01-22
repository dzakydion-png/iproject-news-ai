import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../helpers/swal';

export default function Login() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });

  const handleInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
        const endpoint = isRegister ? '/register' : '/login';
        const { data } = await axios.post(`${BASE_URL}${endpoint}`, formData);
        
        if (isRegister) {
            showToast('success', 'Register Berhasil! Silakan Login.');
            setIsRegister(false); // Pindah ke tab login
        } else {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_fullname', data.fullName);
            localStorage.setItem('user_image', data.imageUrl || "https://placehold.co/400"); // Simpan Foto
            localStorage.setItem('user_email', data.email);
            showToast('success', `Welcome, ${data.fullName}!`);
            navigate('/');
        }
    } catch (error) {
        showToast('error', error.response?.data?.message || "Terjadi Kesalahan");
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/google-login`, { token: response.credential });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_fullname', data.fullName);
      localStorage.setItem('user_image', data.imageUrl); // Simpan Foto Google
      localStorage.setItem('user_email', data.email);
      showToast('success', `Welcome back, ${data.fullName}!`);
      navigate('/');
    } catch (error) {
      showToast('error', 'Login Google Gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ai-dark relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-neon-purple rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-neon-blue rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 bg-ai-card/80 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
            VIRAL NEWS 
        </h1>

        {/* TABS SWITCHER */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
            <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isRegister ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Login</button>
            <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isRegister ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Register</button>
        </div>

        {/* FORM MANUAL */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
            {isRegister && (
                <input type="text" name="fullName" placeholder="Full Name" required onChange={handleInput} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-neon-blue" />
            )}
            <input type="email" name="email" placeholder="Email Address" required onChange={handleInput} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-neon-blue" />
            <input type="password" name="password" placeholder="Password" required onChange={handleInput} className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-neon-blue" />
            
            <button type="submit" className="w-full bg-gradient-to-r from-neon-blue to-blue-600 hover:opacity-90 text-black font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)]">
                {isRegister ? 'Create Account' : 'Login Securely'}
            </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-ai-card text-gray-400">Or continue with</span></div>
        </div>

        <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => showToast('error', 'Failed')} theme="filled_black" shape="pill" />
        </div>
      </div>
    </div>
  );
}