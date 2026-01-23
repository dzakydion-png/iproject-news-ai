import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Gunakan URL dari .env atau default localhost
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';3

// --- ACTIONS ---

// 1. Fetch News (Support Search, Category, & Pagination)
export const fetchNews = createAsyncThunk('news/fetchNews', async (params = {}) => {
  const { q, category, page = 1 } = params;
  
  let url = `${BASE_URL}/news?page=${page}`;
  if (q) url += `&q=${q}`;
  if (category && category !== 'all') url += `&category=${category}`;

  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });
  return data;
});

// 2. Ask AI Summary
export const summarizeNews = createAsyncThunk('news/summarize', async (payload) => {
  const { data } = await axios.post(`${BASE_URL}/ai-summary`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });
  return data.summary;
});

// 3. Add Bookmark
export const addBookmark = createAsyncThunk('news/addBookmark', async (news, { rejectWithValue }) => {
  try {
    await axios.post(`${BASE_URL}/bookmarks`, news, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    return "Success";
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Gagal menyimpan");
  }
});

// 4. Fetch My Bookmarks (INI YANG PENTING BUAT PROFILE)
export const fetchMyBookmarks = createAsyncThunk('news/fetchMyBookmarks', async () => {
  const { data } = await axios.get(`${BASE_URL}/bookmarks`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });
  return data;
});

// --- SLICE ---
const newsSlice = createSlice({
  name: 'news',
  initialState: {
    articles: [],
    myBookmarks: [],
    loading: false,
    aiResult: '',
    currentPage: 1
  },
  reducers: {
    clearAiResult: (state) => { state.aiResult = ''; },
    setPage: (state, action) => { state.currentPage = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => { state.loading = true; })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchNews.rejected, (state) => { state.loading = false; })

      // AI Summary
      .addCase(summarizeNews.pending, (state) => { state.aiResult = 'Sedang mengetik...'; })
      .addCase(summarizeNews.fulfilled, (state, action) => { state.aiResult = action.payload; })

      // Fetch Bookmarks (Profile)
      .addCase(fetchMyBookmarks.fulfilled, (state, action) => {
        state.myBookmarks = action.payload; // <--- Data masuk ke sini
      });
  },
});

export const { clearAiResult, setPage } = newsSlice.actions;
export default newsSlice.reducer;