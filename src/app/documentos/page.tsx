"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { api, ApiError, type FixedDocument, type DocumentStatus } from "@/lib/api";

const STATUS_LABEL: Record<DocumentStatus, string> = {
  borrador: "Borrador",
  en_revision: "En Revisión",
  vigente: "Vigente",
  vencido: "Vencido",
};

const STATUS_STYLE: Record<DocumentStatus, string> = {
  borrador: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  en_revision: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  vigente: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  vencido: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DocumentosFijos() {
  const [documents, setDocuments] = useState<FixedDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await api.get<FixedDocument[]>("/fixed-documents");
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los documentos.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadDocuments();
    })();
  }, [loadDocuments]);

  const handleDownload = (doc: FixedDocument) => {
    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/50 overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 border-b border-blue-100 dark:border-blue-900/50">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400">Plan de Saneamiento</h2>
        </div>

        {documents === null && !error && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {documents !== null && documents.length === 0 && (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Aún no hay documentos fijos registrados.</p>
        )}

        {documents !== null && documents.length > 0 && (
          <div className="divide-y divide-blue-50 dark:divide-blue-900/30">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{doc.name}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {doc.category && <span className="text-sm text-slate-500">{doc.category}</span>}
                      <span className="text-sm text-slate-500">Actualizado: {formatDate(doc.updatedAt)}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[doc.status]}`}>
                        {STATUS_LABEL[doc.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Descargar PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
