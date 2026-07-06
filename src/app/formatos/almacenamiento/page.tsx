"use client";

import { PackageOpen, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FormatoAlmacenamiento() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("(Mock) Checklist de almacenamiento guardado.");
  };

  const checks = [
    "Productos almacenados sobre estibas (no en el piso)",
    "Separación adecuada entre crudos y cocidos",
    "Rotación PEPS (Primeros en Entrar, Primeros en Salir)",
    "Ausencia de productos vencidos",
    "Productos químicos separados de los alimentos",
    "Empaques íntegros y limpios"
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bodega / Cuarto</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none">
              <option>Bodega Secos</option>
              <option>Cuarto Frío Carnes</option>
              <option>Cuarto Frío Verduras</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Checklist de Cumplimiento</h3>
          <div className="space-y-3">
            {checks.map((check, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50 gap-4">
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{check}</span>
                <div className="flex gap-4 shrink-0">
                  <label className="flex items-center gap-2"><input type="radio" name={`chk-${idx}`} defaultChecked className="text-cyan-600" /> Sí</label>
                  <label className="flex items-center gap-2"><input type="radio" name={`chk-${idx}`} className="text-red-500" /> No</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hallazgos / Acciones Correctivas</label>
          <textarea rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none resize-none" placeholder="Escriba aquí..." />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
