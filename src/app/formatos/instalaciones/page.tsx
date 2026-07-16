"use client";

import { useState } from "react";
import { Building2, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";

const AREAS = ["Pisos", "Paredes", "Techos", "Ventanas y Puertas", "Iluminación", "Ventilación"];
const AREAS_EVALUADAS = ["Área de Producción", "Bodega de Almacenamiento", "Baños y Vestieres"];

type Estado = "B" | "R" | "M";

interface ItemRow {
  estado: Estado;
  observacion: string;
}

export default function FormatoInstalaciones() {
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [areaEvaluada, setAreaEvaluada] = useState(AREAS_EVALUADAS[0]);
  const [items, setItems] = useState<Record<string, ItemRow>>(
    Object.fromEntries(AREAS.map((area) => [area, { estado: "B" as Estado, observacion: "" }]))
  );

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
  } = useDailyFormSubmit("instalaciones");

  const updateItem = (area: string, field: keyof ItemRow, value: string) => {
    setItems((prev) => ({ ...prev, [area]: { ...prev[area], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      payload: {
        areaEvaluada,
        items: AREAS.map((area) => ({
          area,
          estado: items[area].estado,
          observacion: items[area].observacion || undefined,
        })),
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/infraestructura" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Infraestructura
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          Inspección de Edificaciones e Instalaciones
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Verificación periódica del estado de la infraestructura física (Res. 2674 Art. 6).</p>
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Inspección</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Área Evaluada</label>
            <select
              value={areaEvaluada}
              onChange={(e) => setAreaEvaluada(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            >
              {AREAS_EVALUADAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Estado Físico e Higiénico</h3>
          {AREAS.map((area) => (
            <div key={area} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50 gap-4">
              <span className="font-medium text-slate-700 dark:text-slate-300 w-1/3">{area}</span>
              <div className="flex gap-4 w-1/3">
                {(["B", "R", "M"] as Estado[]).map((estado) => (
                  <label key={estado} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`est-${area}`}
                      checked={items[area].estado === estado}
                      onChange={() => updateItem(area, "estado", estado)}
                      className="text-amber-500"
                    /> {estado}
                  </label>
                ))}
              </div>
              <input
                type="text"
                placeholder="Observación..."
                value={items[area].observacion}
                onChange={(e) => updateItem(area, "observacion", e.target.value)}
                className="w-full sm:w-1/3 bg-white dark:bg-slate-900 border border-border rounded px-3 py-1.5 text-sm outline-none"
              />
            </div>
          ))}
          <p className="text-xs text-slate-500">Convenciones: B=Bueno, R=Regular, M=Malo.</p>
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
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Inspección
          </button>
        </div>
      </form>
    </div>
  );
}
