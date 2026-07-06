"use client";

import { CheckSquare, ArrowLeft, Save, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FormatoHigiene() {
  const [empleados] = useState([
    "María Rodríguez",
    "Carlos Gómez",
    "Ana Martínez",
    "Luis Fernando"
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("(Mock) Checklist de higiene guardado exitosamente.");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link 
        href="/personal" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Personal
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            Prácticas Higiénicas (Diario)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Verificación de estado de salud aparente, uniforme y aseo personal antes de iniciar el turno.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auditor / Supervisor</label>
            <input type="text" required defaultValue="Admin" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Empleado</th>
                  <th className="px-4 py-3 font-semibold text-center">Uniforme Limpio</th>
                  <th className="px-4 py-3 font-semibold text-center">Uñas Cortas/Limpias</th>
                  <th className="px-4 py-3 font-semibold text-center">Sin Joyas</th>
                  <th className="px-4 py-3 font-semibold text-center">Salud Aparente OK</th>
                  <th className="px-4 py-3 font-semibold">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {empleados.map((nombre, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{nombre}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" placeholder="Opcional..." className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded px-2 py-1 text-sm outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Inspección
          </button>
        </div>
      </form>
    </div>
  );
}
