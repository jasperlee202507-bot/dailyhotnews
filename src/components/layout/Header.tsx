import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Clock, Heart, Flame, TrendingUp } from 'lucide-react';
import { useNewsStore } from '@/stores/newsStore';

export const Header = () => {
  const [searchInput, setSearchInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { setSearchQuery, refreshNews, loading, selectedPlatform } = useNewsStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleRefresh = () => {
    refreshNews();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-amber to-accent-orange flex items-center justify-center"
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold font-display gradient-text">
                每日热点
              </h1>
              <p className="text-xs text-text-muted -mt-0.5">
                24小时内最新资讯
              </p>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索热点..."
                className="w-full pl-11 pr-4 py-2.5 bg-surface border border-border rounded-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/20 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-full bg-surface hover:bg-surface-hover border border-border transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
            </motion.button>

            <Link
              to="/favorites"
              className="p-2 rounded-full bg-surface hover:bg-surface-hover border border-border transition-colors"
            >
              <Heart className="w-5 h-5 text-text-secondary" />
            </Link>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border">
              <Clock className="w-4 h-4 text-accent-amber" />
              <span className="text-sm text-text-secondary">
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
