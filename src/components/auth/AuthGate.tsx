"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/components/auth/AuthProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/login");
    } else if (isAuthenticated && isLoginPage) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  if (isLoading) return null;

  if (isLoginPage) {
    return isAuthenticated ? null : <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return <AppLayout>{children}</AppLayout>;
}
