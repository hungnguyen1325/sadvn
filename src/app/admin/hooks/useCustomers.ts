import { useCallback, useEffect, useMemo, useState } from "react";
import {
  customerService,
  type Customer,
  type MultiDbStats,
} from "@/services/customerService";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dbStats, setDbStats] = useState<MultiDbStats | null>(null);

  const refreshCustomers = useCallback(
    async (query: string = searchTerm) => {
      setIsLoading(true);
      try {
        const [custList, statsData] = await Promise.all([
          customerService.searchMultiDb(query, "ALL", 5000),
          customerService.getStats().catch(() => null),
        ]);
        setCustomers(custList);
        if (statsData) setDbStats(statsData);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm]
  );

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshCustomers(searchTerm);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search input to query live multi-databases
  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshCustomers(searchTerm);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const stats = useMemo(() => {
    const total = customers.length;
    const bgvCount = customers.filter((c) => c.source === "BangGiaVang").length;
    const sadCount = customers.filter((c) => c.source === "SADVietNam").length;
    return {
      total,
      bgvCount,
      sadCount,
      serverStats: dbStats,
    };
  }, [customers, dbStats]);

  return {
    customers,
    setCustomers,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredCustomers: customers,
    stats,
    dbStats,
    refreshCustomers,
  };
}
