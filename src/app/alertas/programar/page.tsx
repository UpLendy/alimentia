"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  api,
  ApiError,
  type ScheduledEvent,
  type ScheduledEventServiceType,
  type ValidationErrorDetail,
} from "@/lib/api";
import { useSedes } from "@/hooks/useSedes";

export default function ProgramarAlerta() {
  const { sedes, sedesError, sedeId, setSedeId, showSedeSelector } = useSedes();

  const [serviceType, setServiceType] = useState<ScheduledEventServiceType>("agua");
  const [proposedDate, setProposedDate] = useState("");
  const [providerName, setProviderName] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<ValidationErrorDetail[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sedeId) {
      setSaveState("error");
      setErrorMessage("Selecciona una sede antes de programar el evento.");
      setValidationDetails(null);
      return;
    }

    setIsSubmitting(true);
    setSaveState("idle");
    setErrorMessage(null);
    setValidationDetails(null);

    try {
      await api.post<{ scheduledEvent: ScheduledEvent }>("/scheduled-events", {
        sedeId,
        serviceType,
        proposedDate,
        providerName: providerName || undefined,
        notes: notes || undefined,
      });
      setSaveState("success");
      setProposedDate("");
      setProviderName("");
      setNotes("");
    } catch (err) {
      setSaveState("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        setValidationDetails(err.details ?? null);
      } else {
        setErrorMessage("No se pudo programar el evento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          Programar Evento / Análisis
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Agenda un muestreo microbiológico, una recolección de residuos o una fumigación con tus proveedores externos.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        <div className="space-y-4">
          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Servicio Requerido</label>
            <select
              required
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ScheduledEventServiceType)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="agua">Análisis Microbiológico de Agua</option>
              <option value="superficies">Frotis de Superficies y Ambientes</option>
              <option value="fumigacion">Control Integral de Plagas (Fumigación)</option>
              <option value="trampas">Mantenimiento Trampa de Grasas</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha Propuesta</label>
              <input
                type="date"
                required
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Proveedor Asignado</label>
              <input
                type="text"
                placeholder="Ej: Laboratorio XYZ"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas Adicionales</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones para la visita..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        {saveState === "success" && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Evento programado con éxito.
          </div>
        )}

        {saveState === "error" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
            {validationDetails && validationDetails.length > 0 && (
              <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                {validationDetails.map((d, i) => (
                  <li key={i}>
                    <span className="font-mono">{d.path}</span>: {d.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/" className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
            Confirmar Programación
          </button>
        </div>
      </form>
    </div>
  );
}
