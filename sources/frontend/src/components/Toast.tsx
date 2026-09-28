"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 flex flex-col space-y-2 sm:space-y-2.5 w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          containerClass: "bg-status-success-bg text-status-success-text border border-status-success-border",
          icon: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-status-success" />,
        };
      case "error":
        return {
          containerClass: "bg-status-danger-bg text-status-danger-text border border-status-danger-border",
          icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-status-danger" />,
        };
      case "warning":
        return {
          containerClass: "bg-status-warning-bg text-status-warning-text border border-status-warning-border",
          icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-status-warning" />,
        };
      default:
        return {
          containerClass: "bg-status-info-bg text-status-info-text border border-status-info-border",
          icon: <Info className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-status-info" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 shadow-lg flex items-center justify-between transition-all duration-300 transform translate-y-0 ${style.containerClass}`}
    >
      <div className="flex items-center space-x-2 sm:space-x-3 pr-1.5 sm:pr-2 min-w-0">
        {style.icon}
        <span className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 break-words">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-70 hover:opacity-100 transition-opacity p-0.5 sm:p-1 cursor-pointer shrink-0 ml-1"
        aria-label="Đóng thông báo"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};
