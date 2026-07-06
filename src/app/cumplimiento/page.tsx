"use client";

import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const dataRendimiento = [
  { name: 'Ene', cumplimiento: 82, meta: 90 },
  { name: 'Feb', cumplimiento: 85, meta: 90 },
  { name: 'Mar', cumplimiento: 84, meta: 90 },
  { name: 'Abr', cumplimiento: 88, meta: 90 },
  { name: 'May', cumplimiento: 89, meta: 90 },
  { name: 'Jun', cumplimiento: 92, meta: 90 },
];

const dataCategorias = [
  { name: 'Temperaturas', completados: 28, fallados: 2 },
  { name: 'Plagas', completados: 30, fallados: 0 },
  { name: 'Agua', completados: 29, fallados: 1 },
  { name: 'Residuos', completados: 30, fallados: 0 },
];

export default function Cumplimiento() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-2 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            Reporte de Cumplimiento
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Visualización del rendimiento en el llenado de formatos y mantenimiento de registros.
          </p>
        </div>
        <Link 
          href="/visor" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          Exportar Reporte
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica de Rendimiento General */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Tendencia de Cumplimiento General</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataRendimiento} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumplimiento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumplimiento" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCumplimiento)" 
                  name="Cumplimiento (%)"
                />
                <Area 
                  type="step" 
                  dataKey="meta" 
                  stroke="#94a3b8" 
                  strokeDasharray="5 5" 
                  fill="transparent" 
                  name="Meta (90%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica por Categorías */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Desempeño por Formato (Últimos 30 días)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCategorias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completados" name="Días Llenados" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="fallados" name="Días Olvidados" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
