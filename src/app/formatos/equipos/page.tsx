"use client";

import { Microwave, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FormatoEquipos() {
  const [equipos] = useState(["Refrigerador Principal", "Estufa Industrial", "Licuadora", "Mesas en Acero Inoxidable"]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("(Mock) Inspección de equipos guardada.");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/infraestructura" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Infraestructura
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-xl">
            <Microwave className="w-6 h-6" />
          </div>
          Estado y Limpieza de Equipos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Revisión pre-operacional de equipos y utensilios (Res. 2674 Art. 8-9).</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsable</label>
            <input type="text" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Equipo / Utensilio</th>
                  <th className="px-4 py-3 font-semibold text-center">Limpio y Desinfectado</th>
                  <th className="px-4 py-3 font-semibold text-center">Buen Estado Físico</th>
                  <th className="px-4 py-3 font-semibold text-center">Requiere Mantenimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {equipos.map((eq, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{eq}</td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 text-amber-600 rounded" /></td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 text-amber-600 rounded" /></td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" className="w-4 h-4 text-red-600 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Guardar Revisión
          </button>
        </div>
      </form>
    </div>
  );
}
