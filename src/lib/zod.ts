import { z } from "zod";

// Sesuaikan dengan CHECK constraint di database (lihat bagian cek di bawah)
export const JENIS_KELAMIN = ["laki_laki", "perempuan"] as const;

export const registrasiSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  jenis_kelamin: z.enum(JENIS_KELAMIN, { message: "Jenis kelamin tidak valid" }),
  no_hp: z.string().trim().regex(/^[0-9+]{8,15}$/, "No HP tidak valid").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const reservasiSchema = z.object({
  layanan_id: z.string().uuid(),
  staf_id: z.string().uuid(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:MM"),
});

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };