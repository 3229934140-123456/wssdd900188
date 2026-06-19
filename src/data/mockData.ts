import { CityRisk, DailyReport, EventNote, CompanyInfo } from '@/types';

export const defaultCompanyInfo: CompanyInfo = {
  name: '悦鲜生鲜连锁',
  shortNames: ['悦鲜', '悦鲜生鲜'],
  cities: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安']
};

export const cityRisks: CityRisk[] = [
  {
    id: '1',
    cityName: '北京',
    level: 'red',
    discussionCount: 328,
    lastUpdated: '2026-06-19 08:30',
    summary: {
      whatHappened: '北京朝阳门店被顾客投诉售卖过期牛奶，相关短视频在抖音和微博传播，24小时内提及量激增320%。',
      whoDiscussing: '主要是北京本地消费者在社交平台投诉，部分本地生活博主转发评论，涉及"食品安全"、"过期食品"等关键词。',
      businessImpact: '可能影响北京地区5家门店客流，若不及时处理有扩散到其他城市的风险，建议尽快联系当事人并发布声明。'
    },
    sources: [
      { id: 's1', title: '网友实拍：悦鲜超市售卖过期牛奶', platform: '抖音', url: 'https://example.com/1' },
      { id: 's2', title: '朝阳食药监接到多起投诉', platform: '微博', url: 'https://example.com/2' },
      { id: 's3', title: '本地生活博主曝光连锁超市问题', platform: '小红书', url: 'https://example.com/3' }
    ]
  },
  {
    id: '2',
    cityName: '上海',
    level: 'yellow',
    discussionCount: 87,
    lastUpdated: '2026-06-19 07:45',
    summary: {
      whatHappened: '上海浦东店因配送延迟引发集中吐槽，近两日在大众点评和外卖平台差评率上升。',
      whoDiscussing: '以中青年上班族为主，集中讨论高温天气下配送慢、生鲜不新鲜等问题。',
      businessImpact: '主要影响线上订单口碑，需关注配送环节优化，暂时不会扩散到线下。'
    },
    sources: [
      { id: 's4', title: '天热配送慢，生鲜到家变"到家臭"', platform: '大众点评', url: 'https://example.com/4' },
      { id: 's5', title: '悦鲜配送超时3小时', platform: '美团', url: 'https://example.com/5' },
      { id: 's6', title: '上海地区配送投诉汇总', platform: '小红书', url: 'https://example.com/6' }
    ]
  },
  {
    id: '3',
    cityName: '广州',
    level: 'yellow',
    discussionCount: 56,
    lastUpdated: '2026-06-18 22:10',
    summary: {
      whatHappened: '广州天河店员工与顾客发生争执的视频在本地微信群流传。',
      whoDiscussing: '本地社区居民为主，讨论量不大但多为负面情绪。',
      businessImpact: '影响范围限于门店周边社区，建议门店经理主动沟通。'
    },
    sources: [
      { id: 's7', title: '超市员工态度恶劣', platform: '微信视频号', url: 'https://example.com/7' },
      { id: 's8', title: '天河某超市服务差', platform: '本地论坛', url: 'https://example.com/8' },
      { id: 's9', title: '社区群热议超市争执事件', platform: '微信群', url: 'https://example.com/9' }
    ]
  },
  {
    id: '4',
    cityName: '深圳',
    level: 'green',
    discussionCount: 12,
    lastUpdated: '2026-06-19 06:00',
    summary: {
      whatHappened: '深圳地区舆情平稳，近期无负面热点。',
      whoDiscussing: '仅有少量正常的产品讨论，以正面评价为主。',
      businessImpact: '无负面影响，可正常运营。'
    },
    sources: [
      { id: 's10', title: '悦鲜深圳店新品好评', platform: '小红书', url: 'https://example.com/10' },
      { id: 's11', title: '深圳用户晒购物体验', platform: '微博', url: 'https://example.com/11' },
      { id: 's12', title: '生鲜电商对比评测', platform: '知乎', url: 'https://example.com/12' }
    ]
  },
  {
    id: '5',
    cityName: '杭州',
    level: 'green',
    discussionCount: 8,
    lastUpdated: '2026-06-19 06:00',
    summary: {
      whatHappened: '杭州地区舆情平稳，品牌口碑良好。',
      whoDiscussing: '用户自发推荐，多为正面评价。',
      businessImpact: '无负面影响。'
    },
    sources: [
      { id: 's13', title: '杭州生鲜首选悦鲜', platform: '小红书', url: 'https://example.com/13' },
      { id: 's14', title: '宝妈推荐靠谱生鲜店', platform: '大众点评', url: 'https://example.com/14' },
      { id: 's15', title: '杭州本地生活攻略', platform: '微信公众号', url: 'https://example.com/15' }
    ]
  },
  {
    id: '6',
    cityName: '成都',
    level: 'red',
    discussionCount: 156,
    lastUpdated: '2026-06-19 09:15',
    summary: {
      whatHappened: '成都春熙路店被举报价格欺诈，标价与结算价不符，已被当地媒体报道。',
      whoDiscussing: '本地消费者+地方媒体，关键词包括"价格欺诈"、"标价不符"、"消费陷阱"。',
      businessImpact: '可能面临市场监管部门调查，品牌声誉受损严重，需立即启动危机公关。'
    },
    sources: [
      { id: 's16', title: '暗访：悦鲜超市标价与结算不符', platform: '成都电视台', url: 'https://example.com/16' },
      { id: 's17', title: '消费者投诉价格欺诈', platform: '四川新闻', url: 'https://example.com/17' },
      { id: 's18', title: '成都多家超市被查', platform: '今日头条', url: 'https://example.com/18' }
    ]
  },
  {
    id: '7',
    cityName: '武汉',
    level: 'green',
    discussionCount: 5,
    lastUpdated: '2026-06-19 06:00',
    summary: {
      whatHappened: '武汉地区舆情平稳。',
      whoDiscussing: '少量正常消费讨论。',
      businessImpact: '无负面影响。'
    },
    sources: [
      { id: 's19', title: '武汉日常购物分享', platform: '小红书', url: 'https://example.com/19' },
      { id: 's20', title: '周末超市采购vlog', platform: '抖音', url: 'https://example.com/20' },
      { id: 's21', title: '武汉本地生活推荐', platform: '微博', url: 'https://example.com/21' }
    ]
  },
  {
    id: '8',
    cityName: '西安',
    level: 'yellow',
    discussionCount: 42,
    lastUpdated: '2026-06-18 20:30',
    summary: {
      whatHappened: '西安雁塔店促销活动引发排队拥挤，有顾客在社交媒体抱怨秩序混乱。',
      whoDiscussing: '参与促销活动的中老年顾客，反映组织不力。',
      businessImpact: '短期负面，下一次促销注意优化现场管理即可。'
    },
    sources: [
      { id: 's22', title: '促销现场人挤人', platform: '抖音', url: 'https://example.com/22' },
      { id: 's23', title: '超市促销秩序堪忧', platform: '本地论坛', url: 'https://example.com/23' },
      { id: 's24', title: '西安某超市促销引混乱', platform: '微信视频号', url: 'https://example.com/24' }
    ]
  }
];

export const dailyReport: DailyReport = {
  date: '2026-06-19',
  newRiskCount: 2,
  riskChanges: [
    { city: '北京', from: 'yellow', to: 'red' },
    { city: '成都', from: 'green', to: 'red' },
    { city: '上海', from: 'green', to: 'yellow' }
  ],
  negativeKeywords: ['过期食品', '价格欺诈', '配送延迟', '服务态度', '促销秩序'],
  mostActivePlatforms: [
    { platform: '抖音', count: 234 },
    { platform: '小红书', count: 156 },
    { platform: '微博', count: 98 },
    { platform: '大众点评', count: 67 },
    { platform: '微信视频号', count: 45 }
  ]
};

export const eventNotes: EventNote[] = [
  {
    id: 'n1',
    cityId: '2',
    cityName: '上海',
    status: 'monitoring',
    statusText: '持续观察',
    description: '已通知上海区域经理关注配送问题，正在与物流服务商沟通优化方案。',
    createdAt: '2026-06-18 15:30'
  },
  {
    id: 'n2',
    cityId: '8',
    cityName: '西安',
    status: 'contacted_customer',
    statusText: '已联系客户',
    description: '已向现场投诉顾客致歉并赠送购物券，顾客表示接受。',
    createdAt: '2026-06-18 21:00'
  }
];
