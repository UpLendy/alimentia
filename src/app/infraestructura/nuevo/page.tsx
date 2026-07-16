"use client";

import { useCallback, useEffect, useState } from "react";
import { Wrench, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError, type CalibrationFrequency, type Equipment, type Sede } from "@/lib/api";

export default function NuevoEquipo() {
  const router = useRouter();

  const [sedes, setSedes] = useState<Sede[] | null>(null);
  const [sedesError, setSedesError] = useState<string | null>(null);
  const [selectedSedeId, setSelectedSedeId] = useState("");

  const [name, setName] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [locationArea, setLocationArea] = useState("Recepción de Materias Primas");
  const [serial, setSerial] = useState("");
  const [lastCalibrationDate, setLastCalibrationDate] = useState("");
  const [calibrationFrequency, setCalibrationFrequency] = useState<CalibrationFrequency>("semestral");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadSedes = useCallback(async () => {
    try {
      const data = await api.get<Sede[]>("/sedes");
      setSedes(data);
      if (data.length === 1) setSelectedSedeId(data[0].id);
      setSedesError(null);
    } catch (err) {
      setSedesError(err instanceof ApiError ? err.message : "No se pudieron cargar las sedes.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSedes();
    })();
  }, [loadSedes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSedeId) {
      setSubmitError("Selecciona una sede antes de guardar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.post<{ equipment: Equipment }>("/equipment", {
        sedeId: selectedSedeId,
        name,
        brandModel: brandModel || undefined,
        locationArea: locationArea || undefined,
        serial: serial || undefined,
        lastCalibrationDate,
        calibrationFrequency,
      });
      // TODO: subir el certificado de calibración a S3 cuando exista el
      // flujo de adjuntos de equipment (mismo pendiente que en empleados,
      // Fase 2, prompt 9). No debe bloquear el guardado del equipo.
      router.push("/infraestructura");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSubmitError("La sede seleccionada ya no es válida. Actualiza la página e intenta de nuevo.");
      } else {
        setSubmitError(err instanceof ApiError ? err.message : "No se pudo guardar el equipo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSedeSelector = (sedes?.length ?? 0) > 1;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/infraestructura" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Infraestructura
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
          Registrar Nuevo Equipo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Agrega un nuevo equipo de medición o refrigeración para llevar su control de calibración y mantenimiento.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        {showSedeSelector && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Sede</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede a la que pertenece</label>
              <select
                required
                value={selectedSedeId}
                onChange={(e) => setSelectedSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Datos del Equipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Equipo</label>
              <input
                type="text"
                required
                placeholder="Ej: Termómetro Infrarrojo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Marca / Modelo</label>
              <input
                type="text"
                placeholder="Ej: Fluke 62 MAX"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ubicación / Área</label>
              <select
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option>Recepción de Materias Primas</option>
                <option>Cuarto Frío de Carnes</option>
                <option>Área de Preparación</option>
                <option>Bodega Principal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identificador / Serial</label>
              <input
                type="text"
                placeholder="Número de serie"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Plan de Calibración / Mantenimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Última Calibración</label>
              <input
                type="date"
                required
                value={lastCalibrationDate}
                onChange={(e) => setLastCalibrationDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Frecuencia de Calibración</label>
              <select
                value={calibrationFrequency}
                onChange={(e) => setCalibrationFrequency(e.target.value as CalibrationFrequency)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
                <option value="bianual">Bianual</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adjuntar Certificado de Calibración Actual (PDF)</label>
              {/* TODO: subir el archivo a S3 cuando exista el flujo de
                  adjuntos de equipment (Fase 2, prompt 9). No bloquea el
                  guardado del equipo, que se hace sin el archivo. */}
              <input
                type="file"
                accept=".pdf"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 file:text-sm file:font-semibold hover:file:bg-amber-200 transition-all"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {submitError}
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/infraestructura" className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Equipo
          </button>
        </div>
      </form>
    </div>
  );
}
