# 🏛️ Arsitektur Sistem ULMET

Dokumen ini menjelaskan rancangan arsitektur teknis, aliran data, dan integrasi komponen pada aplikasi **ULMET (Ultimate Learning & Management Ecosystem for Students)**.

---

## 📐 Diagram Arsitektur Tingkat Tinggi

```
                  +-----------------------------------+
                  |         Pengguna / Mahasiswa      |
                  +-----------------+-----------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|  Browser / Mobile |     |   WhatsApp App    |     |   Home Screen     |
|    PWA Client     |     |   (Share Menu)    |     |   (PWA Widget)    |
+---------+---------+     +---------+---------+     +---------+---------+
          |                         |                         |
          |                         v                         |
          |               +-------------------+               |
          |               | Web Share Target  |               |
          |               |    (ServiceWorker)|               |
          |               +---------+---------+               |
          |                         |                         |
          +-------------------------+-------------------------+
                                    |
                                    v
                     +-----------------------------+
                     |        Routing Layer        |
                     |  index.html & Vercel Engine |
                     +--------------+--------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|      Pages        |     |  Local DB Engine  |     |  Background SW    |
| - Dashboard       |     | - IndexedDB Files |     | - Push Deadline   |
| - Agenda & Tugas  |     | - Scoped LocalStrg|     | - Habit Reminders |
| - Materi Kuliah   |     | - 0ms Latency     |     | - Cache Storage   |
| - Keuangan        |     | - 100% Standalone |     |                   |
| - AI ULMET        |     | - Zero Server Cost|     |                   |
+-------------------+     +-------------------+     +-------------------+
```

---

## 📂 Struktur Direktori Standar

Struktur folder ULMET menerapkan pemisahan tugas (*separation of concerns*) yang modular, terstruktur, dan profesional:

```
ULMET/
├── assets/                 # Berkas statis pendukung
│   ├── icons/              # Ikon resolusi PWA (192x192, 512x512 maskable)
│   ├── img/                # Aset visual & grafis antarmuka
│   └── js/                 # Modul JavaScript & Database Engine
│       ├── local-db.js     # Engine database lokal perangkat (IndexedDB + Scoped Storage)
│       └── ai-widget.js    # Widget floating AI & integrasi model
├── database/               # Skema & dokumentasi basis data
│   ├── schema.sql          # DDL PostgreSQL terstruktur (opsional untuk sync cloud)
│   └── README.md           # Dokumentasi arsitektur database lokal perangkat
├── docs/                   # Dokumentasi teknis & penjurian lomba
│   ├── ARCHITECTURE.md     # Arsitektur sistem & aliran data (dokumen ini)
│   └── FITUR_DAN_SOLUSI.md # Solusi nilai tambah & studi kasus mahasiswa
├── pages/                  # Tampilan antarmuka utama (Views)
│   ├── admin.html          # Panel monitoring & manajemen akun mahasiswa lokal
│   ├── ai.html             # Asisten belajar cerdas bertenaga LLM
│   ├── catatan.html        # Catatan cepat perkuliahan, ide, & materi kuliah
│   ├── dashboard.html      # Beranda ringkasan tugas, agenda terdekat, & countdown
│   ├── jadwal.html         # Agenda & tugas, kalender organisasi 5 warna, countdown deadline
│   ├── keuangan.html       # Manajemen anggaran harian, expense & patungan
│   ├── login.html          # Halaman autentikasi akun & onboarding demo 1-klik
│   ├── materi.html         # Pengorganisir berkas kuliah (PDF/DOC) berbasis IndexedDB
│   └── profil.html         # Profil mahasiswa & Portofolio Brankas Prestasi SKPI (4 Kategori)
├── tools/                  # Utilitas pemeliharaan dan pengembang
│   ├── clear.html          # Pembersihan storage lokal
│   └── clear-cache.html    # Pembersihan service worker & offline cache
├── _headers                # Header keamanan & perizinan Service Worker
├── index.html              # Gerbang utama aplikasi (smart bootstrapper)
├── manifest.json           # Konfigurasi instalasi PWA & Web Share Target
├── sw.js                   # Service Worker offline-first & background push
├── vercel.json             # Konfigurasi hosting & URL rewrites
└── README.md               # Presentasi portofolio GitHub utama
```

---

## 🔒 Keamanan, Privasi & Arsitektur Local-First

1. **Penyimpanan Mandiri Berbasis Perangkat (100% Local-First)**:
   - **IndexedDB (`ULMET_Device_Files`)**: Menyimpan dokumen biner berukuran besar (PDF, DOCX, PPTX, gambar materi) langsung di disk browser mahasiswa tanpa kuota 5MB localStorage. Mampu menampung ratusan megabyte materi kuliah secara aman dan gratis.
   - **User-Scoped LocalStorage**: Data relasional seperti akun mahasiswa, profil, mata kuliah, tugas, transaksi keuangan, kebiasaan, dan sesi pomodoro diisolasi menggunakan prefix unik `u_{userId}_{key}` melalui fungsi `userKey()`. Ketika beberapa mahasiswa bergantian menggunakan satu laptop, data tetap terpisah rapi.

2. **Keunggulan untuk Solusi Mahasiswa**:
   - **0ms Latency**: Semua operasi baca/tulis data berlangsung instan tanpa gangguan koneksi internet lambat di kampus.
   - **Bebas Kuota & Biaya Server**: Tidak ada biaya sewa server bulanan, tidak bergantung pada kuota free-tier cloud yang rawan terblokir/paused.
   - **Privasi Mutlak**: Data keuangan pribadi dan berkas perkuliahan tidak dikirim ke server pihak ketiga manapun.

3. **Service Worker Whitelist & HTTPS Strictness**:
   `_headers` dan `vercel.json` menyertakan `Service-Worker-Allowed: /` dan kontrol cache `no-cache, no-store, must-revalidate` untuk menjamin pembaruan skrip instan tanpa stale caching.

