export interface HotSearchItem {
  id: string;
  title: string;
  summary?: string;
  source: string;
  sourceName: string;
  sourceColor: string;
  hotScore: number;
  imageUrl?: string;
  originalUrl: string;
  tags: string[];
  publishTime: Date;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

const defaultConfig: ApiConfig = {
  baseUrl: 'https://api.example.com',
  timeout: 15000,
};

export class HotSearchApi {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs?: number,
  ): Promise<Response> {
    const ms = timeoutMs ?? this.config.timeout ?? 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async fetchWeiboHotSearch(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/weibo/ajax/side/hotSearch', {
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) {
        console.error(`微博API错误: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return this.parseWeiboHotSearchData(data);
    } catch (error) {
      console.error('获取微博热搜失败:', error);
      return [];
    }
  }

  async fetchZhihuHotSearch(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/zhihu-api/topstory/hot-list', {
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) {
        console.error(`知乎API错误: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return this.parseZhihuHotListData(data);
    } catch (error) {
      console.error('获取知乎热榜失败:', error);
      return [];
    }
  }

  async fetchBilibiliHotSearch(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/bilibili/x/web-interface/popular?ps=20&pn=1', {
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) {
        console.error(`B站API错误: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return this.parseBilibiliData(data);
    } catch (error) {
      console.error('获取B站热门失败:', error);
      return [];
    }
  }

  async fetchGitHubTrending(): Promise<HotSearchItem[]> {
    try {
      const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const q = encodeURIComponent(`stars:>800 pushed:>${since}`);
      const response = await this.fetchWithTimeout(
        `/api/github/search/repositories?q=${q}&sort=stars&order=desc&per_page=20`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        console.error(`GitHub API错误: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return this.parseGitHubData(data);
    } catch (error) {
      console.error('获取GitHub趋势失败:', error);
      return [];
    }
  }

  async fetchJuejinHot(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout(
        '/api/juejin/content_api/v1/content/article_rank?category_id=1&type=hot',
        { headers: { Accept: 'application/json, text/plain, */*' } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return this.parseJuejinData(data);
    } catch (error) {
      console.error('获取掘金热榜失败:', error);
      return [];
    }
  }

  /** 网关热榜；失败或空列表返回 []（不拉 RSS，便于与 RSS 并行）。 */
  private async fetch36krGatewayHot(): Promise<HotSearchItem[]> {
    try {
      const body = JSON.stringify({
        partner_id: 'wap',
        param: { siteId: 1, platformId: 2 },
        timestamp: Date.now(),
      });
      const response = await this.fetchWithTimeout(
        '/api/36kr-gateway/api/mis/nav/home/nav/rank/hot',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Accept: 'application/json, text/plain, */*',
          },
          body,
        },
        12000,
      );
      if (!response.ok) return [];
      const data = await response.json();
      return this.parse36krHotData(data);
    } catch {
      return [];
    }
  }

  async fetch36krHot(): Promise<HotSearchItem[]> {
    try {
      const [fromGateway, fromRss] = await Promise.all([
        this.fetch36krGatewayHot(),
        this.fetch36krFeedFallback(),
      ]);
      return fromGateway.length > 0 ? fromGateway : fromRss;
    } catch (error) {
      console.error('获取36氪热榜失败:', error);
      return this.fetch36krFeedFallback();
    }
  }

  private async fetch36krFeedFallback(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout(
        '/api/36kr-feed',
        {
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
        },
        35000,
      );
      if (!response.ok) return [];
      const xml = await response.text();
      return this.parseRss2AsHotItems(xml, {
        source: '36kr',
        sourceName: '36氪',
        sourceColor: '#0080FF',
        idPrefix: '36kr',
        max: 30,
        tagSlugs: ['news', '热门', '实时'],
      });
    } catch (error) {
      console.error('获取36氪RSS兜底失败:', error);
      return [];
    }
  }

  async fetchIthomeNews(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/ithome/json/newslist/news?r=0', {
        headers: { Accept: 'application/json, text/plain, */*' },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return this.parseIthomeData(data);
    } catch (error) {
      console.error('获取IT之家资讯失败:', error);
      return [];
    }
  }

  async fetchDouyinHotSearch(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/aweme/aweme/v1/hot/search/list/', {
        headers: { Accept: 'application/json, text/plain, */*' },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return this.parseDouyinHotData(data);
    } catch (error) {
      console.error('获取抖音热榜失败:', error);
      return [];
    }
  }

  private parseJuejinData(data: { err_no?: number; data?: unknown[] }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    if (data?.err_no !== 0 || !Array.isArray(data.data)) return items;

    data.data.forEach((raw: unknown, index: number) => {
      const row = raw as {
        content?: { content_id?: string; title?: string; brief?: string };
        content_counter?: { hot_rank?: number; view?: number; like?: number };
        author?: { name?: string };
      };
      const c = row.content;
      const title = (c?.title || '').trim();
      const cid = c?.content_id != null ? String(c.content_id) : '';
      if (!title || !cid) return;

      const hot = row.content_counter?.hot_rank ?? row.content_counter?.view ?? row.content_counter?.like ?? 0;
      const summary = (c?.brief || '').trim();
      const by = row.author?.name ? `作者：${row.author.name}` : '';

      items.push({
        id: `juejin-${cid}`,
        title,
        summary: summary || by,
        source: 'juejin',
        sourceName: '掘金',
        sourceColor: '#1E80FF',
        hotScore: Number(hot) || Math.max(0, 1000 - index * 10),
        imageUrl: undefined,
        originalUrl: `https://juejin.cn/post/${cid}`,
        tags: ['tech', '热门', '实时'],
        publishTime: new Date(),
      });
    });

    return items;
  }

  private parse36krHotData(data: { code?: number | string; data?: { hotRankList?: unknown[] } }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    const codeOk = Number(data?.code) === 0;
    const list = codeOk ? data.data?.hotRankList : undefined;
    if (!Array.isArray(list)) return items;

    list.forEach((raw: unknown) => {
      const row = raw as {
        itemId?: number | string;
        templateMaterial?: {
          itemId?: number | string;
          widgetTitle?: string;
          widgetImage?: string;
          authorName?: string;
          statRead?: number;
        };
      };
      const m = row.templateMaterial;
      const title = (m?.widgetTitle || '').trim();
      const rawId = row.itemId ?? m?.itemId;
      const iid = rawId != null ? String(rawId) : '';
      if (!title || !iid) return;

      items.push({
        id: `36kr-${iid}`,
        title,
        summary: m?.authorName ? `${m.authorName} · 阅读 ${m?.statRead ?? 0}` : `阅读 ${m?.statRead ?? 0}`,
        source: '36kr',
        sourceName: '36氪',
        sourceColor: '#0080FF',
        hotScore: Number(m?.statRead) || 0,
        imageUrl: m?.widgetImage,
        originalUrl: `https://www.36kr.com/p/${iid}`,
        tags: ['news', '热门', '实时'],
        publishTime: new Date(),
      });
    });

    return items;
  }

  private parseIthomeData(data: { newslist?: unknown[] }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    const list = data?.newslist;
    if (!Array.isArray(list)) return items;

    list.slice(0, 30).forEach((raw: unknown) => {
      const row = raw as {
        newsid?: number;
        title?: string;
        description?: string;
        hitcount?: number;
        image?: string;
        url?: string;
        postdate?: string;
      };
      const title = (row.title || '').trim();
      if (!title || row.newsid == null) return;

      const sid = String(row.newsid);
      const pathMid = sid.length > 3 ? `${sid.slice(0, -3)}/${sid.slice(-3)}` : `0/${sid.padStart(3, '0')}`;
      const fallbackUrl = `https://www.ithome.com/0/${pathMid}.htm`;

      items.push({
        id: `ithome-${row.newsid}`,
        title,
        summary: (row.description || '').trim(),
        source: 'ithome',
        sourceName: 'IT之家',
        sourceColor: '#D32F2F',
        hotScore: Number(row.hitcount) || 0,
        imageUrl: row.image,
        originalUrl: (row.url && row.url.startsWith('http')) ? row.url : fallbackUrl,
        tags: ['tech', '热门', '实时'],
        publishTime: row.postdate ? new Date(row.postdate) : new Date(),
      });
    });

    return items;
  }

  private parseDouyinHotData(data: { status_code?: number; data?: { word_list?: unknown[] } }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    if (data?.status_code !== 0 || !Array.isArray(data.data?.word_list)) return items;

    data.data!.word_list!.forEach((raw: unknown, index: number) => {
      const row = raw as {
        word?: string;
        sentence_id?: string;
        group_id?: string;
        hot_value?: number | string;
        word_cover?: { url_list?: string[] };
      };
      const title = (row.word || '').trim();
      const sid = row.sentence_id != null ? String(row.sentence_id) : '';
      if (!title || !sid) return;

      const hot = typeof row.hot_value === 'number' ? row.hot_value : parseInt(String(row.hot_value || '0'), 10);
      const cover = row.word_cover?.url_list?.[0];

      items.push({
        id: `douyin-${sid}`,
        title,
        summary: '抖音热搜',
        source: 'douyin',
        sourceName: '抖音',
        sourceColor: '#000000',
        hotScore: hot || Math.max(0, 5000000 - index * 50000),
        imageUrl: cover,
        originalUrl: `https://www.douyin.com/hot/${encodeURIComponent(sid)}`,
        tags: ['video', '热门', '实时'],
        publishTime: new Date(),
      });
    });

    return items;
  }

  private parseWeiboHotSearchData(data: { ok?: number; data?: { realtime?: unknown[] } }): HotSearchItem[] {
    const items: HotSearchItem[] = [];

    if (!data?.ok || !Array.isArray(data.data?.realtime)) {
      return items;
    }

    data.data!.realtime!.forEach((raw: unknown, index: number) => {
      const item = raw as {
        word?: string;
        note?: string;
        num?: number | string;
        icon?: string;
        word_scheme?: string;
      };
      const title = (item.word || '').trim();
      if (!title) return;

      const num = typeof item.num === 'number' ? item.num : parseInt(String(item.num || '0'), 10) || 0;
      const link =
        typeof item.word_scheme === 'string' && /^https?:\/\//i.test(item.word_scheme)
          ? item.word_scheme
          : `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`;

      items.push({
        id: `weibo-${title}-${index}`,
        title,
        summary: item.note || '',
        source: 'weibo',
        sourceName: '微博',
        sourceColor: '#E6162D',
        hotScore: num,
        imageUrl: item.icon,
        originalUrl: link,
        tags: ['social', '热门', '实时'],
        publishTime: new Date(),
      });
    });

    return items;
  }

  private parseZhihuHeat(detailText: string): number {
    if (!detailText) return 0;
    const wan = detailText.match(/([\d.]+)\s*万/);
    if (wan) return Math.round(parseFloat(wan[1]) * 10000);
    const digits = detailText.match(/(\d+)/);
    return digits ? parseInt(digits[1], 10) : 0;
  }

  /**
   * `JSON.parse` 会把超过 JS 安全整数的问题 id 四舍五入，导致用 `target.id` 拼出的链接错误。
   * API 里的 `target.url` 是字符串，其中的 id 始终正确，应优先用它（或 `card_id`）生成网页链接。
   */
  private normalizeZhihuApiUrlToWeb(apiUrl: string): string {
    const trimmed = apiUrl.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return 'https://www.zhihu.com/hot';
    }
    try {
      const u = new URL(trimmed);
      if (u.hostname === 'api.zhihu.com') {
        u.hostname = 'www.zhihu.com';
      }
      let path = u.pathname;
      if (path.startsWith('/articles/')) {
        const id = path.slice('/articles/'.length).replace(/\/$/, '');
        return `https://zhuanlan.zhihu.com/p/${id}${u.search}${u.hash}`;
      }
      path = path.replace(/^\/questions\//i, '/question/').replace(/^\/answers\//i, '/answer/');
      u.pathname = path;
      return u.toString();
    } catch {
      return trimmed
        .replace(/\/\/api\.zhihu\.com/gi, '//www.zhihu.com')
        .replace(/\/questions\//gi, '/question/')
        .replace(/\/answers\//gi, '/answer/');
    }
  }

  private extractZhihuQuestionIdFromApiUrl(apiUrl: string): string | null {
    const m = apiUrl.match(/\/questions\/(\d+)/i);
    return m ? m[1] : null;
  }

  private parseZhihuHotListData(data: { data?: unknown[] }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    const list = data?.data;

    if (!Array.isArray(list)) {
      return items;
    }

    list.forEach((raw: unknown) => {
      const card = raw as {
        card_id?: string;
        target?: {
          id?: number | string;
          title?: string;
          excerpt?: string;
          url?: string;
        };
        children?: Array<{ thumbnail?: string }>;
        detail_text?: string;
      };
      const target = card?.target;
      const title = (target?.title || '').trim();
      if (!title) return;

      const apiUrl = (target?.url || '').trim();
      const fromCardId = card.card_id?.match(/^Q_(\d+)$/)?.[1];
      const qidFromUrl = apiUrl ? this.extractZhihuQuestionIdFromApiUrl(apiUrl) : null;
      const questionIdStr = qidFromUrl ?? fromCardId;
      if (!questionIdStr) return;

      const originalUrl = apiUrl
        ? this.normalizeZhihuApiUrlToWeb(apiUrl)
        : `https://www.zhihu.com/question/${questionIdStr}`;

      const thumb = card.children?.[0]?.thumbnail;
      const hotScore = this.parseZhihuHeat(card.detail_text || '');

      items.push({
        id: `zhihu-${questionIdStr}`,
        title,
        summary: target?.excerpt || '',
        source: 'zhihu',
        sourceName: '知乎',
        sourceColor: '#0084FF',
        hotScore,
        imageUrl: thumb,
        originalUrl,
        tags: ['social', '热门', '实时'],
        publishTime: new Date(),
      });
    });

    return items;
  }

  private parseBilibiliData(data: { code?: number; data?: { list?: unknown[] } }): HotSearchItem[] {
    const items: HotSearchItem[] = [];

    if (!data || data.code !== 0) {
      return items;
    }

    const list = data.data?.list || [];

    list.forEach((raw: unknown) => {
      const item = raw as {
        title?: string;
        desc?: string;
        aid?: number;
        bvid?: string;
        pubdate?: number;
        stat?: { view?: number };
      };
      if (!item?.title) return;

      items.push({
        id: `bilibili-${item.bvid || item.aid || Math.random().toString(36)}`,
        title: item.title,
        summary: item.desc || '',
        source: 'bilibili',
        sourceName: '哔哩哔哩',
        sourceColor: '#00A1D6',
        hotScore: item.stat?.view || 0,
        originalUrl: `https://www.bilibili.com/video/${item.bvid || `av${item.aid}`}`,
        tags: ['video', '热门', '实时'],
        publishTime: new Date((item.pubdate || 0) * 1000 || Date.now()),
      });
    });

    return items;
  }

  private parseGitHubData(data: { items?: unknown[] }): HotSearchItem[] {
    const items: HotSearchItem[] = [];

    if (!data || !Array.isArray(data.items)) {
      return items;
    }

    data.items.forEach((raw: unknown) => {
      const item = raw as {
        id?: number | string;
        full_name?: string;
        name?: string;
        description?: string | null;
        stargazers_count?: number;
        owner?: { avatar_url?: string };
        html_url?: string;
        url?: string;
        created_at?: string;
      };
      items.push({
        id: `github-${item.id || item.name}`,
        title: `${item.full_name || item.name}: ${item.description || ''}`,
        summary: item.description || '',
        source: 'github',
        sourceName: 'GitHub',
        sourceColor: '#24292F',
        hotScore: parseInt(String(item.stargazers_count || '0'), 10),
        imageUrl: item.owner?.avatar_url,
        originalUrl: item.html_url || item.url || '',
        tags: ['tech', '热门', '趋势'],
        publishTime: new Date(item.created_at || Date.now()),
      });
    });

    return items;
  }

  private firstXmlChildText(parent: Element | Document, tag: string): string {
    const el = parent.getElementsByTagName(tag)[0];
    return (el?.textContent || '').trim();
  }

  private stripHtmlSnippet(html: string): string {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
      return (doc.body.textContent || '').trim();
    } catch {
      return html.replace(/<[^>]+>/g, '').trim();
    }
  }

  private atomEntryLinkHref(entry: Element): string {
    const links = Array.from(entry.getElementsByTagName('link'));
    for (const el of links) {
      const rel = (el.getAttribute('rel') || '').toLowerCase();
      const href = el.getAttribute('href');
      if (href && rel === 'alternate') return href;
    }
    for (const el of links) {
      const rel = (el.getAttribute('rel') || '').toLowerCase();
      const href = el.getAttribute('href');
      if (href && rel !== 'replies' && rel !== 'self') return href;
    }
    return links[0]?.getAttribute('href') || '';
  }

  /**
   * 生成只占「一个 URL path 段」的 id，供 `/detail/:id` 使用。
   * Atom 的 `<id>tag:host,2026:/blog/1.xxx</id>` 含 `:`、`/`，不能直接拼进路由。
   */
  private stableIdFromArticleUrl(prefix: string, url: string): string {
    const trimmed = url.trim().split('#')[0].split('?')[0];
    try {
      const normalized = /^\/\//.test(trimmed) ? `https:${trimmed}` : trimmed;
      const u = new URL(normalized);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length === 0) {
        return `${prefix}-home`.slice(0, 140);
      }
      const last = (parts[parts.length - 1] || '').replace(/\.html?$/i, '');
      const slug = [...parts.slice(0, -1), last]
        .join('-')
        .replace(/[^a-zA-Z0-9_.-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (slug) {
        return `${prefix}-${slug}`.slice(0, 140);
      }
    } catch {
      /* fall through */
    }
    let h = 0;
    for (let i = 0; i < trimmed.length; i += 1) {
      h = (Math.imul(31, h) + trimmed.charCodeAt(i)) | 0;
    }
    return `${prefix}-h${Math.abs(h).toString(36)}`.slice(0, 140);
  }

  private parseRss2AsHotItems(
    xml: string,
    opts: {
      source: string;
      sourceName: string;
      sourceColor: string;
      idPrefix: string;
      max: number;
      tagSlugs: string[];
    }
  ): HotSearchItem[] {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.getElementsByTagName('parsererror').length) return [];

    const rawItems = Array.from(doc.getElementsByTagName('item'));
    const items: HotSearchItem[] = [];

    rawItems.slice(0, opts.max).forEach((node, index) => {
      const title = this.firstXmlChildText(node, 'title');
      let link = this.firstXmlChildText(node, 'link');
      if (!link) {
        const linkEl = node.getElementsByTagName('link')[0];
        link = (linkEl?.getAttribute('href') || '').trim();
      }
      if (!title || !link) return;

      const canonicalUrl = link.trim().split('#')[0].split('?')[0];
      const pub = this.firstXmlChildText(node, 'pubDate');
      const desc = this.firstXmlChildText(node, 'description');
      const pubTime = pub ? new Date(pub) : new Date();
      const t = pubTime.getTime();
      const hotScore = Number.isFinite(t) && !Number.isNaN(t)
        ? Math.floor(t / 1000)
        : 600_000 - index * 2500;

      items.push({
        id: this.stableIdFromArticleUrl(opts.idPrefix, canonicalUrl),
        title,
        summary: this.stripHtmlSnippet(desc).slice(0, 280),
        source: opts.source,
        sourceName: opts.sourceName,
        sourceColor: opts.sourceColor,
        hotScore,
        originalUrl: link.trim().split('#')[0],
        tags: opts.tagSlugs,
        publishTime: Number.isNaN(pubTime.getTime()) ? new Date() : pubTime,
      });
    });

    return items;
  }

  private parseAtomAsHotItems(
    xml: string,
    opts: {
      source: string;
      sourceName: string;
      sourceColor: string;
      idPrefix: string;
      max: number;
      tagSlugs: string[];
    }
  ): HotSearchItem[] {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.getElementsByTagName('parsererror').length) return [];

    const entries = Array.from(doc.getElementsByTagName('entry'));
    const items: HotSearchItem[] = [];

    entries.slice(0, opts.max).forEach((entry, index) => {
      const title = this.firstXmlChildText(entry, 'title');
      const link = this.atomEntryLinkHref(entry);
      if (!title || !link) return;

      const updated =
        this.firstXmlChildText(entry, 'updated') ||
        this.firstXmlChildText(entry, 'published');
      const pubTime = updated ? new Date(updated) : new Date();
      const t = pubTime.getTime();
      const hotScore = Number.isFinite(t) && !Number.isNaN(t)
        ? Math.floor(t / 1000)
        : 700_000 - index * 2500;

      const summary = this.firstXmlChildText(entry, 'summary');
      let url = link.trim();
      if (/^http:\/\/(www\.)?ruanyifeng\.com/i.test(url)) {
        url = url.replace(/^http:/i, 'https:');
      }
      const idFromUrl = this.stableIdFromArticleUrl(
        opts.idPrefix,
        url.split('#')[0].split('?')[0]
      );

      items.push({
        id: idFromUrl,
        title,
        summary: summary.slice(0, 280),
        source: opts.source,
        sourceName: opts.sourceName,
        sourceColor: opts.sourceColor,
        hotScore,
        originalUrl: url,
        tags: opts.tagSlugs,
        publishTime: Number.isNaN(pubTime.getTime()) ? new Date() : pubTime,
      });
    });

    return items;
  }

  private parseCsdnHotRankData(data: { code?: number; data?: unknown[] }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    if (data?.code !== 200 || !Array.isArray(data.data)) return items;

    data.data.forEach((raw: unknown, index: number) => {
      const row = raw as {
        articleTitle?: string;
        articleDetailUrl?: string;
        hotRankScore?: string | number;
        nickName?: string;
        viewCount?: string | number;
        picList?: string[];
      };
      const title = (row.articleTitle || '').trim();
      const url = (row.articleDetailUrl || '').trim();
      if (!title || !url) return;

      const pid = /\/details\/(\d+)/.exec(url)?.[1] ?? `row-${index}`;
      const hot = parseInt(String(row.hotRankScore ?? '0'), 10);
      const views = parseInt(String(row.viewCount ?? '0'), 10);

      items.push({
        id: `csdn-${pid}`,
        title,
        summary: row.nickName ? `作者：${row.nickName} · 阅读 ${views}` : `阅读 ${views}`,
        source: 'csdn',
        sourceName: 'CSDN',
        sourceColor: '#FC5531',
        hotScore: hot || views || Math.max(0, 80_000 - index * 800),
        imageUrl: row.picList?.[0],
        originalUrl: url,
        tags: ['tech', '热门', '实时'],
        publishTime: new Date(),
      });
    });

    return items;
  }

  private parseStcnKxList(data: { state?: number | string; data?: unknown[] }): HotSearchItem[] {
    const items: HotSearchItem[] = [];
    const stateNum = Number(data?.state);
    const stateOk = stateNum === 1 || String(data?.state) === '1';
    if (!stateOk || !Array.isArray(data.data)) return items;

    data.data.forEach((raw: unknown, index: number) => {
      const row = raw as {
        id?: string | number;
        title?: string;
        url?: string;
        web_url?: string;
        time?: number;
        content?: string;
        source?: string;
      };
      const title = (row.title || '').trim();
      const rel = (row.web_url || row.url || '').trim();
      let id = row.id != null && String(row.id).trim() !== '' ? String(row.id) : '';
      if (!id && rel) {
        const m = rel.match(/\/detail\/(\d+)\.html/i);
        if (m) id = m[1];
      }
      if (!title || !id) return;

      const originalUrl = /^https?:\/\//i.test(rel)
        ? rel
        : `https://www.stcn.com${rel.startsWith('/') ? rel : `/${rel}`}`;

      const t = typeof row.time === 'number' ? row.time : 0;
      const summary =
        (row.content || '').replace(/\s+/g, ' ').trim().slice(0, 220) ||
        (row.source ? `来源：${row.source}` : '证券时报快讯');

      items.push({
        id: `stcn-${id}`,
        title,
        summary,
        source: 'stcn',
        sourceName: '证券时报',
        sourceColor: '#C62828',
        hotScore: t || Math.max(0, 9e11 - index * 5e6),
        originalUrl,
        tags: ['finance', '快讯', '实时'],
        publishTime: t ? new Date(t) : new Date(),
      });
    });

    return items;
  }

  private parseCaixinHomeHtml(html: string): HotSearchItem[] {
    const re =
      /<p><a\s+href=(['"])(https:\/\/(?:[\w-]+\.)?caixin\.com\/\d{4}-\d{2}-\d{2}\/\d+\.html)\1>([^<]+)<\/a>/gi;
    const seen = new Set<string>();
    const items: HotSearchItem[] = [];
    let m: RegExpExecArray | null;
    let index = 0;

    while ((m = re.exec(html)) !== null && items.length < 28) {
      const url = m[2].split('#')[0];
      const title = (m[3] || '').trim();
      const nid = url.match(/\/(\d+)\.html$/)?.[1];
      if (!title || !nid || seen.has(nid)) continue;
      seen.add(nid);

      items.push({
        id: `caixin-${nid}`,
        title,
        summary: '财新网 · 首页信息流',
        source: 'caixin',
        sourceName: '财新网',
        sourceColor: '#8B0000',
        hotScore: 1_800_000 - index * 7000,
        originalUrl: url,
        tags: ['finance', '新闻', '实时'],
        publishTime: new Date(),
      });
      index += 1;
    }

    return items;
  }

  async fetchCsdnHot(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout(
        '/api/csdn/phoenix/web/blog/hot-rank?page=0&pageSize=25&type=',
        { headers: { Accept: 'application/json, text/plain, */*' } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return this.parseCsdnHotRankData(data);
    } catch (error) {
      console.error('获取CSDN热榜失败:', error);
      return [];
    }
  }

  async fetchOschinaNewsRss(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/oschina/news/rss', {
        headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      });
      if (!response.ok) return [];
      const xml = await response.text();
      return this.parseRss2AsHotItems(xml, {
        source: 'oschina',
        sourceName: '开源中国',
        sourceColor: '#009688',
        idPrefix: 'oschina',
        max: 25,
        tagSlugs: ['tech', '开源', '实时'],
      });
    } catch (error) {
      console.error('获取开源中国资讯失败:', error);
      return [];
    }
  }

  async fetchSegmentfaultFeed(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/segmentfault/feeds/questions', {
        headers: { Accept: 'application/atom+xml, application/xml, text/xml, */*' },
      });
      if (!response.ok) return [];
      const xml = await response.text();
      return this.parseAtomAsHotItems(xml, {
        source: 'segmentfault',
        sourceName: '思否',
        sourceColor: '#009A61',
        idPrefix: 'segmentfault',
        max: 25,
        tagSlugs: ['tech', '问答', '实时'],
      });
    } catch (error) {
      console.error('获取思否动态失败:', error);
      return [];
    }
  }

  async fetchInfoqFeed(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/infoq/feed', {
        headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      });
      if (!response.ok) return [];
      const xml = await response.text();
      return this.parseRss2AsHotItems(xml, {
        source: 'infoq',
        sourceName: 'InfoQ',
        sourceColor: '#007DC5',
        idPrefix: 'infoq',
        max: 25,
        tagSlugs: ['tech', '资讯', '实时'],
      });
    } catch (error) {
      console.error('获取 InfoQ 资讯失败:', error);
      return [];
    }
  }

  async fetchRuanyifengAtom(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/ruanyifeng/blog/atom.xml', {
        headers: { Accept: 'application/atom+xml, application/xml, text/xml, */*' },
      });
      if (!response.ok) return [];
      const xml = await response.text();
      return this.parseAtomAsHotItems(xml, {
        source: 'ruanyifeng',
        sourceName: '阮一峰博客',
        sourceColor: '#E91E63',
        idPrefix: 'ruanyifeng',
        max: 15,
        tagSlugs: ['tech', '博客', '实时'],
      });
    } catch (error) {
      console.error('获取阮一峰博客失败:', error);
      return [];
    }
  }

  async fetchStcnKuaixun(): Promise<HotSearchItem[]> {
    const stcnHeaders: HeadersInit = {
      Accept: 'application/json, text/plain, */*',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.stcn.com/article/list/kx.html',
    };

    const parseStcnJson = (text: string): { state?: number | string; data?: unknown[] } | null => {
      const trimmed = text.replace(/^\uFEFF/, '').trim();
      if (!trimmed.startsWith('{')) return null;
      try {
        return JSON.parse(trimmed) as { state?: number | string; data?: unknown[] };
      } catch {
        return null;
      }
    };

    try {
      let res = await this.fetchWithTimeout('/api/stcn/article/list.html?type=kx', {
        headers: stcnHeaders,
      });
      if (!res.ok) return [];
      let data = parseStcnJson(await res.text());
      let items = data ? this.parseStcnKxList(data) : [];

      if (items.length === 0) {
        res = await this.fetchWithTimeout('/api/stcn/article/category-news-rank.html?type=kx', {
          headers: stcnHeaders,
        });
        if (!res.ok) return [];
        data = parseStcnJson(await res.text());
        items = data ? this.parseStcnKxList(data) : [];
      }

      return items;
    } catch (error) {
      console.error('获取证券时报快讯失败:', error);
      return [];
    }
  }

  async fetchCaixinHome(): Promise<HotSearchItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/caixin/', {
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      });
      if (!response.ok) return [];
      const html = await response.text();
      return this.parseCaixinHomeHtml(html);
    } catch (error) {
      console.error('获取财新网首页列表失败:', error);
      return [];
    }
  }

  async fetchAllHotSearches(): Promise<HotSearchItem[]> {
    const promises = [
      this.fetchWeiboHotSearch(),
      this.fetchZhihuHotSearch(),
      this.fetchBilibiliHotSearch(),
      this.fetchGitHubTrending(),
      this.fetchJuejinHot(),
      this.fetch36krHot(),
      this.fetchIthomeNews(),
      this.fetchDouyinHotSearch(),
      this.fetchCsdnHot(),
      this.fetchOschinaNewsRss(),
      this.fetchSegmentfaultFeed(),
      this.fetchInfoqFeed(),
      this.fetchRuanyifengAtom(),
      this.fetchStcnKuaixun(),
      this.fetchCaixinHome(),
    ];

    const results = await Promise.allSettled(promises);
    const allItems: HotSearchItem[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    });

    return allItems.sort((a, b) => b.hotScore - a.hotScore);
  }
}

export const hotSearchApi = new HotSearchApi();
