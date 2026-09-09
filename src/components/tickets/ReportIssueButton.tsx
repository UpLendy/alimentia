"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareWarning, X, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ApiError, type Ticket, type TicketType } from "@/lib/api";

const TYPE_OPTIONS: { value: TicketType; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "mejora", label: "Mejora" },
  { value: "duda", label: "Duda" },
];

type ToastState = { kind: "success" | "error"; message: string };

// Botón flotante global (montado en AppLayout, visible en toda página
// autenticada, cualquier rol) para reportar bugs/mejoras/dudas encontrados
// durante las pruebas de la plataforma. Consume POST /tickets del backend.
export function ReportIssueButton() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (state: ToastState) => {
    setToast(state);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        aria-label="Reportar problema"
      >
        <MessageSquareWarning className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-semibold">Reportar problema</span>
      </button>

      {isModalOpen && (
        <ReportIssueModal
          pathname={pathname ?? "/"}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            showToast({ kind: "success", message: "¡Gracias! Tu reporte fue enviado." });
          }}
          onError={(message) => showToast({ kind: "error", message })}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm text-sm font-medium ${
            toast.kind === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

function ReportIssueModal({
  pathname,
  onClose,
  onSuccess,
  onError,
}: {
  pathname: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TicketType>("bug");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post<{ ticket: Ticket }>("/tickets", {
        title,
        description,
        type,
        pageContext: pathname,
      });
      onSuccess();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo enviar el reporte.";
      setFormError(message);
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reportar problema</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cuéntanos qué encontraste durante las pruebas.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
            <input
              type="text"
              required
              minLength={2}
              placeholder="Ej: El botón de guardar no responde"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
            <textarea
              required
              minLength={2}
              rows={4}
              placeholder="Describe el problema o la mejora con el mayor detalle posible"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TicketType)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Página</label>
            <input
              type="text"
              readOnly
              value={pathname}
              className="w-full bg-slate-100 dark:bg-slate-800/60 border border-border rounded-lg px-4 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
