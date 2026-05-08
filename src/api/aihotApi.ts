export interface AihotItem {
  id: string;
  title: string;
  title_en: string | null;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: 'ai-models' | 'ai-products' | 'industry' | 'paper' | 'tip' | null;
}

export interface AihotResponse {
  count: number;
  hasNext: boolean;
  nextCursor: string | null;
  items: AihotItem[];
}

export interface AihotDaily {
  date: string;
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  lead: {
    title: string;
    leadParagraph: string;
  } | null;
  sections: {
    label: string;
    items: Array<{
      title: string;
      summary: string;
      sourceUrl: string;
      sourceName: string;
    }>;
  }[];
  flashes: Array<{
    title: string;
    sourceName: string;
    sourceUrl: string;
    publishedAt: string;
  }>;
}

const BASE_URL = '/api/aihot';

class AihotApi {
  private async fetch<T>(endpoint: string): Promise<T | null> {
    try {
      console.log(`正在获取 AIHOT ${endpoint}...`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`AIHOT API 错误: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`AIHOT ${endpoint} 获取成功:`, data);
      return data as T;
    } catch (error) {
      console.error(`获取 AIHOT 失败:`, error);
      return null;
    }
  }

  async getSelectedItems(since?: string, take = 50): Promise<AihotItem[]> {
    const sinceParam = since ? `&since=${since}` : '';
    const data = await this.fetch<AihotResponse>(
      `/public/items?mode=selected${sinceParam}&take=${take}`
    );
    return data?.items || [];
  }

  async getAllItems(since?: string, take = 100): Promise<AihotItem[]> {
    const sinceParam = since ? `&since=${since}` : '';
    const data = await this.fetch<AihotResponse>(
      `/public/items?mode=all${sinceParam}&take=${take}`
    );
    return data?.items || [];
  }

  async getDaily(date?: string): Promise<AihotDaily | null> {
    const endpoint = date ? `/public/daily/${date}` : '/public/daily';
    return this.fetch<AihotDaily>(endpoint);
  }

  async searchItems(keyword: string, take = 30): Promise<AihotItem[]> {
    const data = await this.fetch<AihotResponse>(
      `/public/items?q=${encodeURIComponent(keyword)}&take=${take}`
    );
    return data?.items || [];
  }

  async getItemsByCategory(category: string, since?: string, take = 50): Promise<AihotItem[]> {
    const sinceParam = since ? `&since=${since}` : '';
    const data = await this.fetch<AihotResponse>(
      `/public/items?mode=selected&category=${category}${sinceParam}&take=${take}`
    );
    return data?.items || [];
  }
}

export const aihotApi = new AihotApi();
