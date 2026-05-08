import { NewsItem } from '@/types';
import { NewsCard } from './NewsCard';

interface NewsGridProps {
  news: NewsItem[];
  loading?: boolean;
  error?: string | null;
}

const SkeletonCard = () => (
  <div className="news-card animate-pulse flex flex-col min-h-[140px]">
    <div className="flex gap-2 mb-3">
      <div className="h-5 bg-surface-active rounded w-16" />
      <div className="h-5 bg-surface-active rounded w-24" />
      <div className="h-5 bg-surface-active rounded w-20" />
    </div>
    <div className="h-5 bg-surface-active rounded w-full mb-2" />
    <div className="h-5 bg-surface-active rounded w-[92%] mb-2" />
    <div className="h-4 bg-surface-active rounded w-full mb-4" />
    <div className="flex gap-2 mt-auto pt-2 border-t border-border/20">
      <div className="h-4 bg-surface-active rounded w-14" />
      <div className="h-4 bg-surface-active rounded w-12" />
    </div>
  </div>
);

export const NewsGrid = ({ news, loading, error }: NewsGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">加载失败</h3>
        <p className="text-text-muted text-center max-w-md">{error}</p>
        <p className="text-xs text-text-muted mt-4">
          请按 F12 打开控制台查看详细错误信息
        </p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-4">
          <span className="text-4xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">暂无内容</h3>
        <p className="text-text-muted">数据可能为空，请稍后重试</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {news.map((item, index) => (
        <NewsCard key={item.id} news={item} index={index} />
      ))}
    </div>
  );
};
