import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Clock, Flame, ExternalLink, Sparkles } from 'lucide-react';
import { useNewsStore } from '@/stores/newsStore';
import { useAihotStore } from '@/stores/aihotStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { useDetailStore } from '@/stores/detailStore';
import { formatNumber } from '@/utils/formatters';
import { platforms } from '@/data/platforms';
import type { DataSource } from '@/stores/dataSourceStore';

export const Sidebar = () => {
  const { news, sortBy, setSortBy, refreshNews } = useNewsStore();
  const { items: aihotItems, loading: aihotLoading, fetchItems, error: aihotError } = useAihotStore();
  const { favorites } = useFavoritesStore();
  const { source, setSource } = useDataSourceStore();
  const setSelectedNews = useDetailStore((s) => s.setSelectedNews);

  const handleDataSourceChange = (newSource: DataSource) => {
    setSource(newSource);
    if (newSource === 'realtime') {
      refreshNews();
    } else {
      fetchItems();
    }
  };

  const currentNews = source === 'aihot' ? aihotItems : news;

  const topNews = [...currentNews]
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 5);

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-20 space-y-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            数据来源
          </h3>
          <div className="space-y-2">
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => handleDataSourceChange('realtime')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                source === 'realtime'
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              🔴 各平台实时
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => handleDataSourceChange('aihot')}
              disabled={aihotLoading}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                source === 'aihot'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-text-secondary hover:bg-surface-hover'
              } ${aihotLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              🤖 AIHOT 精选{' '}
              {aihotLoading && (
                <span className="animate-spin inline-block w-3 h-3 border-1 border-current border-t-transparent rounded-full" />
              )}
            </motion.button>
          </div>
          {aihotError && <p className="text-xs text-red-400 mt-2">{aihotError}</p>}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-amber" />
            排序方式
          </h3>
          <div className="space-y-2">
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => setSortBy('hot')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'hot'
                  ? 'bg-accent-amber/20 text-accent-amber'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              🔥 按热度排序
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => setSortBy('time')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sortBy === 'time'
                  ? 'bg-accent-amber/20 text-accent-amber'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              🕐 按时间排序
            </motion.button>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent-orange" />
            热度榜 TOP 5
          </h3>
          <div className="space-y-3">
            {topNews.map((item, index) => {
              return (
                <Link
                  key={item.id}
                  to={`/detail/${item.id}`}
                  onClick={() => setSelectedNews(item)}
                  className="block group"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                          : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                            : index === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-surface-active text-text-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary line-clamp-2 group-hover:text-accent-amber transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">{item.sourceName}</span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">{formatNumber(item.hotScore)}热度</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            我的收藏
          </h3>
          {favorites.length > 0 ? (
            <Link
              to="/favorites"
              className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-text-secondary">已收藏 {favorites.length} 条热点</span>
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </Link>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">暂无收藏</p>
          )}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            平台分类
          </h3>
          <div className="flex flex-wrap gap-2">
            {['video', 'social', 'tech', 'finance', 'news'].map((category) => {
              const count = platforms.filter((p) => p.category === category).length;
              const labels: Record<string, string> = {
                video: '视频',
                social: '社交',
                tech: '技术',
                finance: '财经',
                news: '资讯',
              };
              return (
                <span
                  key={category}
                  className="px-3 py-1 rounded-full bg-surface text-xs text-text-secondary"
                >
                  {labels[category]} ({count})
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
