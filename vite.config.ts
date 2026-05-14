import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const devProxy = {
  '/api/aihot': {
    target: 'https://aihot.virxact.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/aihot/, '/api'),
    headers: {
      'User-Agent': UA,
    },
  },
  '/api/bilibili': {
    target: 'https://api.bilibili.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/bilibili/, ''),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://www.bilibili.com/',
    },
  },
  '/api/weibo': {
    target: 'https://weibo.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/weibo/, ''),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://weibo.com/',
      'Accept': 'application/json, text/plain, */*',
    },
  },
  '/api/zhihu-api': {
    target: 'https://api.zhihu.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/zhihu-api/, ''),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://www.zhihu.com/hot',
      'Accept': 'application/json, text/plain, */*',
    },
  },
  '/api/github': {
    target: 'https://api.github.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/github/, ''),
    headers: {
      'User-Agent': 'TraeSoloHotNews/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  },
  '/api/juejin': {
    target: 'https://api.juejin.cn',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/juejin/, ''),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://juejin.cn/',
      'Accept': 'application/json, text/plain, */*',
    },
  },
  '/api/36kr-gateway': {
    target: 'https://gateway.36kr.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/36kr-gateway/, ''),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://www.36kr.com/',
      'Origin': 'https://www.36kr.com',
      'Accept': 'application/json, text/plain, */*',
    },
  },
  '/api/36kr-feed': {
    target: 'https://www.36kr.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/36kr-feed/, '/feed'),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://www.36kr.com/',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
  '/api/ithome': {
    target: 'https://api.ithome.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/ithome/, ''),
    headers: {
      'User-Agent': UA,
      'Referer': 'https://www.ithome.com/',
      'Accept': 'application/json, text/plain, */*',
    },
  },
  '/api/aweme': {
    target: 'https://aweme.snssdk.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/aweme/, ''),
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    },
  },
  '/api/csdn': {
    target: 'https://blog.csdn.net',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/csdn/, ''),
    headers: {
      'User-Agent': UA,
      Referer: 'https://blog.csdn.net/',
      Accept: 'application/json, text/plain, */*',
    },
  },
  '/api/oschina': {
    target: 'https://www.oschina.net',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/oschina/, ''),
    headers: {
      'User-Agent': UA,
      Referer: 'https://www.oschina.net/',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
  '/api/segmentfault': {
    target: 'https://segmentfault.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/segmentfault/, ''),
    headers: {
      'User-Agent': UA,
      Referer: 'https://segmentfault.com/',
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
    },
  },
  '/api/infoq': {
    target: 'https://www.infoq.cn',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/infoq/, ''),
    headers: {
      'User-Agent': UA,
      Referer: 'https://www.infoq.cn/',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
  '/api/ruanyifeng': {
    target: 'https://www.ruanyifeng.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/ruanyifeng/, ''),
    headers: {
      'User-Agent': UA,
      Referer: 'https://www.ruanyifeng.com/blog/',
      Accept: 'application/atom+xml, application/xml, text/xml, */*',
    },
  },
  '/api/stcn': {
    target: 'https://www.stcn.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/stcn/, ''),
    /** 上游必须带 XHR 头才返回 JSON，否则为 HTML；在 proxyReq 上强制设置，避免被转发头覆盖。 */
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('User-Agent', UA);
        proxyReq.setHeader('Referer', 'https://www.stcn.com/article/list/kx.html');
        proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
        proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
      });
    },
  },
  '/api/caixin': {
    target: 'https://www.caixin.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/caixin/, '') || '/',
    headers: {
      'User-Agent': UA,
      Referer: 'https://www.caixin.com/',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  },
};

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
  server: {
    proxy: devProxy,
  },
  preview: {
    proxy: devProxy,
  },
})
