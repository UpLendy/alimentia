import {
  Thermometer,
  Bug,
  Droplets,
  Trash2,
  Box,
  UserCheck,
  PackageOpen,
  Truck,
  Building2,
  Microwave,
  type LucideIcon,
} from "lucide-react";
import type { DailyFormType } from "./api";

// Mismos nombres/íconos/colores que src/app/formatos/page.tsx (no se
// reutiliza el array de esa página para no arriesgar romperla: acá solo se
// necesitan formType/name/icon/color, no href/pending/desc).
export interface DailyFormMeta {
  formType: DailyFormType;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const DAILY_FORM_META: DailyFormMeta[] = [
  { formType: "temperatura", name: "Registro de Temperaturas", icon: Thermometer, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { formType: "plagas", name: "Control de Plagas", icon: Bug, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { formType: "agua", name: "Calidad del Agua", icon: Droplets, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { formType: "residuos", name: "Residuos Sólidos y Líquidos", icon: Trash2, color: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { formType: "materias_primas", name: "Recepción de Materias Primas", icon: Box, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { formType: "higiene", name: "Prácticas Higiénicas", icon: UserCheck, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { formType: "almacenamiento", name: "Control de Almacenamiento", icon: PackageOpen, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { formType: "transporte", name: "Inspección de Transporte", icon: Truck, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { formType: "instalaciones", name: "Inspección Locativa", icon: Building2, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { formType: "equipos", name: "Estado de Equipos", icon: Microwave, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
];

export function getDailyFormMeta(formType: DailyFormType): DailyFormMeta {
  return DAILY_FORM_META.find((m) => m.formType === formType) ?? DAILY_FORM_META[0];
}

const SHIFT_LABELS: Record<string, string> = { manana: "Mañana", tarde: "Tarde", noche: "Noche" };

export function shiftLabel(shift: string | null): string {
  if (!shift) return "Sin especificar";
  return SHIFT_LABELS[shift] ?? shift;
}

// submittedBy es un userId (uuid) sin endpoint de resolución a nombre en el
// backend hoy. La mayoría de los 10 formatos ya capturan quién lo diligenció
// como texto libre dentro del propio payload (responsable/auditor/encargado)
// — se usa eso, que es más útil para auditoría que un id.
const RESPONSABLE_FIELD_BY_TYPE: Partial<Record<DailyFormType, string>> = {
  temperatura: "responsable",
  agua: "responsable",
  residuos: "encargado",
  materias_primas: "responsable",
  higiene: "auditor",
  equipos: "responsable",
};

export function getResponsableLabel(formType: DailyFormType, payload: Record<string, unknown>, submittedBy: string | null): string {
  const field = RESPONSABLE_FIELD_BY_TYPE[formType];
  const value = field ? payload[field] : undefined;
  if (typeof value === "string" && value.trim()) return value;
  if (submittedBy) return `Usuario ${submittedBy.slice(0, 8)}`;
  return "No disponible";
}
