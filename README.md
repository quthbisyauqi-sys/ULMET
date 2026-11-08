# 🎓 ULMET — Ultimate Learning & Management Ecosystem for Students

<p align="center">
  <img src="assets/icons/icon-192.png" alt="ULMET Logo" width="100" height="100" style="border-radius: 24px; box-shadow: 0 8px 24px rgba(250,204,21,0.25);">
</p>

<p align="center">
  <b>Solusi Digital Komprehensif Manajemen Waktu, Materi Perkuliahan, Finansial Kos, Portofolio SKPI, dan Asisten AI untuk Mahasiswa Modern</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-100%25_Offline--Ready-facc15?style=for-the-badge&logo=pwa&logoColor=black" alt="PWA Ready">
  <img src="https://img.shields.io/badge/Storage-IndexedDB_Local--First-3b82f6?style=for-the-badge&logo=databricks&logoColor=white" alt="IndexedDB Local-First">
  <img src="https://img.shields.io/badge/CSS-TailwindCSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/AI-Multi--Model-8b5cf6?style=for-the-badge&logo=openai&logoColor=white" alt="AI Assistant">
  <img src="https://img.shields.io/badge/Latency-0ms_Instant-10b981?style=for-the-badge" alt="0ms Latency">
  <img src="https://img.shields.io/badge/Platform-Web_&_Android_APK-ec4899?style=for-the-badge&logo=android&logoColor=white" alt="Web and Android APK">
</p>

---

## 🌟 Tentang ULMET

**ULMET** adalah ekosistem aplikasi web progresif (*Progressive Web App / WebAPK*) yang dirancang secara khusus untuk memecahkan problematika nyata keseharian mahasiswa:
1. **Berkas kuliah tercecer**: Dokumen materi dari dosen di grup WhatsApp sering tertimbun obrolan atau masa aktif unduhannya kadaluarsa.
2. **Deadline tugas terlewat**: Ketidakteraturan jadwal dan minimnya pengingat prioritas yang proaktif.
3. **Finansial kos tidak terkontrol**: Uang saku bulanan sering habis di minggu pertama karena tidak ada batas belanja harian yang jelas.
4. **Sertifikat prestasi berserakan**: Kesulitan mengumpulkan berkas piagam kejuaraan, webinar, dan organisasi saat hendak mendaftar beasiswa atau menyusun Surat Keterangan Pendamping Ijazah (SKPI) menjelang wisuda.

Dengan arsitektur **Local-First**, ULMET beroperasi **100% mandiri tanpa ketergantungan server berbayar**, menjamin latensi 0ms, perlindungan privasi data tingkat tinggi, dan dapat digunakan sepenuhnya saat tidak ada internet (*offline-ready*).

---

## ⚖️ Panduan Khusus Penjurian Lomba (Quick Demo Access)

Untuk memudahkan Dewan Juri dalam menguji dan mengevaluasi seluruh fitur secara komprehensif tanpa harus mengisi data dari nol:

1. Buka halaman utama aplikasi di [`pages/login.html`](pages/login.html).
2. Klik tombol **"Mode Penjurian Demo (1-Click Login)"** di bawah form login.
3. Akun demo otomatis memuat profil mahasiswa berprestasi lengkap dengan data realistis:
   - 📚 **Jadwal & Tugas Kuliah Aktif** dengan indikator prioritas (*Urgent*, *Sedang*, *Rendah*).
   - 📁 **Materi Kuliah & Silabus PDF** yang tersimpan di IndexedDB lokal.
   - 💰 **Laporan Keuangan Kos** lengkap dengan batas jatah harian dan pencatat patungan.
   - 🏆 **Portofolio Prestasi SKPI** lengkap berisi 7 berkas sertifikat terdistribusi di 4 folder.
   - 📝 **Catatan Kuliah** dan habit tracker harian.

---

## 🚀 7 Fitur Unggulan & Inovasi Mahasiswa

### 1. 📥 WhatsApp Web Share Target 2.0 (Materi Dosen)
* **Solusi Nyata:** Dosen mengirimkan materi kuliah di WhatsApp? Mahasiswa cukup memilih berkas di WhatsApp, tekan **Share (Bagikan)**, dan pilih ikon **ULMET**.
* **Otomatisasi:** Dokumen otomatis ditangkap oleh Service Worker, disimpan ke IndexedDB perangkat, dan dikelompokkan ke dalam folder mata kuliah yang sesuai tanpa perlu unduh manual ke galeri.

### 2. 🤖 Asisten Belajar Cerdas AI ULMET (Multi-Model & Document Ingestion)
* **Pilihan Model AI:** Terhubung ke *SnifoxAI Gateway* dengan kebebasan memilih model unggulan (*ULMET Gemini 2.5, ULMET Claude Opus, ULMET GPT*).
* **In-Browser Document Parsing:** Mampu membaca langsung file materi PDF, Word (.docx), dan teks untuk merangkum poin esensial, membuat latihan soal ujian, dan tanya jawab materi.

### 3. 🏆 Portofolio Prestasi & Brankas SKPI (Baru)
* **4 Folder Kategori Khusus Mahasiswa:**
  * 🏆 **Kejuaraan & Lomba** (Piagam juara kompetisi, hackathon, LKTI, debat).
  * 🎓 **Webinar & Seminar** (Sertifikat kepesertaan seminar nasional/internasional).
  * 🤝 **Organisasi & Kepanitiaan** (SK kepengurusan BEM/HMJ, panitia ospek, relawan).
  * 📜 **Pelatihan & Keahlian** (Sertifikat TOEFL/TOAFL, pelatihan kompetensi BNSP, bootcamp).
* **Brankas Dokumen Lokal:** Berkas asli (PDF/JPG/PNG) tersimpan aman di IndexedDB perangkat, dilengkapi pratinjau instan dan tombol salin resume SKPI untuk beasiswa.

### 4. 📅 Kalender Prioritas, Habit Tracker & Pomodoro Timer
* **Sistem Prioritas 4 Warna:** Urgent (🔴 Merah), Sedang (🟡 Kuning), Rendah (🟢 Hijau), dan Libur Nasional Resmi (🟣 Ungu).
* **Fokus Belajar Pomodoro:** Timer belajar terintegrasi audio ambient dan pencatat waktu fokus.
* **Background Notification Daemon:** Pengingat deadline tugas dan kebiasaan harian tetap berjalan melalui Service Worker.

### 5. 💸 Manajemen Keuangan Kos & Patungan
* **Kalkulator Jatah Belanja Harian:** Menghitung sisa kuota uang saku per hari secara dinamis berdasarkan sisa hari dalam bulan.
* **Split Bill / Patungan:** Memudahkan pencatatan tagihan bersama teman kos (listrik, wifi, makanan) dan tracking status lunas.
* **Wishlist Bertahap:** Merencanakan tabungan untuk target barang impian mahasiswa.

### 6. 📝 Catatan Kuliah Terpadu (Note Taker)
* Ruang pencatatan cepat untuk ide perkuliahan, rumus penting, dan rangkuman kelas dengan fitur penyematan (*pinning*) dan filter kategori.

### 7. 🎭 Gamifikasi Karakter Si Ulmet & Mode Widget
* Maskot adaptif yang mengekspresikan suasana hati (*Reward*, *Worried*, *Angry*) sesuai kedisiplinan mahasiswa dalam menyelesaikan tugas.
* Mode widget mandiri ([widget.html](pages/widget.html)) untuk layar kedua laptop atau monitor meja belajar.

---

## 📂 Struktur Direktori Proyek

Proyek ini disusun dengan standar arsitektur modular yang rapi dan terpisah (*Separation of Concerns*):

```
ULMET/
├── assets/                 # Berkas statis terorganisir
│   ├── icons/              # Ikon aplikasi PWA (192x192 & 512x512 maskable)
│   ├── img/                # Aset visual karakter maskot interaktif
│   └── js/                 # Modul JavaScript & Database Engine
│       ├── local-db.js     # Engine database lokal perangkat (IndexedDB & Scoped Storage)
│       └── ai-widget.js    # Floating AI Assistant widget & model gateway
├── database/               # Skema basis data & panduan setup
│   ├── schema.sql          # DDL PostgreSQL terstruktur (opsional untuk sinkronisasi cloud)
│   └── README.md           # Dokumentasi arsitektur penyimpanan lokal perangkat
├── docs/                   # Dokumentasi teknis & materi penjurian lomba
│   ├── ARCHITECTURE.md     # Rancangan teknis sistem, data flow, dan keamanan
│   └── FITUR_DAN_SOLUSI.md # Analisis masalah mahasiswa & matriks perbandingan solusi
├── pages/                  # Tampilan antarmuka utama (Views)
│   ├── admin.html          # Panel monitoring & manajemen profil mahasiswa lokal
│   ├── ai.html             # Ruang belajar interaktif bersama AI
│   ├── catatan.html        # Catatan cepat perkuliahan, ide, & materi kuliah
│   ├── dashboard.html      # Beranda ringkasan tugas, jadwal, & status maskot
│   ├── jadwal.html         # Jadwal kuliah, kalender prioritas, pomodoro, & kebiasaan
│   ├── keuangan.html       # Manajemen anggaran harian, pencatat pengeluaran, & patungan
│   ├── login.html          # Gerbang autentikasi & mode login demo juri
│   ├── materi.html         # Pengelola materi perkuliahan & WhatsApp Web Share Target
│   ├── profil.html         # Profil mahasiswa & Portofolio Brankas Prestasi SKPI
│   └── widget.html         # Mode widget mandiri layar Always-On Si Ulmet
├── tools/                  # Utilitas pemeliharaan dan pengembang
│   ├── clear.html          # Pembersih session storage lokal
│   └── clear-cache.html    # Pembersih service worker & offline cache
├── _headers                # Header keamanan PWA & perizinan Service Worker
├── index.html              # Smart router awal aplikasi
├── manifest.json           # Manifest PWA standar Google Play & Web Share Target
├── sw.js                   # Service Worker offline-first (v86) & notification daemon
├── vercel.json             # Konfigurasi rewrite URL & deployment serverless Vercel
└── README.md               # Dokumentasi utama proyek
```

---

## 🛠️ Stack Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Antarmuka (Frontend)** | HTML5 Semantic, Tailwind CSS, Google Fonts (*Outfit* & *Plus Jakarta Sans*) | Desain bertema *Midnight Slate* modern dengan aksen *Amber Gold* |
| **Penyimpanan Berkas Fisik** | IndexedDB Engine (`ULMET_Device_Files`) | Menyimpan berkas materi PDF/Word & dokumen sertifikat langsung di disk perangkat |
| **Penyimpanan Relasional** | Local Storage Multi-Tenant (`u_{userId}_{key}`) | Isolasi data antar-pengguna dengan latensi 0ms |
| **PWA & Mobile Support** | Web App Manifest, Service Worker v86, Web Share Target API | Mendukung instalasi WebAPK di Android dan layar penuh edge-to-edge |
| **Pemrosesan Dokumen** | PDF.js & Mammoth.js (Client-side) | Mengekstrak teks PDF & DOCX secara langsung di dalam peramban |
| **Kecerdasan Buatan (AI)** | SnifoxAI Gateway & Marked.js | Multi-LLM (Gemini 2.5, Claude, GPT) untuk bimbingan belajar |
| **Hosting & Deployment** | Vercel Platform & GitHub Repository | Routing URL bersih tanpa ekstensi `.html` |

---

## 📱 Panduan Mengunduh & Memasang Sebagai Aplikasi HP (APK)

### Opsi 1: PWA WebAPK Resmi Google (Sangat Direkomendasikan ⭐)
1. Buka tautan ULMET di browser Google Chrome pada HP Android Anda.
2. Tekan tombol **Titik Tiga (⋮)** di pojok kanan atas Chrome.
3. Pilih **"Instal Aplikasi"** atau **"Tambahkan ke Layar Utama"**.
4. Android akan otomatis meng-compile dan meng-install aplikasi ULMET ke daftar aplikasi HP Anda secara *full screen* tanpa address bar browser.

### Opsi 2: Mengunduh Berkas Fisik `.apk` Mentah (Untuk Juri Lomba)
1. Buka generator resmi Microsoft: **[pwabuilder.com](https://www.pwabuilder.com)**.
2. Masukkan URL hosting Vercel proyek ULMET Anda.
3. Klik **Start** -> pilih **Package for Android** -> klik **Generate APK**.
4. Berkas **`ULMET.apk`** siap diunduh dan dibagikan.

---

## 💻 Panduan Menjalankan Proyek Secara Lokal

Karena proyek ini mengusung filosofi **Zero-Configuration Client-Side Architecture** (bebas dari `node_modules` yang berat), Anda dapat langsung menjalankannya dalam hitungan detik:

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/quthbisyauqi-sys/ULMET.git
   cd ULMET
   ```

2. **Jalankan Server Lokal:**
   ```bash
   # Menggunakan Python 3:
   python3 -m http.server 8080

   # Atau menggunakan ekstensi VS Code:
   # Klik kanan pada index.html -> "Open with Live Server"
   ```

3. **Buka di Browser:**
   Akses `http://localhost:8080` pada peramban Anda.

---

## 🚀 Panduan Hosting ke Vercel (Produksi Mahasiswa)

Untuk mempublikasikan ULMET ke Vercel agar dapat diakses oleh seluruh mahasiswa secara publik:

1. Masuk ke [vercel.com](https://vercel.com) menggunakan akun GitHub Anda.
2. Klik tombol **"Add New Project"** -> pilih **"Import"** pada repositori `ULMET`.
3. Biarkan pengaturan *Framework Preset* pada opsi **Other** (karena `vercel.json` bawaan sudah otomatis mengatur semua rute).
4. Klik **Deploy**. Dalam 20 detik, website ULMET resmi aktif dengan sertifikat HTTPS gratis dan domain publik (contoh: `https://ulmet-app.vercel.app`).

---

## 👥 Pengembang & Hak Cipta

Dikembangkan dengan dedikasi penuh untuk memajukan ekosistem produktivitas dan akademik mahasiswa Indonesia.  
Hak Cipta © 2026 **ULMET Team** — All Rights Reserved.
