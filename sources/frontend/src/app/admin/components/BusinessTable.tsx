import type { Business } from "@/services/businessService";

interface BusinessTableProps {
  businesses: Business[];
  isLoading: boolean;
  onEdit: (business: Business) => void;
  onDelete: (id: number, name: string) => void;
}

export function BusinessTable({ businesses, isLoading, onEdit, onDelete }: BusinessTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="px-3 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap w-12 sm:w-16">STT</th>
              <th className="px-3 sm:px-6 py-3.5 sm:py-4">Tên Doanh Nghiệp</th>
              <th className="hidden md:table-cell px-6 py-4 whitespace-nowrap">Mã Số Thuế</th>
              <th className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">Địa Chỉ</th>
              <th className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">Trạng Thái</th>
              <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-right whitespace-nowrap w-24 sm:w-32">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-3 sm:px-6 py-3.5 sm:py-4">
                    <div className="h-4 w-6 sm:w-8 rounded bg-slate-100" />
                  </td>
                  <td className="px-3 sm:px-6 py-3.5 sm:py-4">
                    <div className="h-4 w-32 sm:w-44 rounded bg-slate-100" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-4 w-28 rounded bg-slate-100" />
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <div className="h-5 w-16 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right">
                    <div className="h-6 w-14 sm:w-20 rounded ml-auto bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : businesses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                  Không tìm thấy doanh nghiệp nào.
                </td>
              </tr>
            ) : (
              businesses.map((business) => (
                <tr key={business.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-3 sm:px-6 py-3.5 sm:py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                    #{business.id}
                  </td>

                  <td
                    className="px-3 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-900 max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md truncate"
                    title={business.name}
                  >
                    {business.name}
                  </td>

                  <td className="hidden md:table-cell px-6 py-4 font-mono text-slate-500 whitespace-nowrap">
                    {business.taxCode || "—"}
                  </td>

                  <td
                    className="hidden lg:table-cell px-6 py-4 max-w-xs truncate text-slate-500 whitespace-nowrap font-medium"
                    title={business.address}
                  >
                    {business.address || "—"}
                  </td>

                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    {business.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-500/25 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right space-x-1.5 sm:space-x-2 whitespace-nowrap font-bold text-xs">
                    <button
                      type="button"
                      onClick={() => onEdit(business)}
                      className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(business.id, business.name)}
                      className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
