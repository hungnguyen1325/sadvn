import { useCallback, useEffect, useMemo, useState } from "react";
import { businessService, type Business } from "@/services/businessService";

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshBusinesses = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await businessService.getAll();
      setBusinesses(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshBusinesses();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshBusinesses]);

  const filteredBusinesses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return businesses;

    return businesses.filter((business) => {
      const values = [
        business.name,
        business.taxCode,
        business.address ?? "",
        String(business.id),
      ]
        .join(" ")
        .toLowerCase();

      return values.includes(term);
    });
  }, [businesses, searchTerm]);

  return {
    businesses,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredBusinesses,
    refreshBusinesses,
  };
}
