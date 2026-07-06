"use client";

import { FileText, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const programas = [
  { id: 1, name: "Programa de Agua Potable", date: "12 Mar 2024", status: "Vigente" },
  { id: 2, name: "Programa de Limpieza y Desinfección", date: "12 Mar 2024", status: "Vigente" },
  { id: 3, name: "Control de Residuos", date: "12 Mar 2024", status: "Vigente" },
  { id: 4, name: "Control Preventivo de Plagas", date: "15 Abr 2024", status: "Vigente" },
  { id: 5, name: "Proveedores y Materias Primas", date: "12 Mar 2024", status: "Vigente" },
];

export default function DocumentosFijos() {
  const router = useRouter();

  const handleDownload = (name: string) => {
    router.push("/visor");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" />
            Documentación Fija
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Programas de saneamiento básico. Estos documentos se elaboran una vez y se actualizan ante cambios estructurales.
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/50 overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 border-b border-blue-100 dark:border-blue-900/50">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400">Plan de Saneamiento</h2>
        </div>
        
        <div className="divide-y divide-blue-50 dark:divide-blue-900/30">
          {programas.map((programa) => (
            <div key={programa.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{programa.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-500">Actualizado: {programa.date}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {programa.status}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(programa.name)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                title="Descargar PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/50 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4">Tablas de Concentración</h3>
          <p className="text-sm text-slate-500 mb-4">Productos de limpieza y desinfección aprobados.</p>
          <button 
            onClick={() => handleDownload("Tablas de Concentración")}
            className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Ver Documento
          </button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/50 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4">Fichas Técnicas</h3>
          <p className="text-sm text-slate-500 mb-4">Fichas técnicas de los productos utilizados.</p>
          <button 
            onClick={() => handleDownload("Fichas Técnicas")}
            className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Ver Fichas
          </button>
        </div>
      </div>
    </div>
  );
}
