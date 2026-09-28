"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/authService";

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

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header constrained to max-w-7xl mx-auto */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black tracking-widest text-slate-950">SADVN</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-slate-500 font-medium">
              Xin chào, <span className="font-bold text-slate-900">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
