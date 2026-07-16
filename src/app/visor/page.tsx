"use client";

import { FileText, ArrowLeft, Download, Printer, ZoomIn, ZoomOut, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VisorPDF() {
  const router = useRouter();

  const handleFakeAction = (action: string) => {
    alert(`(Mock) Acción simulada: ${action}`);
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col bg-slate-900 overflow-hidden animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between shrink-0 shadow-lg relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          
          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
          
          <div className="flex items-center gap-2 text-slate-300">
            <FileText className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">Documento_de_Muestra_BPM.pdf</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-900/50 rounded-lg px-2 py-1">
            <button onClick={() => handleFakeAction("Alejar")} className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-700 transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-300">100%</span>
            <button onClick={() => handleFakeAction("Acercar")} className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-700 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

          <button onClick={() => handleFakeAction("Imprimir")} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors hidden sm:block">
            <Printer className="w-5 h-5" />
          </button>
          <button onClick={() => handleFakeAction("Descargar archivo real")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
        </div>
      </div>

      {/* Visor Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900 flex justify-center custom-scrollbar">
        
        {/* Fake PDF Page */}
        <div className="bg-white w-full max-w-[800px] min-h-[1050px] shadow-2xl rounded-sm p-8 sm:p-16 animate-in slide-in-from-bottom-8 duration-700 relative">
          
          {/* Header del documento */}
          <div className="border-b-2 border-slate-200 pb-6 mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">PROGRAMA DE SANEAMIENTO</h2>
              <p className="text-slate-500 mt-1">Documento Controlado - Uso Interno</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400">VERSIÓN 02</div>
              <div className="text-xs text-slate-400 mt-1">Fecha: 15/Mar/2026</div>
            </div>
          </div>

          {/* Cuerpo del documento mock */}
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-10">
              <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Este es un Documento de Prueba</h3>
              <p className="text-slate-600">
                En la plataforma real, aquí se visualizarán los documentos PDF cargados por los usuarios (manuales, procedimientos, certificados de calibración, análisis de agua, etc.) sin necesidad de descargarlos.
              </p>
            </div>

            <h4 className="text-lg font-bold text-slate-800">1. Objetivo</h4>
            <p>
              Establecer los procedimientos estandarizados de operación (POES) para garantizar la limpieza, desinfección y el control de plagas en las instalaciones, cumpliendo con la Resolución 2674 de 2013.
            </p>

            <h4 className="text-lg font-bold text-slate-800">2. Alcance</h4>
            <p>
              Aplica para todas las áreas de recepción, almacenamiento, preparación y distribución del establecimiento, así como para todos los manipuladores de alimentos.
            </p>

            <h4 className="text-lg font-bold text-slate-800">3. Frecuencia de Actividades</h4>
            <table className="w-full text-left border-collapse mt-4">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold">Actividad</th>
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold">Frecuencia</th>
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold">Responsable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Limpieza de pisos y mesas</td>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Diario (al final del turno)</td>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Auxiliar de turno</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Desinfección profunda de cuartos fríos</td>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Semanal</td>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Jefe de Cocina</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Fumigación y control de plagas</td>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Mensual</td>
                  <td className="border border-slate-300 px-4 py-2 text-sm">Proveedor Externo</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex justify-between">
                <div className="w-48 text-center">
                  <div className="border-b border-slate-400 h-8 mb-2"></div>
                  <span className="text-sm text-slate-500">Elaboró</span>
                </div>
                <div className="w-48 text-center">
                  <div className="border-b border-slate-400 h-8 mb-2"></div>
                  <span className="text-sm text-slate-500">Aprobó (Firma Electrónica)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
