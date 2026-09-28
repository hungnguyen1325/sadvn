"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import { AdminHeader } from "./components/AdminHeader";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useUsername() {
  return useSyncExternalStore(
    emptySubscribe,
    () => authService.getUsername() || "admin",
    () => "admin"
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isMounted = useIsMounted();
  const username = useUsername();

  useEffect(() => {
    // Kiểm tra token có tồn tại VÀ còn hạn không
    // Nếu không → logout ngay và redirect về trang login
    if (!authService.isAuthenticated()) {
      authService.handleTokenExpired();
    }
  }, [router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header with redesigned tabs and navigation */}
      <AdminHeader username={username} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
