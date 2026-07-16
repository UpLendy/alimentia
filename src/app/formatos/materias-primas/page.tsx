"use client";

import { Box, ArrowLeft, Save, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";

interface ProductoRow {
  id: number;
  producto: string;
  loteOVencimiento: string;
  cantidad: string;
  temperatura: string;
  empaqueOk: boolean;
  estado: "ok" | "rechazado";
}

let nextRowId = 1;

function emptyRow(): ProductoRow {
  return { id: nextRowId++, producto: "", loteOVencimiento: "", cantidad: "", temperatura: "", empaqueOk: true, estado: "ok" };
}

export default function FormatoMateriasPrimas() {
  const [items, setItems] = useState<ProductoRow[]>([emptyRow()]);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [proveedor, setProveedor] = useState("");
  const [facturaRemision, setFacturaRemision] = useState("");
  const [observations, setObservations] = useState("");

  const {
    sedes,
    sedesError,
    sedeId,
    setSedeId,
    showSedeSelector,
    isSubmitting,
    saveState,
    errorMessage,
    validationDetails,
    submit,
  } = useDailyFormSubmit("materias_primas");

  const updateRow = (id: number, field: keyof ProductoRow, value: string | boolean) => {
    setItems((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setItems((rows) => [...rows, emptyRow()]);
  const removeRow = (id: number) => setItems((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      observations,
      payload: {
        proveedor,
        facturaRemision: facturaRemision || undefined,
        productos: items.map((row) => ({
          producto: row.producto,
          loteOVencimiento: row.loteOVencimiento || undefined,
          cantidad: row.cantidad,
          temperatura: row.temperatura ? Number(row.temperatura) : undefined,
          empaqueOk: row.empaqueOk,
          estado: row.estado,
        })),
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href="/formatos"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Formatos
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 p-2 rounded-xl">
              <Box className="w-6 h-6" />
            </div>
            Recepción de Materias Primas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Evaluación de los insumos al recibirlos del proveedor (temperatura, empaque, características).
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-8">
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Proveedor</label>
            <input
              type="text"
              required
              placeholder="Nombre del proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Factura / Remisión</label>
            <input
              type="text"
              placeholder="Nro de factura"
              value={facturaRemision}
              onChange={(e) => setFacturaRemision(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
            className="w-full md:w-1/4 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          >
            <option value="">Sin especificar</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Productos Recibidos</h3>
          </div>

          <div className="space-y-4 overflow-x-auto pb-2">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-3">Producto</div>
                <div className="col-span-2">Lote/Venc.</div>
                <div className="col-span-2">Cant.</div>
                <div className="col-span-2">Temp (°C)</div>
                <div className="col-span-1">Empaque OK</div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-border/50 mb-2">
                  <div className="col-span-3">
                    <input
                      type="text"
                      required
                      placeholder="Ej: Pechuga de pollo"
                      value={item.producto}
                      onChange={(e) => updateRow(item.id, "producto", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded px-2 py-1.5 text-sm outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Lote/Fecha"
                      value={item.loteOVencimiento}
                      onChange={(e) => updateRow(item.id, "loteOVencimiento", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded px-2 py-1.5 text-sm outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Ej: 5 Kg"
                      value={item.cantidad}
                      onChange={(e) => updateRow(item.id, "cantidad", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded px-2 py-1.5 text-sm outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ej: 4.0"
                      value={item.temperatura}
                      onChange={(e) => updateRow(item.id, "temperatura", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded px-2 py-1.5 text-sm outline-none"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <input
                      type="checkbox"
                      checked={item.empaqueOk}
                      onChange={(e) => updateRow(item.id, "empaqueOk", e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-1">
                    <select
                      value={item.estado}
                      onChange={(e) => updateRow(item.id, "estado", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded px-1 py-1.5 text-sm outline-none"
                    >
                      <option value="ok">✔️</option>
                      <option value="rechazado">❌</option>
                    </select>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(item.id)}
                      disabled={items.length === 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors px-2 py-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md"
            >
              <Plus className="w-4 h-4" />
              Añadir Producto
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones (opcional)</label>
          <textarea
            rows={2}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas adicionales sobre el registro..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
          />
        </div>

        {saveState === "success" && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Registro guardado con éxito.
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

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-purple-500/30 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Recepción
          </button>
        </div>
      </form>
    </div>
  );
}
