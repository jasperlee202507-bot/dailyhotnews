import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { PlatformTabs, NewsGrid, MobileDataSourceToggle } from '@/components/news';
import { useNewsStore } from '@/stores/newsStore';
import { useAihotStore } from '@/stores/aihotStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { getPlatformConfig } from '@/data/platforms';

export const Home = () => {
  const { getFilteredNews, loading, selectedPlatform, error: newsError } = useNewsStore();
  const { items: aihotItems, loading: aihotLoading, fetchItems, error: aihotError } = useAihotStore();
  const { source } = useDataSourceStore();

  useEffect(() => {
    if (source === 'aihot' && aihotItems.length === 0) {
      fetchItems();
    }
  }, [source, aihotItems.length, fetchItems]);

  useEffect(() => {
    if (source !== 'aihot') {
      void useNewsStore.getState().refreshNews();
    }
  }, [source]);

  const filteredNews = source === 'aihot' ? aihotItems : getFilteredNews();
  const isLoading = source === 'aihot' ? aihotLoading : loading;
  const error = source === 'aihot' ? aihotError : newsError;

  const getTitle = () => {
    if (source === 'aihot') {
      return '🤖 AIHOT 精选';
    }
    if (selectedPlatform === 'all') return '🔴 实时热点';
    const cfg = getPlatformConfig(selectedPlatform);
    return `🔴 ${cfg?.name ?? selectedPlatform} · 实时`;
  };

  const getDescription = () => {
    if (source === 'aihot') {
      return 'AIHOT 每日从几百个信源中精选的高价值 AI 资讯';
    }
    return `共 ${filteredNews.length} 条各平台实时热点`;
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-2 break-words text-xl font-bold font-display text-text-primary sm:text-2xl">
              {getTitle()}
            </h2>
            <p className="break-words text-sm text-text-muted sm:text-base">
              {getDescription()}
            </p>
          </motion.div>
        </div>

        <MobileDataSourceToggle />

        {source !== 'aihot' && <PlatformTabs />}

        <NewsGrid news={filteredNews} loading={isLoading} error={error} />
      </motion.div>
    </Layout>
  );
};
