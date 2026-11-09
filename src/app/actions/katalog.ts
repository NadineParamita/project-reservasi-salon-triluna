"use server";

import { prisma } from "@/lib/db";

export async function daftarLayanan() {
  return prisma.layanan.findMany({ where: { aktif: true }, orderBy: { nama: "asc" } });
}

export async function daftarStafUntukLayanan(layananId: string) {
  return prisma.staf.findMany({
    where: { staf_layanan: { some: { layanan_id: layananId } } },
    select: { id: true, nama: true, foto_url: true },
  });
}

export async function daftarGaleri() {
  return prisma.galeri.findMany();
}