"use client";

import { UploadCloud, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubirAnexo() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/anexos");
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/anexos" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Anexos
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
            <UploadCloud className="w-6 h-6" />
          </div>
          Subir Soporte o Anexo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Sube comprobantes externos como facturas de recolección de aceite, resultados de laboratorio o certificados de fumigación.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-6">
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Programa o Categoría</label>
            <select required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option value="">Seleccione el programa al que pertenece...</option>
              <option>Programa de Agua Potable</option>
              <option>Control Preventivo de Plagas</option>
              <option>Control de Residuos (EMAS, Aceites)</option>
              <option>Proveedores (Fichas Técnicas)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Documento</label>
            <input type="text" required placeholder="Ej: Certificado Fumigación Junio 2026" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha del Soporte</label>
            <input type="date" required className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Archivo Adjunto</label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-indigo-600 dark:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Sube un archivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                  <p className="pl-1">o arrastra y suelta aquí</p>
                </div>
                <p className="text-xs leading-5 text-slate-500">PDF, PNG, JPG hasta 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/anexos" className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </Link>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Save className="w-5 h-5" /> Subir y Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
