import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Requerida: sin esta variable no hay forma de contactar el backend.
// Se define en .env.local para desarrollo y en el dashboard de Vercel para
// producción (ver .env.example).
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_API_URL.");
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_COOKIE = "bpm_refresh_token";

// Revoca el refreshToken del lado del servidor antes de olvidarlo: si
// Alimentia no responde igual limpiamos la cookie, para no dejar al
// usuario atascado con una sesión que ya no puede usar.
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
