"use client";

import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function FormatoInstalaciones() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("(Mock) Inspección locativa guardada.");
  };

  const areas = ["Pisos", "Paredes", "Techos", "Ventanas y Puertas", "Iluminación", "Ventilación"];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Inspección</label>
            <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Área Evaluada</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none">
              <option>Área de Producción</option>
              <option>Bodega de Almacenamiento</option>
              <option>Baños y Vestieres</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Estado Físico e Higiénico</h3>
          {areas.map((area, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50 gap-4">
              <span className="font-medium text-slate-700 dark:text-slate-300 w-1/3">{area}</span>
              <div className="flex gap-4 w-1/3">
                <label className="flex items-center gap-2"><input type="radio" name={`est-${idx}`} defaultChecked className="text-amber-500" /> B</label>
                <label className="flex items-center gap-2"><input type="radio" name={`est-${idx}`} className="text-amber-500" /> R</label>
                <label className="flex items-center gap-2"><input type="radio" name={`est-${idx}`} className="text-amber-500" /> M</label>
              </div>
              <input type="text" placeholder="Observación..." className="w-full sm:w-1/3 bg-white dark:bg-slate-900 border border-border rounded px-3 py-1.5 text-sm outline-none" />
            </div>
          ))}
          <p className="text-xs text-slate-500">Convenciones: B=Bueno, R=Regular, M=Malo.</p>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Guardar Inspección
          </button>
        </div>
      </form>
    </div>
  );
}
