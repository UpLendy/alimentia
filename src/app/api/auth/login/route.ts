import { NextResponse } from "next/server";

// Requerida: sin esta variable no hay forma de contactar el backend.
// Se define en .env.local para desarrollo y en el dashboard de Vercel para
// producción (ver .env.example).
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_API_URL.");
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_COOKIE = "bpm_refresh_token";

interface AlimentiaLoginResponse {
  token: string;
  refreshToken: string;
  user: unknown;
}

// Backend-for-frontend: es el único lugar que ve el refreshToken devuelto
// por Alimentia. Lo guarda en una cookie httpOnly y solo reenvía al
// cliente el access token de corta duración y el perfil del usuario.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      { error: "Correo y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: string }).error)
        : `Error ${upstream.status}`;
    return NextResponse.json({ error: message }, { status: upstream.status });
  }

  const { token, refreshToken, user } = data as AlimentiaLoginResponse;

  const response = NextResponse.json({ token, user });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return response;
}
