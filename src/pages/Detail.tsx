import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, ExternalLink, Clock, Flame, Tag } from 'lucide-react';
import { Layout } from '@/components/layout';
import { useDetailStore } from '@/stores/detailStore';
import { useNewsStore } from '@/stores/newsStore';
import { useAihotStore } from '@/stores/aihotStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { formatTime, formatHotScore, getHotLevel } from '@/utils/formatters';

export const Detail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const selectedNews = useDetailStore((s) => s.selectedNews);
  const newsFromRealtime = useNewsStore((s) =>
    id ? s.news.find((n) => n.id === id) : undefined
  );
  const newsFromAihot = useAihotStore((s) =>
    id ? s.items.find((n) => n.id === id) : undefined
  );
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  /** 侧栏 TOP5、收藏、直链等未经过 NewsCard 时不会写入 detailStore，需按 URL 的 id 从列表反查 */
  const news =
    newsFromRealtime ??
    newsFromAihot ??
    (selectedNews?.id === id ? selectedNews : null);

  if (!id || !news) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">热点不存在</h3>
          <p className="text-text-muted mb-4 text-center max-w-sm px-4">
            该热点可能已被删除或链接错误；若从收藏打开，请先回首页加载列表后再试。
          </p>
          <Link to="/" className="btn-primary">
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }

  const hotLevel = getHotLevel(news.hotScore);
  const isFav = isFavorite(news.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('分享取消');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-1 pb-32 sm:px-0 sm:pb-28"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="glass-card overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${news.sourceColor}20`, color: news.sourceColor }}
              >
                {news.sourceName}
              </span>
              {hotLevel.label && (
                <span className={`px-2 py-1 rounded text-xs font-bold ${hotLevel.color} bg-current/10`}>
                  {hotLevel.label}
                </span>
              )}
            </div>

            <h1 className="break-words text-xl font-bold font-display leading-tight text-text-primary sm:text-2xl">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" />
                {formatTime(news.publishTime)}
              </span>
              <span className="flex min-w-0 items-center gap-1">
                <Flame className="h-4 w-4 shrink-0 text-accent-orange" />
                <span className="truncate tabular-nums">{formatHotScore(news.hotScore)}</span>
                <span className="shrink-0">热度</span>
              </span>
            </div>

            <div className="py-4 border-y border-border/30">
              <p className="text-text-secondary leading-relaxed">
                {news.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-text-muted" />
              {news.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-surface-active text-sm text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-background/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:p-4">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleFavorite(news.id)}
              className={`btn-secondary flex min-h-[44px] items-center justify-center gap-2 px-4 text-sm ${
                isFav ? 'text-red-400 border-red-400/30' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? '已收藏' : '收藏'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="btn-secondary flex min-h-[44px] items-center justify-center gap-2 px-4 text-sm"
            >
              <Share2 className="h-4 w-4" />
              分享
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex min-h-[44px] w-full items-center justify-center gap-2 px-5 text-sm sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              查看原文
            </motion.a>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};
