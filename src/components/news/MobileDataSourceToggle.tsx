import { motion } from 'framer-motion';
import { useNewsStore } from '@/stores/newsStore';
import { useAihotStore } from '@/stores/aihotStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type { DataSource } from '@/stores/dataSourceStore';

/**
 * 侧栏在 lg 以下隐藏，数据源切换在手机上不可见；此条仅 lg:hidden。
 */
export const MobileDataSourceToggle = () => {
  const { refreshNews } = useNewsStore();
  const { fetchItems, loading: aihotLoading, error: aihotError } = useAihotStore();
  const { source, setSource } = useDataSourceStore();

  const handleChange = (next: DataSource) => {
    setSource(next);
    if (next === 'realtime') {
      refreshNews();
    } else {
      fetchItems();
    }
  };

  return (
    <div className="mb-6 lg:hidden">
      <p className="mb-2 text-xs font-medium text-text-muted">数据来源</p>
      <div className="flex rounded-xl border border-border/50 bg-surface/70 p-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => handleChange('realtime')}
          className={`relative flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
            source === 'realtime'
              ? 'bg-green-500/25 text-green-400 shadow-sm'
              : 'text-text-secondary active:bg-surface-hover'
          }`}
        >
          各平台实时
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => handleChange('aihot')}
          disabled={aihotLoading}
          className={`relative flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
            source === 'aihot'
              ? 'bg-purple-500/25 text-purple-400 shadow-sm'
              : 'text-text-secondary active:bg-surface-hover'
          } ${aihotLoading ? 'opacity-60' : ''}`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            AIHOT 精选
            {aihotLoading && (
              <span
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
            )}
          </span>
        </motion.button>
      </div>
      {source === 'aihot' && aihotError && (
        <p className="mt-2 text-xs text-red-400">{aihotError}</p>
      )}
    </div>
  );
};
