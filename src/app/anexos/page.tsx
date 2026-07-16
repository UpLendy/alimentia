"use client";

import { useCallback, useEffect, useState } from "react";
import { Paperclip, UploadCloud, FileText, Search, Download, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api, ApiError, type Attachment } from "@/lib/api";

function formatDate(iso: string | null) {
  if (!iso) return "Sin fecha";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function formatFileSize(bytes: number | null) {
  if (bytes === null) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function groupByCategory(attachments: Attachment[]): { category: string; documents: Attachment[] }[] {
  const groups = new Map<string, Attachment[]>();
  for (const attachment of attachments) {
    const bucket = groups.get(attachment.category) ?? [];
    bucket.push(attachment);
    groups.set(attachment.category, bucket);
  }
  return Array.from(groups.entries()).map(([category, documents]) => ({ category, documents }));
}

export default function AnexosYSoportes() {
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    try {
      const data = await api.get<Attachment[]>("/attachments");
      setAttachments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los anexos.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadAttachments();
    })();
  }, [loadAttachments]);

  const handleDownload = (doc: Attachment) => {
    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
  };

  const sections = attachments ? groupByCategory(attachments) : [];

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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {attachments === null && !error && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {attachments !== null && sections.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Aún no hay anexos ni soportes cargados.</p>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.category} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
            {/* Header de la Categoría */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 border-b border-indigo-100 dark:border-indigo-900/50">
              <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                {section.category}
              </h2>
            </div>

            {/* Lista de Documentos */}
            <div className="divide-y divide-indigo-50 dark:divide-indigo-900/30">
              {section.documents.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                        <span>{formatDate(doc.documentDate)}</span>
                        {doc.fileType && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="font-medium">{doc.fileType}</span>
                          </>
                        )}
                        {formatFileSize(doc.fileSizeBytes) && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span>{formatFileSize(doc.fileSizeBytes)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
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
