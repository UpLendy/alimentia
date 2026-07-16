"use client";

import { useState } from "react";
import { Trash2, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";

type Unidad = "bolsas" | "kg";

interface Cantidad {
  cantidad: string;
  unidad: Unidad;
}

export default function FormatoResiduos() {
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [turno, setTurno] = useState<DailyFormShift | "">("");
  const [organicos, setOrganicos] = useState<Cantidad>({ cantidad: "", unidad: "bolsas" });
  const [aprovechables, setAprovechables] = useState<Cantidad>({ cantidad: "", unidad: "bolsas" });
  const [noAprovechables, setNoAprovechables] = useState<Cantidad>({ cantidad: "", unidad: "bolsas" });
  const [aceiteUsadoLitros, setAceiteUsadoLitros] = useState("");
  const [encargado, setEncargado] = useState("");
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
  } = useDailyFormSubmit("residuos");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turno) return;
    await submit({
      formDate,
      shift: turno,
      observations,
      payload: {
        turno,
        organicos: { cantidad: Number(organicos.cantidad), unidad: organicos.unidad },
        aprovechables: { cantidad: Number(aprovechables.cantidad), unidad: aprovechables.unidad },
        noAprovechables: { cantidad: Number(noAprovechables.cantidad), unidad: noAprovechables.unidad },
        aceiteUsadoLitros: aceiteUsadoLitros ? Number(aceiteUsadoLitros) : undefined,
        encargado,
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href="/formatos"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Formatos
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 p-2 rounded-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            Residuos Sólidos y Líquidos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Cuantificación de los residuos generados al final del turno.
          </p>
        </div>
      </header>

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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Cuantificación</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno</label>
            <select
              required
              value={turno}
              onChange={(e) => setTurno(e.target.value as DailyFormShift)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all appearance-none"
            >
              <option value="">Seleccionar turno...</option>
              <option value="manana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Cantidades (Bolsas/Kilos)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Residuos Orgánicos (Verde)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Cantidad"
                  required
                  value={organicos.cantidad}
                  onChange={(e) => setOrganicos((prev) => ({ ...prev, cantidad: e.target.value }))}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                />
                <select
                  value={organicos.unidad}
                  onChange={(e) => setOrganicos((prev) => ({ ...prev, unidad: e.target.value as Unidad }))}
                  className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                >
                  <option value="bolsas">Bolsas</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Residuos Aprovechables (Blanco)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Cantidad"
                  required
                  value={aprovechables.cantidad}
                  onChange={(e) => setAprovechables((prev) => ({ ...prev, cantidad: e.target.value }))}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                />
                <select
                  value={aprovechables.unidad}
                  onChange={(e) => setAprovechables((prev) => ({ ...prev, unidad: e.target.value as Unidad }))}
                  className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                >
                  <option value="bolsas">Bolsas</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Residuos No Aprovechables (Negro)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Cantidad"
                  required
                  value={noAprovechables.cantidad}
                  onChange={(e) => setNoAprovechables((prev) => ({ ...prev, cantidad: e.target.value }))}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                />
                <select
                  value={noAprovechables.unidad}
                  onChange={(e) => setNoAprovechables((prev) => ({ ...prev, unidad: e.target.value as Unidad }))}
                  className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                >
                  <option value="bolsas">Bolsas</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aceite Usado (Litros)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={aceiteUsadoLitros}
                  onChange={(e) => setAceiteUsadoLitros(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                />
                <div className="bg-slate-100 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm text-slate-500 flex items-center">
                  L
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Encargado de Disposición</label>
          <input
            type="text"
            required
            placeholder="Nombre del responsable..."
            value={encargado}
            onChange={(e) => setEncargado(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones (opcional)</label>
          <textarea
            rows={2}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas adicionales sobre el registro..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all resize-none"
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
            className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white disabled:opacity-60 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
