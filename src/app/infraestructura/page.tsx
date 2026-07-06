"use client";

import { Wrench, CheckCircle2, AlertTriangle, Plus, Search, FileText } from "lucide-react";
import Link from "next/link";

const equipos = [
  { id: 1, nombre: "Balanza Digital (Recepción)", marca: "Cas", proximaCalibracion: "15/08/2026", estado: "al_dia" },
  { id: 2, nombre: "Termómetro Cuarto Frío 1", marca: "Testo", proximaCalibracion: "02/07/2026", estado: "vencido" },
  { id: 3, nombre: "Termómetro Láser", marca: "Fluke", proximaCalibracion: "20/07/2026", estado: "al_erta" },
  { id: 4, nombre: "pHmetro", marca: "Hanna", proximaCalibracion: "10/12/2026", estado: "al_dia" },
];

export default function InfraestructuraDashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            Infraestructura y Equipos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestión de calibraciones, mantenimiento y estado locativo.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/formatos/instalaciones" className="bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" />
            Inspección Locativa
          </Link>
          <Link href="/formatos/equipos" className="bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" />
            Revisión Equipos
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Equipos Calibrados</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">85%</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mantenimientos Pendientes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">2 Reportes</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Programa de Calibración de Equipos</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar equipo..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none w-64 transition-all" />
            </div>
            <Link href="/infraestructura/nuevo" className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors inline-flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Equipo</th>
                <th className="px-6 py-4 font-medium">Marca / Modelo</th>
                <th className="px-6 py-4 font-medium">Próxima Calibración</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Certificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {equipos.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{eq.nombre}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{eq.marca}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{eq.proximaCalibracion}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      eq.estado === 'al_dia' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      eq.estado === 'al_erta' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {eq.estado === 'al_dia' ? 'Al día' : eq.estado === 'al_erta' ? 'Por vencer' : 'Vencido'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href="/visor" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium text-sm">Ver PDF</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
