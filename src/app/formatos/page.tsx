"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Thermometer, Bug, Droplets, Trash2, Box, ChevronRight, UserCheck, PackageOpen, Truck, Building2, Microwave, History } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, type CompanyDailyFormStatus, type DailyFormType } from "@/lib/api";

const formatos = [
  {
    id: "temperatura",
    formType: "temperatura" as DailyFormType,
    name: "Registro de Temperaturas",
    desc: "Control diario de refrigeradores y congeladores.",
    icon: Thermometer,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    href: "/formatos/temperatura",
    pending: true
  },
  {
    id: "plagas",
    formType: "plagas" as DailyFormType,
    name: "Control de Plagas",
    desc: "Verificación diaria de ausencia de plagas.",
    icon: Bug,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    href: "/formatos/plagas",
    pending: true
  },
  {
    id: "agua",
    formType: "agua" as DailyFormType,
    name: "Calidad del Agua",
    desc: "Verificación de color, sabor y apariencia.",
    icon: Droplets,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    href: "/formatos/agua",
    pending: false
  },
  {
    id: "residuos",
    formType: "residuos" as DailyFormType,
    name: "Residuos Sólidos y Líquidos",
    desc: "Cantidad y tipo de residuos generados.",
    icon: Trash2,
    color: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    href: "/formatos/residuos",
    pending: false
  },
  {
    id: "materias",
    formType: "materias_primas" as DailyFormType,
    name: "Recepción de Materias Primas",
    desc: "Registro de inventario y estado al recibir.",
    icon: Box,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    href: "/formatos/materias-primas",
    pending: false
  },
  {
    id: "higiene",
    formType: "higiene" as DailyFormType,
    name: "Higiene de Personal",
    desc: "Revisión diaria de uniforme y estado de salud.",
    icon: UserCheck,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    href: "/formatos/higiene",
    pending: true
  },
  {
    id: "almacenamiento",
    formType: "almacenamiento" as DailyFormType,
    name: "Almacenamiento (PEPS)",
    desc: "Condiciones de bodegas y cuartos fríos.",
    icon: PackageOpen,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    href: "/formatos/almacenamiento",
    pending: false
  },
  {
    id: "transporte",
    formType: "transporte" as DailyFormType,
    name: "Inspección de Transporte",
    desc: "Verificación de vehículos y temperatura.",
    icon: Truck,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    href: "/formatos/transporte",
    pending: false
  },
  {
    id: "instalaciones",
    formType: "instalaciones" as DailyFormType,
    name: "Inspección Locativa",
    desc: "Estado físico de pisos, paredes y techos.",
    icon: Building2,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    href: "/formatos/instalaciones",
    pending: false
  },
  {
    id: "equipos",
    formType: "equipos" as DailyFormType,
    name: "Estado de Equipos",
    desc: "Revisión y mantenimiento de utensilios.",
    icon: Microwave,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    href: "/formatos/equipos",
    pending: false
  },
];

export default function FormatosDiarios() {
  const { user } = useAuth();
  // null mientras carga o si no aplica (bpm_admin sin companyId, error de red):
  // en ese caso no se oculta nada, se muestran los 10 formatos sin filtrar.
  const [enabledTypes, setEnabledTypes] = useState<Set<DailyFormType> | null>(null);

  useEffect(() => {
    if (!user?.companyId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<CompanyDailyFormStatus[]>(`/companies/${user.companyId}/enabled-forms`);
        if (!cancelled) {
          setEnabledTypes(new Set(data.filter((f) => f.enabled).map((f) => f.formType)));
        }
      } catch {
        // Falla silenciosa: se prefiere mostrar todos los formatos a ocultar
        // de más por un error transitorio de red.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.companyId]);

  const visibleFormatos = enabledTypes
    ? formatos.filter((formato) => enabledTypes.has(formato.formType))
    : formatos;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8" />
            Formatos Diarios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Registros que deben diligenciarse todos los días para cumplir con la normativa.
          </p>
        </div>
        <Link
          href="/formatos/historial"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <History className="w-4 h-4" />
          Ver historial
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleFormatos.map((formato) => {
          const Icon = formato.icon;
          return (
            <Link
              key={formato.id}
              href={formato.href}
              className="group block bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${formato.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {formato.pending && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Pendiente hoy
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                {formato.name}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {formato.desc}
              </p>

              <div className="flex items-center text-sm font-medium text-primary mt-auto">
                Llenar formato
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
