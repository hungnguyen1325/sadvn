"use client";

import type { FormEvent } from "react";
import type { Customer, CreateCustomerRequest } from "@/services/customerService";
import type { Business } from "@/services/businessService";
import { X, User, Phone, Mail, Building2, MapPin, FileText, Sparkles } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  editingCustomer: Customer | null;
  businesses: Business[];
  error: string;
  formData: CreateCustomerRequest;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChangeField: <K extends keyof CreateCustomerRequest>(
    field: K,
    value: CreateCustomerRequest[K]
  ) => void;
}

export function CustomerModal({
  isOpen,
  isSubmitting,
  editingCustomer,
  businesses,
  error,
  formData,
  onClose,
  onSubmit,
  onChangeField,
}: CustomerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? `Cập nhật: ${editingCustomer.name}` : "Thêm khách hàng mới"}
              </h3>
              <p className="text-xs text-slate-500">
                {editingCustomer
                  ? `Mã khách hàng: ${editingCustomer.code}`
                  : "Điền thông tin định danh và phân loại khách hàng"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên khách hàng */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={formData.name}
                onChange={(e) => onChangeField("name", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                disabled={isSubmitting}
                value={formData.phone}
                onChange={(e) => onChangeField("phone", e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email liên hệ
              </label>
              <input
                type="email"
                disabled={isSubmitting}
                value={formData.email || ""}
                onChange={(e) => onChangeField("email", e.target.value)}
                placeholder="khachhang@example.com"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Doanh nghiệp liên kết */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Doanh nghiệp trực thuộc
              </label>
              <select
                disabled={isSubmitting}
                value={formData.businessId || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const bName = businesses.find((b) => b.id === val)?.name;
                  onChangeField("businessId", val);
                  onChangeField("businessName", bName);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">-- Không trực thuộc / Khách độc lập --</option>
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name} ({biz.taxCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Loại khách hàng */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Phân loại khách
              </label>
              <select
                disabled={isSubmitting}
                value={formData.customerType}
                onChange={(e) =>
                  onChangeField("customerType", e.target.value as "individual" | "enterprise")
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="individual">Cá nhân (Bán lẻ)</option>
                <option value="enterprise">Doanh nghiệp / Tổ chức</option>
              </select>
            </div>

            {/* Phân hạng / Tier */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Hạng khách hàng
              </label>
              <select
                disabled={isSubmitting}
                value={formData.tier}
                onChange={(e) =>
                  onChangeField(
                    "tier",
                    e.target.value as "VIP" | "Thân thiết" | "Tiêu chuẩn" | "Đối tác"
                  )
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Tiêu chuẩn">Tiêu chuẩn</option>
                <option value="Thân thiết">Thân thiết</option>
                <option value="VIP">VIP</option>
                <option value="Đối tác">Đối tác chiến lược</option>
              </select>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              Địa chỉ liên hệ
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={formData.address || ""}
              onChange={(e) => onChangeField("address", e.target.value)}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Ghi chú */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              disabled={isSubmitting}
              value={formData.notes || ""}
              onChange={(e) => onChangeField("notes", e.target.value)}
              placeholder="Yêu cầu đặc biệt, lưu ý giao dịch..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                "Lưu thông tin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
