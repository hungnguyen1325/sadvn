"use client";

import { useCallback, useState, type FormEvent } from "react";
import { ToastContainer, type ToastMessage, type ToastType } from "@/components/Toast";
import { businessService, type Business } from "@/services/businessService";
import { BusinessModal } from "./components/BusinessModal";
import { BusinessTable } from "./components/BusinessTable";
import { useBusinesses } from "./hooks/useBusinesses";

interface BusinessFormState {
  name: string;
  address: string;
  taxCode: string;
  isActive: boolean;
}

const emptyBusinessForm = (): BusinessFormState => ({
  name: "",
  address: "",
  taxCode: "",
  isActive: true,
});

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function AdminPage() {
  const { isLoading, searchTerm, setSearchTerm, filteredBusinesses, refreshBusinesses } = useBusinesses();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formState, setFormState] = useState<BusinessFormState>(emptyBusinessForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((previous) => [...previous, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(emptyBusinessForm());
  }, []);

  const handleOpenAddModal = () => {
    setEditingBusiness(null);
    resetForm();
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (business: Business) => {
    setEditingBusiness(business);
    setFormState({
      name: business.name || "",
      address: business.address || "",
      taxCode: business.taxCode || "",
      isActive: business.isActive ?? true,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingBusiness(null);
    setError("");
    resetForm();
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!formState.name.trim()) {
      setError("Vui lòng nhập tên doanh nghiệp");
      return;
    }

    if (!formState.taxCode.trim()) {
      setError("Vui lòng nhập mã số thuế");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingBusiness) {
        await businessService.update({
          id: editingBusiness.id,
          name: formState.name.trim(),
          taxCode: formState.taxCode.trim(),
          address: formState.address.trim() || undefined,
          active: formState.isActive,
        });
        addToast("Cập nhật doanh nghiệp thành công!", "success");
      } else {
        await businessService.create({
          name: formState.name.trim(),
          taxCode: formState.taxCode.trim(),
          address: formState.address.trim() || undefined,
        });
        addToast("Thêm doanh nghiệp mới thành công!", "success");
      }

      handleCloseModal();
      await refreshBusinesses();
    } catch (errorValue) {
      setError(getErrorMessage(errorValue, "Đã xảy ra lỗi khi lưu thông tin"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa doanh nghiệp "${name}" không?`)) {
      return;
    }

    try {
      await businessService.delete(id);
      addToast("Đã xóa doanh nghiệp thành công!", "success");
      await refreshBusinesses();
    } catch (errorValue) {
      addToast(getErrorMessage(errorValue, "Không thể xóa doanh nghiệp"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Tìm kiếm doanh nghiệp, MST..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
          />
          <div className="absolute left-3 top-2.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm doanh nghiệp
        </button>
      </div>

      <BusinessTable
        businesses={filteredBusinesses}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      <BusinessModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        editingBusiness={editingBusiness}
        error={error}
        formName={formState.name}
        formAddress={formState.address}
        formTaxCode={formState.taxCode}
        formIsActive={formState.isActive}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        onChangeName={(value) => setFormState((current) => ({ ...current, name: value }))}
        onChangeAddress={(value) => setFormState((current) => ({ ...current, address: value }))}
        onChangeTaxCode={(value) => setFormState((current) => ({ ...current, taxCode: value }))}
        onToggleActive={(value) => setFormState((current) => ({ ...current, isActive: value }))}
      />
    </div>
  );
}
