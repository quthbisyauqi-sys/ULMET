# ULMET — Web Manajemen Mahasiswa

Aplikasi web terpadu untuk membantu mahasiswa mengelola jadwal kuliah, tugas, berkas materi perkuliahan, keuangan kos, dan portofolio sertifikat prestasi.

---

## Akses dan Uji Coba Aplikasi

Pengujian aplikasi dapat dilakukan melalui dua cara berikut:

### 1. Akses Langsung Online (Vercel)
Aplikasi telah di-hosting dan dapat langsung dibuka melalui tautan berikut:
- **Tautan Aplikasi:** https://ulmet.vercel.app *(atau tautan domain Vercel yang Anda gunakan)*

Aplikasi dapat dibuka langsung menggunakan browser di laptop maupun smartphone.

### 2. Menjalankan Kode Mentah di Komputer Lokal (Localhost)
Bagi yang ingin menguji dan memeriksa kode sumber secara langsung di laptop:
1. Unduh atau clone repositori ini:
   ```bash
   git clone https://github.com/quthbisyauqi-sys/ULMET.git
   cd ULMET
   ```
2. Jalankan server lokal:
   ```bash
   python3 -m http.server 8080
   ```
   *Atau klik kanan berkas index.html dan pilih "Open with Live Server" di VS Code.*
3. Buka peramban dan akses alamat:
   ```text
   http://localhost:8080
   ```

---

## Panduan Penjurian (Akun Demo)

Untuk memudahkan proses evaluasi tanpa harus mendaftar dan mengisi data dari awal, telah disediakan akun demo yang sudah memiliki data simulasi lengkap:

1. Buka halaman masuk di `pages/login.html`.
2. Klik tombol **"Mode Penjurian Demo"** yang berada di bawah formulir login.
3. Akun demo akan langsung terbuka dengan data terisi:
   - Jadwal dan tugas kuliah aktif dengan indikator prioritas (Urgent, Sedang, Rendah, Libur Nasional).
   - Dokumen materi perkuliahan format PDF yang tersimpan di dalam folder mata kuliah.
   - Laporan keuangan kos lengkap dengan simulasi batas jatah belanja harian dan catatan patungan.
   - Portofolio sertifikat prestasi yang terorganisir di dalam 4 kategori folder.
   - Catatan perkuliahan dan pelacak kebiasaan belajar harian.

---

## Fitur Utama

### 1. Materi Kuliah dan Penerima File WhatsApp
- Mahasiswa dapat mengirimkan berkas materi (PDF, Word, PPT) dari grup WhatsApp langsung ke ULMET menggunakan fitur Share di HP.
- File otomatis tersimpan di penyimpanan browser (IndexedDB) dan masuk ke folder mata kuliah yang sesuai, sehingga dokumen tidak hilang meskipun obrolan chat terhapus.

### 2. Jadwal, Tugas, dan Kalender Prioritas
- Kalender kuliah dengan pembagian warna prioritas:
  - Merah: Tugas Urgent (deadline mendesak)
  - Kuning: Prioritas Sedang
  - Hijau: Prioritas Rendah
  - Ungu: Hari Libur Nasional
- Dilengkapi timer Pomodoro untuk fokus belajar dan pencatat kebiasaan harian.

### 3. Asisten Belajar AI
- Membantu mahasiswa memahami materi kuliah, membuat ringkasan bab penting, dan dapat membaca langsung isi dokumen yang dilampirkan.

### 4. Portofolio Sertifikat dan Prestasi (SKPI)
- Tempat menyimpan dan merapikan sertifikat ke dalam 4 folder kategori:
  - Kejuaraan dan Lomba
  - Webinar dan Seminar
  - Organisasi dan Kepanitiaan
  - Pelatihan dan Keahlian
- Berkas asli tersimpan aman di penyimpanan lokal, dilengkapi pratinjau dokumen dan fitur salin ringkasan prestasi untuk pengajuan beasiswa atau SKPI wisuda.

### 5. Manajemen Keuangan Kos
- Menghitung sisa kuota uang belanja harian secara otomatis berdasarkan sisa hari dalam bulan agar uang saku tidak habis di awal.
- Fitur pencatat tagihan patungan bersama teman kos dan target tabungan barang impian (wishlist).

### 6. Catatan Kuliah
- Tempat menulis ringkasan materi kuliah, rumus, atau catatan cepat dengan fitur penyematan catatan penting di baris teratas.

### 7. Mode Widget Layar
- Tampilan widget layar penuh yang dapat dipasang di layar monitor kedua untuk memantau tugas terdekat dan waktu secara praktis.

---

## Pemasangan Aplikasi di HP (PWA / WebAPK)

Aplikasi ini menggunakan teknologi Progressive Web App sehingga dapat dipasang langsung menjadi aplikasi di HP Android tanpa perlu mengunduh dari toko aplikasi:

1. Buka tautan ULMET di browser Google Chrome pada HP.
2. Tekan menu titik tiga di pojok kanan atas Chrome.
3. Pilih **"Instal Aplikasi"** atau **"Tambahkan ke Layar Utama"**.
4. Aplikasi ULMET akan terpasang di menu HP dan dapat dibuka secara layar penuh (tanpa bilah alamat browser) serta dapat dibuka saat offline.

Jika panitia lomba memerlukan berkas fisik berformat `.apk`, tautan web ULMET dapat dipaketkan melalui layanan seperti [pwabuilder.com](https://www.pwabuilder.com) untuk mengunduh file installer APK-nya.

---

## Struktur Folder Proyek

```text
ULMET/
├── assets/                 # Aset pendukung
│   ├── icons/              # Ikon aplikasi
│   ├── img/                # Gambar visual maskot
│   └── js/                 # Modul JavaScript dan database lokal perangkat
├── database/               # Skema dan dokumentasi database
├── docs/                   # Dokumen teknis dan penjelasan sistem
├── pages/                  # Halaman tampilan antarmuka
│   ├── admin.html          # Panel admin
│   ├── ai.html             # Ruang belajar asisten AI
│   ├── catatan.html        # Catatan kuliah
│   ├── dashboard.html      # Beranda utama mahasiswa
│   ├── jadwal.html         # Jadwal kuliah, kalender, dan tugas
│   ├── keuangan.html       # Keuangan dan anggaran kos
│   ├── login.html          # Halaman masuk dan akun demo
│   ├── materi.html         # Penyimpanan materi kuliah
│   ├── profil.html         # Profil dan portofolio sertifikat prestasi
│   └── widget.html         # Mode widget layar
├── tools/                  # Alat pembersih cache
├── _headers                # Pengaturan header web
├── index.html              # Halaman awal pembuka
├── manifest.json           # Konfigurasi PWA dan ikon
├── sw.js                   # Service worker untuk mode offline
└── vercel.json             # Pengaturan routing hosting Vercel
```

---

## Teknologi yang Digunakan

- **Antarmuka:** HTML5, Tailwind CSS, Font Plus Jakarta Sans dan Outfit
- **Penyimpanan Berkas:** IndexedDB (untuk dokumen biner materi dan sertifikat)
- **Penyimpanan Data Relasional:** LocalStorage browser terisolasi per akun
- **Fitur Mobile:** Progressive Web App (PWA), Service Worker, Web Share Target API
- **Pemroses Dokumen:** PDF.js dan Mammoth.js
- **Platform Hosting:** GitHub dan Vercel

---

## Tim Pengembang

Aplikasi ini dikembangkan untuk mempermudah kegiatan perkuliahan, pengelolaan tugas, materi, dan keuangan mahasiswa.
