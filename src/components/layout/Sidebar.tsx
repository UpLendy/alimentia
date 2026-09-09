"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  ClipboardList,
  Paperclip,
  Settings,
  BellRing,
  X,
  Users,
  Building2,
  ShieldAlert,
  ListChecks,
  MessageSquareWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Personal", href: "/personal", icon: Users },
  { name: "Infraestructura", href: "/infraestructura", icon: Building2 },
  { name: "Formatos Diarios", href: "/formatos", icon: ClipboardList },
  { name: "Documentos Fijos", href: "/documentos", icon: FileCheck2 },
  { name: "Anexos y Soportes", href: "/anexos", icon: Paperclip },
  { name: "No Conformidades", href: "/no-conformidades", icon: ShieldAlert },
];

// Solo visible para staff de BPM Consulting (role bpm_admin): panel interno
// de avance del Checklist Maestro por empresa cliente, no para el cliente final.
const bpmAdminNavigation = [
  { name: "Checklist Maestro", href: "/admin/checklist", icon: ListChecks },
  { name: "Tickets", href: "/admin/tickets", icon: MessageSquareWarning },
];

interface SidebarProps {
  onClose?: () => void;
}

function NavLink({ item, isActive }: { item: (typeof navigation)[number]; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <item.icon
        className={cn(
          "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
        )}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-border/40 shadow-sm transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/40 shrink-0">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
            <span className="text-lg">B</span>
          </div>
          <span className="hidden md:block">BPM</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return <NavLink key={item.name} item={item} isActive={!!isActive} />;
          })}
        </nav>

        {user?.role === "bpm_admin" && (
          <>
            <p className="px-3 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              BPM Consulting
            </p>
            <nav className="space-y-1.5">
              {bpmAdminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return <NavLink key={item.name} item={item} isActive={!!isActive} />;
              })}
            </nav>
          </>
        )}
      </div>

      <div className="p-4 border-t border-border/40 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
            <BellRing className="h-4 w-4" />
            <span className="text-sm font-semibold">2 Pendientes</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Formato de plagas y limpieza diarios sin llenar.
          </p>
        </div>

        <Link
          href="/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500 transition-transform group-hover:rotate-45 duration-300" />
          Configuración
        </Link>
      </div>
    </div>
  );
}
