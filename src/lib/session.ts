import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const NAMA_COOKIE = "salon_session";
const kunci = new TextEncoder().encode(process.env.SESSION_SECRET);

export type Session = { userId: string; jenisAkun: string };

export async function buatSession(userId: string, jenisAkun: string) {
  const token = await new SignJWT({ userId, jenisAkun })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(kunci);

  const store = await cookies();
  store.set(NAMA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(NAMA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, kunci);
    return { userId: payload.userId as string, jenisAkun: payload.jenisAkun as string };
  } catch {
    return null;
  }
}

export async function hapusSession() {
  const store = await cookies();
  store.delete(NAMA_COOKIE);
}