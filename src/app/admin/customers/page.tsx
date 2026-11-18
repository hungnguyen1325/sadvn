"use client";

import { CustomerTable } from "./components/CustomerTable";
import { useCustomers } from "../hooks/useCustomers";
import {
  Users,
  Search,
  Coins,
  Layers,
} from "lucide-react";

export default function CustomerManagementPage() {
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredCustomers,
    stats,
    dbStats,
  } = useCustomers();

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards - Showing Multi-Database counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng số kết quả */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng đang hiển thị</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {dbStats ? `Tổng DB: ${dbStats.totalAll.toLocaleString()} bản ghi` : "Từ các database đã kết nối"}
          </div>
        </div>

        {/* Card 2: Bảng Giá Vàng */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Database BangGiaVang</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dbStats?.totalBangGiaVang ? dbStats.totalBangGiaVang.toLocaleString() : stats.bgvCount}
          </div>
          <div className="text-[11px] text-amber-700/80 font-medium mt-1">
            Bảng [ShopsTbl] ({stats.bgvCount} kết quả khớp)
          </div>
        </div>

        {/* Card 3: SAD Việt Nam */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">Database SADVietNam</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dbStats?.totalSadVietNam ? dbStats.totalSadVietNam.toLocaleString() : stats.sadCount}
          </div>
          <div className="text-[11px] text-indigo-700/80 font-medium mt-1">
            Bảng [dmdoitac] ({stats.sadCount} kết quả khớp)
          </div>
        </div>
      </div>

      {/* Live Search Bar across all DBs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tìm kiếm trực tiếp theo tên khách/tiệm, tên đối tác, SĐT, địa chỉ, mã ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <div className="absolute left-3.5 top-3 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <CustomerTable
        customers={filteredCustomers}
        isLoading={isLoading}
      />
    </div>
  );
}
