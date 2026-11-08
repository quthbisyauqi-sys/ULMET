# 🎓 ULMET — Ultimate Learning & Management Ecosystem for Students

<p align="center">
  <img src="assets/icons/icon-192.png" alt="ULMET Logo" width="96" height="96" style="border-radius: 20px;">
</p>

<p align="center">
  <b>Solusi Digital Komprehensif Manajemen Waktu, Materi Perkuliahan, Finansial Kos, dan Asisten AI untuk Mahasiswa Modern</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-100%25_Offline--Ready-facc15?style=for-the-badge&logo=pwa&logoColor=black" alt="PWA Ready">
  <img src="https://img.shields.io/badge/Storage-IndexedDB_Local--First-3b82f6?style=for-the-badge&logo=databricks&logoColor=white" alt="IndexedDB Local-First">
  <img src="https://img.shields.io/badge/CSS-TailwindCSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/AI-Multi--Model-8b5cf6?style=for-the-badge&logo=openai&logoColor=white" alt="AI Assistant">
  <img src="https://img.shields.io/badge/Latency-0ms_Instant-10b981?style=for-the-badge" alt="0ms Latency">
</p>

---

## 🌟 Tentang ULMET

**ULMET** adalah aplikasi web progresif (*Progressive Web App / PWA*) yang dirancang khusus untuk memecahkan problematika nyata mahasiswa perguruan tinggi: berkas materi yang hilang di grup obrolan, deadline tugas yang terlewat, pengeluaran uang saku yang tidak terkontrol, serta kesulitan dalam memahami materi kuliah yang kompleks.

Dengan arsitektur terstruktur, modular, dan ramah pengguna, ULMET memadukan manajemen waktu berorientasi hasil, integrasi langsung ke menu bagikan WhatsApp, serta sistem maskot gamifikasi yang hidup.

---

## 🚀 Fitur Unggulan & Nilai Inovasi

### 1. 📥 WhatsApp Web Share Target 2.0 (Materi Dosen)
* **Solutif:** Dosen mengirimkan file silabus atau PDF di grup WhatsApp? Mahasiswa cukup memilih berkas, tekan menu **Share**, dan pilih ikon **ULMET**.
* **Otomatisasi:** Dokumen seketika tersimpan di Cache Storage & IndexedDB Perangkat, siap dibaca kapan saja tanpa takut tautan unduhan kadaluarsa.

### 2. 🤖 AI ULMET (Multi-Model & Document Ingestion)
* **Multi-LLM Gateway:** Pilihan model terkini (*GPT-5.5, Gemini 2.5, Claude Opus*).
* **Bisa Membaca PDF:** Membaca langsung dokumen perkuliahan (*in-browser parsing via PDF.js*) untuk merangkum bab penting, menyusun flashcards, dan simulasi soal ujian.

### 3. 🎭 Gamifikasi Emosional Maskot ("Si Ulmet")
* **Karakter Adaptif:** Karakter maskot yang suasana hatinya berubah dinamis sesuai performa mahasiswa:
  * 🏆 **Reward Mood:** Bangga saat mahasiswa rajin belajar dan tugas tuntas.
  * ⏰ **Worried Mood:** Mengingatkan mahasiswa saat deadline kurang dari 24 jam.
  * 😡 **Angry Mood:** Memperingatkan mahasiswa yang sering mangkir dan menumpuk tugas.

### 4. 💸 Manajemen Keuangan Pintar
* **Kalkulator Jatah Belanja:** Menghitung sisa batas belanja harian yang aman agar uang bulanan tidak habis di awal bulan.
* **Patungan & Wishlist:** Mencatat tagihan bersama teman kos dan target tabungan impian bertahap.

### 5. 📅 Jadwal Kuliah, Habit Tracker & Push Alarm
* Dilengkapi sistem Service Worker background yang proaktif mengirimkan push notification alarm deadline bahkan saat browser ditutup.

---

## 📂 Struktur Direktori Proyek

Proyek ini disusun secara modular dan terstandarisasi agar memudahkan kolaborasi, evaluasi juri, dan skalabilitas:

```
ULMET/
├── assets/                 # Aset statis terorganisir
│   ├── icons/              # Ikon aplikasi PWA (192x192 & 512x512)
│   ├── img/                # Aset visual karakter maskot interaktif
│   └── js/                 # Modul JavaScript & Local Storage Engine
│       ├── local-db.js         # Engine basis data perangkat (IndexedDB & Scoped Storage)
│       └── ai-widget.js        # Floating AI Assistant widget
├── database/               # Skema basis data & panduan setup
│   ├── schema.sql          # DDL skema PostgreSQL terstruktur
│   └── README.md           # Dokumentasi arsitektur database lokal perangkat
├── docs/                   # Dokumentasi arsitektur & materi lomba
│   ├── ARCHITECTURE.md     # Rancangan teknis sistem & data flow
│   └── FITUR_DAN_SOLUSI.md # Analisis masalah & solusi komparatif
├── pages/                  # Seluruh tampilan antarmuka (Views)
│   ├── admin.html          # Dashboard monitoring admin
│   ├── ai.html             # Ruang belajar interaktif bersama AI
│   ├── dashboard.html      # Dashboard utama mahasiswa
│   ├── jadwal.html         # Jadwal kuliah, tugas, & habit tracker
│   ├── keuangan.html       # Manajemen anggaran & keuangan kos
│   ├── login.html          # Gerbang autentikasi & registrasi
│   ├── materi.html         # Pengelola materi perkuliahan & WhatsApp receiver
│   ├── profil.html         # Profil mahasiswa & pengaturan akun
│   └── widget.html         # Halaman widget Si Ulmet
├── tools/                  # Utilitas pemeliharaan sistem
│   ├── clear.html          # Pembersih session storage lokal
│   └── clear-cache.html    # Pembersih service worker & cache storage
├── _headers                # Header keamanan PWA & Service Worker
├── index.html              # Router awal aplikasi
├── manifest.json           # Manifest PWA & konfigurasi Share Target
├── sw.js                   # Service Worker offline-first & notification daemon
├── vercel.json             # Konfigurasi rewrite URL & deployment Vercel
└── README.md               # Dokumentasi utama proyek
```

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| **Antarmuka (Frontend)** | HTML5 Semantic, Tailwind CSS, Google Fonts Plus Jakarta Sans / Outfit |
| **PWA & Offline** | Web App Manifest, Service Worker Cache Storage, Web Share Target API |
| **Penyimpanan Berkas Fisik** | IndexedDB Engine (`ULMET_Device_Files`) — Dokumen PDF/DOCX/Gambar |
| **Database & Relasi Data** | Native Browser Storage (User-Scoped Multi-Tenant Isolation `u_{uid}_*`) |
| **Kecerdasan Buatan (AI)** | SnifoxAI Gateway, Marked.js, PDF.js In-Browser Rendering |
| **Hosting & Deployment** | Vercel Serverless Platform & Standalone Offline PWA |

---

## 💻 Panduan Menjalankan Proyek Secara Lokal

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/quthbisyauqi-sys/ULMET.git
   cd ULMET
   ```

2. **Jalankan Server Lokal Sederhana:**
   Karena proyek ini merupakan PWA murni (tanpa node_modules/bundler yang berat), Anda dapat langsung menjalankannya dengan server statis apa pun:

   *Menggunakan Python 3:*
   ```bash
   python3 -m http.server 8080
   ```

   *Atau menggunakan VS Code Live Server:*
   - Klik kanan pada `index.html` dan pilih **Open with Live Server**.

3. **Akses di Browser:**
   Buka `http://localhost:8080` pada peramban Anda. Aplikasi akan secara otomatis mengarahkan ke antarmuka login.

---

## 👥 Pengembang

Dikembangkan dengan dedikasi untuk mendukung kemajuan pendidikan dan produktivitas mahasiswa Indonesia.
Semua hak cipta dilindungi undang-undang © 2026 ULMET Team.

