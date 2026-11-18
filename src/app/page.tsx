"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  useEffect(() => {
    // Nếu đã đăng nhập (token còn hạn) → vào thẳng admin
    if (authService.isAuthenticated()) {
      router.push("/admin");
      return;
    }

    // Nếu có tài khoản đã lưu → điền sẵn vào form
    const saved = authService.getSavedCredentials();
    if (saved) {
      setUsername(saved.username);
      setPassword(saved.password);
      setRememberMe(true);
      setHasSavedCredentials(true);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ username, password }, rememberMe);
      router.push("/admin");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Tên đăng nhập hoặc mật khẩu không chính xác"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm w-full max-w-sm">
        <h2 className="text-center font-bold text-lg text-slate-800 mb-6">
          ĐĂNG NHẬP HỆ THỐNG
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold text-slate-600">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setHasSavedCredentials(false); }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-500 bg-white text-slate-900 transition-all"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-600">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setHasSavedCredentials(false); }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-500 bg-white text-slate-900 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 accent-slate-900"
            />
            <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
              Ghi nhớ tài khoản
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer flex justify-center items-center disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang đăng nhập...</span>
              </div>
            ) : hasSavedCredentials ? (
              "Đăng nhập ngay"
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
