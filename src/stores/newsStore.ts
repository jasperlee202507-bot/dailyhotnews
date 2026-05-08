import { create } from 'zustand';
import { NewsItem, PlatformId } from '@/types';
import { hotSearchApi } from '@/api/hotSearchApi';

interface NewsStore {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  selectedPlatform: PlatformId | 'all';
  searchQuery: string;
  sortBy: 'time' | 'hot';
  setSelectedPlatform: (platform: PlatformId | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'time' | 'hot') => void;
  refreshNews: () => Promise<void>;
  getFilteredNews: () => NewsItem[];
  getNewsById: (id: string) => NewsItem | undefined;
}

const convertApiItemToNewsItem = (apiItem: {
  id: string;
  title: string;
  summary?: string;
  source: string;
  sourceName: string;
  sourceColor: string;
  hotScore: number;
  imageUrl?: string;
  originalUrl: string;
  tags: string[];
  publishTime: Date;
}): NewsItem => {
  return {
    id: apiItem.id,
    title: apiItem.title,
    summary: apiItem.summary || '',
    source: apiItem.source as PlatformId,
    sourceName: apiItem.sourceName,
    sourceColor: apiItem.sourceColor,
    publishTime: apiItem.publishTime,
    hotScore: apiItem.hotScore,
    originalUrl: apiItem.originalUrl,
    tags: apiItem.tags,
    isMock: false,
  };
};

export const useNewsStore = create<NewsStore>((set, get) => ({
  news: [],
  loading: false,
  error: null,
  selectedPlatform: 'all',
  searchQuery: '',
  sortBy: 'hot',

  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortBy: (sort) => set({ sortBy: sort }),

  refreshNews: async () => {
    set({ loading: true, error: null });

    try {
      const realData = await hotSearchApi.fetchAllHotSearches();

      if (realData.length === 0) {
        set({
          news: [],
          loading: false,
          error: '无法获取实时数据：请确认使用 npm run dev / vite preview（需代理），或检查网络与控制台。',
        });
        return;
      }

      const newsItems = realData.map(convertApiItemToNewsItem);
      set({ news: newsItems, loading: false, error: null });
    } catch (error) {
      console.error('刷新新闻失败:', error);
      set({
        news: [],
        loading: false,
        error: '获取实时数据失败，请稍后重试。',
      });
    }
  },

  getFilteredNews: () => {
    const { news, selectedPlatform, searchQuery, sortBy } = get();

    let filtered = news;

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter((item) => item.source === selectedPlatform);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (sortBy === 'time') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      );
    } else {
      filtered = [...filtered].sort((a, b) => b.hotScore - a.hotScore);
    }

    return filtered;
  },

  getNewsById: (id) => {
    return get().news.find((item) => item.id === id);
  },
}));
