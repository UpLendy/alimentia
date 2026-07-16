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

interface AlimentiaRefreshResponse {
  token: string;
  refreshToken: string;
}

// El front nunca guarda el refreshToken: lo lee de la cookie httpOnly,
// pide un access token nuevo a Alimentia y rota la cookie con el
// refreshToken que vuelve (el anterior queda invalidado en el backend).
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No hay sesión activa." },
      { status: 401 }
    );
  }

  const upstream = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!upstream.ok) {
    const response = NextResponse.json(
      { error: "La sesión expiró." },
      { status: 401 }
    );
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const data = (await upstream.json().catch(() => null)) as AlimentiaRefreshResponse | null;

  if (!data?.token || !data?.refreshToken) {
    const response = NextResponse.json(
      { error: "La sesión expiró." },
      { status: 401 }
    );
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const response = NextResponse.json({ token: data.token });
  response.cookies.set(REFRESH_COOKIE, data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return response;
}
