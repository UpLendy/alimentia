"use client";

import { useState } from "react";
import { Bug, ArrowLeft, Save, Info, Loader2, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";
import { useZones } from "@/hooks/useZones";

export default function FormatoPlagas() {
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [evidencias, setEvidencias] = useState<Record<string, boolean>>({});
  const [observations, setObservations] = useState("");

  const {
    sedes,
    sedesError,
    sedeId,
    setSedeId,
    showSedeSelector,
    isSubmitting,
    saveState,
    errorMessage,
    validationDetails,
    submit,
  } = useDailyFormSubmit("plagas");

  const { zones, zonesLoading, zonesError } = useZones(sedeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      observations,
      payload: {
        areas: zones.map((zone) => ({ area: zone.name, evidencia: evidencias[zone.name] ?? false })),
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href="/formatos"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Formatos
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-2 rounded-xl">
              <Bug className="w-6 h-6" />
            </div>
            Control de Plagas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Inspección visual diaria de las áreas de trabajo para garantizar la ausencia de plagas.
          </p>
        </div>
      </header>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex gap-3 text-blue-800 dark:text-blue-300">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Recuerde revisar esquinas, debajo de los equipos y áreas de almacenamiento. Si marca &quot;Sí&quot; en algún avistamiento, debe registrar la acción correctiva.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-8">
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Inspección</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              <option value="">Sin especificar</option>
              <option value="manana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Lista de Chequeo de Áreas</h3>

          {!sedeId && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
              Selecciona una sede para ver sus zonas.
            </div>
          )}

          {sedeId && zonesLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando zonas...
            </div>
          )}

          {sedeId && !zonesLoading && zonesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {zonesError}
            </div>
          )}

          {sedeId && !zonesLoading && !zonesError && zones.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-4 py-6 rounded-xl text-sm font-medium text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                Esta sede todavía no tiene zonas creadas, agrégalas primero en Configuración.
              </div>
              <Link href="/settings" className="inline-block text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                Ir a Configuración
              </Link>
            </div>
          )}

          {sedeId && !zonesLoading && !zonesError && zones.length > 0 && (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50 gap-4">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{zone.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">¿Evidencia de plagas?</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`area-${zone.id}`}
                        checked={!evidencias[zone.name]}
                        onChange={() => setEvidencias((prev) => ({ ...prev, [zone.name]: false }))}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">No</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`area-${zone.id}`}
                        checked={!!evidencias[zone.name]}
                        onChange={() => setEvidencias((prev) => ({ ...prev, [zone.name]: true }))}
                        className="text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Sí</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones y/o Acciones Correctivas</label>
          <textarea
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Si hubo evidencia de plagas, describa qué encontró y qué acción tomó..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
          />
        </div>

        {saveState === "success" && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Registro guardado con éxito.
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

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || zones.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-emerald-500/30 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
