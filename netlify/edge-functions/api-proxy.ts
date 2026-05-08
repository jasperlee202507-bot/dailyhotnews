/**
 * 生产环境 /api/* 边缘代理：为上游注入与 vite.config.ts 一致的 UA / Referer / Origin 等，
 * 解决 Netlify 纯 redirects 代理时微博、B 站、36 氪等返回空数据的问题。
 */
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

type Outbound = Record<string, string>;
type ResolvedUpstream = {
  url: string | string[];
  outbound: Outbound;
  timeoutMs?: number;
  maxAttempts?: number;
};

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

function resolveUpstream(pathname: string, search: string): ResolvedUpstream | null {
  const q = search || '';

  /** 前缀长的优先，避免误匹配 */
  const tryRules: Array<{
    prefix: string;
    resolve: () => string | string[];
    outbound: Outbound;
    timeoutMs?: number;
    maxAttempts?: number;
  }> = [
    {
      prefix: '/api/36kr-dailyhot',
      resolve: () => [
        `https://api-hot.imsyy.top/36kr/new${q}`,
        `https://api-hot.imsyy.top/36kr${q}`,
        `https://api.vvhan.com/api/hotlist/36Ke${q}`,
        `http://api.guiguiya.com/api/hotlist/36kr?type=hot`,
      ],
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://36kr.com/',
        Accept: 'application/json, text/plain, */*',
      },
      timeoutMs: 8000,
      maxAttempts: 1,
    },
    {
      prefix: '/api/36kr-feed',
      resolve: () => [
        `https://www.36kr.com/feed${q}`,
        `https://36kr.com/feed${q}`,
      ],
      outbound: {
        'User-Agent': CHROME_UA,
        Referer: 'https://36kr.com/',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeoutMs: 8000,
      maxAttempts: 1,
    },
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
      timeoutMs: 6000,
      maxAttempts: 1,
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

/** 上游在 TLS/HTTP2 下偶发「读体读到一半断连」；重试常能恢复。 */
function isTransientFetchBodyError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /body from connection|connection reset|broken pipe|UnexpectedEof|unexpected eof|incomplete message|stream error|ECONNRESET|peer closed/i.test(
    msg,
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs?: number): Promise<Response> {
  if (!timeoutMs) return fetch(url, init);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 发起上游 fetch 并整包读入再返回（避免流式回传触发 HTTP/2 协议错误）。
 * 对「读 body 时断连」类错误做有限次重试。
 */
async function fetchUpstreamBuffered(
  url: string | string[],
  init: RequestInit,
  maxAttempts = 3,
  timeoutMs?: number,
): Promise<Response> {
  const urls = Array.isArray(url) ? url : [url];
  let last: unknown;
  for (const upstreamUrl of urls) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const upstream = await fetchWithTimeout(
          upstreamUrl,
          {
            ...init,
            redirect: 'follow',
            cache: 'no-store',
          },
          timeoutMs,
        );
        const buf = await upstream.arrayBuffer();
        const out = new Headers();
        const ct = upstream.headers.get('content-type');
        if (ct) out.set('content-type', ct);
        else if (buf.byteLength > 0) out.set('content-type', 'application/octet-stream');
        const cc = upstream.headers.get('cache-control');
        if (cc) out.set('cache-control', cc);

        const response = new Response(buf, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: out,
        });

        const shouldTryAnotherUrl = urls.length > 1 && !upstream.ok && upstreamUrl !== urls[urls.length - 1];
        const shouldRetrySameUrl = isRetryableStatus(upstream.status) && attempt < maxAttempts;
        if (shouldTryAnotherUrl || shouldRetrySameUrl) {
          last = new Error(`upstream ${upstream.status} from ${upstreamUrl}`);
          await sleep(100 * attempt);
          continue;
        }

        return response;
      } catch (e) {
        last = e;
        if (attempt < maxAttempts && isTransientFetchBodyError(e)) {
          await sleep(100 * attempt);
          continue;
        }
        break;
      }
    }
  }
  throw last;
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

    /**
     * 勿把 upstream.body 直接管道回浏览器：在 Netlify HTTP/2 下易触发
     * net::ERR_HTTP2_PROTOCOL_ERROR。整包缓冲；瞬时读体失败见 fetchUpstreamBuffered 重试。
     */
    return await fetchUpstreamBuffered(resolved.url, {
      method,
      headers,
      body,
    }, resolved.maxAttempts, resolved.timeoutMs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown edge proxy error';
    return new Response(`API proxy failed: ${message}`, {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

export const config = { path: '/api/*' };
