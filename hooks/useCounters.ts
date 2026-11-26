import { useMemo } from "react";
import { useCountersStore } from "@/store/counters.store";
import { useUIStore } from "@/store/ui.store";

export function useCounters() {
  const counters = useCountersStore((s) => s.counters);
  const isHydrated = useCountersStore((s) => s.isHydrated);
  const storageStatus = useCountersStore((s) => s.storageStatus);

  const searchQuery = useUIStore((s) => s.searchQuery);
  const sortBy = useUIStore((s) => s.sortBy);
  const filterBy = useUIStore((s) => s.filterBy);

  const filteredAndSorted = useMemo(() => {
    let result = [...counters];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.value.toString().includes(q) ||
          (c.color && c.color.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (filterBy === "pinned") {
      result = result.filter((c) => c.pinned);
    } else if (filterBy === "limits") {
      result = result.filter((c) => c.min !== null || c.max !== null);
    }

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "value") {
      result.sort((a, b) => b.value - a.value);
    } else if (sortBy === "updated") {
      result.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (sortBy === "created") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      // Manual order
      result.sort((a, b) => a.order - b.order);
    }

    return result;
  }, [counters, searchQuery, sortBy, filterBy]);

  const pinnedCounters = useMemo(
    () => filteredAndSorted.filter((c) => c.pinned),
    [filteredAndSorted]
  );

  const unpinnedCounters = useMemo(
    () => filteredAndSorted.filter((c) => !c.pinned),
    [filteredAndSorted]
  );

  const totalSum = useMemo(
    () => counters.reduce((sum, c) => sum + c.value, 0),
    [counters]
  );

  return {
    counters: filteredAndSorted,
    pinnedCounters,
    unpinnedCounters,
    totalCount: counters.length,
    totalSum,
    isHydrated,
    storageStatus,
  };
}
