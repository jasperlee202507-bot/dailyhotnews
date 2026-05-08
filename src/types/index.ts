export type PlatformCategory = 'video' | 'social' | 'tech' | 'finance' | 'news';

export type PlatformId = 
  | 'aihot'
  | 'bilibili'
  | 'weibo'
  | 'zhihu'
  | 'github'
  | 'juejin'
  | 'douyin'
  | '36kr'
  | 'ithome'
  | 'segmentfault'
  | 'oschina'
  | 'infoq'
  | 'ruanyifeng'
  | 'csdn'
  | 'stcn'
  | 'caixin';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: string;
  color: string;
  category: PlatformCategory;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: PlatformId;
  sourceName: string;
  sourceColor: string;
  publishTime: Date;
  hotScore: number;
  imageUrl?: string;
  originalUrl: string;
  tags: string[];
  isMock?: boolean;
}

export interface NewsState {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  selectedPlatform: PlatformId | 'all';
  searchQuery: string;
  sortBy: 'time' | 'hot';
}

export interface FavoritesState {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}
