import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNewsStore } from '@/stores/newsStore';
import { useAihotStore } from '@/stores/aihotStore';

export type DataSource = 'realtime' | 'aihot';

interface DataSourceStore {
  source: DataSource;
  setSource: (source: DataSource) => void;
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set) => ({
      source: 'realtime',
      setSource: (source) => set({ source }),
    }),
    {
      name: 'data-source-v2',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.source === 'aihot') {
          if (useAihotStore.getState().items.length === 0) {
            void useAihotStore.getState().fetchItems();
          }
        } else {
          void useNewsStore.getState().refreshNews();
        }
      },
    }
  )
);
