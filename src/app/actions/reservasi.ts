"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { reservasiSchema, type ActionResult } from "@/lib/zod";
import {
  formatJam, hariDariTanggal, menitKeTime, parseJam,
  sekarangWIB, tanggalKeDate, timeKeMenit,
} from "@/lib/waktu";

const STATUS_AWAL = "menunggu";
const STATUS_BATAL = "dibatalkan";
const LANGKAH_SLOT_MENIT = 30;

type Layanan = { id: string; harga: number; durasi_menit: number; aktif: boolean };

/** Cek semua aturan jadwal. Return pesan error, atau null kalau aman. */
async function periksaJadwal(
  stafId: string, layanan: Layanan, tanggal: string, mulai: number
): Promise<string | null> {
  const selesai = mulai + layanan.durasi_menit;

  // 1. Tidak boleh di masa lalu
  const now = sekarangWIB();
  if (tanggal < now.tanggal) return "Tanggal sudah lewat";
  if (tanggal === now.tanggal && mulai <= now.menit) return "Jam sudah lewat";

  // 2. Staf bisa mengerjakan layanan ini
  const bisa = await prisma.staf_layanan.findUnique({
    where: { staf_id_layanan_id: { staf_id: stafId, layanan_id: layanan.id } },
  });
  if (!bisa) return "Staf ini tidak melayani layanan tersebut";

  // 3. Dalam jam kerja staf di hari itu
  const jadwal = await prisma.jam_kerja_staf.findUnique({
    where: { staf_id_hari: { staf_id: stafId, hari: hariDariTanggal(tanggal) } },
  });
  if (!jadwal) return "Staf tidak bekerja di hari tersebut";
  if (mulai < timeKeMenit(jadwal.jam_mulai) || selesai > timeKeMenit(jadwal.jam_selesai)) {
    return `Di luar jam kerja staf (${formatJam(timeKeMenit(jadwal.jam_mulai))}-${formatJam(timeKeMenit(jadwal.jam_selesai))})`;
  }

  // 4. Tidak bentrok dengan reservasi lain (yang belum dibatalkan)
  const bentrok = await prisma.reservasi.findFirst({
    where: {
      staf_id: stafId,
      tanggal: tanggalKeDate(tanggal),
      status: { not: STATUS_BATAL },
      jam_mulai: { lt: menitKeTime(selesai) },
      jam_selesai: { gt: menitKeTime(mulai) },
    },
    select: { id: true },
  });
  if (bentrok) return "Jadwal bentrok dengan reservasi lain, pilih jam lain";

  return null;
}

export async function buatReservasi(input: unknown) {
  const session = await getSession();
  if (!session) return { ok: false, error: "Silakan login dulu" } as const;

  const parsed = reservasiSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid", fieldErrors: parsed.error.flatten().fieldErrors } as const;
  }
  const { layanan_id, staf_id, tanggal, jam_mulai } = parsed.data;

  const layanan = await prisma.layanan.findUnique({ where: { id: layanan_id } });
  if (!layanan || !layanan.aktif) return { ok: false, error: "Layanan tidak tersedia" } as const;

  const mulai = parseJam(jam_mulai);
  const pesan = await periksaJadwal(staf_id, layanan, tanggal, mulai);
  if (pesan) return { ok: false, error: pesan } as const;

  try {
    const r = await prisma.reservasi.create({
      data: {
        pelanggan_id: session.userId, // dari session, bukan dari client
        staf_id,
        layanan_id,
        tanggal: tanggalKeDate(tanggal),
        jam_mulai: menitKeTime(mulai),
        jam_selesai: menitKeTime(mulai + layanan.durasi_menit),
        status: STATUS_AWAL,
        total_biaya: layanan.harga, // dihitung di server
      },
    });
    return { ok: true, data: { id: r.id, total_biaya: r.total_biaya } } as const;
  } catch (e: any) {
    // Pengaman: dua orang booking di detik yang sama, ditolak constraint database
    const teks = `${e?.message ?? ""} ${JSON.stringify(e?.meta ?? {})} ${e?.code ?? ""}`;
    if (teks.includes("reservasi_tanpa_bentrok") || teks.includes("23P01")) {
      return { ok: false, error: "Jadwal baru saja diambil orang lain, pilih jam lain" } as const;
    }
    console.error(e);
    return { ok: false, error: "Gagal membuat reservasi" } as const;
  }
}

/** Untuk frontend: daftar jam mulai yang masih kosong. */
export async function slotTersedia(stafId: string, layananId: string, tanggal: string) {
  const layanan = await prisma.layanan.findUnique({ where: { id: layananId } });
  if (!layanan || !layanan.aktif) return [] as string[];

  const jadwal = await prisma.jam_kerja_staf.findUnique({
    where: { staf_id_hari: { staf_id: stafId, hari: hariDariTanggal(tanggal) } },
  });
  if (!jadwal) return [];

  const terisi = await prisma.reservasi.findMany({
    where: { staf_id: stafId, tanggal: tanggalKeDate(tanggal), status: { not: STATUS_BATAL } },
    select: { jam_mulai: true, jam_selesai: true },
  });

  const now = sekarangWIB();
  const buka = timeKeMenit(jadwal.jam_mulai);
  const tutup = timeKeMenit(jadwal.jam_selesai);
  const hasil: string[] = [];

  for (let m = buka; m + layanan.durasi_menit <= tutup; m += LANGKAH_SLOT_MENIT) {
    if (tanggal < now.tanggal) break;
    if (tanggal === now.tanggal && m <= now.menit) continue;
    const e = m + layanan.durasi_menit;
    const bentrok = terisi.some((r) => timeKeMenit(r.jam_mulai) < e && timeKeMenit(r.jam_selesai) > m);
    if (!bentrok) hasil.push(formatJam(m));
  }
  return hasil;
}

export async function reservasiSaya() {
  const session = await getSession();
  if (!session) return [];
  const list = await prisma.reservasi.findMany({
    where: { pelanggan_id: session.userId },
    include: { layanan: { select: { nama: true } }, staf: { select: { nama: true } } },
    orderBy: [{ tanggal: "desc" }, { jam_mulai: "desc" }],
  });
  return list.map((r) => ({
    id: r.id,
    layanan: r.layanan.nama,
    staf: r.staf.nama,
    tanggal: r.tanggal.toISOString().slice(0, 10),
    jam_mulai: formatJam(timeKeMenit(r.jam_mulai)),
    jam_selesai: formatJam(timeKeMenit(r.jam_selesai)),
    status: r.status,
    total_biaya: r.total_biaya,
  }));
}

export async function batalkanReservasi(id: string): Promise<ActionResult<null>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Silakan login dulu" };

  const r = await prisma.reservasi.findUnique({ where: { id } });
  if (!r || r.pelanggan_id !== session.userId) return { ok: false, error: "Reservasi tidak ditemukan" };
  if (r.status === STATUS_BATAL || r.status === "selesai") {
    return { ok: false, error: "Reservasi ini tidak bisa dibatalkan" };
  }
  await prisma.reservasi.update({ where: { id }, data: { status: STATUS_BATAL } });
  return { ok: true, data: null };
}