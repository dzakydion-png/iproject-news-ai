# Panduan Deployment Viral News AI

## Persiapan

1. **GitHub Account** - https://github.com
2. **Railway Account** - https://railway.app (untuk backend)
3. **Vercel Account** - https://vercel.com (untuk frontend)
4. **Google Cloud Console** - konfigurasi Google OAuth untuk domain production

---

## STEP 1: Upload Code ke GitHub

### 1.1 Initialize Git (jika belum)
```bash
cd iproject-news-ai
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create Repository di GitHub
- Buka https://github.com/new
- Nama: `iproject-news-ai`
- Jangan add README/gitignore (sudah ada di folder)
- Create repository

### 1.3 Push ke GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/iproject-news-ai.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy Backend ke Railway

### 2.1 Setup Railway
1. Buka https://railway.app
2. Sign up dengan GitHub account
3. Click "Create New Project"
4. Select "Deploy from GitHub repo"
5. Select repository `iproject-news-ai`

### 2.2 Konfigurasi Railway
1. Pilih root directory: `/server`
2. Connect database PostgreSQL ke Railway (atau pakai Supabase yang sudah ada)
3. Set environment variables di Railway:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `NEWS_API_KEY=xxx`
   - `GEMINI_API_KEY=xxx`
   - `GOOGLE_CLIENT_ID=xxx`
   - `JWT_SECRET=xxx`
   - `DATABASE_URL=xxx` (copy dari Supabase)

### 2.3 Deploy
- Railway akan auto-deploy setiap push ke GitHub
- Tunggu sampai "Build Successful"
- Catat Railway URL (misal: `https://your-api.railway.app`)

---

## STEP 3: Setup Google OAuth untuk Production

1. Buka Google Cloud Console: https://console.cloud.google.com/
2. Cari OAuth 2.0 Client IDs
3. Edit Client ID Anda
4. Di "Authorized origins" tambahkan:
   - `https://your-domain.vercel.app`
   - `https://your-api.railway.app`
5. Save

---

## STEP 4: Deploy Frontend ke Vercel

### 4.1 Update Environment Variables
Edit `client/.env`:
```
VITE_BASE_URL=https://your-api.railway.app
VITE_GOOGLE_CLIENT_ID=your_new_google_client_id
```

### 4.2 Commit dan Push
```bash
git add .
git commit -m "Update production URLs"
git push
```

### 4.3 Deploy ke Vercel
1. Buka https://vercel.com
2. Sign up dengan GitHub
3. Click "Import Project"
4. Select repository `iproject-news-ai`
5. Konfigurasi:
   - Framework: Vite
   - Root directory: `./client`
   - Build command: `npm run build`
   - Output directory: `dist`
6. Click "Deploy"

Vercel akan auto-deploy setiap push ke GitHub

---

## Hasil Akhir

- **Backend**: https://your-api.railway.app
- **Frontend**: https://your-domain.vercel.app
- **Database**: Supabase (sudah ada)

---

## Troubleshooting

### CORS Error?
Update CORS di `server/app.js` dengan domain production Vercel

### Database Connection Error?
Pastikan DATABASE_URL di Railway sama dengan yang ada di Supabase

### Google OAuth Error?
Pastikan Google Client ID authorized origins sudah include domain Vercel dan Railway API
