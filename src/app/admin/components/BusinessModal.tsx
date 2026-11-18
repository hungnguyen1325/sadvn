import type { FormEvent } from "react";
import type { Business } from "@/services/businessService";

interface BusinessModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  editingBusiness: Business | null;
  error: string;
  formName: string;
  formAddress: string;
  formTaxCode: string;
  formIsActive: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChangeName: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeTaxCode: (value: string) => void;
  onToggleActive: (value: boolean) => void;
}

export function BusinessModal({
  isOpen,
  isSubmitting,
  editingBusiness,
  error,
  formName,
  formAddress,
  formTaxCode,
  formIsActive,
  onClose,
  onSubmit,
  onChangeName,
  onChangeAddress,
  onChangeTaxCode,
  onToggleActive,
}: BusinessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-8 relative">
        <h3 className="text-lg font-black text-slate-900 mb-6">
          {editingBusiness ? "Cập nhật doanh nghiệp" : "Thêm doanh nghiệp mới"}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs text-center font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Tên Doanh Nghiệp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={formName}
              onChange={(event) => onChangeName(event.target.value)}
              placeholder="Công ty TNHH SADVN"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Mã Số Thuế <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={formTaxCode}
              onChange={(event) => onChangeTaxCode(event.target.value)}
              placeholder="0101234567"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Địa Chỉ</label>
            <textarea
              disabled={isSubmitting}
              value={formAddress}
              onChange={(event) => onChangeAddress(event.target.value)}
              placeholder="Hà Nội, Việt Nam"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 resize-none"
            />
          </div>

          {editingBusiness && (
            <div className="flex items-center justify-between py-3 border-t border-slate-100 mt-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trạng thái hoạt động
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(event) => onToggleActive(event.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900" />
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
                "Lưu"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
