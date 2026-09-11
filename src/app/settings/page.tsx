"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, Bell, Shield, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, ApiError, type Company } from "@/lib/api";
import { BusinessProfileFormsCard } from "@/components/company/BusinessProfileFormsCard";

export default function Configuración() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const handleAction = (action: string) => {
    alert(`(Mock) Ejecutando acción de configuración: ${action}`);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // bpm_admin no tiene companyId propio (administra empresas clientes desde
  // /admin/companies), así que esta sección solo aplica a admin/supervisor/operario.
  const loadCompany = useCallback(async () => {
    if (!user?.companyId) return;
    try {
      const { company: data } = await api.get<{ company: Company }>("/companies/me");
      setCompany(data);
      setCompanyError(null);
    } catch (err) {
      setCompanyError(err instanceof ApiError ? err.message : "No se pudo cargar la información de la empresa.");
    }
  }, [user?.companyId]);

  useEffect(() => {
    queueMicrotask(loadCompany);
  }, [loadCompany]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 p-2 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            Configuración
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Administra tus preferencias de cuenta y notificaciones del sistema.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Menú lateral de configuración */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-primary shadow-sm text-left">
            <User className="w-5 h-5" />
            Perfil de Usuario
          </button>
          <button onClick={() => handleAction('Notificaciones')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-xl font-medium transition-colors text-left">
            <Bell className="w-5 h-5" />
            Notificaciones
          </button>
          <button onClick={() => handleAction('Seguridad')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-xl font-medium transition-colors text-left">
            <Shield className="w-5 h-5" />
            Seguridad
          </button>
        </div>

        {/* Contenido principal de configuración */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Información del Negocio</h2>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAction('Guardar Perfil'); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Razón Social</label>
                  <input type="text" defaultValue="Empresa Demo S.A.S" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">NIT</label>
                  <input type="text" defaultValue="900.123.456-7" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                <input type="email" defaultValue="admin@empresademo.com" className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-primary/30">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

          {user?.companyId && (
            <>
              {companyError && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  <span>{companyError}</span>
                  <button
                    type="button"
                    onClick={loadCompany}
                    className="inline-flex items-center gap-1.5 font-medium hover:underline shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reintentar
                  </button>
                </div>
              )}
              {company && (
                <BusinessProfileFormsCard
                  companyId={company.id}
                  company={company}
                  canEdit={user.role === "admin"}
                  onCompanyChange={setCompany}
                />
              )}
            </>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Zona de Peligro</h2>
            <p className="text-sm text-slate-500 mb-4">Opciones avanzadas y de cierre de sesión.</p>
            
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 px-4 py-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
