import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (id) => set((state) => ({
        favorites: [...state.favorites, id]
      })),
      
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter(f => f !== id)
      })),
      
      toggleFavorite: (id) => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.includes(id)) {
          removeFavorite(id);
        } else {
          addFavorite(id);
        }
      },
      
      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: 'news-favorites',
    }
  )
);
