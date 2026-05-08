import { NewsItem, PlatformId } from '@/types';
import { platforms } from './platforms';

const generateRandomTime = (hoursAgo: number): Date => {
  const now = new Date();
  const randomHours = Math.random() * hoursAgo;
  return new Date(now.getTime() - randomHours * 60 * 60 * 1000);
};

const generateRandomScore = (): number => {
  return Math.floor(Math.random() * 100000) + 1000;
};

const platformUrls: Record<PlatformId, string> = {
  aihot: 'https://aihot.virxact.com',
  bilibili: 'https://www.bilibili.com',
  weibo: 'https://weibo.com',
  zhihu: 'https://www.zhihu.com',
  github: 'https://github.com/trending',
  juejin: 'https://juejin.cn',
  douyin: 'https://www.douyin.com',
  '36kr': 'https://36kr.com',
  ithome: 'https://www.ithome.com',
  segmentfault: 'https://segmentfault.com',
  oschina: 'https://www.oschina.net',
  infoq: 'https://www.infoq.cn',
  ruanyifeng: 'https://www.ruanyifeng.com',
  csdn: 'https://www.csdn.net',
  stcn: 'https://www.stcn.com',
  caixin: 'https://www.caixin.com',
};

const mockTitles: Record<PlatformId, string[]> = {
  aihot: ['AI 行业速递：模型与应用更新', '本周值得关注的 AI 论文与开源项目'],
  bilibili: [
    '【硬核】一口气看完《三体》原著，震撼到头皮发麻！',
    '程序员的一天：从入门到入土',
    '这可能是B站最硬核的数学课了',
    '我用AI生成了1000张猫猫图，结果...',
    '【4K】绝美风景合集，治愈你的心灵',
    '当程序员遇上产品经理：史诗级对决',
    '一口气看完《进击的巨人》全四季',
    '这届年轻人开始流行"反向消费"了',
  ],
  weibo: [
    '#今日热搜# 某明星官宣结婚，粉丝沸腾',
    '热搜第一！这个话题引发全网热议',
    '网友：这操作太离谱了',
    '#社会热点# 最新政策解读来了',
    '某品牌新品发布会直播破亿观看',
    '这个瓜保熟吗？网友炸锅了',
    '#娱乐新闻# 某综艺收视率创新高',
    '热搜爆了！这个话题阅读量破10亿',
  ],
  zhihu: [
    '如何评价最近大火的AI技术？',
    '为什么程序员都喜欢用机械键盘？',
    '有哪些看似简单实则复杂的知识？',
    '你见过最离谱的面试经历是什么？',
    '如何高效学习一门新技能？',
    '有哪些让你相见恨晚的软件？',
    '为什么现在的年轻人越来越焦虑？',
    '有哪些值得推荐的纪录片？',
  ],
  github: [
    'microsoft/generative-ai-for-beginners: 生成式AI入门教程',
    'awesome-selfhosted: 自托管服务合集',
    'freeCodeCamp: 免费学习编程',
    'public-apis: 公开API合集',
    'system-design-primer: 系统设计入门',
    'developer-roadmap: 开发者学习路线',
    'awesome-chatgpt-prompts: ChatGPT提示词合集',
    'huggingface/transformers: 机器学习框架',
  ],
  juejin: [
    '2024年前端趋势预测：这些技术将大火',
    '深入理解React 19新特性',
    'TypeScript 5.5发布，这些新功能太强了',
    '从零搭建企业级微前端架构',
    '前端性能优化实战指南',
    'Node.js最佳实践2024版',
    'CSS新特性大盘点',
    'Vue 3.5发布，性能提升50%',
  ],
  douyin: [
    '这个挑战太火了，全网都在模仿',
    '抖音爆款：这个滤镜太绝了',
    '网红探店：这家店排队3小时值得吗？',
    '萌宠日常：猫咪的一天',
    '美食教程：在家也能做出米其林味道',
    '旅行vlog：这个城市太美了',
    '舞蹈挑战：这个舞步太魔性了',
    '搞笑日常：社死现场大赏',
  ],
  '36kr': [
    'AI创业公司估值突破百亿，投资人疯狂抢投',
    '新能源汽车市场格局大变，谁将胜出？',
    '互联网大厂最新裁员潮：真相是什么',
    'SaaS赛道融资回暖，这些公司最受青睐',
    '出海创业：机遇与挑战并存',
    '2024年科技行业十大趋势预测',
    '独角兽企业最新估值排行榜',
    '芯片行业迎来新变局',
  ],
  ithome: [
    '苹果发布iOS 18，这些新功能太实用了',
    '华为Mate 70曝光：配置全面升级',
    '英伟达发布新一代显卡，性能提升50%',
    '小米15系列发布：价格惊喜',
    'ChatGPT迎来重大更新，功能更强了',
    '特斯拉FSD V12正式推送',
    'Windows 12最新截图曝光',
    '三星Galaxy S25渲染图流出',
  ],
  segmentfault: [
    '如何设计一个高并发系统？',
    'MySQL索引优化实战',
    'Redis缓存穿透解决方案',
    'Docker容器化部署最佳实践',
    '微服务架构设计模式',
    'Kubernetes入门到精通',
    '消息队列选型指南',
    '分布式事务解决方案',
  ],
  oschina: [
    '开源项目推荐：这个工具太好用了',
    'Linux 6.8发布，这些新特性值得关注',
    '国产操作系统最新进展',
    '开源许可证选择指南',
    '最受欢迎的开源项目排行榜',
    '开源社区年度报告发布',
    '开源软件安全漏洞分析',
    '如何参与开源项目贡献',
  ],
  infoq: [
    '微服务架构演进：从单体到云原生',
    'DevOps实践指南2024版',
    '云原生技术趋势解读',
    '架构师必备技能图谱',
    '大厂技术架构揭秘',
    'AI工程化落地实践',
    '技术债务治理方案',
    '敏捷开发最佳实践',
  ],
  ruanyifeng: [
    '科技爱好者周刊：AI时代的新机遇',
    'ES6入门教程更新：新特性详解',
    '如何保持技术敏感度',
    '开源软件的未来在哪里',
    '程序员如何规划职业发展',
    '学习新技术的正确姿势',
    '技术写作的艺术',
    '开源项目的可持续发展',
  ],
  csdn: [
    'Python爬虫实战：从入门到精通',
    'Java面试题大全2024版',
    '深度学习框架对比分析',
    '前端工程化最佳实践',
    '算法刷题指南：LeetCode精选',
    '数据库优化实战案例',
    'Linux运维必备技能',
    'Git高级用法大全',
  ],
  stcn: [
    'A股三大指数集体上涨，成交额破万亿',
    '央行最新政策解读：对市场有何影响',
    '北向资金净流入超百亿，这些股票最受青睐',
    '新能源板块大涨，龙头股创新高',
    '券商看好后市，建议关注这些方向',
    'IPO审核趋严，这些企业受影响',
    '基金四季报出炉，明星基金经理调仓动向',
    '可转债市场火热，投资者如何参与',
  ],
  caixin: [
    '宏观经济形势分析：2024年展望',
    '金融监管新规解读',
    '房地产市场最新动向',
    '科技创新与产业升级',
    'ESG投资趋势报告',
    '地方债务风险化解方案',
    '消费市场复苏态势分析',
    '外贸形势与政策解读',
  ],
};

const mockSummaries: Record<PlatformId, string[]> = {
  aihot: ['精选自多路信源的 AI 资讯摘要。', '来自 AIHOT 聚合的摘要说明。'],
  bilibili: [
    '本期视频详细解析了相关内容，从多个角度深入探讨...',
    'UP主用独特的视角解读了这个话题，引发网友热议...',
    '视频内容干货满满，建议收藏反复观看...',
  ],
  weibo: [
    '该话题在微博引发广泛讨论，相关话题阅读量已破亿...',
    '网友纷纷发表看法，评论区已沦陷...',
    '事件持续发酵，当事人已回应...',
  ],
  zhihu: [
    '这个问题引发了知乎用户的热烈讨论，高赞回答从专业角度分析...',
    '答主结合自身经历，给出了独到见解...',
    '这个问题下有超过1000个回答，看看知友们怎么说...',
  ],
  github: [
    '这个项目获得了大量star，社区活跃度很高...',
    '项目文档完善，适合新手入门...',
    '代码质量高，架构设计值得学习...',
  ],
  juejin: [
    '本文详细介绍了相关技术细节，适合进阶学习...',
    '作者结合实际项目经验，分享了最佳实践...',
    '文章干货满满，建议收藏慢慢看...',
  ],
  douyin: [
    '这个视频在抖音获得了百万点赞，网友直呼太绝了...',
    '博主用创意的方式呈现内容，引发模仿热潮...',
    '视频内容治愈又有趣，看完心情变好了...',
  ],
  '36kr': [
    '36氪独家报道，深度解析行业动态...',
    '文章从投资角度分析了行业趋势...',
    '采访了多位业内人士，呈现多元观点...',
  ],
  ithome: [
    'IT之家第一时间带来详细报道...',
    '产品参数全面曝光，性能提升明显...',
    '网友评论两极分化，你怎么看？...',
  ],
  segmentfault: [
    '本文从技术角度深入分析了问题...',
    '作者提供了完整的代码示例和解决方案...',
    '文章获得了社区精华推荐...',
  ],
  oschina: [
    '开源中国独家报道，关注开源动态...',
    '项目已在GitHub开源，欢迎参与贡献...',
    '国产开源项目再添新成员...',
  ],
  infoq: [
    'InfoQ专访技术大牛，分享架构经验...',
    '文章来自一线实践，具有参考价值...',
    '技术大会精彩演讲整理...',
  ],
  ruanyifeng: [
    '阮一峰老师最新分享，深入浅出...',
    '周刊内容丰富，涵盖多个技术领域...',
    '文章风格一如既往的清晰易懂...',
  ],
  csdn: [
    'CSDN博主原创分享，干货满满...',
    '文章已入选官方推荐，值得一看...',
    '代码示例完整，可直接运行...',
  ],
  stcn: [
    '证券时报权威报道，数据详实...',
    '分析师观点：市场走势解读...',
    '机构研报精华摘要...',
  ],
  caixin: [
    '财新网深度报道，揭示事件背后...',
    '专业财经媒体视角，分析透彻...',
    '独家采访内容，信息量大...',
  ],
};

export const generateMockNews = (): NewsItem[] => {
  const news: NewsItem[] = [];
  let id = 1;

  platforms.forEach(platform => {
    const titles = mockTitles[platform.id];
    const summaries = mockSummaries[platform.id];
    const count = Math.floor(Math.random() * 5) + 3;
    const baseUrl = platformUrls[platform.id];

    for (let i = 0; i < count; i++) {
      const titleIndex = i % titles.length;
      const summaryIndex = i % summaries.length;
      
      news.push({
        id: `news-${id++}`,
        title: titles[titleIndex],
        summary: summaries[summaryIndex],
        source: platform.id,
        sourceName: platform.name,
        sourceColor: platform.color,
        publishTime: generateRandomTime(24),
        hotScore: generateRandomScore(),
        imageUrl: Math.random() > 0.3 
          ? `https://neeko-copilot.bytedance.net/api/text2image?prompt=${encodeURIComponent(`modern tech news illustration, abstract digital art, ${platform.category} theme`)}&image_size=landscape_16_9`
          : undefined,
        originalUrl: baseUrl,
        tags: [platform.category, '热门', '24小时内'],
        isMock: true,
      });
    }
  });

  return news.sort((a, b) => b.hotScore - a.hotScore);
};

export const mockNews = generateMockNews();
