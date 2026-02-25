# iProject News AI

Portal berita modern dengan integrasi Artificial Intelligence untuk merangkum artikel berita secara otomatis.

## 📋 Deskripsi Proyek

iProject News AI adalah aplikasi web yang menggabungkan agregasi berita real-time dengan kemampuan AI untuk memberikan ringkasan berita yang cepat dan mudah dipahami. Aplikasi ini memungkinkan pengguna untuk membaca berita terkini, menyimpan berita favorit, dan mendapatkan rangkuman otomatis menggunakan teknologi AI.

## ✨ Fitur Utama

### 1. 🔐 Sistem Autentikasi Ganda
- **Registrasi Manual**: Pengguna dapat mendaftar menggunakan email dan password
- **Login Manual**: Autentikasi dengan validasi email dan password (bcrypt)
- **Google OAuth 2.0**: Login cepat menggunakan akun Google
- **Token-based Authentication**: Menggunakan JWT untuk keamanan session
- **Protected Routes**: Middleware authentication untuk endpoint private

### 2. 📰 Agregasi Berita Real-time
- **Berita Terkini**: Menampilkan headline berita dari Indonesia (GNews API)
- **Pencarian Berita**: Fitur search untuk mencari berita berdasarkan keyword
- **Filter Kategori**: Kategori berita (all, breaking-news, world, nation, business, technology, entertainment, sports, science, health)
- **Pagination**: Navigasi halaman untuk berita yang lebih banyak
- **Fallback Mechanism**: Data backup saat API limit tercapai
- **Responsive Card**: Tampilan card berita yang modern dan mobile-friendly

### 3. 🤖 AI Summary (Google Gemini)
- **Ringkasan Otomatis**: Generate ringkasan berita dalam Bahasa Indonesia
- **Powered by Gemini**: Menggunakan Google Generative AI (gemini-2.5-flash)
- **Quick Summary**: Mendapatkan poin-poin penting dari artikel berita
- **Smart Prompt**: Prompt engineering untuk hasil ringkasan yang optimal
- **Error Handling**: Fallback summary jika API limit habis

### 4. 📌 Bookmark & Collection
- **Save Artikel**: Menyimpan berita favorit ke dalam koleksi pribadi
- **Duplicate Detection**: Validasi untuk mencegah duplikasi bookmark
- **User-Specific**: Setiap user memiliki koleksi bookmark sendiri
- **Delete Bookmark**: Hapus bookmark yang tidak diperlukan
- **Sorted by Latest**: Bookmark diurutkan berdasarkan waktu penyimpanan

### 5. 👤 Manajemen Profil
- **Update Profile**: Edit nama lengkap dan foto profil
- **Image URL Support**: Upload foto profil menggunakan URL
- **Google Avatar**: Otomatis mengambil foto dari akun Google saat login
- **Default Avatar**: Placeholder avatar untuk user baru

## 🔧 Spesifikasi Fungsional

### Backend (Node.js + Express)

#### API Endpoints

**Public Routes:**
```
GET    /                    → Health check server
POST   /register            → Registrasi user baru
POST   /login               → Login manual
POST   /google-login        → Login dengan Google OAuth
GET    /news                → Get berita (dengan query params)
```

**Private Routes (Memerlukan Token):**
```
POST   /ai-summary          → Generate ringkasan AI
POST   /bookmarks           → Tambah bookmark
GET    /bookmarks           → Get semua bookmark user
DELETE /bookmarks/:id       → Hapus bookmark
PUT    /profile             → Update profil user
```

#### Database Schema

**Users Table:**
- `id` (Primary Key)
- `email` (Unique, dengan validasi email)
- `password` (Hashed dengan bcryptjs)
- `fullName` (Not Null)
- `imageUrl` (Default: placeholder)
- `createdAt`, `updatedAt`

**Bookmarks Table:**
- `id` (Primary Key)
- `title` (Not Null)
- `url` (Not Null)
- `imageUrl`
- `UserId` (Foreign Key ke Users)
- `createdAt`, `updatedAt`

#### Tech Stack Server
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **ORM**: Sequelize v6
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Google Auth**: google-auth-library
- **AI Integration**: @google/generative-ai (Gemini)
- **HTTP Client**: axios
- **Testing**: Jest + Supertest
- **Dev Tools**: Nodemon

### Frontend (React + Vite)

#### Halaman & Routing

**Public Pages:**
- `/login` → Halaman login/register dengan Google OAuth button

**Protected Pages:**
- `/` (Home) → Halaman utama menampilkan feed berita
- `/profile` → Halaman profil user dan bookmark collection

#### State Management
- **Redux Toolkit**: Global state management
- **News Slice**: Mengelola data berita dan loading state
- **localStorage**: Menyimpan access token

#### Tech Stack Client
- **Library**: React v19
- **Build Tool**: Vite v7
- **Routing**: React Router DOM v7
- **State Management**: Redux Toolkit
- **HTTP Client**: axios
- **CSS Framework**: Tailwind CSS v3
- **UI Components**: Custom components dengan Tailwind
- **Notifications**: SweetAlert2
- **Google OAuth**: @react-oauth/google

### Integrasi Third-Party APIs

#### 1. GNews API
- **Purpose**: Sumber berita real-time dari Indonesia
- **Language**: Bahasa Indonesia (lang=id)
- **Country**: Indonesia (country=id)
- **Max Results**: 10 artikel per request
- **Endpoints Used**: 
  - `/top-headlines` untuk berita utama
  - `/search` untuk pencarian berita

#### 2. Google Gemini AI
- **Model**: gemini-2.5-flash
- **Purpose**: Generate ringkasan berita dalam Bahasa Indonesia
- **Input**: Title + URL berita
- **Output**: Ringkasan poin-poin penting

#### 3. Google OAuth 2.0
- **Purpose**: Authentication dengan akun Google
- **Library**: google-auth-library (backend) + @react-oauth/google (frontend)
- **Token Verification**: Server-side validation

## 🛡️ Security Features

- **Password Hashing**: Menggunakan bcryptjs dengan salt rounds
- **JWT Authentication**: Token-based session management
- **Environment Variables**: Sensitive data disimpan di `.env`
- **CORS Configuration**: Cross-origin resource sharing yang aman
- **Input Validation**: Sequelize validation untuk data integrity
- **Protected Routes**: Middleware authentication untuk private endpoints
- **Google Token Verification**: Server-side validation untuk OAuth tokens

## 🎯 User Flow

### Flow Registrasi & Login
1. User mengunjungi `/login`
2. Pilihan: Login manual atau Google OAuth
3. Jika register → input email, password, fullName
4. Server validasi & hash password → simpan ke database
5. Jika login → server validasi credentials → generate JWT
6. Token disimpan di localStorage
7. Redirect ke halaman Home `/`

### Flow Membaca Berita
1. User di halaman Home (harus login)
2. Berita di-fetch dari GNews API
3. User dapat filter kategori atau search
4. Click card berita → navigate ke URL artikel (tab baru)
5. User dapat save ke bookmark atau request AI summary

### Flow AI Summary
1. User click tombol "AI Summary" di news card
2. Frontend kirim request POST /ai-summary dengan title & URL
3. Backend hit Google Gemini API dengan prompt khusus
4. AI generate ringkasan dalam Bahasa Indonesia
5. Response ditampilkan dalam modal/popup
6. Jika API limit → tampilkan mock summary

### Flow Bookmark
1. User click tombol "Bookmark" di news card
2. Frontend kirim POST /bookmarks dengan data berita
3. Backend cek duplikasi (url + UserId)
4. Jika belum ada → save ke database
5. User dapat lihat semua bookmark di halaman Profile
6. User dapat delete bookmark yang tidak diperlukan

## 📊 Error Handling

### Backend
- **Sequelize Errors**: Unique constraint, validation errors
- **Authentication Errors**: Invalid credentials, missing token
- **API Errors**: Fallback data saat third-party API down/limit
- **500 Errors**: Internal server error dengan message generic

### Frontend
- **Network Errors**: Axios interceptor untuk handle response errors
- **Auth Errors**: Auto-redirect ke login jika token invalid/expired
- **API Limit**: Tampilkan fallback data (mock news/summary)
- **User Feedback**: SweetAlert2 untuk notifikasi error/success

## 🧪 Testing

- **Framework**: Jest
- **API Testing**: Supertest
- **Coverage**: Code coverage dengan lcov report
- **Test Location**: `server/__test__/news.test.js`
- **Run Tests**: `npm test`

## 📁 Struktur Proyek

```
iproject-news-ai/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, NewsCard)
│   │   ├── pages/          # Page components (Home, Login, Profile)
│   │   ├── router/         # React Router configuration
│   │   ├── store/          # Redux store & slices
│   │   └── helpers/        # Utility functions (swal)
│   └── public/             # Static assets
│
└── server/                 # Backend Express Application
    ├── controllers/        # Business logic (Controller.js)
    ├── models/             # Sequelize models (User, Bookmark)
    ├── routes/             # API routes
    ├── middlewares/        # Authentication & error handler
    ├── helpers/            # JWT & error handler utilities
    ├── migrations/         # Database migrations
    └── __test__/           # Jest test files
```

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js (v16 atau lebih tinggi)
- PostgreSQL
- npm atau yarn

### Environment Variables

**Server (.env):**
```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
NEWS_API_KEY=your_gnews_api_key
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Client (.env):**
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_BASE_URL=http://localhost:3000
```

### Instalasi

**Backend:**
```bash
cd server
npm install
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## 🔑 API Keys Required

1. **GNews API**: [https://gnews.io/](https://gnews.io/)
2. **Google Gemini AI**: [https://ai.google.dev/](https://ai.google.dev/)
3. **Google OAuth 2.0**: [https://console.cloud.google.com/](https://console.cloud.google.com/)

## 📱 Responsive Design

- Mobile-first approach dengan Tailwind CSS
- Responsive navigation bar
- Card layout yang adaptif
- Optimal viewing di berbagai ukuran layar (mobile, tablet, desktop)

## 🎨 UI/UX Features

- Modern card-based layout untuk berita
- Loading states & skeleton loaders
- Smooth transitions & hover effects
- Toast notifications untuk user feedback
- Modal dialogs untuk AI summary
- Clean & minimalist design

---

**Developed with ❤️ using React, Express, PostgreSQL, and Google AI**
