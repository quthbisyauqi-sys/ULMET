// =============================================
// ULMET — Local-First Offline Database Engine
// Arsitektur Penyimpanan Mandiri Berbasis Perangkat Mahasiswa
// (IndexedDB untuk Berkas Fisik + User-Scoped LocalStorage untuk Relasi Data)
// 100% Offline-Ready • 0ms Latency • Bebas Ketergantungan Server Cloud
// =============================================

// =============================================
// 1. USER-SCOPED STORAGE MANAGEMENT
// Setiap data mahasiswa diisolasi per UID agar tidak tercampur
// =============================================

let _cachedUserId = null;

/**
 * Dapatkan User ID yang sedang aktif dari cache / localStorage
 */
function getCurrentUserId() {
    if (_cachedUserId) return _cachedUserId;
    const cached = localStorage.getItem('ulmet_current_uid');
    if (cached) {
        _cachedUserId = cached;
        return cached;
    }
    // Fallback sinkron HANYA dari session account lokal yang sah jika ada
    try {
        const accStr = localStorage.getItem('ulmet_account');
        if (accStr) {
            const acc = JSON.parse(accStr);
            if (acc && acc.id) {
                _cachedUserId = String(acc.id);
                localStorage.setItem('ulmet_current_uid', _cachedUserId);
                return _cachedUserId;
            }
        }
    } catch (e) { }
    return null;
}

/**
 * Simpan user ID aktif saat login
 */
function setCurrentUserId(uid) {
    _cachedUserId = uid ? String(uid) : null;
    if (_cachedUserId) {
        localStorage.setItem('ulmet_current_uid', _cachedUserId);
    } else {
        localStorage.removeItem('ulmet_current_uid');
    }
}

/**
 * Hasilkan key localStorage yang diisolasi per akun mahasiswa.
 * Contoh: userKey('ulmet_tasks') -> 'u_9a8b7c_ulmet_tasks'
 */
function userKey(key) {
    const uid = getCurrentUserId();
    if (uid) return `u_${uid}_${key}`;
    return key;
}

/**
 * Hapus key-key localStorage legacy yang tidak di-scope
 */
function clearLegacyLocalStorage() {
    const legacyKeys = [
        'ulmet_tasks',
        'ulmet_courses',
        'ulmet_files',
        'ulmet_keuangan_budget',
        'ulmet_keuangan_budget_end_date',
        'ulmet_keuangan_expenses',
        'ulmet_keuangan_patungan',
        'ulmet_keuangan_wishlist',
        'ulmet_keuangan_categories',
        'ulmet_keuangan_config',
        'ulmet_streak',
        'ulmet_habits',
        'ulmet_pomo_sessions',
        'ulmet_pomo_total',
        'ulmet_profile',
        'ulmet_account',
        'ulmet_avatar_photo',
        'ulmet_notes',
        'ulmet_note_folders',
        'ulmet_achievements'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
}

/**
 * Hapus seluruh data milik user tertentu di penyimpanan lokal
 */
function clearUserLocalStorage(uid) {
    if (!uid) return;
    const prefix = `u_${uid}_`;
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
            toRemove.push(k);
        }
    }
    toRemove.forEach(k => localStorage.removeItem(k));
}

// =============================================
// 2. AUTHENTICATION & SESSION (LOCAL-FIRST)
// =============================================

async function getSession() {
    const localUid = getCurrentUserId();
    if (localUid) {
        const accStr = localStorage.getItem(`u_${localUid}_ulmet_account`) || localStorage.getItem('ulmet_account');
        if (accStr) {
            try {
                const acc = JSON.parse(accStr);
                return {
                    user: {
                        id: localUid,
                        email: acc.email || `${acc.username}@ulmet.app`,
                        user_metadata: {
                            username: acc.username,
                            full_name: acc.nama || acc.username,
                            role: 'student'
                        }
                    }
                };
            } catch(e) {}
        }
    }
    return null;
}

async function getUserId() {
    return getCurrentUserId();
}

async function isLoggedIn() {
    return !!(await getSession());
}

async function requireAuth(redirectTo = 'login.html') {
    const session = await getSession();
    if (!session || !session.user) {
        window.location.href = redirectTo;
        return null;
    }
    setCurrentUserId(session.user.id);
    return session;
}

function usernameToEmail(username) {
    return (username || '').toLowerCase().trim().replace(/\s+/g, '') + '@ulmet.app';
}

function emailToUsername(email) {
    return (email || '').replace('@ulmet.app', '').trim();
}

async function loginWithUsername(username, password) {
    const localStudents = JSON.parse(localStorage.getItem('ulmet_local_students') || '[]');
    const user = localStudents.find(s => s.username.toLowerCase() === username.toLowerCase() && s.password === password);
    if (user) {
        setCurrentUserId(user.id);
        const acc = { id: user.id, username: user.username, email: user.email, nama: user.nama };
        localStorage.setItem(userKey('ulmet_account'), JSON.stringify(acc));
        localStorage.setItem('ulmet_account', JSON.stringify(acc));
        return { data: { user }, error: null };
    }
    return { data: { user: null }, error: new Error('Username atau kata sandi tidak cocok.') };
}

const DEFAULT_STUDENT_SEEDS = [
    {
        id: 'std_demo_1',
        username: 'mahasiswa',
        password: 'mahasiswa123',
        nama: 'Ahmad Baihaqi',
        nim: '210102003',
        prodi: 'Sastra Arab',
        semester: '5',
        avatar: 'A'
    },
    {
        id: 'std_demo_2',
        username: 'syauqi',
        password: 'syauqi123',
        nama: 'Syauqi Quthbi',
        nim: '210102001',
        prodi: 'Teknik Informatika',
        semester: '5',
        avatar: 'S'
    }
];

function ensureLocalStudentsSeeded() {
    try {
        let list = [];
        const stored = localStorage.getItem('ulmet_local_students');
        if (stored) {
            try { list = JSON.parse(stored); } catch(e) { list = []; }
        }
        if (!Array.isArray(list)) list = [];
        let updated = false;
        DEFAULT_STUDENT_SEEDS.forEach(seed => {
            if (!list.some(s => s && s.username && s.username.toLowerCase() === seed.username.toLowerCase())) {
                list.push(seed);
                updated = true;
            }
        });
        if (updated || !stored) {
            localStorage.setItem('ulmet_local_students', JSON.stringify(list));
        }
    } catch (e) { }
}
ensureLocalStudentsSeeded();

async function logoutUser(redirectTo = 'login.html') {
    const currentUid = getCurrentUserId();
    setCurrentUserId(null);
    _cachedUserId = null;
    localStorage.removeItem('ulmet_current_uid');
    localStorage.removeItem('ulmet_account');
    localStorage.removeItem('ulmet_profile');
    if (currentUid) {
        localStorage.removeItem(`u_${currentUid}_ulmet_account`);
        localStorage.removeItem(`u_${currentUid}_ulmet_profile`);
    }
    // Bersihkan residu sesi demo juri secara tuntas
    localStorage.removeItem('u_demo_juri_invofest_ulmet_account');
    localStorage.removeItem('u_demo_juri_invofest_ulmet_profile');
    sessionStorage.removeItem('ulmet_admin_ok');
    localStorage.removeItem('ulmet_admin_session');

    if (redirectTo) {
        const sep = redirectTo.includes('?') ? '&' : '?';
        window.location.href = `${redirectTo}${sep}logout=true`;
    }
}

/**
 * Otentikasi Khusus Dewan Juri / Mode Demo 1-Klik
 * Mengisi data percontohan lengkap (Jadwal, Tugas, Keuangan, Kebiasaan, Maskot)
 * agar juri dapat langsung mengevaluasi seluruh fitur tanpa harus mendaftar dari nol.
 */
function loginAsDemoJudge() {
    const demoId = 'demo_juri_invofest';
    setCurrentUserId(demoId);

    const acc = {
        id: demoId,
        username: 'juri_invofest',
        email: 'juri_invofest@ulmet.app',
        nama: 'Dewan Juri INVOFEST 2026'
    };
    localStorage.setItem(userKey('ulmet_account'), JSON.stringify(acc));
    localStorage.setItem('ulmet_account', JSON.stringify(acc));

    const profile = {
        id: demoId,
        nama: 'Dewan Juri INVOFEST 2026',
        panggilan: 'Juri',
        nim: '2026.INVO.01',
        prodi: 'Teknik Informatika & Sistem Cerdas',
        semester: '5',
        avatar: 'J'
    };
    localStorage.setItem(userKey('ulmet_profile'), JSON.stringify(profile));
    localStorage.setItem('ulmet_profile', JSON.stringify(profile));

    const courses = [
        { id: 'c1', name: 'Kecerdasan Buatan', day: 'Senin', time: '08:00 - 10:30', room: 'Lab AI 301', lecturer: 'Dr. Hendra, M.Kom' },
        { id: 'c2', name: 'Rekayasa Perangkat Lunak', day: 'Selasa', time: '10:30 - 13:00', room: 'Ruang Teori 204', lecturer: 'Ir. Ratna Dewi, M.T.' },
        { id: 'c3', name: 'Sistem Terdistribusi', day: 'Kamis', time: '13:30 - 16:00', room: 'Lab Komputasi A', lecturer: 'Bambang S., Ph.D' }
    ];
    localStorage.setItem(userKey('ulmet_courses'), JSON.stringify(courses));

    const today = new Date();
    const d1 = new Date(today.getTime() + 86400000 * 1.5).toISOString().slice(0, 16);
    const d2 = new Date(today.getTime() + 86400000 * 4).toISOString().slice(0, 16);
    const d3 = new Date(today.getTime() + 86400000 * 7).toISOString().slice(0, 16);
    const tasks = [
        { 
            id: 't1', 
            nama: 'Implementasi Algoritma Search pada Peta Kampus', 
            title: 'Implementasi Algoritma Search pada Peta Kampus', 
            matkul: 'Kecerdasan Buatan', 
            course: 'Kecerdasan Buatan', 
            deadline: d1, 
            prioritas: 'tinggi', 
            priority: 'tinggi', 
            estimasi: 3,
            status: 'belum', 
            completed: false,
            catatan: 'Gunakan heuristik A* dan uji pada graf kampus.'
        },
        { 
            id: 't2', 
            nama: 'Dokumen Desain Sistem PWA Local-First', 
            title: 'Dokumen Desain Sistem PWA Local-First', 
            matkul: 'Rekayasa Perangkat Lunak', 
            course: 'Rekayasa Perangkat Lunak', 
            deadline: d2, 
            prioritas: 'sedang', 
            priority: 'sedang', 
            estimasi: 4,
            status: 'belum', 
            completed: false,
            catatan: 'Diagram arsitektur IndexedDB dan Service Worker sync.'
        },
        { 
            id: 't3', 
            nama: 'Review Jurnal Cloud vs Edge Computing', 
            title: 'Review Jurnal Cloud vs Edge Computing', 
            matkul: 'Sistem Terdistribusi', 
            course: 'Sistem Terdistribusi', 
            deadline: d3, 
            prioritas: 'rendah', 
            priority: 'rendah', 
            estimasi: 2,
            status: 'belum', 
            completed: false,
            catatan: 'Meringkas 3 paper IEEE tahun 2024-2025.'
        },
        { 
            id: 't4_org', 
            nama: 'Meeting Koordinasi Panitia Lomba Invofest 2026', 
            title: 'Meeting Koordinasi Panitia Lomba Invofest 2026', 
            matkul: 'Divisi Kreatif & Acara', 
            course: 'Divisi Kreatif & Acara', 
            kategori: 'organisasi',
            category: 'organisasi',
            deadline: new Date(today.getTime() + 86400000 * 2.5).toISOString().slice(0, 16), 
            prioritas: 'tinggi', 
            priority: 'tinggi', 
            estimasi: 2,
            status: 'belum', 
            completed: false,
            catatan: 'Pembahasan teknis rundown lomba dan koordinasi dewan juri di Gedung Rektorat Lt. 3.'
        },
        { 
            id: 't5_org', 
            nama: 'Rapat Pleno BEM & Evaluasi Program Kerja', 
            title: 'Rapat Pleno BEM & Evaluasi Program Kerja', 
            matkul: 'BEM Fakultas / Organisasi', 
            course: 'BEM Fakultas / Organisasi', 
            kategori: 'organisasi',
            category: 'organisasi',
            deadline: new Date(today.getTime() + 86400000 * 5).toISOString().slice(0, 16), 
            prioritas: 'sedang', 
            priority: 'sedang', 
            estimasi: 2.5,
            status: 'belum', 
            completed: false,
            catatan: 'Presentasi evaluasi program kerja bulanan bersama divisi pengurus.'
        }
    ];
    localStorage.setItem(userKey('ulmet_tasks'), JSON.stringify(tasks));

    const budgetConfig = { budget: 1500000, days: 30 };
    localStorage.setItem(userKey('ulmet_keuangan_config'), JSON.stringify(budgetConfig));
    const expenses = [
        { id: 'e1', date: today.toLocaleDateString('id-ID'), category: 'Makan & Minum', note: 'Makan siang kantin kampus', amount: 25000 },
        { id: 'e2', date: today.toLocaleDateString('id-ID'), category: 'Pendidikan', note: 'Modul praktikum AI', amount: 18000 }
    ];
    localStorage.setItem(userKey('ulmet_keuangan_expenses'), JSON.stringify(expenses));

    const habits = [
        { id: 'h1', title: 'Membaca Modul Kuliah 30 Menit', streak: 7, doneToday: true },
        { id: 'h2', title: 'Sesi Fokus Pomodoro 2x', streak: 5, doneToday: false }
    ];
    localStorage.setItem(userKey('ulmet_habits'), JSON.stringify(habits));
    localStorage.setItem(userKey('ulmet_streak'), '7');

    const noteFolders = ['Hutang', 'LKP2M', 'Matkul', 'Pribadi'];
    localStorage.setItem(userKey('ulmet_note_folders'), JSON.stringify(noteFolders));

    const demoNotes = [
        {
            id: 'note_1',
            title: 'Mini riset KKI',
            content: 'Mini riset KKI\n\nMembuat mini riset di sekitaran daerah KKI nanti subjek dan objeknya seperti umkm, petani" dll\n\nDan untuk metode penelitiannya itu di sarankan menggunakan kualitatif\n\n1. Latar belakang\n2. Kajian teori\n3. Teorinya siapa\n4. Metodologi penelitiannya\n5. Hasil dan pembahasan.\n\nNanti di lampiran di tulis yang mengerjakan latar belakang siapa dan yang mengerjakan kajian teori dll agar kelihatan yang mengerjakan siapa.',
            folder: 'LKP2M',
            pinned: true,
            updatedAt: Date.now() - 3600000 * 2,
            createdAt: Date.now() - 86400000
        },
        {
            id: 'note_2',
            title: 'You may delay',
            content: 'but time will not\nI can because i think can',
            folder: 'Pribadi',
            pinned: false,
            updatedAt: Date.now() - 3600000 * 5,
            createdAt: Date.now() - 86400000 * 2
        },
        {
            id: 'note_3',
            title: 'Jaket, alat sholat,',
            content: 'Jaket, alat sholat, buku tulis, charger, botol minum',
            folder: 'Pribadi',
            pinned: false,
            updatedAt: Date.now() - 3600000 * 20,
            createdAt: Date.now() - 86400000 * 3
        },
        {
            id: 'note_4',
            title: 'Matkul Sastra Arab - Balaghah',
            content: 'Konsep dasar majaz mursal dan alaqah-nya:\n1. Sababiyyah & Musabbabiyyah\n2. Juz\'iyyah & Kulliyyah\n3. Haliyyah & Mahaliyyah\n\nPersiapan ujian bab 3.',
            folder: 'Matkul',
            pinned: false,
            updatedAt: Date.now() - 86400000,
            createdAt: Date.now() - 86400000 * 4
        }
    ];
    localStorage.setItem(userKey('ulmet_notes'), JSON.stringify(demoNotes));

    const demoAchievements = [
        {
            id: 'ach_demo_1',
            judul: 'Juara 1 Lomba Karya Tulis Ilmiah Nasional (LKTIN) Mahasiswa',
            folder: 'kejuaraan',
            tingkat: 'Nasional',
            capaian: 'Juara 1',
            penyelenggara: 'Universitas Indonesia • Festival Ilmiah Nusantara',
            tahun: 2026,
            nomorSkpi: 'SK-088/LKTIN-UI/2026',
            deskripsi: 'Meraih juara pertama kategori karya ilmiah integrasi sains dan humaniora.',
            berkas: { id: 'file_cert_1', name: 'Sertifikat_Juara1_LKTIN_Nasional.pdf', size: '1.4 MB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 3
        },
        {
            id: 'ach_demo_2',
            judul: 'Juara 2 Debat Bahasa Arab Tingkat Nasional (Festival Sastra)',
            folder: 'kejuaraan',
            tingkat: 'Nasional',
            capaian: 'Juara 2',
            penyelenggara: 'Kementerian Agama RI & Asosiasi Pengajar Bahasa Arab',
            tahun: 2026,
            nomorSkpi: 'SK-042/DIT-PTKI/2026',
            deskripsi: 'Peringkat kedua kompetisi debat ilmiah bahasa Arab se-Indonesia.',
            berkas: { id: 'file_cert_2', name: 'Piagam_Debat_Nasional.pdf', size: '980 KB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 10
        },
        {
            id: 'ach_demo_3',
            judul: 'Peserta Seminar Internasional: AI & Islamic Civilization in Digital Era',
            folder: 'webinar',
            tingkat: 'Internasional',
            capaian: 'Peserta Webinar',
            penyelenggara: 'UIN Maulana Malik Ibrahim Malang & ISESCO',
            tahun: 2026,
            nomorSkpi: 'WEBINAR-AI-2026-781',
            deskripsi: 'Seminar internasional eksplorasi etika AI dalam kemajuan literasi akademik.',
            berkas: { id: 'file_cert_3', name: 'Sertifikat_Webinar_Internasional_AI.pdf', size: '1.2 MB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 20
        },
        {
            id: 'ach_demo_4',
            judul: 'Workshop Nasional: Penulisan Jurnal Bereputasi Sinta & Scopus',
            folder: 'webinar',
            tingkat: 'Nasional',
            capaian: 'Peserta Webinar',
            penyelenggara: 'Lembaga Publikasi Ilmiah & Jurnal Mahasiswa',
            tahun: 2025,
            nomorSkpi: 'WS-SINTA-2025-104',
            deskripsi: 'Pelatihan teknis metodologi penulisan naskah artikel ilmiah berstandar internasional.',
            berkas: { id: 'file_cert_4', name: 'Sertifikat_Workshop_Publikasi.pdf', size: '850 KB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 35
        },
        {
            id: 'ach_demo_5',
            judul: 'Ketua Divisi Humas & Publikasi - DEMA Fakultas Humaniora',
            folder: 'organisasi',
            tingkat: 'Kampus',
            capaian: 'Pengurus Organisasi',
            penyelenggara: 'Dewan Eksekutif Mahasiswa (DEMA) Periode 2025/2026',
            tahun: 2026,
            nomorSkpi: 'SK-REKTOR-019/DEMA/2026',
            deskripsi: 'Memimpin koordinasi publikasi media sosial dan relasi kemitraan kampus.',
            berkas: { id: 'file_cert_5', name: 'SK_Kepengurusan_DEMA_2026.pdf', size: '1.6 MB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 45
        },
        {
            id: 'ach_demo_6',
            judul: 'Koordinator Lapangan - Pengenalan Budaya Akademik & Kemahasiswaan (PBAK)',
            folder: 'organisasi',
            tingkat: 'Kampus',
            capaian: 'Panitia Kegiatan',
            penyelenggara: 'Panitia Pusat PBAK UIN Malang',
            tahun: 2025,
            nomorSkpi: 'PBAK-UIN-PAN-055',
            deskripsi: 'Koordinator lapangan orientasi mahasiswa baru tingkat universitas.',
            berkas: { id: 'file_cert_6', name: 'Piagam_Panitia_PBAK_2025.pdf', size: '1.1 MB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 60
        },
        {
            id: 'ach_demo_7',
            judul: 'Sertifikasi Kemahiran Bahasa Arab Internasional (TOAFL Skor 585)',
            folder: 'pelatihan',
            tingkat: 'Kampus',
            capaian: 'Sertifikasi Kompetensi',
            penyelenggara: 'Pusat Pengembangan Bahasa Universitas',
            tahun: 2025,
            nomorSkpi: 'TOAFL-2025-UIN-091',
            deskripsi: 'Uji kompetensi kemahiran berbahasa Arab tingkat lanjut dengan predikat Istimewa.',
            berkas: { id: 'file_cert_7', name: 'Sertifikat_TOAFL_Resmi.pdf', size: '1.3 MB', type: 'application/pdf', dataUrl: '' },
            createdAt: Date.now() - 86400000 * 75
        }
    ];
    localStorage.setItem(userKey('ulmet_achievements'), JSON.stringify(demoAchievements));
    localStorage.setItem('ulmet_achievements', JSON.stringify(demoAchievements));

    return true;
}

// =============================================
// 3. INDEXEDDB FILE STORAGE ENGINE (BERKAS MAHASISWA)
// Menyimpan berkas biner (PDF, DOCX, PPTX, JPG) langsung di perangkat
// =============================================

const FILE_DB_NAME = 'ULMET_Device_Files';
const FILE_STORE_NAME = 'files_blobs';

function openDeviceFilesDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(FILE_DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
                db.createObjectStore(FILE_STORE_NAME, { keyPath: 'id' });
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Simpan berkas fisik (Blob / File) ke dalam IndexedDB perangkat
 */
async function saveDeviceFileBlob(fileId, blobOrFile) {
    try {
        const db = await openDeviceFilesDB();
        const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(FILE_STORE_NAME);
        const record = {
            id: fileId,
            userId: getCurrentUserId() || 'local',
            blob: blobOrFile,
            name: blobOrFile.name || 'Dokumen',
            type: blobOrFile.type || 'application/pdf',
            size: blobOrFile.size || 0,
            updatedAt: Date.now()
        };
        await new Promise((resolve, reject) => {
            const putReq = store.put(record);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        });
        return true;
    } catch(err) {
        console.warn('Gagal menyimpan berkas ke IndexedDB perangkat:', err);
        return false;
    }
}

/**
 * Ambil berkas fisik (Blob) dari IndexedDB perangkat
 */
async function getDeviceFileBlob(fileId) {
    try {
        const db = await openDeviceFilesDB();
        const tx = db.transaction(FILE_STORE_NAME, 'readonly');
        const store = tx.objectStore(FILE_STORE_NAME);
        const record = await new Promise((resolve) => {
            const getReq = store.get(fileId);
            getReq.onsuccess = () => resolve(getReq.result);
            getReq.onerror = () => resolve(null);
        });
        return record ? record.blob : null;
    } catch(err) {
        console.warn('Gagal mengambil berkas dari IndexedDB perangkat:', err);
        return null;
    }
}

/**
 * Hapus berkas fisik dari IndexedDB perangkat
 */
async function deleteDeviceFileBlob(fileId) {
    try {
        const db = await openDeviceFilesDB();
        const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(FILE_STORE_NAME);
        store.delete(fileId);
    } catch(e) {}
}

const _blobUrlCache = new Map();

/**
 * Fungsi upload berkas: menyimpan langsung ke IndexedDB perangkat
 */
async function uploadFile(file, folderPath) {
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    await saveDeviceFileBlob(fileId, file);
    try {
        const blobUrl = URL.createObjectURL(file);
        _blobUrlCache.set(fileId, blobUrl);
    } catch(e) {}
    return { path: fileId, fullPath: fileId, originalName: file.name };
}

/**
 * Dapatkan URL untuk menampilkan/mengunduh berkas
 */
function getFileUrl(filePath) {
    if (!filePath) return '';
    if (filePath.startsWith('blob:') || filePath.startsWith('data:') || filePath.startsWith('http')) {
        return filePath;
    }
    if (_blobUrlCache.has(filePath)) {
        return _blobUrlCache.get(filePath);
    }
    return '';
}

/**
 * Dapatkan atau buat URL Blob secara asinkron dari IndexedDB
 */
async function getOrFetchFileUrl(fileId) {
    if (!fileId) return '';
    if (fileId.startsWith('blob:') || fileId.startsWith('data:') || fileId.startsWith('http')) {
        return fileId;
    }
    if (_blobUrlCache.has(fileId)) {
        return _blobUrlCache.get(fileId);
    }
    const blob = await getDeviceFileBlob(fileId);
    if (blob) {
        const url = URL.createObjectURL(blob);
        _blobUrlCache.set(fileId, url);
        return url;
    }
    return '';
}

/**
 * Hapus berkas dari penyimpanan lokal perangkat
 */
async function deleteStorageFile(filePath) {
    if (!filePath) return;
    await deleteDeviceFileBlob(filePath);
    if (_blobUrlCache.has(filePath)) {
        try { URL.revokeObjectURL(_blobUrlCache.get(filePath)); } catch(e) {}
        _blobUrlCache.delete(filePath);
    }
}

// =============================================
// 4. DATA SYNCHRONIZATION HELPERS (NATIVE LOCAL STORAGE)
// =============================================

async function syncArrayToSupabase(table, localKey, data) {
    try {
        localStorage.setItem(userKey(localKey), JSON.stringify(data || []));
    } catch (e) {
        console.warn('Gagal menyimpan array lokal:', e);
    }
}

async function loadArrayFromSupabase(table, localKey, defaultVal = []) {
    try {
        const cached = localStorage.getItem(userKey(localKey));
        return cached ? JSON.parse(cached) : defaultVal;
    } catch(e) {
        return defaultVal;
    }
}

async function syncConfigToSupabase(table, localKey, configObj) {
    try {
        localStorage.setItem(userKey(localKey), JSON.stringify(configObj || {}));
    } catch (e) {}
}

async function loadConfigFromSupabase(table, localKey, defaultVal = {}) {
    try {
        const cached = localStorage.getItem(userKey(localKey));
        return cached ? JSON.parse(cached) : defaultVal;
    } catch (e) {
        return defaultVal;
    }
}

// --- Entitas Spesifik ---

async function syncTasks(tasks) {
    return syncArrayToSupabase('tasks', 'ulmet_tasks', tasks);
}

async function loadTasks() {
    return loadArrayFromSupabase('tasks', 'ulmet_tasks', []);
}

async function syncCourses(courses) {
    return syncArrayToSupabase('courses', 'ulmet_courses', courses);
}

async function loadCourses(defaultCourses = ['Sastra Arab', 'Filsafat Ilmu', 'Sejarah Kebudayaan']) {
    return loadArrayFromSupabase('courses', 'ulmet_courses', defaultCourses);
}

async function syncFiles(files) {
    const cleanFiles = (files || []).map(f => {
        const { dataUrl, blob, ...rest } = f;
        return rest;
    });
    return syncArrayToSupabase('files', 'ulmet_files', cleanFiles);
}

async function loadFiles() {
    return loadArrayFromSupabase('files', 'ulmet_files', []);
}

async function syncNotes(notes) {
    return syncArrayToSupabase('notes', 'ulmet_notes', notes);
}

async function loadNotes(defaultNotes = []) {
    return loadArrayFromSupabase('notes', 'ulmet_notes', defaultNotes);
}

async function syncNoteFolders(folders) {
    return syncArrayToSupabase('note_folders', 'ulmet_note_folders', folders);
}

async function loadNoteFolders(defaultFolders = ['Kuliah', 'Riset & KKI', 'Organisasi', 'Pribadi']) {
    return loadArrayFromSupabase('note_folders', 'ulmet_note_folders', defaultFolders);
}

async function syncExpenses(expenses) {
    return syncArrayToSupabase('expenses', 'ulmet_keuangan_expenses', expenses);
}

async function loadExpenses() {
    return loadArrayFromSupabase('expenses', 'ulmet_keuangan_expenses', []);
}

async function syncBudgetConfig(config) {
    return syncConfigToSupabase('budget_config', 'ulmet_keuangan_config', config);
}

async function loadBudgetConfig() {
    return loadConfigFromSupabase('budget_config', 'ulmet_keuangan_config', { budget: 1000000, days: 30 });
}

async function syncPatungan(patungan) {
    return syncArrayToSupabase('patungan', 'ulmet_keuangan_patungan', patungan);
}

async function loadPatunganData() {
    return loadArrayFromSupabase('patungan', 'ulmet_keuangan_patungan', []);
}

async function syncWishlist(wishlist) {
    return syncArrayToSupabase('wishlist', 'ulmet_keuangan_wishlist', wishlist);
}

async function loadWishlistData() {
    return loadArrayFromSupabase('wishlist', 'ulmet_keuangan_wishlist', []);
}

async function syncCategories(categories) {
    return syncArrayToSupabase('expense_categories', 'ulmet_keuangan_categories', categories);
}

async function loadCategoriesData() {
    const defaultCats = [
        { id: "makan", name: "Makan & Minum", icon: "🍜", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
        { id: "kos", name: "Kebutuhan Kos", icon: "🏠", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
        { id: "kuliah", name: "Tugas & Kuliah", icon: "📚", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
        { id: "transport", name: "Bensin & Ojol", icon: "🛵", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
        { id: "jajan", name: "Nongkrong & Hiburan", icon: "☕", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
        { id: "darurat", name: "Darurat & Medis", icon: "💊", color: "bg-red-500/20 text-red-400 border-red-500/30" }
    ];
    return loadArrayFromSupabase('expense_categories', 'ulmet_keuangan_categories', defaultCats);
}

// =============================================
// 5. LOCAL SUPABASE CLIENT MOCK ADAPTER
// Menjamin seluruh pemanggilan getSupabase() di halaman lain tetap berjalan tanpa error
// =============================================

function getSupabase() {
    return {
        auth: {
            async getSession() {
                const s = await getSession();
                return { data: { session: s } };
            },
            async signInWithPassword({ email, password }) {
                const username = emailToUsername(email);
                return loginWithUsername(username, password);
            },
            async signOut() {
                await logoutUser();
                return { error: null };
            }
        },
        from(tableName) {
            return {
                select(fields = '*') {
                    return {
                        eq(col, val) {
                            return {
                                async maybeSingle() {
                                    if (tableName === 'profiles') {
                                        const p = JSON.parse(localStorage.getItem(userKey('ulmet_profile')) || 'null');
                                        return { data: p, error: null };
                                    }
                                    return { data: null, error: null };
                                },
                                async single() {
                                    if (tableName === 'profiles') {
                                        const p = JSON.parse(localStorage.getItem(userKey('ulmet_profile')) || 'null');
                                        return { data: p, error: null };
                                    }
                                    return { data: null, error: null };
                                }
                            };
                        },
                        async maybeSingle() {
                            return { data: null, error: null };
                        }
                    };
                },
                async upsert(rowOrRows) {
                    if (tableName === 'profiles') {
                        const row = Array.isArray(rowOrRows) ? rowOrRows[0] : rowOrRows;
                        if (row) {
                            localStorage.setItem(userKey('ulmet_profile'), JSON.stringify(row));
                        }
                    }
                    return { data: rowOrRows, error: null };
                },
                async delete() {
                    return {
                        eq(col, val) {
                            return { error: null };
                        }
                    };
                }
            };
        },
        storage: {
            from(bucket) {
                return {
                    async upload(filePath, file) {
                        return uploadFile(file, filePath);
                    },
                    getPublicUrl(filePath) {
                        return { data: { publicUrl: getFileUrl(filePath) } };
                    },
                    async remove(paths) {
                        for (const p of paths) {
                            await deleteStorageFile(p);
                        }
                        return { data: paths, error: null };
                    }
                };
            }
        }
    };
}

// =============================================
// 7. NATIVE PWA MICRO-INTERACTIONS: HAPTIC, SOUND & OFFLINE ENGINE
// Standar Aplikasi Native: Getaran Haptic, Efek Suara Web Audio & Indikator Offline
// 100% Client-Side • Tanpa Berkas MP3 Eksternal • 0ms Latensi • Berjalan Offline
// =============================================

let _ulmetAudioCtx = null;

function _getAudioContext() {
    if (!_ulmetAudioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            _ulmetAudioCtx = new AudioContextClass();
        }
    }
    if (_ulmetAudioCtx && _ulmetAudioCtx.state === 'suspended') {
        _ulmetAudioCtx.resume().catch(() => {});
    }
    return _ulmetAudioCtx;
}

/**
 * Getar Haptic Halus di Ponsel (Android & browser pendukung)
 * @param {'tap'|'success'|'streak'|'coin'|'warning'|'delete'} type
 */
function triggerHaptic(type = 'tap') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            switch (type) {
                case 'tap':
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'success':
                case 'done':
                    navigator.vibrate([15, 35, 20]);
                    break;
                case 'streak':
                    navigator.vibrate([15, 25, 15, 25, 30]);
                    break;
                case 'coin':
                case 'money':
                    navigator.vibrate([12, 25, 15]);
                    break;
                case 'warning':
                case 'urgent':
                    navigator.vibrate([40, 50, 40]);
                    break;
                case 'delete':
                    navigator.vibrate(25);
                    break;
                default:
                    navigator.vibrate(12);
            }
        } catch (e) {}
    }
}

/**
 * Pemutar Efek Suara Sintesis ULMET (Web Audio API)
 * Bebas file MP3, hemat kuota 0KB, instan tanpa lag
 * @param {'success'|'streak'|'coin'|'pop'|'timer'|'warning'} type
 */
function playUlmetSound(type = 'success') {
    try {
        const ctx = _getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        if (type === 'success' || type === 'done') {
            // C5 (523.25Hz) -> E5 (659.25Hz) Upbeat Chime
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        } else if (type === 'streak' || type === 'achievement') {
            // C5 -> E5 -> G5 -> C6 Ascending Triumphant Arpeggio
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const noteTime = now + (idx * 0.065);
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);
                gain.gain.setValueAtTime(0.2, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.22);
            });
        } else if (type === 'coin' || type === 'money') {
            // B5 (987.77Hz) -> E6 (1318.51Hz) Arcade Coin Ding
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(987.77, now);
            gain1.gain.setValueAtTime(0.18, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.08);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1318.51, now + 0.07);
            gain2.gain.setValueAtTime(0.22, now + 0.07);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.07);
            osc2.stop(now + 0.35);
        } else if (type === 'pop' || type === 'tap') {
            // Soft Wooden Pop
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'timer' || type === 'bell') {
            // Warm Bell Resonance
            const freqs = [880, 1760];
            freqs.forEach(f => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.6);
            });
        }
    } catch (e) {}
}

/**
 * Kombinasi Haptic + Suara Sekaligus dalam 1 Panggilan Cepat
 */
function feedbackAction(type = 'success') {
    triggerHaptic(type);
    playUlmetSound(type);
}

// =============================================
// 8. PWA OFFLINE / ONLINE REALTIME NOTIFIER
// Menampilkan banner status koneksi elegan ala Native App
// =============================================

function _showConnectionToast(isOnline) {
    let el = document.getElementById('ulmet-connection-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'ulmet-connection-toast';
        el.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 transform -translate-y-6 opacity-0';
        document.body.appendChild(el);
    }

    if (!isOnline) {
        el.innerHTML = `
            <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-400/60 text-slate-100 shadow-2xl backdrop-blur-xl text-xs font-bold pointer-events-auto">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>⚡ Mode Offline Aktif</span>
                <span class="text-slate-400 font-normal hidden sm:inline">• 100% data tersimpan di HP</span>
            </div>
        `;
        triggerHaptic('warning');
    } else {
        el.innerHTML = `
            <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/60 text-slate-100 shadow-2xl backdrop-blur-xl text-xs font-bold pointer-events-auto">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>🟢 Kembali Online</span>
                <span class="text-emerald-300/80 font-normal hidden sm:inline">• Siap sinkronisasi</span>
            </div>
        `;
        triggerHaptic('success');
        playUlmetSound('pop');
    }

    requestAnimationFrame(() => {
        el.classList.remove('-translate-y-6', 'opacity-0');
        el.classList.add('translate-y-0', 'opacity-100');
    });

    if (isOnline) {
        setTimeout(() => {
            el.classList.remove('translate-y-0', 'opacity-100');
            el.classList.add('-translate-y-6', 'opacity-0');
        }, 3200);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => _showConnectionToast(true));
    window.addEventListener('offline', () => _showConnectionToast(false));

    const _unlockAudio = () => {
        _getAudioContext();
        window.removeEventListener('click', _unlockAudio);
        window.removeEventListener('touchstart', _unlockAudio);
    };
    window.addEventListener('click', _unlockAudio, { once: true });
    window.addEventListener('touchstart', _unlockAudio, { once: true });

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.bnav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic('tap');
            });
        });
    });
}
