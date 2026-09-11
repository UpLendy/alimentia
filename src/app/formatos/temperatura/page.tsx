"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Thermometer, Plus, Trash2, Loader2, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { api, type DailyFormShift, type Equipment } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";
import { useAuth } from "@/components/auth/AuthProvider";

interface EquipoRow {
  id: number;
  equipmentId: string;
  time: string;
  temp: string;
}

let nextRowId = 1;

export default function RegistroTemperatura() {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState<EquipoRow[]>([{ id: nextRowId++, equipmentId: "", temp: "", time: "08:00" }]);

  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [responsable, setResponsable] = useState(() => user?.fullName ?? "");
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
  } = useDailyFormSubmit("temperatura");

  // El catálogo de equipos vive por sede (equipmentId debe pertenecer a la
  // misma sede del formato — lo valida CreateDailyFormUseCase), así que se
  // recarga cada vez que cambia la sede seleccionada.
  const [equipmentOptions, setEquipmentOptions] = useState<Equipment[]>([]);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);

  useEffect(() => {
    if (!sedeId) {
      setEquipmentOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<Equipment[]>("/equipment");
        if (!cancelled) {
          setEquipmentOptions(data.filter((eq) => eq.sedeId === sedeId));
          setEquipmentError(null);
        }
      } catch {
        if (!cancelled) setEquipmentError("No se pudo cargar el catálogo de equipos de esta sede.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sedeId]);

  const updateRow = (id: number, field: "equipmentId" | "time" | "temp", value: string) => {
    setEquipos((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setEquipos((rows) => [...rows, { id: nextRowId++, equipmentId: "", time: "08:00", temp: "" }]);
  };

  const removeRow = (id: number) => {
    setEquipos((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      observations,
      payload: {
        responsable,
        equipos: equipos.map((row) => ({
          equipmentId: row.equipmentId,
          time: row.time,
          temp: Number(row.temp),
        })),
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href="/formatos"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a formatos
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 p-2 rounded-xl">
              <Thermometer className="w-6 h-6" />
            </div>
            Registro de Temperaturas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Por favor, registre la temperatura actual de todos los equipos de refrigeración.
          </p>
        </div>
        <div className="text-right space-y-1">
          <label className="text-sm font-medium text-slate-500 block">Fecha de Registro</label>
          <input
            type="date"
            required
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="p-6 space-y-6">
          {sedesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {sedesError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {showSedeSelector && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
                <select
                  required
                  value={sedeId}
                  onChange={(e) => setSedeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="" disabled>Selecciona una sede</option>
                  {sedes?.map((sede) => (
                    <option key={sede.id} value={sede.id}>{sede.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsable</label>
              <input
                type="text"
                required
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Sin especificar</option>
                <option value="manana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Rango de referencia (valores a confirmar con BPM Consulting): refrigeración 0°C – 4°C, congelación
              -18°C o menos.
            </span>
          </div>

          {equipmentError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {equipmentError}
            </div>
          )}
          {sedeId && !equipmentError && equipmentOptions.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl text-sm">
              Esta sede no tiene equipos registrados. Agrégalos primero en Infraestructura → Equipos.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Equipo</th>
                  <th className="pb-3 font-medium">Hora</th>
                  <th className="pb-3 font-medium">Temperatura (°C)</th>
                  <th className="pb-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {equipos.map((equipo) => (
                  <tr key={equipo.id} className="group">
                    <td className="py-4">
                      <select
                        required
                        value={equipo.equipmentId}
                        onChange={(e) => updateRow(equipo.id, "equipmentId", e.target.value)}
                        disabled={!sedeId || equipmentOptions.length === 0}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
                      >
                        <option value="" disabled>
                          {sedeId ? "Selecciona un equipo" : "Selecciona primero una sede"}
                        </option>
                        {equipmentOptions.map((eq) => (
                          <option key={eq.id} value={eq.id}>{eq.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4">
                      <input
                        type="time"
                        required
                        value={equipo.time}
                        onChange={(e) => updateRow(equipo.id, "time", e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      />
                    </td>
                    <td className="py-4">
                      <div className="relative w-32">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ej: 4.5"
                          required
                          value={equipo.temp}
                          onChange={(e) => updateRow(equipo.id, "temp", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">°C</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(equipo.id)}
                        disabled={equipos.length === 1}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={addRow}
              className="mt-4 flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Agregar Equipo
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones (opcional)</label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notas adicionales sobre el registro..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

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
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-border/50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Asegúrese de que los valores sean exactos.
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-primary/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : saveState === "success" ? (
              <>Guardado con éxito</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Registro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
