# 🚀 Personal Portfolio & Digital Garden

![GitHub stars](https://img.shields.io/github/stars/[username-kamu]/[nama-repo]?style=social)
![Next.js Version](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

Selamat datang di repository portofolio saya. Proyek ini dibangun menggunakan **Next.js (App Router)** sebagai pusat informasi mengenai perjalanan saya di dunia Informatika, proyek yang saya kerjakan, dan tulisan teknis mengenai teknologi.

---

## 📖 Filosofi Proyek
Di era di mana AI bisa menulis kode dalam hitungan detik, saya percaya bahwa nilai seorang Engineer terletak pada **pemahaman fundamental** dan **kemampuan dokumentasi**. Portofolio ini adalah bukti nyata bahwa saya tidak hanya mengonsumsi teknologi, tetapi juga membangun dan memahaminya dari akar.

> "AI mungkin bisa menggantikan kode yang repetitif, tapi tidak bisa menggantikan visi dan narasi di balik sebuah solusi."

---

## 🛠️ Arsitektur Teknologi (Tech Stack)

Saya memilih teknologi yang modern dan memiliki performa tinggi untuk memastikan pengalaman pengguna yang mulus:

| Komponen | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14+](https://nextjs.org/) | Mendukung *Server Components* (RSC) untuk performa rendering yang sangat cepat. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Memungkinkan pengembangan UI yang cepat dengan sistem *utility-first* yang konsisten. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Memberikan keamanan tipe (*type-safety*) untuk meminimalisir bug saat runtime. |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Memberikan interaksi UI yang hidup dan elegan. |
| **Icons** | [Lucide React](https://lucide.dev/) | Library ikon yang ringan dan mudah dikustomisasi. |
| **Deployment** | [Vercel](https://vercel.com/) | Integrasi CI/CD otomatis setiap kali saya melakukan `git push`. |

---

## ✨ Fitur Unggulan

1. **Next.js App Router & Server Actions:** Implementasi standar terbaru Next.js untuk optimasi rute dan pengiriman data.
2. **Dynamic SEO & Meta Tags:** Setiap halaman memiliki meta data yang unik agar mudah ditemukan di mesin pencari (Google/Bing).
3. **Responsive Glassmorphism UI:** Desain modern yang menyesuaikan dengan segala ukuran layar (Mobile, Tablet, Desktop).
4. **Light & Dark Mode Switcher:** Kenyamanan visual pengguna menggunakan `next-themes`.
5. **Project Showcase:** Galeri proyek interaktif dengan detail teknologi dan link demo langsung.

---

## 📂 Struktur Folder (Project Architecture)

Saya mengikuti standar industri untuk menjaga keterbacaan kode (*clean code*):

```text
.
├── app/                # Next.js App Router (Layouts, Pages, Routes)
│   ├── about/          # Informasi pribadi & profil
│   ├── projects/       # Detail dan list proyek
│   ├── globals.css     # Tailwind & Global Styles
│   └── page.tsx        # Homepage (Hero Section)
├── components/         # UI Reusable Components
│   ├── ui/             # Komponen dasar (Button, Card, Input)
│   ├── Navbar.tsx      # Komponen Navigasi
│   └── Footer.tsx      # Komponen Footer
├── public/             # Assets (Images, Icons, PDF CV)
├── lib/                # Helper functions & Utility classes
├── types/              # TypeScript interfaces/types
├── next.config.mjs     # Konfigurasi Next.js
└── tailwind.config.ts  # Konfigurasi tema Tailwind