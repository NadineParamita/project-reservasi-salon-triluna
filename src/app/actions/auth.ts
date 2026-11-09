"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema, registrasiSchema, type ActionResult } from "@/lib/zod";
import { buatSession, getSession, hapusSession } from "@/lib/session";

export async function registrasi(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = registrasiSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { nama, email, password, jenis_kelamin, no_hp } = parsed.data;

  const sudahAda = await prisma.pengguna.findUnique({ where: { email } });
  if (sudahAda) return { ok: false, error: "Email sudah terdaftar" };

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.pengguna.create({
    data: { nama, email, password_hash, jenis_kelamin, no_hp: no_hp || null }, // jenis_akun default "pelanggan"
  });

  await buatSession(user.id, user.jenis_akun);
  return { ok: true, data: { id: user.id } };
}

export async function login(input: unknown): Promise<ActionResult<{ jenisAkun: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const user = await prisma.pengguna.findUnique({ where: { email } });
  const cocok = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!user || !cocok) return { ok: false, error: "Email atau password salah" };

  await buatSession(user.id, user.jenis_akun);
  return { ok: true, data: { jenisAkun: user.jenis_akun } };
}

export async function logout(): Promise<ActionResult<null>> {
  await hapusSession();
  return { ok: true, data: null };
}

export async function penggunaSaatIni() {
  const s = await getSession();
  if (!s) return null;
  return prisma.pengguna.findUnique({
    where: { id: s.userId },
    select: { id: true, nama: true, email: true, no_hp: true, jenis_akun: true },
  });
}