import { motion } from 'framer-motion';
import { useNewsStore } from '@/stores/newsStore';
import { platforms } from '@/data/platforms';
import { PlatformId } from '@/types';

export const PlatformTabs = () => {
  const { selectedPlatform, setSelectedPlatform } = useNewsStore();

  const allPlatforms = [
    { id: 'all' as const, name: '全部', icon: '🔥', color: '#f59e0b' },
    ...platforms,
  ];

  return (
    <div className="mb-6">
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          {allPlatforms.map((platform) => {
            const isActive = selectedPlatform === platform.id;
            return (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`platform-tab shrink-0 ${
                  isActive ? 'platform-tab-active' : 'platform-tab-inactive'
                }`}
                style={isActive ? { 
                  background: `linear-gradient(135deg, ${platform.color}20, ${platform.color}10)`,
                  borderColor: platform.color,
                  borderWidth: '1px',
                } : {}}
              >
                <span className="text-lg">{platform.icon}</span>
                <span>{platform.name}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {selectedPlatform !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2"
        >
          <span className="text-sm text-text-muted">当前筛选：</span>
          <span 
            className="text-sm font-medium px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: `${platforms.find(p => p.id === selectedPlatform)?.color}20`,
              color: platforms.find(p => p.id === selectedPlatform)?.color 
            }}
          >
            {platforms.find(p => p.id === selectedPlatform)?.name}
          </span>
          <button
            onClick={() => setSelectedPlatform('all')}
            className="text-sm text-accent-amber hover:underline"
          >
            清除筛选
          </button>
        </motion.div>
      )}
    </div>
  );
};
