"use client";

import { UserPlus, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NuevoEmpleado() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/personal");
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/personal" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Personal
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
          Registrar Nuevo Empleado
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Ingresa los datos del nuevo colaborador y programa su plan de capacitación inicial.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombres y Apellidos</label>
              <input type="text" required placeholder="Ej: Juan Pérez" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Identificación</label>
              <input type="text" required placeholder="Cédula de ciudadanía" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option>Jefe de Cocina</option>
                <option>Auxiliar de Cocina</option>
                <option>Mesero(a)</option>
                <option>Almacenista</option>
                <option>Otro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Ingreso</label>
              <input type="date" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-border pb-2">Requisitos Sanitarios (Res. 2674)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha del Examen Médico Ocupacional</label>
              <input type="date" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              <p className="text-xs text-slate-500">Obligatorio: KOH de uñas, Frotis faríngeo, Coprológico.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Certificado de Manipulador de Alimentos</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option>Sí, cuenta con certificado al día</option>
                <option>No, requiere programación inmediata (10h obligatorias)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adjuntar Certificado (Opcional)</label>
              <input type="file" accept=".pdf,.jpg,.png" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-700 file:text-sm file:font-semibold hover:file:bg-indigo-200 transition-all" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/personal" className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </Link>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Guardar Empleado
          </button>
        </div>
      </form>
    </div>
  );
}
