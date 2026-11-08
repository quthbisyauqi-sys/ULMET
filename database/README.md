# 🗄️ Database Architecture — ULMET (Local-First Engine)

Dokumen ini menjelaskan arsitektur penyimpanan data **ULMET (Ultimate Learning & Management Ecosystem for Students)**.

---

## 🌟 Arsitektur Utama: 100% Local-First Device Database

ULMET menggunakan arsitektur **Local-First Standalone** yang menyimpan 100% data mahasiswa secara mandiri dan aman langsung di dalam memori dan disk perangkat (laptop / smartphone) mahasiswa:

### 1. IndexedDB Engine (`ULMET_Device_Files`)
- **Tujuan**: Menyimpan berkas biner berukuran besar seperti modul perkuliahan, slide presentasi dosen, makalah, dan file PDF/DOCX/gambar.
- **Kapasitas**: Menampung ratusan megabyte berkas (sesuai kuota disk browser, umumnya 60-80% kapasitas penyimpanan bebas).
- **Keunggulan**: 
  - Tidak membebani memori 5MB `localStorage`.
  - Berkas PDF dapat langsung dibaca secara offline menggunakan engine PDF.js bawaan.
  - Berkas yang dibagikan dari WhatsApp via Web Share Target disimpan seketika ke folder mata kuliah lokal.

### 2. User-Scoped LocalStorage (`u_{userId}_{key}`)
- **Tujuan**: Menyimpan data relasional terstruktur:
  - Akun & Autentikasi Mahasiswa (`ulmet_account`, `ulmet_local_students`)
  - Profil Akademik (`ulmet_profile` — nama, NIM, prodi, semester, avatar)
  - Jadwal Mata Kuliah & Agenda Mingguan (`ulmet_courses`)
  - Manajemen Tugas & Deadline Kuliah (`ulmet_tasks`)
  - Keuangan, Anggaran Harian, & Catatan Pengeluaran (`ulmet_keuangan_*`)
  - Pelacak Kebiasaan & Gamifikasi Karakter Si Ulmet (`ulmet_habits`, `ulmet_streak`)
  - Sesi Fokus Belajar Pomodoro (`ulmet_pomo_*`)
- **Multi-Tenant Isolation**: Setiap record disimpan dengan prefix unik `u_{userId}_` (contoh: `u_loc_9a8b_ulmet_tasks`), sehingga dalam satu laptop mahasiswa dapat bergantian login beberapa akun tanpa risiko data tertukar atau bocor.

---

## 🏆 Keunggulan Solusi untuk Lomba & Dampak Mahasiswa

1. **⚡ 0ms Latency (Respons Instan)**: Tidak ada loading spinner panjang karena semua query membaca memori perangkat secara langsung.
2. **📶 100% Offline-Ready**: Mahasiswa di pelosok, di ruang bawah tanah kampus, atau saat kuota habis tetap dapat belajar dan mencatat tugas tanpa kendala.
3. **🔐 Privasi Mutlak (Zero Data Breach Risk)**: Data catatan tugas, berkas kuliah, dan laporan keuangan kos tersimpan eksklusif di laptop mahasiswa, bebas dari risiko kebocoran data di server cloud pihak ketiga.
4. **💰 Bebas Biaya Operasional (Zero Cloud Cost)**: Tidak memerlukan langganan server database berbayar, bebas dari risiko limit kuota atau project auto-pause pada free tier cloud.

---

## 🗃️ Skema SQL Opsional (`schema.sql`)

Bagi institusi, universitas, atau ormawa kampus yang ingin menerapkan sinkronisasi cloud terpusat di kemudian hari, berkas [`schema.sql`](./schema.sql) telah disediakan lengkap dengan aturan **Row Level Security (RLS)** PostgreSQL.
