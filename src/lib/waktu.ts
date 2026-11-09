export const menitKeTime = (m: number) =>
  new Date(Date.UTC(1970, 0, 1, Math.floor(m / 60), m % 60));

export const timeKeMenit = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();

export const parseJam = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

export const formatJam = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const tanggalKeDate = (s: string) => new Date(`${s}T00:00:00.000Z`);

// 0 = Minggu ... 6 = Sabtu
export const hariDariTanggal = (s: string) => tanggalKeDate(s).getUTCDay();

export function sekarangWIB() {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return {
    tanggal: d.toISOString().slice(0, 10),
    menit: d.getUTCHours() * 60 + d.getUTCMinutes(),
  };
}