# <p align="center"><img src="https://api.dicebear.com/7.x/bottts/svg?seed=Aura" width="70" /><br/>🔮 auraauvarose.dev — Digital Garden & Portfolio</p>

<p align="center">
  <a href="https://github.com/auraauvarose/my-portfolio"><img src="https://img.shields.io/github/stars/auraauvarose/my-portfolio?style=for-the-badge&color=d4eb00&labelColor=1a1a1a&logo=github" alt="GitHub Stars" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js&logoColor=white&labelColor=1a1a1a" alt="Next.js 16" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=1a1a1a" alt="React 19" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase&logoColor=3ECF8E&labelColor=1a1a1a" alt="Supabase" /></a>
  <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Gemini_AI-Chatbot-purple?style=for-the-badge&logo=google-gemini&logoColor=8E75C8&labelColor=1a1a1a" alt="Gemini AI" /></a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&size=20&duration=3000&pause=1000&color=d4eb00&center=true&vCenter=true&width=450&lines=🐧+Informatics+Student;🚀+Fedora+Linux+Enthusiast;💻+Creative+Full-Stack+Developer;🔮+Interactive+Digital+Garden" alt="Typing SVG" />
</p>

---

## 📖 Tentang Proyek (About The Project)

Selamat datang di repository portofolio digital saya. Proyek ini bukan sekadar portofolio biasa, melainkan sebuah **Interactive Digital Garden & Tech HUD** yang dirancang khusus untuk memadukan estetika pemrograman tingkat tinggi dengan fitur dinamis real-time. 

Dibangun dengan standar **Next.js 16 (Turbopack)**, **React 19**, dan **Supabase Database**, proyek ini memadukan animasi interaktif, integrasi kecerdasan buatan (Google Gemini AI), sistem log pengunjung terperinci, papan aspirasi komunitas, serta arsitektur yang super responsif pada perangkat mobile.

---

## 🛠️ Arsitektur Teknologi & Fitur (Tech Stack & Premium Features)

### 🌟 Fitur Utama (Core Highlights)
* **🤖 Gemini AI Integration (Aura AI):** Chatbot AI personal yang disematkan langsung di halaman utama untuk menjawab pertanyaan pengunjung seputar keahlian, riwayat belajar, dan proyek saya.
* **📊 Developer HUD (VS Code & GitHub Status):** Panel real-time yang memadukan status Discord/VS Code (apakah sedang online dan sedang mengedit file apa) serta grafik kontribusi GitHub secara side-by-side dalam desain ala IDE editor.
* **📸 Community Photo Gallery:** Slider galeri momen dan kenangan interaktif yang mendukung upload foto terverifikasi secara langsung oleh komunitas pengunjung.
* **💬 Real-time Aspirations Board (Comments Feed):** Forum komentar terintegrasi Supabase lengkap dengan fitur balasan (*threaded replies*) dan avatar gradien warna konsisten yang dibuat otomatis berdasarkan nama pengunjung.
* **❤️ Optimistic Like System:** Tombol suka interaktif yang mendukung toggle Like & Unlike secara instan dengan efek partikel **Heart Emoji Fireworks Explosion** yang meledak radial 360 derajat.
* **🎨 20+ Premium Theme & Animation Backgrounds:** Pilihan kustomisasi visual dari minimalist, cyber-dark, warm-glass, hingga aurora dengan default animasi constellation yang mengikuti kursor mouse (magnetic connection).

### 🖥️ Spesifikasi Teknis (Tech Stack Specs)
* **Framework:** Next.js 16.1.6 (Turbopack App Router)
* **Library Utama:** React 19.2.3, Framer Motion, AOS
* **Database & BaaS:** Supabase (PostgreSQL, Realtime, Storage)
* **Styling:** Premium Vanilla CSS (Custom properties, Glassmorphic reflections, 3D rotations)
* **Kecerdasan Buatan:** Google Gemini API

---

## 📂 Struktur Proyek (Directory Structure)

```text
.
├── src/
│   ├── app/                    # Next.js App Router (Layouts, Pages, Routes)
│   │   ├── admin/              # Panel Administrasi (Manajemen Tema, Konten, Validasi Foto)
│   │   ├── api/                # Endpoint Backend (Gemini AI integration)
│   │   ├── certificates/       # Halaman Koleksi Sertifikat Akademis Lengkap
│   │   ├── gallery/            # Halaman Galeri Foto Kenangan Komunitas
│   │   ├── game/               # Mini Game Interaktif
│   │   ├── projects/           # Halaman Detail Proyek Full-Scale
│   │   ├── globals.css         # Reset CSS, Design Tokens & Core Variables
│   │   ├── layout.js           # Metadata Global & Root Layout
│   │   └── page.js             # Halaman Utama (Interactive Landings HUD)
│   ├── components/             # Reusable UI Components
│   │   ├── animations/         # BackgroundCanvas (constellations, meteor, dna, vortex)
│   │   └── loading/            # Glowing Orb Loader Screens
│   ├── context/                # React Context for State Management
│   └── lib/                    # Supabase Client & API Helper functions
```

---

## ⚙️ Cara Menjalankan Proyek (Local Installation)

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 18+) di mesin Anda.

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/auraauvarose/my-portfolio.git
   cd my-portfolio
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env.local` di folder root dan isi dengan kredensial Supabase serta Gemini API Anda (lihat `.env.local.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Jalankan server lokal dalam mode development:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya!

---

## 💻 Kontribusi & Lisensi

Proyek ini bersifat open-source dan dilisensikan di bawah **MIT License**. Jangan ragu untuk melakukan fork, mengajukan pull requests, atau memberikan kontribusi terbaik Anda demi kemajuan ekosistem developer!

<p align="center">
  Made with 🐧 Fedora Linux, ⚡ Next.js 16, and ❤️ by <strong>Aura Auvarose</strong>
</p>