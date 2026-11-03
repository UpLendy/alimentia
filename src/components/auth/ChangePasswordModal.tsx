"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, X } from "lucide-react";
import { ApiError, changePasswordRequest, setAccessToken } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

interface ChangePasswordModalProps {
  onClose: () => void;
}

function PasswordInput({
  value,
  onChange,
  disabled,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Formulario de cambio de contraseña, disponible para los 4 roles (el
// backend no restringe /auth/change-password por rol). El backend rota el
// refresh token y emite un access token nuevo; el BFF (src/app/api/auth/
// change-password/route.ts) rota la cookie httpOnly y nos devuelve el token
// nuevo, que guardamos con setAccessToken para que la sesión en memoria
// quede sincronizada y el usuario no sea deslogueado.
export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (newPassword !== confirmPassword) {
      return "La confirmación no coincide con la nueva contraseña.";
    }
    if (newPassword === currentPassword) {
      return "La nueva contraseña debe ser distinta de la actual.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const { token } = await changePasswordRequest({ currentPassword, newPassword });
      setAccessToken(token);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 w-full max-w-md"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cambiar contraseña</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Actualiza tu contraseña de acceso.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Tu contraseña se actualizó correctamente. Tu sesión sigue activa.</span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {formError}
              </div>
            )}

            <fieldset className="space-y-4" disabled={isSubmitting}>
              <div className="space-y-2">
                <label className={labelClass}>Contraseña actual</label>
                <PasswordInput
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Nueva contraseña</label>
                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Mínimo {MIN_PASSWORD_LENGTH} caracteres.</p>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Confirmar nueva contraseña</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
            </fieldset>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
