"use client";

import { useState } from "react";
import { Truck, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";

export default function FormatoTransporte() {
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [placa, setPlaca] = useState("");
  const [conductor, setConductor] = useState("");
  const [limpiezaInterior, setLimpiezaInterior] = useState(true);
  const [ausenciaOlores, setAusenciaOlores] = useState(true);
  const [temperaturaFurgon, setTemperaturaFurgon] = useState("");
  const [temperaturaNoAplica, setTemperaturaNoAplica] = useState(false);
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
  } = useDailyFormSubmit("transporte");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      observations,
      payload: {
        placa,
        conductor,
        limpiezaInterior,
        ausenciaOlores,
        temperaturaFurgon: temperaturaNoAplica ? "no_aplica" : temperaturaFurgon ? Number(temperaturaFurgon) : undefined,
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/formatos" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Formatos
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          Inspección de Vehículos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Control de condiciones sanitarias para distribución y transporte de alimentos.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-8">
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Placa</label>
            <input
              type="text"
              placeholder="Ej: ABC-123"
              required
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Conductor</label>
            <input
              type="text"
              placeholder="Nombre"
              required
              value={conductor}
              onChange={(e) => setConductor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
            className="w-full md:w-1/4 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
          >
            <option value="">Sin especificar</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Condiciones del Furgón</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Limpieza interior</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="limp" checked={limpiezaInterior} onChange={() => setLimpiezaInterior(true)} className="text-blue-600" /> Cumple
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="limp" checked={!limpiezaInterior} onChange={() => setLimpiezaInterior(false)} className="text-red-500" /> No
                </label>
              </div>
            </div>
            <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ausencia de olores extraños</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="olor" checked={ausenciaOlores} onChange={() => setAusenciaOlores(true)} className="text-blue-600" /> Cumple
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="olor" checked={!ausenciaOlores} onChange={() => setAusenciaOlores(false)} className="text-red-500" /> No
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperatura del Furgón (°C)</label>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <input
                type="number"
                step="0.1"
                placeholder="Ej. -18.0"
                disabled={temperaturaNoAplica}
                value={temperaturaFurgon}
                onChange={(e) => setTemperaturaFurgon(e.target.value)}
                className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={temperaturaNoAplica}
                  onChange={(e) => {
                    setTemperaturaNoAplica(e.target.checked);
                    if (e.target.checked) setTemperaturaFurgon("");
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                No aplica (vehículo sin cadena de frío)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones (opcional)</label>
          <textarea
            rows={2}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas adicionales sobre el registro..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none resize-none"
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
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
