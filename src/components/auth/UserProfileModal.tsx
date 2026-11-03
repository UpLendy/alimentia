"use client";

import { User, X } from "lucide-react";
import type { AuthUser, UserRole } from "@/lib/api";

const ROLE_LABELS: Record<UserRole, string> = {
  bpm_admin: "Staff BPM Consulting",
  admin: "Administrador",
  supervisor: "Supervisor",
  operario: "Operario",
};

interface UserProfileModalProps {
  user: AuthUser;
  onClose: () => void;
}

// Acción real y mínima para el botón "Perfil de Usuario" (antes sin
// onClick): solo lectura, sin edición — cambiar nombre/correo no tiene
// endpoint propio hoy, y la contraseña ya tiene su propio flujo en
// ChangePasswordModal.
export function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 w-full max-w-sm"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perfil de Usuario</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tu información de cuenta.</p>
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

        <dl className="p-6 space-y-4">
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Nombre completo</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{user.fullName}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Correo</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{user.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Rol</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{ROLE_LABELS[user.role]}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
