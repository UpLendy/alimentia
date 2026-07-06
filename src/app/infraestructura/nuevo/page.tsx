"use client";

import { Wrench, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NuevoEquipo() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/infraestructura");
  };

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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Datos del Equipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Equipo</label>
              <input type="text" required placeholder="Ej: Termómetro Infrarrojo" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Marca / Modelo</label>
              <input type="text" placeholder="Ej: Fluke 62 MAX" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ubicación / Área</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all">
                <option>Recepción de Materias Primas</option>
                <option>Cuarto Frío de Carnes</option>
                <option>Área de Preparación</option>
                <option>Bodega Principal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identificador / Serial</label>
              <input type="text" placeholder="Número de serie" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Plan de Calibración / Mantenimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Última Calibración</label>
              <input type="date" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Frecuencia de Calibración</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all">
                <option>Semestral</option>
                <option>Anual</option>
                <option>Bianual</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adjuntar Certificado de Calibración Actual (PDF)</label>
              <input type="file" accept=".pdf" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 file:text-sm file:font-semibold hover:file:bg-amber-200 transition-all" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/infraestructura" className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </Link>
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Guardar Equipo
          </button>
        </div>
      </form>
    </div>
  );
}
