import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Clock, Heart, Flame } from 'lucide-react';
import { useNewsStore } from '@/stores/newsStore';

export const Header = () => {
  const [searchInput, setSearchInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { setSearchQuery, refreshNews, loading } = useNewsStore();

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

  const iconBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover active:scale-95 sm:h-11 sm:w-11';

  return (
    <header className="fixed left-0 right-0 top-0 z-50 glass safe-area-pt border-b border-border/30">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 xl:px-6">
        <div className="flex flex-col gap-2.5 py-2.5 lg:h-16 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-0">
          {/* 第一行：品牌（不换行错乱）+ 移动端快捷按钮 */}
          <div className="flex min-w-0 items-center justify-between gap-2 lg:contents">
            <Link
              to="/"
              className="group flex min-w-0 max-w-[calc(100%-7.5rem)] items-center gap-2 sm:max-w-none sm:gap-3 lg:max-w-none lg:shrink-0"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-amber to-accent-orange sm:h-10 sm:w-10"
              >
                <Flame className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-display text-base font-bold leading-tight gradient-text sm:text-lg">
                  每日热点
                </h1>
                <p className="truncate text-[11px] leading-tight text-text-muted sm:text-xs">
                  24小时内最新资讯
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className={iconBtn}
                aria-label="刷新"
              >
                <RefreshCw className={`h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              <Link to="/favorites" className={iconBtn} aria-label="收藏">
                <Heart className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>

          {/* 第二行：搜索（移动端独占一行） */}
          <form
            onSubmit={handleSearch}
            className="w-full min-w-0 lg:order-none lg:mx-4 lg:flex-1 lg:max-w-2xl xl:mx-8"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:left-4" />
              <input
                type="search"
                enterKeyHint="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索热点..."
                className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-amber/50 focus:outline-none focus:ring-1 focus:ring-accent-amber/20 sm:py-2.5 sm:pl-11 sm:pr-4"
              />
            </div>
          </form>

          {/* 桌面端：刷新、收藏、时间 */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex xl:gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:bg-surface-hover"
              aria-label="刷新"
            >
              <RefreshCw className={`h-5 w-5 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
            </motion.button>

            <Link
              to="/favorites"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:bg-surface-hover"
              aria-label="收藏"
            >
              <Heart className="h-5 w-5 text-text-secondary" />
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 xl:px-4">
              <Clock className="h-4 w-4 shrink-0 text-accent-amber" />
              <span className="text-sm tabular-nums text-text-secondary">
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
