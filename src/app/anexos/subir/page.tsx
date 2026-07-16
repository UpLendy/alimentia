"use client";

import { useState } from "react";
import { UploadCloud, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { api, ApiError, type Attachment, type UploadUrlResult, type ValidationErrorDetail } from "@/lib/api";
import { useSedes } from "@/hooks/useSedes";

export default function SubirAnexo() {
  const { sedes, sedesError, sedeId, setSedeId, showSedeSelector } = useSedes();

  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<ValidationErrorDetail[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setSaveState("error");
      setErrorMessage("Selecciona un archivo para subir.");
      setValidationDetails(null);
      return;
    }

    setIsSubmitting(true);
    setSaveState("idle");
    setErrorMessage(null);
    setValidationDetails(null);

    try {
      const contentType = file.type || "application/octet-stream";
      const { uploadUrl, fileKey, fileUrl } = await api.post<UploadUrlResult>("/attachments/upload-url", {
        fileName: file.name,
        contentType,
      });

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      });
      if (!putRes.ok) {
        throw new Error("No se pudo subir el archivo al almacenamiento.");
      }

      await api.post<{ attachment: Attachment }>("/attachments", {
        sedeId: sedeId || undefined,
        category,
        name,
        documentDate: documentDate || undefined,
        fileKey,
        fileUrl,
        fileType: contentType,
        fileSizeBytes: file.size,
      });

      setSaveState("success");
      setCategory("");
      setName("");
      setDocumentDate("");
      setFile(null);
    } catch (err) {
      setSaveState("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        setValidationDetails(err.details ?? null);
      } else {
        setErrorMessage(err instanceof Error ? err.message : "No se pudo subir el anexo.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        <div className="space-y-4">
          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Programa o Categoría</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Agua Potable, Control de Plagas, Residuos..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Documento</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Certificado Fumigación Junio 2026"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha del Soporte</label>
            <input
              type="date"
              required
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Archivo Adjunto</label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="text-center">
                {file ? (
                  <FileCheck2 className="mx-auto h-12 w-12 text-indigo-500" aria-hidden="true" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
                )}
                <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-indigo-600 dark:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>{file ? "Cambiar archivo" : "Sube un archivo"}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                  </label>
                  {!file && <p className="pl-1">o arrastra y suelta aquí</p>}
                </div>
                <p className="text-xs leading-5 text-slate-500">{file ? file.name : "PDF, PNG, JPG hasta 10MB"}</p>
              </div>
            </div>
          </div>
        </div>

        {saveState === "success" && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Anexo subido con éxito.
          </div>
        )}

        {saveState === "error" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
            {validationDetails && validationDetails.length > 0 && (
              <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                {validationDetails.map((d, i) => (
                  <li key={i}>
                    <span className="font-mono">{d.path}</span>: {d.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link href="/anexos" className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Subir y Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
