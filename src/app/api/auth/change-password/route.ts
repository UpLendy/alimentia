import { NextResponse } from "next/server";

// Requerida: sin esta variable no hay forma de contactar el backend.
// Se define en .env.local para desarrollo y en el dashboard de Vercel para
// producción (ver .env.example).
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_API_URL.");
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_COOKIE = "bpm_refresh_token";

interface AlimentiaChangePasswordResponse {
  success: boolean;
  token: string;
  refreshToken: string;
}

// /auth/change-password exige el access token del usuario (no el refresh
// token de la cookie), así que a diferencia de refresh/route.ts reenviamos
// el header Authorization que manda el cliente. El backend revoca todos los
// refresh tokens existentes y emite uno nuevo: igual que en login, este BFF
// es el único que lo ve y lo guarda en la cookie httpOnly, devolviendo al
// cliente solo el access token nuevo para que siga logueado.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.currentPassword !== "string" ||
    typeof body.newPassword !== "string"
  ) {
    return NextResponse.json(
      { error: "Contraseña actual y nueva son requeridas." },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    }),
  });

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: string }).error)
        : `Error ${upstream.status}`;
    const response = NextResponse.json({ error: message }, { status: upstream.status });
    const retryAfter = upstream.headers.get("Retry-After");
    if (retryAfter) response.headers.set("Retry-After", retryAfter);
    return response;
  }

  const { token, refreshToken } = data as AlimentiaChangePasswordResponse;

  const response = NextResponse.json({ token });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return response;
}
