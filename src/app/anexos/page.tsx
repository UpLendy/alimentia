"use client";

import { Paperclip, UploadCloud, FileText, Search, Link as LinkIcon, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const anexos = [
  {
    id: 1,
    category: "Agua Potable",
    programLink: "Programa de Agua Potable",
    documents: [
      { name: "Informe Mensual - Aguas de Manizales", date: "01 Jun 2024", type: "PDF", size: "2.4 MB" },
      { name: "Análisis Microbiológico Anual", date: "15 Ene 2024", type: "PDF", size: "1.1 MB" },
    ]
  },
  {
    id: 2,
    category: "Control de Plagas",
    programLink: "Control Preventivo de Plagas",
    documents: [
      { name: "Certificado Empresa de Fumigación", date: "10 May 2024", type: "PDF", size: "850 KB" },
      { name: "Fichas Técnicas Plaguicidas", date: "10 May 2024", type: "PDF", size: "4.2 MB" },
      { name: "Mapa de Puntos de Control", date: "10 May 2024", type: "IMG", size: "1.8 MB" },
    ]
  },
  {
    id: 3,
    category: "Residuos Sólidos y Líquidos",
    programLink: "Control de Residuos",
    documents: [
      { name: "Certificado Recolección EMAS", date: "28 May 2024", type: "PDF", size: "500 KB" },
      { name: "Certificado Entrega de Aceite", date: "15 May 2024", type: "PDF", size: "450 KB" },
    ]
  }
];

export default function AnexosYSoportes() {
  const router = useRouter();

  const handleDownload = (name: string) => {
    router.push("/visor");
  };

  const handleUpload = () => {
    alert("(Mock) Abriendo ventana de selección de archivo para subir un anexo...");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-400 flex items-center gap-3">
            <Paperclip className="w-8 h-8" />
            Anexos y Soportes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Documentos externos, certificados y resultados de laboratorio que respaldan tus programas.
          </p>
        </div>
        <Link 
          href="/anexos/subir"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
        >
          <UploadCloud className="w-4 h-4" />
          Subir Soporte
        </Link>
      </header>

      {/* Buscador y Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border/50 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, fecha o tipo de documento..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-6">
        {anexos.map((section) => (
          <div key={section.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
            {/* Header de la Categoría */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                {section.category}
              </h2>
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1.5 rounded-lg w-fit">
                <LinkIcon className="w-4 h-4" />
                <span>Vinculado a: {section.programLink}</span>
              </div>
            </div>
            
            {/* Lista de Documentos */}
            <div className="divide-y divide-indigo-50 dark:divide-indigo-900/30">
              {section.documents.map((doc, index) => (
                <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>{doc.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="font-medium">{doc.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(doc.name)}
                    className="flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
