-- =============================================
-- ULMET — Supabase SQL Schema (Clean & Safe)
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Bersihkan tabel lama jika sebelumnya dibuat tanpa kolom user_id
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS budget_config CASCADE;
DROP TABLE IF EXISTS patungan CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;

-- 1. TABEL PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT,
    panggilan TEXT,
    nim TEXT,
    prodi TEXT,
    semester TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;

-- Semua user yang login bisa melihat daftar profil (untuk fitur admin panel)
CREATE POLICY "Users can view profiles" ON profiles FOR SELECT USING (true);

-- User hanya bisa update profil miliknya sendiri
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User hanya bisa insert profil untuk dirinya sendiri
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. TABEL TASKS (Tugas Mahasiswa)
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    matkul TEXT,
    prioritas TEXT DEFAULT 'rendah',
    deadline TEXT,
    estimasi REAL DEFAULT 0,
    eisenhower TEXT DEFAULT 'do',
    catatan TEXT,
    status TEXT DEFAULT 'belum',
    created_at BIGINT,
    completed_at BIGINT
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tasks" ON tasks;
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- 3. TABEL COURSES (Folder Mata Kuliah)
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own courses" ON courses;
CREATE POLICY "Users manage own courses" ON courses FOR ALL USING (auth.uid() = user_id);

-- 4. TABEL FILES (Metadata File Materi)
CREATE TABLE files (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    course TEXT,
    size TEXT,
    ext TEXT,
    date TEXT,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own files" ON files;
CREATE POLICY "Users manage own files" ON files FOR ALL USING (auth.uid() = user_id);

-- 5. TABEL EXPENSES (Pengeluaran Keuangan)
CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT,
    amount REAL NOT NULL,
    note TEXT,
    date TEXT
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own expenses" ON expenses;
CREATE POLICY "Users manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- 6. TABEL BUDGET_CONFIG (Setting Budget Bulanan — 1 row per user)
CREATE TABLE budget_config (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    budget REAL DEFAULT 0,
    budget_end_date BIGINT DEFAULT 0
);

ALTER TABLE budget_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own budget" ON budget_config;
CREATE POLICY "Users manage own budget" ON budget_config FOR ALL USING (auth.uid() = user_id);

-- 7. TABEL PATUNGAN (Kas & Patungan Kos)
CREATE TABLE patungan (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'Belum',
    type TEXT DEFAULT 'out',
    month TEXT DEFAULT ''
);

ALTER TABLE patungan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own patungan" ON patungan;
CREATE POLICY "Users manage own patungan" ON patungan FOR ALL USING (auth.uid() = user_id);

-- 8. TABEL WISHLIST (Target Nabung)
CREATE TABLE wishlist (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    target REAL DEFAULT 0,
    current REAL DEFAULT 0
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist;
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- 9. TABEL EXPENSE_CATEGORIES (Kategori Custom Keuangan)
CREATE TABLE expense_categories (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    icon TEXT,
    color TEXT
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own categories" ON expense_categories;
CREATE POLICY "Users manage own categories" ON expense_categories FOR ALL USING (auth.uid() = user_id);

-- 10. STORAGE BUCKET untuk file materi
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materi', 'materi', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
CREATE POLICY "Users can upload own files" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'materi' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
CREATE POLICY "Users can view own files" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'materi' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'materi' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Public can read materi files" ON storage.objects;
CREATE POLICY "Public can read materi files" ON storage.objects 
FOR SELECT USING (bucket_id = 'materi');
