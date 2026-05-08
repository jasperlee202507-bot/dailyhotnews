import { create } from 'zustand';
import { NewsItem } from '@/types';

interface DetailStore {
  selectedNews: NewsItem | null;
  setSelectedNews: (news: NewsItem | null) => void;
  clearSelectedNews: () => void;
}

export const useDetailStore = create<DetailStore>((set) => ({
  selectedNews: null,
  setSelectedNews: (news) => set({ selectedNews: news }),
  clearSelectedNews: () => set({ selectedNews: null }),
}));
