"use client";

import React from "react";
import type { Customer } from "@/services/customerService";
import {
  Building2,
  Users,
} from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export function CustomerTable({
  customers,
  isLoading,
}: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3 shadow-xs">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Đang truy vấn dữ liệu từ các database...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
          <Users className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Không tìm thấy khách hàng nào</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Không có kết quả phù hợp với từ khóa hoặc bộ lọc trên các database. Thử thay đổi từ khóa tìm kiếm (họ tên, username, SĐT...).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 sm:px-6">Khách hàng</th>
              <th className="py-3.5 px-4">Nguồn</th>
              <th className="py-3.5 px-4">Thông tin</th>
              <th className="py-3.5 px-4 sm:px-6">Địa chỉ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {customers.map((c) => {
              const isBangGiaVang = c.source === "BangGiaVang";
              const isSadVietNam = c.source === "SADVietNam";

              return (
                <tr
                  key={String(c.id)}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Tên khách hàng */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {c.name}
                    </div>
                  </td>

                  {/* Nguồn Database */}
                  <td className="py-4 px-4">
                    {isBangGiaVang ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
                        <span>Bảng Giá</span>
                      </span>
                    ) : isSadVietNam ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-xs">
                        <span>Isales</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
                        <span>{c.sourceLabel || "Hệ thống"}</span>
                      </span>
                    )}
                  </td>

                  {/* Thông tin liên hệ */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                        >
                          <span>{c.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Chưa có SĐT</span>
                      )}

                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors truncate max-w-xs"
                        >
                          <span className="truncate">{c.email}</span>
                        </a>
                      ) : null}
                    </div>
                  </td>

                  {/* Địa chỉ */}
                  <td className="py-4 px-4 sm:px-6">
                    {c.address ? (
                      <div className="text-xs text-slate-600" title={c.address}>
                        {c.address}
                      </div>
                    ) : c.businessName ? (
                      <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{c.businessName}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Hiển thị <span className="font-bold text-slate-800">{customers.length}</span> kết quả tìm kiếm đa nguồn
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Nguồn dữ liệu: Bảng Giá Vàng &bull; SAD Việt Nam</span>
        </div>
      </div>
    </div>
  );
}
