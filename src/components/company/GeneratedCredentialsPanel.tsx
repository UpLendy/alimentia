"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldAlert } from "lucide-react";

interface GeneratedCredentialsPanelProps {
  companyName: string;
  email: string;
  password: string;
  onClose: () => void;
}

// Única vez que el backend devuelve la contraseña en texto plano
// (POST /companies -> generatedPassword). No hay click-fuera-para-cerrar
// ni botón X: cerrar es una acción explícita y requiere confirmar que la
// contraseña ya se guardó, porque después de este cierre no se vuelve a
// mostrar.
export function GeneratedCredentialsPanel({ companyName, email, password, onClose }: GeneratedCredentialsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API puede fallar sin permisos; la contraseña sigue
      // visible en pantalla para copiarla manualmente.
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-amber-300/60 dark:border-amber-500/30 w-full max-w-lg">
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Empresa creada: {companyName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Guarda o comparte estas credenciales ahora con el administrador.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Esta contraseña NO se volverá a mostrar. Si se pierde, deberá restablecerse por otro medio.</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Correo del administrador</label>
              <div className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm font-mono text-slate-900 dark:text-white break-all">
                {email}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Contraseña generada</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm font-mono text-slate-900 dark:text-white break-all">
                  {password}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiada" : "Copiar"}
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedSaved}
              onChange={(e) => setConfirmedSaved(e.target.checked)}
              className="mt-0.5 cursor-pointer"
            />
            Ya guardé o compartí esta contraseña de forma segura.
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!confirmedSaved}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entendido, cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
