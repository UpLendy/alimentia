"use client";

import { PackageOpen, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";
import { useZones } from "@/hooks/useZones";

const CHECKS = [
  "Productos almacenados sobre estibas (no en el piso)",
  "Separación adecuada entre crudos y cocidos",
  "Rotación PEPS (Primeros en Entrar, Primeros en Salir)",
  "Ausencia de productos vencidos",
  "Productos químicos separados de los alimentos",
  "Empaques íntegros y limpios",
];

export default function FormatoAlmacenamiento() {
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [bodega, setBodega] = useState("");
  const [cumple, setCumple] = useState<Record<string, boolean>>({});
  const [hallazgos, setHallazgos] = useState("");

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
  } = useDailyFormSubmit("almacenamiento");

  const { zones, zonesLoading, zonesError } = useZones(sedeId);

  useEffect(() => {
    if (zones.length === 0) {
      setBodega("");
      return;
    }
    setBodega((prev) => (zones.some((z) => z.name === prev) ? prev : zones[0].name));
  }, [zones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      payload: {
        bodega,
        checks: CHECKS.map((item) => ({ item, cumple: cumple[item] ?? true })),
        hallazgos: hallazgos || undefined,
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/formatos" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Formatos
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 p-2 rounded-xl">
            <PackageOpen className="w-6 h-6" />
          </div>
          Control de Almacenamiento
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Verificación de condiciones en bodegas y cuartos fríos.</p>
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bodega / Cuarto</label>
            {!sedeId ? (
              <select disabled className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none opacity-60">
                <option>Selecciona una sede primero</option>
              </select>
            ) : zonesLoading ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando zonas...
              </div>
            ) : zonesError ? (
              <div className="text-sm text-red-600 dark:text-red-400">{zonesError}</div>
            ) : zones.length === 0 ? (
              <div className="text-xs text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Esta sede no tiene zonas creadas.{" "}
                  <Link href="/settings" className="underline font-semibold">
                    Créalas primero en Configuración
                  </Link>
                  .
                </span>
              </div>
            ) : (
              <select
                required
                value={bodega}
                onChange={(e) => setBodega(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            >
              <option value="">Sin especificar</option>
              <option value="manana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Checklist de Cumplimiento</h3>
          <div className="space-y-3">
            {CHECKS.map((check) => (
              <div key={check} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50 gap-4">
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{check}</span>
                <div className="flex gap-4 shrink-0">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`chk-${check}`}
                      checked={cumple[check] ?? true}
                      onChange={() => setCumple((prev) => ({ ...prev, [check]: true }))}
                      className="text-cyan-600"
                    /> Sí
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`chk-${check}`}
                      checked={!(cumple[check] ?? true)}
                      onChange={() => setCumple((prev) => ({ ...prev, [check]: false }))}
                      className="text-red-500"
                    /> No
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hallazgos / Acciones Correctivas</label>
          <textarea
            rows={3}
            value={hallazgos}
            onChange={(e) => setHallazgos(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none resize-none"
            placeholder="Escriba aquí..."
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
            disabled={isSubmitting || !bodega}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
