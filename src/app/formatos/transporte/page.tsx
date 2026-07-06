"use client";

import { Truck, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function FormatoTransporte() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("(Mock) Inspección de vehículo guardada.");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Placa</label>
            <input type="text" placeholder="Ej: ABC-123" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Conductor</label>
            <input type="text" placeholder="Nombre" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Condiciones del Furgón</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Limpieza interior</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="limp" defaultChecked className="text-blue-600" /> Cumple</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="limp" className="text-red-500" /> No</label>
              </div>
            </div>
            <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ausencia de olores extraños</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="olor" defaultChecked className="text-blue-600" /> Cumple</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="olor" className="text-red-500" /> No</label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperatura del Furgón (°C)</label>
            <input type="number" step="0.1" placeholder="Ej. -18.0" className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
