import { create } from "zustand";
import { SortOption } from "@/types/counter";

export type FilterOption = "all" | "pinned" | "limits";

interface UIState {
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  isCreateOpen: boolean;
  editingCounterId: string | null;
  historyCounterId: string | null;
  isSettingsOpen: boolean;
  isShortcutsOpen: boolean;
  focusedCounterId: string | null;

  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  openCreate: () => void;
  closeCreate: () => void;
  openEdit: (id: string) => void;
  closeEdit: () => void;
  openHistory: (id: string) => void;
  closeHistory: () => void;
  setSettingsOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setFocusedCounterId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  sortBy: "manual",
  filterBy: "all",
  isCreateOpen: false,
  editingCounterId: null,
  historyCounterId: null,
  isSettingsOpen: false,
  isShortcutsOpen: false,
  focusedCounterId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterBy: (filterBy) => set({ filterBy }),
  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),
  openEdit: (id) => set({ editingCounterId: id }),
  closeEdit: () => set({ editingCounterId: null }),
  openHistory: (id) => set({ historyCounterId: id }),
  closeHistory: () => set({ historyCounterId: null }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
  setFocusedCounterId: (id) => set({ focusedCounterId: id }),
}));
