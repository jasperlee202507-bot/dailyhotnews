/**
 * 生产环境 /api/* 边缘代理：为上游注入与 vite.config.ts 一致的 UA / Referer / Origin 等，
 * 解决 Netlify 纯 redirects 代理时微博、B 站、36 氪等返回空数据的问题。
 */
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

type Outbound = Record<string, string>;

function mergeHeaders(incoming: Request, outbound: Outbound): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(outbound)) {
    h.set(k, v);
  }
  const accept = incoming.headers.get('accept');
  if (accept) h.set('accept', accept);
  const ct = incoming.headers.get('content-type');
  if (ct) h.set('content-type', ct);
  return h;
}

function resolveUpstream(pathname: string, search: string): { url: string; outbound: Outbound } | null {
  const q = search || '';

  /** 前缀长的优先，避免误匹配 */
  const tryRules: Array<{ prefix: string; resolve: () => string; outbound: Outbound }> = [
    {
      prefix: '/api/36kr-gateway',
      resolve: () => `https://gateway.36kr.com${pathname.replace(/^\/api\/36kr-gateway/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.36kr.com/',
        Origin: 'https://www.36kr.com',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    },
    {
      prefix: '/api/segmentfault',
      resolve: () => `https://segmentfault.com${pathname.replace(/^\/api\/segmentfault/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://segmentfault.com/',
        Accept: 'application/atom+xml, application/xml, text/xml, */*',
      },
    },
    {
      prefix: '/api/zhihu-api',
      resolve: () => `https://api.zhihu.com${pathname.replace(/^\/api\/zhihu-api/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.zhihu.com/hot',
        Accept: 'application/json, text/plain, */*',
      },
    },
    {
      prefix: '/api/ruanyifeng',
      resolve: () => `http://www.ruanyifeng.com${pathname.replace(/^\/api\/ruanyifeng/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'http://www.ruanyifeng.com/blog/',
        Accept: 'application/atom+xml, application/xml, text/xml, */*',
      },
    },
    {
      prefix: '/api/bilibili',
      resolve: () => `https://api.bilibili.com${pathname.replace(/^\/api\/bilibili/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.bilibili.com/',
        Accept: 'application/json, text/plain, */*',
      },
    },
    {
      prefix: '/api/oschina',
      resolve: () => `https://www.oschina.net${pathname.replace(/^\/api\/oschina/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.oschina.net/',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    },
    {
      prefix: '/api/ithome',
      resolve: () => `https://api.ithome.com${pathname.replace(/^\/api\/ithome/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.ithome.com/',
        Accept: 'application/json, text/plain, */*',
      },
    },
    {
      prefix: '/api/github',
      resolve: () => `https://api.github.com${pathname.replace(/^\/api\/github/, '') || '/'}${q}`,
      outbound: { 'User-Agent': 'TraeSoloHotNews/1.0', Accept: 'application/vnd.github.v3+json' },
    },
    {
      prefix: '/api/juejin',
      resolve: () => `https://api.juejin.cn${pathname.replace(/^\/api\/juejin/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://juejin.cn/',
        Accept: 'application/json, text/plain, */*',
      },
    },
    {
      prefix: '/api/caixin',
      resolve: () => {
        const rest = pathname.replace(/^\/api\/caixin/, '') || '/';
        return `https://www.caixin.com${rest}${q}`;
      },
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.caixin.com/',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    },
    {
      prefix: '/api/aihot',
      resolve: () => {
        const pathOnOrigin = pathname.replace(/^\/api\/aihot/, '/api');
        return `https://aihot.virxact.com${pathOnOrigin}${q}`;
      },
      outbound: { 'User-Agent': CHROME_UA, Accept: 'application/json' },
    },
    {
      prefix: '/api/weibo',
      resolve: () => `https://weibo.com${pathname.replace(/^\/api\/weibo/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://weibo.com/',
        Accept: 'application/json, text/plain, */*',
      },
    },
    {
      prefix: '/api/aweme',
      resolve: () => `https://aweme.snssdk.com${pathname.replace(/^\/api\/aweme/, '') || '/'}${q}`,
      outbound: { 'User-Agent': MOBILE_UA, Accept: 'application/json, text/plain, */*' },
    },
    {
      prefix: '/api/csdn',
      resolve: () => `https://blog.csdn.net${pathname.replace(/^\/api\/csdn/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://blog.csdn.net/',
        Accept: 'application/json, text/plain, */*',
      },
    },
    {
      prefix: '/api/infoq',
      resolve: () => `https://www.infoq.cn${pathname.replace(/^\/api\/infoq/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.infoq.cn/',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    },
    {
      prefix: '/api/stcn',
      resolve: () => `https://www.stcn.com${pathname.replace(/^\/api\/stcn/, '') || '/'}${q}`,
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://www.stcn.com/article/list/kx.html',
        Accept: 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  ];

  for (const rule of tryRules) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return { url: rule.resolve(), outbound: rule.outbound };
    }
  }
  return null;
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const resolved = resolveUpstream(url.pathname, url.search);
    if (!resolved) {
      return new Response('API proxy: unknown path', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    const headers = mergeHeaders(request, resolved.outbound);
    const method = request.method;

  /**
   * 36 氪热榜是唯一 POST；Netlify Edge 上偶发「请求体未到上游」会导致 gateway 返回 HTML/500，
   * 浏览器 JSON 解析失败 → 列表为空。对 rank/hot 在校验失败或 body 为空时注入与客户端一致的 JSON。
   */
    let body: BodyInit | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      let text = await request.text();
      const is36krHot =
        url.pathname.includes('/api/36kr-gateway') && url.pathname.includes('nav/rank/hot');
      if (is36krHot) {
        let payloadOk = false;
        const t = text.trim();
        if (t.length > 8) {
          try {
            const j = JSON.parse(t) as { partner_id?: unknown; param?: unknown };
            payloadOk =
              (j?.partner_id === 'wap' || j?.partner_id === 'web') && j?.param != null;
          } catch {
            payloadOk = false;
          }
        }
        if (!payloadOk) {
          text = JSON.stringify({
            partner_id: 'wap',
            param: { siteId: 1, platformId: 2 },
            timestamp: Date.now(),
          });
        }
        headers.set('content-type', 'application/json; charset=utf-8');
        body = text;
      } else {
        body = text.length > 0 ? text : undefined;
      }
    }

    const upstream = await fetch(resolved.url, {
      method,
      headers,
      body,
      redirect: 'follow',
    });

  /**
   * 勿把 upstream.body 直接管道回浏览器：在 Netlify HTTP/2 下易触发
   * net::ERR_HTTP2_PROTOCOL_ERROR（帧/Content-Length 与流式体不一致）。
   * 先读成 ArrayBuffer 再返回，体量对热榜/RSS 可接受。
   */
    const buf = await upstream.arrayBuffer();
    const out = new Headers();
    const ct = upstream.headers.get('content-type');
    if (ct) out.set('content-type', ct);
    else if (buf.byteLength > 0) out.set('content-type', 'application/octet-stream');
    const cc = upstream.headers.get('cache-control');
    if (cc) out.set('cache-control', cc);

    return new Response(buf, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown edge proxy error';
    return new Response(`API proxy failed: ${message}`, {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

export const config = { path: '/api/*' };
