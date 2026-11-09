-- =====================================================================
-- 00_semua_sekaligus.sql
-- Menghapus tabel lama (jika ada), membuat tabel, mengisi data contoh,
-- lalu mengecek hasilnya. Cukup tempel SATU KALI lalu Run.
-- Hasil akhir: tabel 12 baris, semuanya harus LULUS.
-- =====================================================================

-- LANGKAH 1: hapus tabel lama (aman walau belum ada)
DROP TABLE IF EXISTS langganan_notifikasi, galeri, pembayaran, reservasi, jam_kerja_staf, staf_layanan, staf, layanan, pengguna CASCADE;

-- LANGKAH 2: buat tabel
-- =====================================================================
-- Migration 001: skema awal Sistem Reservasi Salon / Klinik Kecantikan
-- Database : PostgreSQL (juga berjalan di Supabase)
-- Cara pakai: jalankan file ini sekali pada database kosong.
-- =====================================================================

-- Dibutuhkan agar database bisa menolak jadwal staf yang bentrok
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------
-- 1. pengguna: semua akun (pelanggan, staf, admin)
-- ---------------------------------------------------------------------
CREATE TABLE pengguna (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama           text        NOT NULL CHECK (length(btrim(nama)) > 0),
    email          text        NOT NULL UNIQUE,
    password_hash  text        NOT NULL,
    jenis_kelamin  text        NOT NULL
                   CHECK (jenis_kelamin IN ('laki_laki', 'perempuan')),
    no_hp          text,
    jenis_akun     text        NOT NULL DEFAULT 'pelanggan'
                   CHECK (jenis_akun IN ('pelanggan', 'staf', 'admin')),
    dibuat_pada    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. layanan: daftar layanan salon
-- ---------------------------------------------------------------------
CREATE TABLE layanan (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama          text    NOT NULL UNIQUE CHECK (length(btrim(nama)) > 0),
    deskripsi     text,
    harga         integer NOT NULL CHECK (harga >= 0),
    durasi_menit  integer NOT NULL CHECK (durasi_menit > 0),
    aktif         boolean NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------
-- 3. staf: satu staf terhubung ke tepat satu akun pengguna
-- ---------------------------------------------------------------------
CREATE TABLE staf (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id  uuid NOT NULL UNIQUE REFERENCES pengguna (id) ON DELETE RESTRICT,
    nama         text NOT NULL CHECK (length(btrim(nama)) > 0),
    foto_url     text
);

-- ---------------------------------------------------------------------
-- 4. staf_layanan: staf mana bisa mengerjakan layanan apa
-- ---------------------------------------------------------------------
CREATE TABLE staf_layanan (
    staf_id     uuid NOT NULL REFERENCES staf (id)    ON DELETE CASCADE,
    layanan_id  uuid NOT NULL REFERENCES layanan (id) ON DELETE CASCADE,
    PRIMARY KEY (staf_id, layanan_id)
);

-- ---------------------------------------------------------------------
-- 5. jam_kerja_staf: hari dan jam kerja tiap staf
--    hari: 0 = Minggu, 1 = Senin, ... 6 = Sabtu
-- ---------------------------------------------------------------------
CREATE TABLE jam_kerja_staf (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    staf_id      uuid     NOT NULL REFERENCES staf (id) ON DELETE CASCADE,
    hari         smallint NOT NULL CHECK (hari BETWEEN 0 AND 6),
    jam_mulai    time     NOT NULL,
    jam_selesai  time     NOT NULL,
    CHECK (jam_selesai > jam_mulai),
    UNIQUE (staf_id, hari)
);

-- ---------------------------------------------------------------------
-- 6. reservasi
--    Aturan terpenting: satu staf tidak boleh punya dua reservasi aktif
--    pada rentang waktu yang saling tumpang tindih (constraint
--    reservasi_tanpa_bentrok di bawah). Reservasi yang dibatalkan
--    tidak dihitung, jadi jam itu bisa dipesan lagi.
-- ---------------------------------------------------------------------
CREATE TABLE reservasi (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pelanggan_id  uuid    NOT NULL REFERENCES pengguna (id) ON DELETE RESTRICT,
    staf_id       uuid    NOT NULL REFERENCES staf (id)     ON DELETE RESTRICT,
    layanan_id    uuid    NOT NULL REFERENCES layanan (id)  ON DELETE RESTRICT,
    tanggal       date    NOT NULL,
    jam_mulai     time    NOT NULL,
    jam_selesai   time    NOT NULL,
    status        text    NOT NULL DEFAULT 'menunggu'
                  CHECK (status IN ('menunggu', 'dikonfirmasi', 'sedang_dikerjakan', 'selesai', 'dibatalkan')),
    total_biaya   integer NOT NULL CHECK (total_biaya >= 0),
    dibuat_pada   timestamptz NOT NULL DEFAULT now(),
    CHECK (jam_selesai > jam_mulai)
);

-- Aturan anti-bentrok dipasang lewat DO + EXECUTE karena SQL Editor Supabase
-- gagal membaca sintaks EXCLUDE jika ditulis langsung. Hasilnya sama persis.
DO $do$
BEGIN
  EXECUTE $sql$
    ALTER TABLE reservasi
      ADD CONSTRAINT reservasi_tanpa_bentrok
      EXCLUDE USING gist (
        staf_id WITH =,
        tsrange(tanggal + jam_mulai, tanggal + jam_selesai, '[)') WITH &&
      ) WHERE (status <> 'dibatalkan')
  $sql$;
END
$do$;

CREATE INDEX idx_reservasi_pelanggan   ON reservasi (pelanggan_id);
CREATE INDEX idx_reservasi_staf_tgl    ON reservasi (staf_id, tanggal);
CREATE INDEX idx_reservasi_status      ON reservasi (status);

-- ---------------------------------------------------------------------
-- 7. pembayaran (hanya dicatat, tanpa payment gateway)
-- ---------------------------------------------------------------------
CREATE TABLE pembayaran (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reservasi_id  uuid    NOT NULL REFERENCES reservasi (id) ON DELETE RESTRICT,
    jumlah        integer NOT NULL CHECK (jumlah > 0),
    metode        text    NOT NULL CHECK (metode IN ('tunai', 'transfer')),
    status        text    NOT NULL DEFAULT 'belum_bayar'
                  CHECK (status IN ('belum_bayar', 'lunas')),
    dibayar_pada  timestamptz
);

CREATE INDEX idx_pembayaran_reservasi ON pembayaran (reservasi_id);

-- ---------------------------------------------------------------------
-- 8. galeri: foto disimpan di storage, tabel ini hanya menyimpan alamatnya
-- ---------------------------------------------------------------------
CREATE TABLE galeri (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    foto_url    text NOT NULL,
    keterangan  text
);

-- ---------------------------------------------------------------------
-- 9. langganan_notifikasi (Web Push) - hanya jika fitur ini wajib
--    kunci_langganan berisi {"p256dh": "...", "auth": "..."} dari browser
-- ---------------------------------------------------------------------
CREATE TABLE langganan_notifikasi (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id      uuid  NOT NULL REFERENCES pengguna (id) ON DELETE CASCADE,
    endpoint         text  NOT NULL UNIQUE,
    kunci_langganan  jsonb NOT NULL
                     CHECK ((kunci_langganan -> 'p256dh') IS NOT NULL AND (kunci_langganan -> 'auth') IS NOT NULL)
);

CREATE INDEX idx_langganan_pengguna ON langganan_notifikasi (pengguna_id);

-- ---------------------------------------------------------------------
-- 10. Keamanan (penting jika memakai Supabase)
--     Supabase otomatis membuka tabel di schema public lewat Data API
--     (PostgREST). Tanpa RLS, siapa pun yang tahu kunci publik bisa
--     membaca tabel. Dengan RLS aktif dan TANPA policy, Data API tidak
--     bisa mengakses tabel sama sekali. Backend Next.js tetap bisa
--     membaca dan menulis karena terhubung langsung sebagai role
--     "postgres" yang melewati RLS. Di PostgreSQL biasa, perintah ini
--     tidak berpengaruh pada koneksi pemilik tabel.
-- ---------------------------------------------------------------------
ALTER TABLE pengguna             ENABLE ROW LEVEL SECURITY;
ALTER TABLE layanan              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staf                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE staf_layanan         ENABLE ROW LEVEL SECURITY;
ALTER TABLE jam_kerja_staf       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservasi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran           ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeri               ENABLE ROW LEVEL SECURITY;
ALTER TABLE langganan_notifikasi ENABLE ROW LEVEL SECURITY;

-- LANGKAH 3: isi data contoh
-- =====================================================================
-- Seed 002: data contoh untuk demo
-- Jalankan SETELAH 001_init.sql, pada database yang masih kosong.
-- Semua akun contoh memakai password:  Password123!
-- (hanya untuk demo; jangan dipakai di data sungguhan)
-- Password disimpan sebagai hash bcrypt, jadi backend harus memakai
-- bcrypt (misalnya paket bcrypt atau bcryptjs) agar login berhasil.
-- Semua identitas di bawah ini fiktif.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Akun: 1 admin, 3 staf, 4 pelanggan
-- ---------------------------------------------------------------------
INSERT INTO pengguna (nama, email, password_hash, jenis_kelamin, no_hp, jenis_akun) VALUES
 ('Admin Salon',  'admin@example.com', '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'perempuan', '081200000001', 'admin'),
 ('Rina Staf',    'rina@example.com',  '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'perempuan', '081200000002', 'staf'),
 ('Dewi Staf',    'dewi@example.com',  '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'perempuan', '081200000003', 'staf'),
 ('Maya Staf',    'maya@example.com',  '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'perempuan', '081200000004', 'staf'),
 ('Sinta',        'sinta@example.com', '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'perempuan', '081200000011', 'pelanggan'),
 ('Budi',         'budi@example.com',  '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'laki_laki', '081200000012', 'pelanggan'),
 ('Ayu',          'ayu@example.com',   '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'perempuan', '081200000013', 'pelanggan'),
 ('Tono',         'tono@example.com',  '$2b$10$d79Cp21O/KB4/waqbykR1OZVZeji1mHujJrGcqWvm6cwSQ4XohdFm', 'laki_laki', '081200000014', 'pelanggan');

-- ---------------------------------------------------------------------
-- Layanan (6)
-- ---------------------------------------------------------------------
INSERT INTO layanan (nama, deskripsi, harga, durasi_menit) VALUES
 ('Potong Rambut Wanita', 'Potong dan styling rambut wanita',          75000,  60),
 ('Potong Rambut Pria',   'Potong rambut pria',                        45000,  30),
 ('Creambath',            'Perawatan rambut dan pijat kepala',        120000,  60),
 ('Facial Brightening',   'Perawatan wajah untuk mencerahkan kulit',  180000,  75),
 ('Manicure',             'Perawatan kuku tangan',                     80000,  45),
 ('Hair Coloring',        'Pewarnaan rambut',                         350000, 120);

-- ---------------------------------------------------------------------
-- Staf (terhubung ke akun jenis staf)
-- ---------------------------------------------------------------------
INSERT INTO staf (pengguna_id, nama)
SELECT id, replace(nama, ' Staf', '') FROM pengguna WHERE jenis_akun = 'staf';

-- Layanan yang dikuasai tiap staf
INSERT INTO staf_layanan (staf_id, layanan_id)
SELECT s.id, l.id
FROM (VALUES
  ('Rina', 'Potong Rambut Wanita'), ('Rina', 'Potong Rambut Pria'),
  ('Rina', 'Creambath'),            ('Rina', 'Hair Coloring'),
  ('Dewi', 'Facial Brightening'),   ('Dewi', 'Manicure'), ('Dewi', 'Creambath'),
  ('Maya', 'Potong Rambut Wanita'), ('Maya', 'Manicure'), ('Maya', 'Facial Brightening')
) AS v(staf_nama, layanan_nama)
JOIN staf s    ON s.nama = v.staf_nama
JOIN layanan l ON l.nama = v.layanan_nama;

-- Jam kerja (hari: 0 = Minggu, 1 = Senin, ... 6 = Sabtu)
INSERT INTO jam_kerja_staf (staf_id, hari, jam_mulai, jam_selesai)
SELECT s.id, h.hari, v.jam_mulai::time, v.jam_selesai::time
FROM (VALUES
  ('Rina', 1, 6, '09:00', '17:00'),   -- Senin-Sabtu
  ('Dewi', 2, 6, '10:00', '18:00'),   -- Selasa-Sabtu
  ('Maya', 1, 5, '09:00', '16:00')    -- Senin-Jumat
) AS v(staf_nama, hari_awal, hari_akhir, jam_mulai, jam_selesai)
JOIN staf s ON s.nama = v.staf_nama
CROSS JOIN LATERAL generate_series(v.hari_awal, v.hari_akhir) AS h(hari);

-- ---------------------------------------------------------------------
-- Reservasi (8) dengan tanggal, staf, dan status yang bervariasi.
-- total_biaya diambil dari harga layanan saat itu.
-- Reservasi no. 7 dibatalkan, lalu jam yang sama dipesan lagi (no. 8),
-- untuk menunjukkan bahwa jam dari reservasi batal bisa dipakai lagi.
-- ---------------------------------------------------------------------
INSERT INTO reservasi (pelanggan_id, staf_id, layanan_id, tanggal, jam_mulai, jam_selesai, status, total_biaya)
SELECT p.id, s.id, l.id, v.tanggal::date, v.mulai::time, v.selesai::time, v.status, l.harga
FROM (VALUES
  ('sinta@example.com', 'Rina', 'Potong Rambut Wanita', '2026-11-02', '10:00', '11:00', 'selesai'),
  ('budi@example.com',  'Rina', 'Potong Rambut Pria',   '2026-11-03', '14:00', '14:30', 'selesai'),
  ('ayu@example.com',   'Dewi', 'Facial Brightening',   '2026-11-05', '11:00', '12:15', 'selesai'),
  ('ayu@example.com',   'Rina', 'Potong Rambut Wanita', '2026-11-09', '09:00', '10:00', 'sedang_dikerjakan'),
  ('sinta@example.com', 'Maya', 'Manicure',             '2026-11-09', '13:00', '13:45', 'dikonfirmasi'),
  ('tono@example.com',  'Rina', 'Creambath',            '2026-11-10', '10:00', '11:00', 'menunggu'),
  ('budi@example.com',  'Rina', 'Hair Coloring',        '2026-11-11', '09:00', '11:00', 'dibatalkan'),
  ('sinta@example.com', 'Rina', 'Hair Coloring',        '2026-11-11', '09:00', '11:00', 'menunggu')
) AS v(email, staf_nama, layanan_nama, tanggal, mulai, selesai, status)
JOIN pengguna p ON p.email = v.email
JOIN staf s     ON s.nama = v.staf_nama
JOIN layanan l  ON l.nama = v.layanan_nama;

-- ---------------------------------------------------------------------
-- Pembayaran (untuk reservasi yang sudah selesai dan satu yang belum bayar)
-- ---------------------------------------------------------------------
INSERT INTO pembayaran (reservasi_id, jumlah, metode, status, dibayar_pada)
SELECT r.id, r.total_biaya, v.metode, v.status,
       CASE WHEN v.status = 'lunas' THEN (r.tanggal + r.jam_selesai)::timestamptz END
FROM (VALUES
  ('sinta@example.com', '2026-11-02', 'tunai',    'lunas'),
  ('budi@example.com',  '2026-11-03', 'transfer', 'lunas'),
  ('ayu@example.com',   '2026-11-05', 'transfer', 'lunas'),
  ('sinta@example.com', '2026-11-09', 'tunai',    'belum_bayar')
) AS v(email, tanggal, metode, status)
JOIN pengguna p  ON p.email = v.email
JOIN reservasi r ON r.pelanggan_id = p.id AND r.tanggal = v.tanggal::date AND r.status <> 'dibatalkan';

-- ---------------------------------------------------------------------
-- Galeri (alamat contoh; ganti dengan alamat foto di storage setelah upload)
-- ---------------------------------------------------------------------
INSERT INTO galeri (foto_url, keterangan) VALUES
 ('https://example.com/galeri/ruang-salon.jpg',   'Ruang salon'),
 ('https://example.com/galeri/area-facial.jpg',   'Area perawatan wajah'),
 ('https://example.com/galeri/hasil-potong.jpg',  'Hasil potong rambut'),
 ('https://example.com/galeri/hasil-warna.jpg',   'Hasil pewarnaan rambut');

-- LANGKAH 4: pengecekan
-- =====================================================================
-- 003_cek_database.sql  —  pengecekan tugas 2, 3, dan 4 (Database-Infra)
-- Jalankan SETELAH 001_init.sql dan 002_seed.sql.
-- Hasil: tabel berisi daftar pengecekan. Semua baris harus berstatus LULUS.
-- Skrip ini tidak mengubah data (semua percobaan data salah akan ditolak).
-- =====================================================================

CREATE TEMP TABLE hasil (no serial, tugas text, pengecekan text, status text);

-- ---------- Tugas 2: Migration ----------
INSERT INTO hasil (tugas, pengecekan, status)
SELECT 'Tugas 2 Migration', 'Ada 9 tabel dari migration',
       CASE WHEN count(*) = 9 THEN 'LULUS' ELSE 'GAGAL (ada ' || count(*) || ' tabel)' END
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pengguna','layanan','staf','staf_layanan','jam_kerja_staf',
                     'reservasi','pembayaran','galeri','langganan_notifikasi');

-- ---------- Tugas 3: Constraint dan index ----------
INSERT INTO hasil (tugas, pengecekan, status)
SELECT 'Tugas 3 Constraint', 'Index tersedia (minimal 4 index buatan sendiri)',
       CASE WHEN count(*) >= 4 THEN 'LULUS' ELSE 'GAGAL' END
FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx\_%';

DO $$
DECLARE
  v_staf uuid := (SELECT id FROM staf WHERE nama = 'Rina');
  v_pel  uuid := (SELECT id FROM pengguna WHERE email = 'budi@example.com');
  v_lay  uuid := (SELECT id FROM layanan WHERE nama = 'Creambath');
BEGIN
  -- Harga negatif harus ditolak
  BEGIN
    INSERT INTO layanan (nama, harga, durasi_menit) VALUES ('Uji harga', -1, 30);
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Harga negatif ditolak', 'GAGAL');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Harga negatif ditolak', 'LULUS');
  END;

  -- Durasi 0 harus ditolak
  BEGIN
    INSERT INTO layanan (nama, harga, durasi_menit) VALUES ('Uji durasi', 1000, 0);
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Durasi 0 menit ditolak', 'GAGAL');
  EXCEPTION WHEN check_violation THEN
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Durasi 0 menit ditolak', 'LULUS');
  END;

  -- Email kembar harus ditolak
  BEGIN
    INSERT INTO pengguna (nama, email, password_hash, jenis_kelamin)
    VALUES ('Uji', 'sinta@example.com', 'h', 'perempuan');
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Email kembar ditolak', 'GAGAL');
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Email kembar ditolak', 'LULUS');
  END;

  -- Kolom wajib kosong harus ditolak
  BEGIN
    INSERT INTO pengguna (nama, email, password_hash) VALUES ('Uji', 'uji@example.com', 'h');
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Kolom wajib (jenis kelamin) kosong ditolak', 'GAGAL');
  EXCEPTION WHEN not_null_violation THEN
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Kolom wajib (jenis kelamin) kosong ditolak', 'LULUS');
  END;

  -- Staf yang tidak ada (relasi rusak) harus ditolak
  BEGIN
    INSERT INTO reservasi (pelanggan_id, staf_id, layanan_id, tanggal, jam_mulai, jam_selesai, total_biaya)
    VALUES (v_pel, gen_random_uuid(), v_lay, '2026-12-01', '10:00', '11:00', 1000);
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Reservasi ke staf yang tidak ada ditolak', 'GAGAL');
  EXCEPTION WHEN foreign_key_violation THEN
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Reservasi ke staf yang tidak ada ditolak', 'LULUS');
  END;

  -- Jadwal staf bentrok harus ditolak (Rina sudah punya Creambath 10:00-11:00 pada 2026-11-10)
  BEGIN
    INSERT INTO reservasi (pelanggan_id, staf_id, layanan_id, tanggal, jam_mulai, jam_selesai, total_biaya)
    VALUES (v_pel, v_staf, v_lay, '2026-11-10', '10:30', '11:30', 120000);
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Jadwal staf bentrok ditolak', 'GAGAL');
  EXCEPTION WHEN exclusion_violation THEN
    INSERT INTO hasil (tugas, pengecekan, status) VALUES ('Tugas 3 Constraint', 'Jadwal staf bentrok ditolak', 'LULUS');
  END;
END $$;

-- ---------- Tugas 4: Data contoh ----------
INSERT INTO hasil (tugas, pengecekan, status)
SELECT 'Tugas 4 Seed', 'Minimal 5 layanan (ada ' || count(*) || ')',
       CASE WHEN count(*) >= 5 THEN 'LULUS' ELSE 'GAGAL' END FROM layanan;

INSERT INTO hasil (tugas, pengecekan, status)
SELECT 'Tugas 4 Seed', 'Minimal 5 reservasi (ada ' || count(*) || ')',
       CASE WHEN count(*) >= 5 THEN 'LULUS' ELSE 'GAGAL' END FROM reservasi;

INSERT INTO hasil (tugas, pengecekan, status)
SELECT 'Tugas 4 Seed', 'Reservasi bervariasi: minimal 3 status, 2 staf, 3 tanggal',
       CASE WHEN count(DISTINCT status) >= 3 AND count(DISTINCT staf_id) >= 2
                 AND count(DISTINCT tanggal) >= 3 THEN 'LULUS' ELSE 'GAGAL' END
FROM reservasi;

INSERT INTO hasil (tugas, pengecekan, status)
SELECT 'Tugas 4 Seed', 'Ada akun uji untuk 3 jenis akun (pelanggan, staf, admin)',
       CASE WHEN count(DISTINCT jenis_akun) = 3 THEN 'LULUS' ELSE 'GAGAL' END FROM pengguna;

SELECT no, tugas, pengecekan, status FROM hasil ORDER BY no;
