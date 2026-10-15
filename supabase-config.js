// =============================================
// ULMET — Supabase Config Terpusat
// Dipakai oleh SEMUA halaman sebagai satu sumber kebenaran
// =============================================

const SUPABASE_URL = 'https://hslwzwpeogxwirzjuukx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbHd6d3Blb2d4d2lyemp1dWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTQ1MTIsImV4cCI6MjEwNDc3MDUxMn0.EZFUeOaGzhD-BonVt2niczXyFRtTYAsiv01mk3_VYAE';

// Inisialisasi Supabase Client (singleton)
let _supabaseClient = null;
function getSupabase() {
    if (!_supabaseClient) {
        if (!window.supabase) {
            console.error('Supabase SDK belum dimuat! Pastikan <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"> ada di <head>.');
            return null;
        }
        _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
}

// =============================================
// USER-SCOPED LOCALSTORAGE
// Setiap key di localStorage diberi prefix user ID
// agar data antar mahasiswa TIDAK AKAN BISA tercampur
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
    return null;
}

/**
 * Simpan user ID aktif saat login
 */
function setCurrentUserId(uid) {
    _cachedUserId = uid;
    if (uid) {
        localStorage.setItem('ulmet_current_uid', uid);
    } else {
        localStorage.removeItem('ulmet_current_uid');
    }
}

/**
 * Hasilkan key localStorage yang diisolasi per akun user.
 * Contoh: userKey('ulmet_tasks') -> 'u_9a8b7c_ulmet_tasks'
 */
function userKey(key) {
    const uid = getCurrentUserId();
    if (uid) return `u_${uid}_${key}`;
    return key;
}

/**
 * Hapus key-key localStorage legacy yang tidak di-scope
 * untuk mencegah kebocoran data antar akun
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
        'ulmet_avatar_photo'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
}

/**
 * Hapus seluruh data cache lokal milik user tertentu
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
// AUTH HELPERS
// =============================================

async function getSession() {
    const sb = getSupabase();
    if (!sb) return null;
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (session && session.user) {
            setCurrentUserId(session.user.id);
        }
        return session;
    } catch (e) {
        console.error('Gagal getSession:', e);
        return null;
    }
}

async function getUserId() {
    const uid = getCurrentUserId();
    if (uid) return uid;
    const session = await getSession();
    return session ? session.user.id : null;
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

// =============================================
// STORAGE HELPERS (Supabase Storage — bucket "materi")
// =============================================
const STORAGE_BUCKET = 'materi';

async function uploadFile(file, folderPath) {
    const sb = getSupabase();
    const userId = await getUserId();
    if (!sb || !userId) return null;

    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const filePath = `${userId}/${folderPath}/${uniqueName}`;

    const { data, error } = await sb.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload gagal:', error);
        throw error;
    }
    return { path: filePath, fullPath: filePath, originalName: file.name };
}

function getFileUrl(filePath) {
    const sb = getSupabase();
    if (!sb || !filePath) return '';
    const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
}

async function deleteStorageFile(filePath) {
    const sb = getSupabase();
    if (!sb || !filePath) return;
    const { error } = await sb.storage.from(STORAGE_BUCKET).remove([filePath]);
    if (error) console.error('Gagal hapus file storage:', error);
}

// =============================================
// DATABASE SYNC — GENERIK (ISOLASI PER USER)
// Pattern: Cloud First / Offline fallback with User-Scoped Cache
// =============================================

/**
 * Sync data array ke Supabase dan localStorage (user-scoped)
 */
async function syncArrayToSupabase(table, localKey, data) {
    const userId = await getUserId();
    
    // Simpan ke cache user yang sedang login (kecualikan dataUrl besar agar tidak kena kuota 5MB)
    try {
        const cleanForLocal = (data || []).map(item => {
            if (item && item.dataUrl && item.dataUrl.length > 50000) {
                const { dataUrl, ...rest } = item;
                return rest;
            }
            return item;
        });
        localStorage.setItem(userKey(localKey), JSON.stringify(cleanForLocal));
    } catch(e) {
        console.warn('localStorage quota warning:', e);
    }
    
    const sb = getSupabase();
    if (!sb || !userId) return; // Mode offline / belum login
    
    try {
        if (Array.isArray(data) && data.length > 0) {
            const rows = data.map(item => ({ ...item, user_id: userId }));
            // Coba upsert terlebih dahulu
            const { error: upsertErr } = await sb.from(table).upsert(rows, { onConflict: 'id' });
            if (upsertErr) {
                // Jika upsert gagal (misal table tanpa constraint id), fallback ke delete lalu insert
                await sb.from(table).delete().eq('user_id', userId);
                const { error: insertErr } = await sb.from(table).insert(rows);
                if (insertErr) console.error(`Sync ${table} insert gagal:`, insertErr);
            } else {
                // Hapus data lama yang sudah dihapus oleh user
                const currentIds = rows.map(r => r.id).filter(id => id !== undefined && id !== null);
                if (currentIds.length > 0) {
                    const isNum = typeof currentIds[0] === 'number';
                    const inClause = isNum ? `(${currentIds.join(',')})` : `(${currentIds.map(id => `"${id}"`).join(',')})`;
                    await sb.from(table).delete().eq('user_id', userId).not('id', 'in', inClause);
                }
            }
        } else {
            await sb.from(table).delete().eq('user_id', userId);
        }
    } catch (e) {
        console.error(`Sync ${table} error:`, e);
    }
}

/**
 * Load data dari Supabase, fallback ke userKey localStorage
 * Safeguard: Jangan pernah menimpa cache lokal dengan [] jika user baru saja membuat data!
 */
async function loadArrayFromSupabase(table, localKey, defaultVal = []) {
    const sb = getSupabase();
    const userId = await getUserId();
    
    // Ambil cache lokal user terlebih dahulu
    let cachedItems = null;
    const rawCached = localStorage.getItem(userKey(localKey));
    if (rawCached !== null) {
        try {
            const parsed = JSON.parse(rawCached);
            if (Array.isArray(parsed)) cachedItems = parsed;
        } catch(e) {}
    }

    if (sb && userId) {
        try {
            const { data, error } = await sb.from(table).select('*').eq('user_id', userId);
            if (!error && Array.isArray(data)) {
                // Safeguard: Jika Supabase mengembalikan 0 baris, tapi cache lokal memiliki data,
                // jangan timpa lokal jadi kosong! Otomatis pulihkan dan unggah ke Supabase.
                if (data.length === 0 && cachedItems && cachedItems.length > 0) {
                    console.log(`[Auto-healing] Mengunggah ${cachedItems.length} data lokal ${table} ke Supabase...`);
                    syncArrayToSupabase(table, localKey, cachedItems);
                    return cachedItems;
                }

                // Berhasil baca dari Supabase
                const cleaned = data.map(row => {
                    const { user_id, ...rest } = row;
                    return rest;
                });
                localStorage.setItem(userKey(localKey), JSON.stringify(cleaned));
                return cleaned;
            }
        } catch (e) {
            console.error(`Load ${table} error:`, e);
        }
    }
    
    // Fallback jika offline atau error
    if (cachedItems !== null) {
        return cachedItems;
    }
    return defaultVal;
}

/**
 * Upsert objek konfigurasi tunggal (budget, settings)
 */
async function syncConfigToSupabase(table, localKey, configObj) {
    const userId = await getUserId();
    localStorage.setItem(userKey(localKey), JSON.stringify(configObj));
    
    const sb = getSupabase();
    if (!sb || !userId) return;
    
    try {
        const { error } = await sb.from(table)
            .upsert({ user_id: userId, ...configObj }, { onConflict: 'user_id' });
        if (error) console.error(`Sync config ${table} gagal:`, error);
    } catch (e) {
        console.error(`Sync config ${table} error:`, e);
    }
}

async function loadConfigFromSupabase(table, localKey, defaultVal = {}) {
    const sb = getSupabase();
    const userId = await getUserId();
    
    if (sb && userId) {
        try {
            const { data, error } = await sb.from(table)
                .select('*').eq('user_id', userId).maybeSingle();
            if (!error) {
                if (data) {
                    const { user_id, ...rest } = data;
                    localStorage.setItem(userKey(localKey), JSON.stringify(rest));
                    return rest;
                } else {
                    // Akun ini belum punya config di Supabase -> gunakan defaultVal bersih!
                    localStorage.setItem(userKey(localKey), JSON.stringify(defaultVal));
                    return defaultVal;
                }
            }
        } catch (e) {
            console.error(`Load config ${table} error:`, e);
        }
    }
    
    const cached = localStorage.getItem(userKey(localKey));
    if (cached !== null) {
        try {
            return JSON.parse(cached);
        } catch(e) {}
    }
    return defaultVal;
}

// =============================================
// MODUL-SPECIFIC SYNC FUNCTIONS
// =============================================

// --- TASKS (Tugas) ---
async function syncTasks(tasks) {
    const sanitized = (tasks || []).map(t => ({
        id: Number(t.id) || Date.now(),
        nama: String(t.nama || ''),
        matkul: String(t.matkul || ''),
        prioritas: String(t.prioritas || 'rendah'),
        deadline: String(t.deadline || ''),
        estimasi: Number(t.estimasi) || 0,
        eisenhower: String(t.eisenhower || 'do'),
        catatan: String(t.catatan || ''),
        status: String(t.status || 'belum'),
        created_at: Number(t.created_at || t.createdAt || Date.now()),
        completed_at: (t.completed_at || t.completedAt) ? Number(t.completed_at || t.completedAt) : null
    }));

    // Simpan ke local user cache dengan kompatibilitas camelCase dan snake_case
    const localTasks = (tasks || []).map(t => ({
        ...t,
        id: Number(t.id) || Date.now(),
        createdAt: Number(t.createdAt || t.created_at || Date.now()),
        created_at: Number(t.created_at || t.createdAt || Date.now()),
        completedAt: (t.completedAt !== undefined && t.completedAt !== null) ? Number(t.completedAt) : (t.completed_at ? Number(t.completed_at) : null),
        completed_at: (t.completed_at !== undefined && t.completed_at !== null) ? Number(t.completed_at) : (t.completedAt ? Number(t.completedAt) : null),
    }));
    try {
        localStorage.setItem(userKey('ulmet_tasks'), JSON.stringify(localTasks));
    } catch(e) {}

    return syncArrayToSupabase('tasks', 'ulmet_tasks', sanitized);
}

async function loadTasks() {
    const raw = await loadArrayFromSupabase('tasks', 'ulmet_tasks', []);
    const normalized = (raw || []).map(t => ({
        ...t,
        id: Number(t.id) || Date.now(),
        createdAt: Number(t.createdAt || t.created_at || Date.now()),
        created_at: Number(t.created_at || t.createdAt || Date.now()),
        completedAt: (t.completedAt !== undefined && t.completedAt !== null) ? Number(t.completedAt) : (t.completed_at ? Number(t.completed_at) : null),
        completed_at: (t.completed_at !== undefined && t.completed_at !== null) ? Number(t.completed_at) : (t.completedAt ? Number(t.completedAt) : null),
    }));
    try {
        localStorage.setItem(userKey('ulmet_tasks'), JSON.stringify(normalized));
    } catch(e) {}
    return normalized;
}

// --- COURSES (Folder Mata Kuliah) ---
async function syncCourses(courses) {
    const stringNames = courses.map(item => typeof item === 'string' ? item : (item && item.name ? item.name : String(item))).filter(Boolean);
    localStorage.setItem(userKey('ulmet_courses'), JSON.stringify(stringNames));
    
    const sb = getSupabase();
    const userId = await getUserId();
    if (!sb || !userId) return;
    
    try {
        await sb.from('courses').delete().eq('user_id', userId);
        if (stringNames.length > 0) {
            const rows = stringNames.map(name => ({ name, user_id: userId }));
            const { error } = await sb.from('courses').insert(rows);
            if (error) console.error('Sync courses gagal:', error);
        }
    } catch (e) {
        console.error('Sync courses error:', e);
    }
}

async function loadCourses(defaultCourses = ['Sastra Arab', 'Filsafat Ilmu', 'Sejarah Kebudayaan']) {
    const sb = getSupabase();
    const userId = await getUserId();
    
    if (sb && userId) {
        try {
            const { data, error } = await sb.from('courses').select('*').eq('user_id', userId);
            if (!error && data && data.length > 0) {
                const names = data.map(row => row.name).filter(Boolean);
                localStorage.setItem(userKey('ulmet_courses'), JSON.stringify(names));
                return names;
            } else if (!error && data && data.length === 0) {
                // Belum ada folder -> inisialisasi default
                await syncCourses(defaultCourses);
                return defaultCourses;
            }
        } catch (e) {
            console.error('Load courses error:', e);
        }
    }
    
    const cached = localStorage.getItem(userKey('ulmet_courses'));
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    return defaultCourses;
}

// --- FILES (Metadata File Materi) ---
async function syncFiles(files) {
    const sanitized = (files || []).map(f => ({
        id: String(f.id),
        name: String(f.name || 'Dokumen'),
        course: String(f.course || 'Umum'),
        size: String(f.size || ''),
        ext: String(f.ext || (f.name ? f.name.split('.').pop() : '')).toLowerCase(),
        date: String(f.date || ''),
        storage_path: f.storage_path ? String(f.storage_path) : null
    }));
    return syncArrayToSupabase('files', 'ulmet_files', sanitized);
}
async function loadFiles() {
    return loadArrayFromSupabase('files', 'ulmet_files', []);
}

// --- EXPENSES (Pengeluaran Keuangan) ---
async function syncExpenses(expenses) {
    return syncArrayToSupabase('expenses', 'ulmet_keuangan_expenses', expenses);
}
async function loadExpenses() {
    return loadArrayFromSupabase('expenses', 'ulmet_keuangan_expenses', []);
}

// --- BUDGET CONFIG ---
async function syncBudgetConfig(config) {
    const budgetVal = Number(config.budget) || 0;
    const daysVal = Number(config.days || config.budget_days) || 30;
    const startDateVal = config.start_date || config.budget_start_date || (new Date().toISOString().slice(0, 10));
    const endDateVal = Number(config.budget_end_date) || (Date.now() + (daysVal * 24 * 60 * 60 * 1000));
    const createdVal = Number(config.created_at) || Date.now();

    const fullConfig = {
        budget: budgetVal,
        days: daysVal,
        start_date: startDateVal,
        created_at: createdVal,
        budget_end_date: endDateVal
    };

    localStorage.setItem(userKey('ulmet_keuangan_budget'), budgetVal);
    localStorage.setItem(userKey('ulmet_keuangan_budget_end_date'), endDateVal);
    localStorage.setItem(userKey('ulmet_keuangan_config'), JSON.stringify(fullConfig));

    // Sinkronisasi ke Supabase (hanya kolom yang valid di schema: budget & budget_end_date)
    const sb = getSupabase();
    const userId = await getUserId();
    if (sb && userId) {
        try {
            const { error } = await sb.from('budget_config')
                .upsert({ user_id: userId, budget: budgetVal, budget_end_date: endDateVal }, { onConflict: 'user_id' });
            if (error) console.error('Sync budget_config to Supabase gagal:', error);
        } catch (e) {
            console.error('Sync budget_config error:', e);
        }
    }
    return fullConfig;
}

async function loadBudgetConfig() {
    let localConfig = {
        budget: 0,
        days: 30,
        start_date: new Date().toISOString().slice(0, 10),
        created_at: Date.now(),
        budget_end_date: 0
    };
    try {
        const raw = localStorage.getItem(userKey('ulmet_keuangan_config'));
        if (raw) {
            const parsed = JSON.parse(raw);
            localConfig = { ...localConfig, ...parsed };
        }
    } catch(e) {}

    const sb = getSupabase();
    const userId = await getUserId();
    if (sb && userId) {
        try {
            const { data, error } = await sb.from('budget_config').select('*').eq('user_id', userId).maybeSingle();
            if (!error && data) {
                const merged = {
                    ...localConfig,
                    budget: Number(data.budget) || localConfig.budget || 0,
                    budget_end_date: Number(data.budget_end_date) || localConfig.budget_end_date || 0
                };
                localStorage.setItem(userKey('ulmet_keuangan_budget'), merged.budget);
                localStorage.setItem(userKey('ulmet_keuangan_budget_end_date'), merged.budget_end_date);
                localStorage.setItem(userKey('ulmet_keuangan_config'), JSON.stringify(merged));
                return merged;
            }
        } catch (e) {
            console.error('Load budget_config from Supabase error:', e);
        }
    }
    return localConfig;
}

// --- PATUNGAN (Kas & Iuran Kos Bulanan) ---
async function syncPatungan(patungan) {
    try {
        localStorage.setItem(userKey('ulmet_keuangan_patungan'), JSON.stringify(patungan || []));
    } catch(e) {}

    const sb = getSupabase();
    const userId = await getUserId();
    if (!sb || !userId) return;

    try {
        if (Array.isArray(patungan) && patungan.length > 0) {
            const rows = patungan.map(p => ({
                id: p.id,
                user_id: userId,
                name: p.name || '',
                amount: Number(p.amount) || 0,
                status: p.isPaid || p.status === 'Lunas' ? 'Lunas' : 'Belum',
                type: p.type || 'out',
                month: p.month || ''
            }));

            let { error } = await sb.from('patungan').upsert(rows, { onConflict: 'id' });
            if (error && error.message && error.message.includes('month')) {
                // Kolom month belum ada di schema remote Supabase user, kirim tanpa kolom month
                const stripped = rows.map(({ month, ...r }) => r);
                await sb.from('patungan').upsert(stripped, { onConflict: 'id' });
            }

            const currentIds = rows.map(r => r.id);
            if (currentIds.length > 0) {
                await sb.from('patungan').delete().eq('user_id', userId).not('id', 'in', `(${currentIds.join(',')})`);
            }
        } else {
            await sb.from('patungan').delete().eq('user_id', userId);
        }
    } catch(err) {
        console.warn('Sync patungan error:', err);
    }
}

async function loadPatunganData() {
    const cached = localStorage.getItem(userKey('ulmet_keuangan_patungan'));
    let localItems = [];
    if (cached) {
        try { localItems = JSON.parse(cached); } catch(e) {}
    }

    const sb = getSupabase();
    const userId = await getUserId();
    if (!sb || !userId) return localItems;

    try {
        const { data, error } = await sb.from('patungan').select('*').eq('user_id', userId);
        if (error) throw error;
        if (Array.isArray(data)) {
            const todayMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
            const merged = data.map(rem => {
                const loc = localItems.find(l => l.id == rem.id);
                return {
                    id: rem.id,
                    name: rem.name,
                    amount: rem.amount,
                    status: rem.status,
                    isPaid: rem.status === 'Lunas',
                    type: rem.type || 'out',
                    month: rem.month || (loc && loc.month ? loc.month : todayMonth),
                    expenseId: loc && loc.expenseId ? loc.expenseId : (rem.status === 'Lunas' ? `exp_pat_${rem.id}` : null)
                };
            });
            localStorage.setItem(userKey('ulmet_keuangan_patungan'), JSON.stringify(merged));
            return merged;
        }
    } catch(e) {
        console.warn('loadPatunganData warning:', e);
    }
    return localItems;
}

// --- WISHLIST (Target Nabung) ---
async function syncWishlist(wishlist) {
    return syncArrayToSupabase('wishlist', 'ulmet_keuangan_wishlist', wishlist);
}
async function loadWishlistData() {
    return loadArrayFromSupabase('wishlist', 'ulmet_keuangan_wishlist', []);
}

// --- CATEGORIES (Kategori Keuangan) ---
async function syncCategories(categories) {
    return syncArrayToSupabase('expense_categories', 'ulmet_keuangan_categories', categories);
}
async function loadCategoriesData() {
    return loadArrayFromSupabase('expense_categories', 'ulmet_keuangan_categories', []);
}

// =============================================
// USERNAME AUTH HELPERS
// Login berbasis Username + Password (tanpa email)
// Di balik layar: username -> username@ulmet.app
// =============================================
const ULMET_EMAIL_DOMAIN = '@ulmet.app';

function usernameToEmail(username) {
    return username.toLowerCase().trim().replace(/\s+/g, '') + ULMET_EMAIL_DOMAIN;
}

function emailToUsername(email) {
    if (!email) return '';
    return email.replace(ULMET_EMAIL_DOMAIN, '');
}

async function loginWithUsername(username, password) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase belum siap');
    const email = usernameToEmail(username);
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Set user ID cache segera setelah login
    if (data && data.user) {
        setCurrentUserId(data.user.id);
        // Bersihkan data legacy un-scoped agar tidak ada residu akun sebelumnya
        clearLegacyLocalStorage();
    }
    return data;
}

async function logoutUser() {
    const sb = getSupabase();
    clearLegacyLocalStorage();
    // Catatan: Jangan hapus user-scoped cache agar history belajar & data lokal
    // mahasiswa tetap aman saat mereka login kembali ke akun yang sama
    setCurrentUserId(null);

    if (sb) {
        try { await sb.auth.signOut(); } catch(e) {}
    }
}
