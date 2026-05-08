import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { NewsGrid } from '@/components/news';
import { useNewsStore } from '@/stores/newsStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

export const Favorites = () => {
  const { news, refreshNews } = useNewsStore();
  const { favorites, removeFavorite } = useFavoritesStore();

  useEffect(() => {
    if (favorites.length > 0 && news.length === 0) {
      void refreshNews();
    }
  }, [favorites.length, news.length, refreshNews]);

  const favoriteNews = news.filter(item => favorites.includes(item.id));

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-display text-text-primary mb-2 flex items-center gap-3">
                <Heart className="w-7 h-7 text-red-400 fill-red-400" />
                我的收藏
              </h2>
              <p className="text-text-muted">
                共收藏 {favorites.length} 条热点
              </p>
            </div>
            {favorites.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (confirm('确定要清空所有收藏吗？')) {
                    favorites.forEach(id => removeFavorite(id));
                  }
                }}
                className="btn-secondary flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
                清空收藏
              </motion.button>
            )}
          </div>
        </div>

        {favoriteNews.length > 0 ? (
          <NewsGrid news={favoriteNews} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">暂无收藏</h3>
            <p className="text-text-muted mb-4">浏览热点时点击心形图标即可收藏</p>
            <Link to="/" className="btn-primary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              去发现热点
            </Link>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};
