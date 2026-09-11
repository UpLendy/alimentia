import type { DailyFormType } from "@/lib/api";

// Renderizador de solo lectura del payload de un daily-form, uno por
// formType. Los labels y la estructura son un calco de los 10 formularios de
// creación en src/app/formatos/* (mismo texto, mismos nombres de campo) para
// no inventar nomenclatura nueva — ver también daily-form-payload.schema.ts
// en el backend, que es la fuente de verdad de qué campos existen.

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 dark:text-white">{value ?? "—"}</dd>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>;
}

function DataTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-border">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CARACTERISTICA_LABEL: Record<string, Record<string, string>> = {
  color: { normal: "Incoloro (Normal)", anormal: "Turbio/Anormal" },
  olor: { normal: "Inodoro (Normal)", anormal: "Olor Extraño" },
  sabor: { normal: "Insípido (Normal)", anormal: "Sabor Extraño" },
};

const CUMPLIMIENTO_LABEL: Record<string, string> = { cumple: "Cumple", no_cumple: "No Cumple", no_aplica: "No Aplica" };
const ESTADO_LOCATIVO_LABEL: Record<string, string> = { B: "Bueno", R: "Regular", M: "Malo" };

const CHECKLIST_HIGIENE = [
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

export function PayloadViewer({ formType, payload }: { formType: DailyFormType; payload: Record<string, unknown> }) {
  switch (formType) {
    case "temperatura": {
      const equipos = (payload.equipos as { equipmentId: string; equipmentName?: string; time: string; temp: number }[]) ?? [];
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Responsable" value={payload.responsable as string} />
          </FieldGrid>
          <DataTable
            head={["Equipo", "Hora", "Temperatura (°C)"]}
            rows={equipos.map((eq) => [eq.equipmentName ?? eq.equipmentId, eq.time, `${eq.temp}°C`])}
          />
        </div>
      );
    }

    case "plagas": {
      const areas = (payload.areas as { area: string; evidencia: boolean }[]) ?? [];
      return (
        <DataTable
          head={["Área", "¿Evidencia de plagas?"]}
          rows={areas.map((a) => [
            a.area,
            a.evidencia ? <span className="text-red-600 dark:text-red-400 font-semibold">Sí</span> : "No",
          ])}
        />
      );
    }

    case "agua": {
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Punto de Muestreo" value={payload.puntoMuestreo as string} />
            <Field label="Responsable" value={payload.responsable as string} />
          </FieldGrid>
          <FieldGrid>
            <Field label="Color" value={CARACTERISTICA_LABEL.color[payload.color as string] ?? (payload.color as string)} />
            <Field label="Olor" value={CARACTERISTICA_LABEL.olor[payload.olor as string] ?? (payload.olor as string)} />
            <Field label="Sabor" value={CARACTERISTICA_LABEL.sabor[payload.sabor as string] ?? (payload.sabor as string)} />
          </FieldGrid>
          <FieldGrid>
            <Field label="pH" value={payload.ph !== undefined ? String(payload.ph) : "No registrado"} />
            <Field
              label="Nivel de Cloro Residual (ppm)"
              value={payload.cloroResidualPpm !== undefined ? `${payload.cloroResidualPpm} ppm` : "No registrado"}
            />
          </FieldGrid>
        </div>
      );
    }

    case "residuos": {
      const cant = (key: string) => payload[key] as { cantidad: number; unidad: string } | undefined;
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Encargado de Disposición" value={payload.encargado as string} />
          </FieldGrid>
          <FieldGrid>
            <Field label="Residuos Orgánicos (Verde)" value={cant("organicos") ? `${cant("organicos")!.cantidad} ${cant("organicos")!.unidad}` : "—"} />
            <Field label="Residuos Aprovechables (Blanco)" value={cant("aprovechables") ? `${cant("aprovechables")!.cantidad} ${cant("aprovechables")!.unidad}` : "—"} />
            <Field label="Residuos No Aprovechables (Negro)" value={cant("noAprovechables") ? `${cant("noAprovechables")!.cantidad} ${cant("noAprovechables")!.unidad}` : "—"} />
            <Field label="Aceite Usado (Litros)" value={payload.aceiteUsadoLitros !== undefined ? `${payload.aceiteUsadoLitros} L` : "No registrado"} />
          </FieldGrid>
        </div>
      );
    }

    case "materias_primas": {
      const productos = (payload.productos as {
        producto: string;
        loteOVencimiento?: string;
        cantidad: string;
        temperatura?: number;
        empaqueOk: boolean;
        estado: "ok" | "rechazado";
      }[]) ?? [];
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Proveedor" value={payload.proveedor as string} />
            <Field label="Factura / Remisión" value={(payload.facturaRemision as string) || "No registrada"} />
            <Field label="Responsable" value={payload.responsable as string} />
          </FieldGrid>
          <DataTable
            head={["Producto", "Lote/Venc.", "Cant.", "Temp (°C)", "Empaque OK", "Estado"]}
            rows={productos.map((p) => [
              p.producto,
              p.loteOVencimiento || "—",
              p.cantidad,
              p.temperatura !== undefined ? `${p.temperatura}°C` : "—",
              p.empaqueOk ? "Sí" : "No",
              p.estado === "rechazado" ? (
                <span className="text-red-600 dark:text-red-400 font-semibold">Rechazado</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Aceptado</span>
              ),
            ])}
          />
        </div>
      );
    }

    case "higiene": {
      const empleados = (payload.empleados as Record<string, string>[]) ?? [];
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Auditor / Supervisor" value={payload.auditor as string} />
          </FieldGrid>
          <DataTable
            head={["Empleado", ...CHECKLIST_HIGIENE.map((c) => c.label), "Observaciones"]}
            rows={empleados.map((row) => [
              row.nombre,
              ...CHECKLIST_HIGIENE.map((c) => CUMPLIMIENTO_LABEL[row[c.field]] ?? row[c.field]),
              row.observaciones || "—",
            ])}
          />
        </div>
      );
    }

    case "almacenamiento": {
      const checks = (payload.checks as { item: string; cumple: boolean }[]) ?? [];
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Bodega / Cuarto" value={payload.bodega as string} />
          </FieldGrid>
          <DataTable
            head={["Ítem del checklist", "¿Cumple?"]}
            rows={checks.map((c) => [c.item, c.cumple ? "Sí" : <span className="text-red-600 dark:text-red-400 font-semibold">No</span>])}
          />
          <Field label="Hallazgos / Acciones Correctivas" value={(payload.hallazgos as string) || "Ninguno"} />
        </div>
      );
    }

    case "transporte": {
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Placa" value={payload.placa as string} />
            <Field label="Conductor" value={payload.conductor as string} />
            <Field label="Temperatura del Furgón (°C)" value={payload.temperaturaFurgon !== undefined ? `${payload.temperaturaFurgon}°C` : "No registrada"} />
          </FieldGrid>
          <FieldGrid>
            <Field label="Limpieza interior" value={payload.limpiezaInterior ? "Cumple" : <span className="text-red-600 dark:text-red-400 font-semibold">No cumple</span>} />
            <Field label="Ausencia de olores extraños" value={payload.ausenciaOlores ? "Cumple" : <span className="text-red-600 dark:text-red-400 font-semibold">No cumple</span>} />
          </FieldGrid>
        </div>
      );
    }

    case "instalaciones": {
      const items = (payload.items as { area: string; estado: "B" | "R" | "M"; observacion?: string }[]) ?? [];
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Área Evaluada" value={payload.areaEvaluada as string} />
          </FieldGrid>
          <DataTable
            head={["Área", "Estado", "Observación"]}
            rows={items.map((it) => [it.area, ESTADO_LOCATIVO_LABEL[it.estado] ?? it.estado, it.observacion || "—"])}
          />
          <p className="text-xs text-slate-500">Convenciones: B=Bueno, R=Regular, M=Malo.</p>
        </div>
      );
    }

    case "equipos": {
      const equipos = (payload.equipos as {
        equipo: string;
        limpio: boolean;
        buenEstado: boolean;
        requiereMantenimiento: boolean;
        productoLimpieza?: string;
      }[]) ?? [];
      return (
        <div className="space-y-6">
          <FieldGrid>
            <Field label="Responsable" value={payload.responsable as string} />
          </FieldGrid>
          <DataTable
            head={["Equipo / Utensilio", "Limpio y Desinfectado", "Buen Estado Físico", "Requiere Mantenimiento", "Producto de Limpieza/Desinfección"]}
            rows={equipos.map((eq) => [
              eq.equipo,
              eq.limpio ? "Cumple" : <span className="text-red-600 dark:text-red-400 font-semibold">No Cumple</span>,
              eq.buenEstado ? "Cumple" : <span className="text-red-600 dark:text-red-400 font-semibold">No Cumple</span>,
              eq.requiereMantenimiento ? <span className="text-red-600 dark:text-red-400 font-semibold">Sí</span> : "No",
              eq.productoLimpieza || "—",
            ])}
          />
        </div>
      );
    }

    default:
      return <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>;
  }
}
