"use client";

import { Users, FileCheck, BookOpen, AlertCircle, Search, Plus } from "lucide-react";
import Link from "next/link";

const empleados = [
  { id: 1, nombre: "María Rodríguez", cargo: "Jefe de Cocina", examen: "vigente", examenFecha: "15/03/2027", horasCapacitacion: 8, totalCapacitacion: 10 },
  { id: 2, nombre: "Carlos Gómez", cargo: "Auxiliar", examen: "por_vencer", examenFecha: "20/07/2026", horasCapacitacion: 10, totalCapacitacion: 10 },
  { id: 3, nombre: "Ana Martínez", cargo: "Mesera", examen: "vigente", examenFecha: "10/11/2026", horasCapacitacion: 4, totalCapacitacion: 10 },
  { id: 4, nombre: "Luis Fernando", cargo: "Almacenista", examen: "vencido", examenFecha: "01/06/2026", horasCapacitacion: 0, totalCapacitacion: 10 },
];

export default function PersonalDashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            Personal y Capacitaciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestión de exámenes médicos y plan de capacitación continuo (Res. 2674).
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/formatos/higiene" className="bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <FileCheck className="w-4 h-4" />
            Checklist Higiene
          </Link>
          <Link href="/personal/nuevo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/30">
            <Plus className="w-4 h-4" />
            Nuevo Empleado
          </Link>
        </div>
      </header>

      {/* Resumen de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Plantilla</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12 Empleados</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Exámenes Críticos</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">2 Vencidos/Por vencer</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cumplimiento Capacitación</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">65% Global</h3>
          </div>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Directorio de Personal</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar empleado..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Empleado</th>
                <th className="px-6 py-4 font-medium">Cargo</th>
                <th className="px-6 py-4 font-medium">Examen Médico (1 año)</th>
                <th className="px-6 py-4 font-medium">Plan Capacitación (10h)</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{emp.nombre}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {emp.cargo}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {emp.examen === "vigente" && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>}
                      {emp.examen === "por_vencer" && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>}
                      {emp.examen === "vencido" && <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        emp.examen === 'vigente' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        emp.examen === 'por_vencer' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {emp.examenFecha}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[120px] bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${emp.horasCapacitacion === 10 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${(emp.horasCapacitacion / emp.totalCapacitacion) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {emp.horasCapacitacion}/{emp.totalCapacitacion}h
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => alert(`(Mock) Editando información de ${emp.nombre}`)} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium text-sm">Editar</button>
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
