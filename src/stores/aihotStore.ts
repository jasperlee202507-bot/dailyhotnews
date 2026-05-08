import { create } from 'zustand';
import { NewsItem, PlatformId } from '@/types';
import { aihotApi, AihotItem } from '@/api/aihotApi';

interface AihotStore {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  mode: 'selected' | 'all';
  category: string;
  searchQuery: string;
  fetchItems: () => Promise<void>;
  setMode: (mode: 'selected' | 'all') => void;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  search: (keyword: string) => Promise<void>;
}

const convertAihotToNewsItem = (item: AihotItem): NewsItem => {
  const categoryLabels: Record<string, string> = {
    'ai-models': '模型发布',
    'ai-products': '产品发布',
    'industry': '行业动态',
    'paper': '论文研究',
    'tip': '技巧观点',
  };

  return {
    id: item.id,
    title: item.title,
    summary: item.summary || '',
    source: 'aihot',
    sourceName: item.source,
    sourceColor: '#6366f1',
    publishTime: new Date(item.publishedAt || Date.now()),
    hotScore: Math.floor(Math.random() * 50000) + 10000,
    imageUrl: undefined,
    originalUrl: item.url,
    tags: [
      item.category ? categoryLabels[item.category] || 'AI动态' : 'AI动态',
      'AIHOT',
    ],
    isMock: false,
  };
};

export const useAihotStore = create<AihotStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  mode: 'selected',
  category: '',
  searchQuery: '',

  fetchItems: async () => {
    set({ loading: true, error: null });

    try {
      const { mode, category } = get();
      let data: AihotItem[] = [];

      if (category) {
        data = await aihotApi.getItemsByCategory(category);
      } else if (mode === 'all') {
        data = await aihotApi.getAllItems();
      } else {
        data = await aihotApi.getSelectedItems();
      }

      const newsItems = data.map(convertAihotToNewsItem);
      set({ items: newsItems, loading: false });
    } catch (error) {
      console.error('获取 AIHOT 数据失败:', error);
      set({ 
        items: [], 
        loading: false, 
        error: '获取 AIHOT 数据失败，请稍后重试' 
      });
    }
  },

  setMode: (mode) => {
    set({ mode, category: '' });
    get().fetchItems();
  },

  setCategory: (category) => {
    set({ category });
    get().fetchItems();
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  search: async (keyword) => {
    set({ loading: true, error: null, category: '' });

    try {
      const data = await aihotApi.searchItems(keyword);
      const newsItems = data.map(convertAihotToNewsItem);
      set({ items: newsItems, loading: false, mode: 'selected' });
    } catch (error) {
      console.error('搜索 AIHOT 失败:', error);
      set({ 
        items: [], 
        loading: false, 
        error: '搜索失败，请稍后重试' 
      });
    }
  },
}));
