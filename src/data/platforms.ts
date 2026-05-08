import { PlatformConfig } from '@/types';

export const platforms: PlatformConfig[] = [
  { id: 'bilibili', name: '哔哩哔哩', icon: '📺', color: '#00A1D6', category: 'video' },
  { id: 'weibo', name: '微博', icon: '📱', color: '#E6162D', category: 'social' },
  { id: 'zhihu', name: '知乎', icon: '💬', color: '#0084FF', category: 'social' },
  { id: 'github', name: 'GitHub', icon: '🐙', color: '#24292F', category: 'tech' },
  { id: 'juejin', name: '掘金', icon: '⛏️', color: '#1E80FF', category: 'tech' },
  { id: 'douyin', name: '抖音', icon: '🎵', color: '#000000', category: 'video' },
  { id: '36kr', name: '36氪', icon: '📊', color: '#0080FF', category: 'news' },
  { id: 'ithome', name: 'IT之家', icon: '🏠', color: '#D32F2F', category: 'tech' },
  { id: 'segmentfault', name: '思否', icon: '💻', color: '#009A61', category: 'tech' },
  { id: 'oschina', name: '开源中国', icon: '🌏', color: '#009688', category: 'tech' },
  { id: 'infoq', name: 'InfoQ', icon: '📺', color: '#007DC5', category: 'tech' },
  { id: 'ruanyifeng', name: '阮一峰博客', icon: '📝', color: '#E91E63', category: 'tech' },
  { id: 'csdn', name: 'CSDN', icon: '📚', color: '#FC5531', category: 'tech' },
  { id: 'stcn', name: '证券时报', icon: '💹', color: '#C62828', category: 'finance' },
  { id: 'caixin', name: '财新网', icon: '💰', color: '#8B0000', category: 'finance' },
];

export const getPlatformConfig = (id: string): PlatformConfig | undefined => {
  return platforms.find(p => p.id === id);
};
