# 💡 Nilai Solutif & Fitur Unggulan — ULMET

> **Kategori Lomba:** Inovasi Aplikasi Web & Solusi Digital Mahasiswa  
> **Nama Proyek:** ULMET (*Ultimate Learning & Management Ecosystem for Students*)

---

## 🎯 Latar Belakang Masalah (Pain Points Mahasiswa)

Dalam dinamika kehidupan perkuliahan modern, mahasiswa menghadapi beberapa masalah krusial:
1. **Materi Kuliah Tercecer di WhatsApp**: Dosen sering membagikan silabus, modul PDF, dan slide kuliah melalui grup WhatsApp kelas. Dokumen tersebut sering kali tertimbun ribuan pesan chat atau hilang (*media expired*).
2. **Deadline & Manajemen Waktu Berantakan**: Menumpuknya tugas dari berbagai mata kuliah tanpa sistem pengingat proaktif mengakibatkan fenomena *Sistem Kebut Semalam* (SKS) dan penurunan performa akademik.
3. **Krisis Finansial Anak Kos**: Pengeluaran harian tidak terkontrol, sulit menghitung jatah makan harian, serta kerumitan saat mengelola patungan kos/proyek kelompok.
4. **Hambatan Belajar & Pemahaman Materi**: Ketika menemukan istilah teknis atau materi ujian yang rumit, mahasiswa membutuhkan ringkasan instan yang dapat membaca langsung dokumen PDF kuliah.

---

## 🚀 Solusi yang Dihadirkan ULMET

ULMET menyatukan seluruh kebutuhan mahasiswa ke dalam satu ekosistem web progresif (PWA) yang terintegrasi:

### 1. 📱 WhatsApp Share Target Instan (Materi Kuliah)
- **Inovasi Solutif**: Memanfaatkan API standar Web Share Target Level 2.
- **Cara Kerja**: Mahasiswa cukup memilih file dokumen PDF dari WhatsApp, tekan tombol **Share / Bagikan**, lalu pilih **ULMET**. Dokumen secara otomatis ditangkap oleh Service Worker, disimpan ke penyimpanan lokal & IndexedDB, dan dikelompokkan ke dalam folder mata kuliah yang sesuai.

### 2. 🤖 AI ULMET (Multi-Model & PDF Reader)
- **Inovasi Solutif**: Integrasi SnifoxAI Gateway dengan model cerdas (GPT-5.5, Gemini 2.5, Claude Opus).
- **Kapabilitas**: Dilengkapi kemampuan ekstraksi teks dari berkas PDF langsung di sisi peramban (*client-side PDF parsing via PDF.js*), pembuatan flashcards, kuis latihan, dan ringkasan konsep inti.

### 3. 🎭 Gamifikasi Maskot Adaptif ("Si Ulmet")
- **Inovasi Solutif**: Maskot emosional yang bereaksi terhadap kedisiplinan mahasiswa.
  - 🏆 **Happy (Reward)**: Ketika tugas selesai tepat waktu dan streak belajar terjaga.
  - ⏰ **Worried (Panik)**: Ketika deadline mendekat dalam waktu kurang dari 24 jam.
  - 😡 **Angry (Marah)**: Ketika mahasiswa mengabaikan tugas dan lama tidak membuka aplikasi.

### 4. 💸 Manajemen Keuangan & Kalkulator Jatah Harian
- **Inovasi Solutif**: Menghitung secara otomatis sisa pagu anggaran dibagi jumlah hari tersisa hingga akhir bulan.
- **Fitur Tambahan**: Pelacak patungan kos (*shared bills*), pencatat *wishlist* dengan target tabungan bertahap, dan visualisasi grafik pengeluaran berbasis kategori.

### 5. 🔔 Push Notification & Habit Tracker Offline-First
- **Inovasi Solutif**: Service Worker background notification daemon yang tetap dapat mengirimkan alarm deadline tugas kuliah bahkan saat browser ditutup.

