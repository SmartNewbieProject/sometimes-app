import { useState, useEffect, useCallback } from "react";
import apis, { MatchingFilters } from "../apis";

export const useMatchingFilters = () => {
  const [filters, setFilters] = useState<MatchingFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFilters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentFilters = await apis.getCurrentMatchingFilters();
      setFilters(currentFilters);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch matching filters:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const toggleAvoidDepartment = useCallback(async () => {
    if (!filters) return;

    try {
      const newFlag = !filters.avoidDepartment;
      await apis.updateAvoidDepartmentFilter(newFlag);

      await fetchFilters();
    } catch (err) {
      setError(err as Error);
      console.error("Failed to update department filter:", err);
    }
  }, [filters, fetchFilters]);

  const toggleAvoidUniversity = useCallback(async () => {
    if (!filters) return;

    try {
      const newFlag = !filters.avoidUniversity;
      await apis.updateAvoidUniversityFilter(newFlag);

      await fetchFilters();
    } catch (err) {
      setError(err as Error);
      console.error("Failed to update university filter:", err);
    }
  }, [filters, fetchFilters]);

  return {
    filters,
    isLoading,
    error,
    toggleAvoidDepartment,
    toggleAvoidUniversity,
    refetchFilters: fetchFilters,
  };
};
