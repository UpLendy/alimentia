"use client";

import { ArrowLeft, Save, UserCheck, Loader2, AlertCircle, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError, type DailyFormShift, type EmployeeWithStatus } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";
import { useAuth } from "@/components/auth/AuthProvider";

type Cumplimiento = "cumple" | "no_cumple" | "no_aplica";

type ChecklistField =
  | "uniformeLimpio"
  | "unasLimpias"
  | "sinJoyas"
  | "saludOk"
  | "cabelloRecogido"
  | "sinBarbaOBigote"
  | "lavadoManos"
  | "sinMaquillaje"
  | "usoTapabocas";

const CHECKLIST_ITEMS: { field: ChecklistField; label: string }[] = [
  { field: "uniformeLimpio", label: "Uniforme Limpio" },
  { field: "unasLimpias", label: "Uñas Cortas/Limpias" },
  { field: "sinJoyas", label: "Sin Joyas" },
  { field: "saludOk", label: "Salud Aparente OK" },
  { field: "cabelloRecogido", label: "Cabello Recogido y Cubierto" },
  { field: "sinBarbaOBigote", label: "Sin Barba o Bigote" },
  { field: "lavadoManos", label: "Lavado e Higiene de Manos" },
  { field: "sinMaquillaje", label: "Sin Maquillaje" },
  { field: "usoTapabocas", label: "Uso Adecuado del Tapabocas" },
];

interface EmpleadoRow {
  employeeId: string;
  nombre: string;
  uniformeLimpio: Cumplimiento;
  unasLimpias: Cumplimiento;
  sinJoyas: Cumplimiento;
  saludOk: Cumplimiento;
  cabelloRecogido: Cumplimiento;
  sinBarbaOBigote: Cumplimiento;
  lavadoManos: Cumplimiento;
  sinMaquillaje: Cumplimiento;
  usoTapabocas: Cumplimiento;
  observaciones: string;
}

function rowFromEmployee(employee: EmployeeWithStatus): EmpleadoRow {
  return {
    employeeId: employee.id,
    nombre: employee.fullName,
    uniformeLimpio: "cumple",
    unasLimpias: "cumple",
    sinJoyas: "cumple",
    saludOk: "cumple",
    cabelloRecogido: "cumple",
    sinBarbaOBigote: "cumple",
    lavadoManos: "cumple",
    sinMaquillaje: "cumple",
    usoTapabocas: "cumple",
    observaciones: "",
  };
}

export default function FormatoHigiene() {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState<EmpleadoRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [auditor, setAuditor] = useState(() => user?.fullName ?? "");
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
  } = useDailyFormSubmit("higiene");

  // GET /employees ya filtra por activos y, si el usuario tiene una sede fija
  // (operario/supervisor), por esa sede. Para admin/bpm_admin (sin sede fija,
  // de ahí el selector de sede de arriba) devuelve empleados de toda la
  // empresa, así que igual filtramos por la sede seleccionada en el cliente.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sedeId) {
        setEmpleados([]);
        return;
      }
      setEmployeesLoading(true);
      setEmployeesError(null);
      try {
        const data = await api.get<EmployeeWithStatus[]>("/employees");
        if (cancelled) return;
        const deLaSede = data.filter((employee) => employee.sedeId === sedeId);
        setEmpleados(deLaSede.map(rowFromEmployee));
      } catch (err) {
        if (cancelled) return;
        setEmployeesError(err instanceof ApiError ? err.message : "No se pudieron cargar los empleados.");
        setEmpleados([]);
      } finally {
        if (!cancelled) setEmployeesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sedeId]);

  const updateRow = (idx: number, field: keyof EmpleadoRow, value: string) => {
    setEmpleados((rows) => rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      observations,
      payload: {
        auditor,
        empleados: empleados.map((row) => ({
          employeeId: row.employeeId,
          nombre: row.nombre,
          uniformeLimpio: row.uniformeLimpio,
          unasLimpias: row.unasLimpias,
          sinJoyas: row.sinJoyas,
          saludOk: row.saludOk,
          cabelloRecogido: row.cabelloRecogido,
          sinBarbaOBigote: row.sinBarbaOBigote,
          lavadoManos: row.lavadoManos,
          sinMaquillaje: row.sinMaquillaje,
          usoTapabocas: row.usoTapabocas,
          observaciones: row.observaciones || undefined,
        })),
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href="/personal"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Personal
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            Prácticas Higiénicas (Diario)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Verificación de estado de salud aparente, uniforme y aseo personal antes de iniciar el turno.
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auditor / Supervisor</label>
            <input
              type="text"
              required
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="">Sin especificar</option>
              <option value="manana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {!sedeId && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
              Selecciona una sede para ver sus empleados.
            </div>
          )}

          {sedeId && employeesLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando empleados de la sede...
            </div>
          )}

          {sedeId && !employeesLoading && employeesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {employeesError}
            </div>
          )}

          {sedeId && !employeesLoading && !employeesError && empleados.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-4 py-6 rounded-xl text-sm font-medium text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                No hay empleados registrados en esta sede, agrégalos primero en Personal.
              </div>
              <Link href="/personal" className="inline-block text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Ir a Personal
              </Link>
            </div>
          )}

          {sedeId && !employeesLoading && !employeesError && empleados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Empleado</th>
                    {CHECKLIST_ITEMS.map((item) => (
                      <th key={item.field} className="px-4 py-3 font-semibold text-center">
                        {item.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {empleados.map((row, idx) => (
                    <tr key={row.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.nombre}</td>
                      {CHECKLIST_ITEMS.map((item) => (
                        <td key={item.field} className="px-4 py-3 text-center">
                          <select
                            value={row[item.field]}
                            onChange={(e) => updateRow(idx, item.field, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          >
                            <option value="cumple">Cumple</option>
                            <option value="no_cumple">No Cumple</option>
                            <option value="no_aplica">No Aplica</option>
                          </select>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Opcional..."
                          value={row.observaciones}
                          onChange={(e) => updateRow(idx, "observaciones", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded px-2 py-1 text-sm outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones generales (opcional)</label>
          <textarea
            rows={2}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas adicionales sobre el registro..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
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
            disabled={isSubmitting || empleados.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Inspección
          </button>
        </div>
      </form>
    </div>
  );
}
