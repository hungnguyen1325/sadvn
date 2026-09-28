"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { authService } from "@/services/authService";

interface AdminHeaderProps {
  username: string;
}

export function AdminHeader({ username }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  const navItems = [
    {
      key: "business",
      title: "Doanh nghiệp",
      href: "/admin",
      isActive: pathname === "/admin",
      icon: Building2,
    },
    {
      key: "customers",
      title: "Khách hàng",
      href: "/admin/customers",
      isActive: pathname.startsWith("/admin/customers"),
      icon: Users,
    },
  ];

  const firstLetter = (username || "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Logo */}
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs tracking-tighter">
                S
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 font-sans">
                SADVN
              </span>
            </Link>

            <div className="hidden sm:block h-4 w-px bg-slate-200" />

            {/* Desktop Navigation Segmented Tabs */}
            <nav className="hidden sm:flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.isActive;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        active ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User & Actions */}
          <div className="flex items-center gap-3">
            {/* User Chip */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                {firstLetter}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {username}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-300" : "text-slate-400"}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Đang đăng nhập: <strong className="text-slate-800">{username}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
