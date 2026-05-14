import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Clock, Flame } from 'lucide-react';
import { NewsItem } from '@/types';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useDetailStore } from '@/stores/detailStore';
import { formatTime, formatHotScore, getHotLevel } from '@/utils/formatters';

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export const NewsCard = ({ news, index }: NewsCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { setSelectedNews } = useDetailStore();
  const hotLevel = getHotLevel(news.hotScore);
  const isFav = isFavorite(news.id);

  const handleCardClick = () => {
    setSelectedNews(news);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(news.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group"
    >
      <Link to={`/detail/${news.id}`} onClick={handleCardClick}>
        <div
          className="news-card relative cursor-pointer flex flex-col min-h-[140px]"
          style={{ borderLeftColor: news.sourceColor, borderLeftWidth: '3px' }}
        >
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 pr-11 text-xs text-text-muted sm:pr-10">
            <span
              className="shrink-0 font-medium px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${news.sourceColor}18`, color: news.sourceColor }}
            >
              {news.sourceName}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <Clock className="h-3 w-3 shrink-0 opacity-70" />
              {formatTime(news.publishTime)}
            </span>
            <span className="flex min-w-0 max-w-full flex-[1_1_220px] items-center gap-1 text-text-secondary sm:flex-[0_1_auto] sm:max-w-md">
              <Flame className="h-3 w-3 shrink-0 text-accent-orange" />
              <span className="truncate tabular-nums">{formatHotScore(news.hotScore)}</span>
            </span>
            {hotLevel.label && (
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 font-bold ${hotLevel.color} bg-current/10 sm:ml-0`}
              >
                {hotLevel.label}
              </span>
            )}
          </div>

          <h3 className="mb-2 line-clamp-3 text-[15px] font-semibold leading-snug text-text-primary sm:text-base group-hover:text-accent-amber transition-colors">
            {news.title}
          </h3>

          {news.summary ? (
            <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-3 flex-1">
              {news.summary}
            </p>
          ) : (
            <div className="flex-1 mb-2" />
          )}

          <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/30">
            {news.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="text-xs text-text-muted bg-surface-active px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>

          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isFav
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-surface/90 text-text-muted hover:text-red-400 border border-border/40'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
