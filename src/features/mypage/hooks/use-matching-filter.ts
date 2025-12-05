import { useState, useEffect, useCallback } from "react";
import apis, { MatchingFilters } from "../apis";
import { AMPLITUDE_KPI_EVENTS } from "@/src/shared/constants/amplitude-kpi-events";

export const useMatchingFilters = () => {
  const [filters, setFilters] = useState<MatchingFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
    if (!filters || isUpdating) return;

    const previousValue = filters.avoidDepartment;
    const newFlag = !filters.avoidDepartment;

    setIsUpdating(true);
    setFilters({ ...filters, avoidDepartment: newFlag });

    try {
      await apis.updateAvoidDepartmentFilter(newFlag);

      const amplitude = (global as any).amplitude || {
        track: (event: string, properties: any) => {
          console.log('Amplitude Event:', event, properties);
        },
      };

      amplitude.track(AMPLITUDE_KPI_EVENTS.FILTER_APPLIED, {
        filter_type: 'avoid_department',
        filter_value: newFlag,
        previous_value: previousValue,
        timestamp: new Date().toISOString(),
      });

      await fetchFilters();
    } catch (err) {
      setFilters({ ...filters, avoidDepartment: previousValue });
      setError(err as Error);
      console.error("Failed to update department filter:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [filters, isUpdating, fetchFilters]);

  const toggleAvoidUniversity = useCallback(async () => {
    if (!filters || isUpdating) return;

    const previousValue = filters.avoidUniversity;
    const newFlag = !filters.avoidUniversity;

    setIsUpdating(true);
    setFilters({ ...filters, avoidUniversity: newFlag });

    try {
      await apis.updateAvoidUniversityFilter(newFlag);

      const amplitude = (global as any).amplitude || {
        track: (event: string, properties: any) => {
          console.log('Amplitude Event:', event, properties);
        },
      };

      amplitude.track(AMPLITUDE_KPI_EVENTS.FILTER_APPLIED, {
        filter_type: 'avoid_university',
        filter_value: newFlag,
        previous_value: previousValue,
        timestamp: new Date().toISOString(),
      });

      await fetchFilters();
    } catch (err) {
      setFilters({ ...filters, avoidUniversity: previousValue });
      setError(err as Error);
      console.error("Failed to update university filter:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [filters, isUpdating, fetchFilters]);

  return {
    filters,
    isLoading,
    isUpdating,
    error,
    toggleAvoidDepartment,
    toggleAvoidUniversity,
    refetchFilters: fetchFilters,
  };
};
