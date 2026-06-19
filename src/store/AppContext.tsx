import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { CompanyInfo, CityRisk, EventNote, RiskLevel } from '@/types';
import { defaultCompanyInfo, cityRisks as seedCityRisks, eventNotes as seedEventNotes } from '@/data/mockData';

const STORAGE_KEYS = {
  IS_ONBOARDED: 'yp_is_onboarded',
  COMPANY_INFO: 'yp_company_info',
  CITY_RISKS: 'yp_city_risks',
  EVENT_NOTES: 'yp_event_notes',
  RISK_HISTORY: 'yp_risk_history'
};

export interface RiskChangeRecord {
  id: string;
  cityId: string;
  cityName: string;
  fromLevel: RiskLevel | null;
  toLevel: RiskLevel;
  reason: string;
  timestamp: number;
  date: string;
}

export interface TimelineItem {
  id: string;
  type: 'init' | 'note' | 'level_change';
  title: string;
  description: string;
  time: string;
  timestamp: number;
  level?: RiskLevel;
  fromLevel?: RiskLevel | null;
  toLevel?: RiskLevel;
  status?: string;
  statusText?: string;
}

const CITY_COORDS: Record<string, { x: number; y: number }> = {
  '北京': { x: 68, y: 22 },
  '天津': { x: 66, y: 28 },
  '上海': { x: 76, y: 52 },
  '广州': { x: 64, y: 84 },
  '深圳': { x: 60, y: 87 },
  '杭州': { x: 72, y: 58 },
  '南京': { x: 68, y: 50 },
  '苏州': { x: 72, y: 50 },
  '宁波': { x: 75, y: 62 },
  '成都': { x: 34, y: 55 },
  '重庆': { x: 42, y: 58 },
  '武汉': { x: 56, y: 56 },
  '西安': { x: 42, y: 38 },
  '长沙': { x: 58, y: 68 },
  '郑州': { x: 54, y: 40 },
  '青岛': { x: 70, y: 34 },
  '济南': { x: 62, y: 32 },
  '厦门': { x: 66, y: 78 },
  '福州': { x: 68, y: 74 },
  '合肥': { x: 64, y: 54 }
};

const getTodayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const generateCityId = (cityName: string): string => {
  return 'city_' + cityName;
};

const createDefaultCityRisk = (cityName: string): CityRisk => {
  return {
    id: generateCityId(cityName),
    cityName,
    level: 'green',
    discussionCount: Math.floor(Math.random() * 5) + 1,
    lastUpdated: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    summary: {
      whatHappened: `${cityName}地区舆情平稳，近期无负面热点事件。`,
      whoDiscussing: '仅有少量正常的产品讨论，以正面评价为主。',
      businessImpact: '无负面影响，各门店可正常运营。'
    },
    sources: [
      { id: `${cityName}_s1`, title: `${cityName}用户购物体验分享`, platform: '小红书', url: 'https://example.com/1' },
      { id: `${cityName}_s2`, title: `本地生活推荐：${cityName}必逛超市`, platform: '大众点评', url: 'https://example.com/2' },
      { id: `${cityName}_s3`, title: `${cityName}生鲜市场观察`, platform: '本地论坛', url: 'https://example.com/3' }
    ]
  };
};

const mergeCitiesWithSeed = (cities: string[]): CityRisk[] => {
  return cities.map(cityName => {
    const seed = seedCityRisks.find(s => s.cityName === cityName);
    if (seed) return seed;
    return createDefaultCityRisk(cityName);
  });
};

const tryGetStorage = <T,>(key: string, fallback: T): T => {
  try {
    const val = Taro.getStorageSync(key);
    if (val !== '' && val !== null && val !== undefined) {
      return val as T;
    }
  } catch {}
  return fallback;
};

const trySetStorage = (key: string, value: any): void => {
  try {
    Taro.setStorageSync(key, value);
  } catch (e) {
    console.error('[AppContext] 存储失败', key, e);
  }
};

interface AppContextType {
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
  cityRisks: CityRisk[];
  getCityRisk: (id: string) => CityRisk | undefined;
  updateCityRiskLevel: (cityId: string, level: RiskLevel, reason?: string) => void;
  syncCitiesFromCompany: (newCities?: string[]) => void;
  eventNotes: EventNote[];
  addEventNote: (note: Omit<EventNote, 'id' | 'createdAt'>) => EventNote;
  getNotesByCity: (cityId: string) => EventNote[];
  cityCoords: Record<string, { x: number; y: number }>;
  generateReportContent: () => string;
  getYesterdayChanges: () => {
    newRisks: RiskChangeRecord[];
    upgraded: RiskChangeRecord[];
    downgraded: RiskChangeRecord[];
    total: number;
  };
  riskHistory: RiskChangeRecord[];
  getCityTimeline: (cityId: string) => TimelineItem[];
  isOverdueUnprocessed: (cityId: string) => boolean;
  getRecentlyUpgraded: (withinHours?: number) => RiskChangeRecord[];
}

const AppContext = createContext<AppContextType | null>(null);

const getInitialOnboarded = (): boolean => {
  return tryGetStorage<boolean>(STORAGE_KEYS.IS_ONBOARDED, false);
};

const getInitialCompanyInfo = (): CompanyInfo => {
  return tryGetStorage<CompanyInfo>(STORAGE_KEYS.COMPANY_INFO, defaultCompanyInfo);
};

const getInitialCityRisks = (company: CompanyInfo): CityRisk[] => {
  const stored = tryGetStorage<CityRisk[] | null>(STORAGE_KEYS.CITY_RISKS, null);
  if (stored && stored.length > 0) {
    const validCities = stored.filter(c => company.cities.includes(c.cityName));
    const newCities = company.cities.filter(city => !stored.find(s => s.cityName === city));
    const created = newCities.map(city => createDefaultCityRisk(city));
    return [...validCities, ...created];
  }
  return mergeCitiesWithSeed(company.cities);
};

const getInitialNotes = (cities: CityRisk[]): EventNote[] => {
  const stored = tryGetStorage<EventNote[]>(STORAGE_KEYS.EVENT_NOTES, null);
  if (stored && stored.length > 0) return stored;
  return seedEventNotes.map(n => {
    const city = cities.find(c => c.cityName === n.cityName);
    return { ...n, cityId: city ? city.id : n.cityId };
  });
};

const getInitialHistory = (cities: CityRisk[]): RiskChangeRecord[] => {
  const stored = tryGetStorage<RiskChangeRecord[]>(STORAGE_KEYS.RISK_HISTORY, null);
  if (stored && stored.length > 0) return stored;

  const yesterday = getYesterdayStr();
  const now = Date.now();
  return cities
    .filter(c => c.level !== 'green')
    .map((c, i) => ({
      id: `rh_seed_${i}`,
      cityId: c.id,
      cityName: c.cityName,
      fromLevel: 'green' as RiskLevel,
      toLevel: c.level,
      reason: '监控中发现异常讨论',
      timestamp: now - (cities.length - i) * 3600000,
      date: yesterday
    }));
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialCompany = getInitialCompanyInfo();
  const initialCities = getInitialCityRisks(initialCompany);

  const [isOnboarded, setIsOnboardedState] = useState<boolean>(getInitialOnboarded());
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(initialCompany);
  const [cityRisks, setCityRisks] = useState<CityRisk[]>(initialCities);
  const [eventNotes, setEventNotes] = useState<EventNote[]>(() => getInitialNotes(initialCities));
  const [riskHistory, setRiskHistory] = useState<RiskChangeRecord[]>(() => getInitialHistory(initialCities));

  const setIsOnboarded = useCallback((v: boolean) => {
    setIsOnboardedState(v);
    trySetStorage(STORAGE_KEYS.IS_ONBOARDED, v);
  }, []);

  const setCompanyInfo = useCallback((info: CompanyInfo) => {
    setCompanyInfoState(info);
    trySetStorage(STORAGE_KEYS.COMPANY_INFO, info);
  }, []);

  const addHistoryRecord = useCallback((
    cityId: string,
    cityName: string,
    fromLevel: RiskLevel | null,
    toLevel: RiskLevel,
    reason: string
  ) => {
    const record: RiskChangeRecord = {
      id: 'rh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId,
      cityName,
      fromLevel,
      toLevel,
      reason,
      timestamp: Date.now(),
      date: getTodayStr()
    };
    setRiskHistory(prev => {
      const updated = [record, ...prev].slice(0, 200);
      trySetStorage(STORAGE_KEYS.RISK_HISTORY, updated);
      return updated;
    });
    return record;
  }, []);

  const updateCityRiskLevel = useCallback((cityId: string, level: RiskLevel, reason: string = '') => {
    setCityRisks(prev => {
      const targetCity = prev.find(c => c.id === cityId);
      if (!targetCity) return prev;
      if (targetCity.level === level) return prev;

      addHistoryRecord(cityId, targetCity.cityName, targetCity.level, level, reason);

      const newCount = level === 'green'
        ? Math.floor(Math.random() * 5) + 1
        : level === 'yellow'
          ? Math.floor(Math.random() * 50) + 30
          : Math.floor(Math.random() * 200) + 100;

      const updated = prev.map(c => {
        if (c.id === cityId) {
          return {
            ...c,
            level,
            discussionCount: newCount,
            lastUpdated: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
          };
        }
        return c;
      });
      trySetStorage(STORAGE_KEYS.CITY_RISKS, updated);
      return updated;
    });
  }, [addHistoryRecord]);

  const syncCitiesFromCompany = useCallback((newCities?: string[]) => {
    const citiesToSync = newCities || companyInfo.cities;

    setCityRisks(prevRisks => {
      const existingMap = new Map(prevRisks.map(c => [c.cityName, c]));
      const result: CityRisk[] = [];

      citiesToSync.forEach(cityName => {
        if (existingMap.has(cityName)) {
          result.push(existingMap.get(cityName)!);
        } else {
          const newCity = createDefaultCityRisk(cityName);
          result.push(newCity);
          addHistoryRecord(newCity.id, cityName, null, 'green', '新增监控城市');
        }
      });

      const removedCities = prevRisks.filter(c => !citiesToSync.includes(c.cityName));
      if (removedCities.length > 0) {
        console.log('[AppContext] 移除城市:', removedCities.map(c => c.cityName).join(', '));
      }

      trySetStorage(STORAGE_KEYS.CITY_RISKS, result);
      return result;
    });
  }, [companyInfo.cities, addHistoryRecord]);

  const getCityRisk = useCallback((id: string) => {
    return cityRisks.find(c => c.id === id);
  }, [cityRisks]);

  const addEventNote = useCallback((note: Omit<EventNote, 'id' | 'createdAt'>): EventNote => {
    const newNote: EventNote = {
      ...note,
      id: 'n' + Date.now(),
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    };

    setEventNotes(prev => {
      const updated = [newNote, ...prev];
      trySetStorage(STORAGE_KEYS.EVENT_NOTES, updated);
      return updated;
    });

    if (note.status === 'resolved' || note.status === 'rumor' || note.status === 'issued_statement') {
      updateCityRiskLevel(note.cityId, 'green', `备注：${note.statusText}`);
    } else if (note.status === 'monitoring') {
      const city = cityRisks.find(c => c.id === note.cityId);
      if (city && city.level === 'red') {
        updateCityRiskLevel(note.cityId, 'yellow', `备注：${note.statusText}`);
      }
    }

    return newNote;
  }, [updateCityRiskLevel, cityRisks]);

  const getNotesByCity = useCallback((cityId: string) => {
    return eventNotes.filter(n => n.cityId === cityId);
  }, [eventNotes]);

  const getCityTimeline = useCallback((cityId: string): TimelineItem[] => {
    const items: TimelineItem[] = [];
    const city = cityRisks.find(c => c.id === cityId);

    if (city) {
      const cityHistory = riskHistory.filter(r => r.cityId === cityId);
      cityHistory.forEach(r => {
        items.push({
          id: `hist_${r.id}`,
          type: 'level_change',
          title: r.fromLevel === null
            ? `开始监控（${r.toLevel === 'green' ? '平稳' : r.toLevel === 'yellow' ? '关注' : '预警'}）`
            : `风险${r.toLevel === 'green' ? '下降' : r.toLevel === 'yellow' ? '变动' : '升级'}`,
          description: r.reason || (r.fromLevel === null
            ? '已纳入舆情监控范围'
            : `${r.fromLevel === 'green' ? '平稳' : r.fromLevel === 'yellow' ? '关注' : '预警'} → ${r.toLevel === 'green' ? '平稳' : r.toLevel === 'yellow' ? '关注' : '预警'}`),
          time: new Date(r.timestamp).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          timestamp: r.timestamp,
          fromLevel: r.fromLevel,
          toLevel: r.toLevel,
          level: r.toLevel
        });
      });

      const notes = getNotesByCity(cityId);
      notes.forEach(n => {
        const ts = Date.parse(n.createdAt.replace(/-/g, '/')) || Date.now();
        items.push({
          id: n.id,
          type: 'note',
          title: n.statusText,
          description: n.description,
          time: n.createdAt,
          timestamp: ts,
          status: n.status,
          statusText: n.statusText
        });
      });

      if (items.length === 0) {
        items.push({
          id: 'init_fallback',
          type: 'init',
          title: `${city.cityName}开始监控`,
          description: '已纳入舆情监控范围，持续关注中',
          time: city.lastUpdated,
          timestamp: Date.parse(city.lastUpdated.replace(/-/g, '/')) || Date.now(),
          level: city.level
        });
      }
    }

    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }, [cityRisks, riskHistory, eventNotes, getNotesByCity]);

  const isOverdueUnprocessed = useCallback((cityId: string) => {
    const city = cityRisks.find(c => c.id === cityId);
    if (!city || city.level === 'green') return false;
    const notes = getNotesByCity(cityId);
    if (notes.length === 0) {
      const ts = Date.parse(city.lastUpdated.replace(/-/g, '/')) || Date.now();
      return (Date.now() - ts) > 24 * 60 * 60 * 1000;
    }
    const latestNote = notes[0];
    const ts = Date.parse(latestNote.createdAt.replace(/-/g, '/')) || Date.now();
    return (Date.now() - ts) > 24 * 60 * 60 * 1000;
  }, [cityRisks, getNotesByCity]);

  const getRecentlyUpgraded = useCallback((withinHours: number = 24) => {
    const threshold = Date.now() - withinHours * 60 * 60 * 1000;
    return riskHistory.filter(r =>
      r.timestamp >= threshold &&
      r.toLevel !== 'green' &&
      ((r.fromLevel === 'green' && r.toLevel !== 'green') ||
        (r.fromLevel === 'yellow' && r.toLevel === 'red'))
    );
  }, [riskHistory]);

  const getYesterdayChanges = useCallback(() => {
    const yesterday = getYesterdayStr();
    let yesterdayChanges = riskHistory.filter(r => r.date === yesterday);

    if (yesterdayChanges.length === 0) {
      const now = Date.now();
      yesterdayChanges = cityRisks
        .filter(c => c.level !== 'green')
        .map((c, i) => ({
          id: `rh_fallback_${i}`,
          cityId: c.id,
          cityName: c.cityName,
          fromLevel: 'green' as RiskLevel,
          toLevel: c.level,
          reason: '监控中发现异常讨论',
          timestamp: now - (cityRisks.length - i) * 3600000,
          date: yesterday
        }));
    }

    const newRisks = yesterdayChanges.filter(r =>
      (r.fromLevel === null && r.toLevel !== 'green') ||
      (r.fromLevel === 'green' && r.toLevel !== 'green')
    );
    const upgraded = yesterdayChanges.filter(r =>
      (r.fromLevel === 'yellow' && r.toLevel === 'red')
    );
    const downgraded = yesterdayChanges.filter(r =>
      (r.fromLevel === 'red' && r.toLevel === 'yellow') ||
      (r.fromLevel === 'red' && r.toLevel === 'green') ||
      (r.fromLevel === 'yellow' && r.toLevel === 'green')
    );

    return {
      newRisks,
      upgraded,
      downgraded,
      total: newRisks.length + upgraded.length
    };
  }, [riskHistory, cityRisks]);

  const generateReportContent = useCallback(() => {
    const redCities = cityRisks.filter(c => c.level === 'red');
    const yellowCities = cityRisks.filter(c => c.level === 'yellow');
    const greenCities = cityRisks.filter(c => c.level === 'green');
    const changes = getYesterdayChanges();

    const topKeywords = ['过期食品', '价格欺诈', '配送延迟', '服务态度', '促销秩序'];
    const topPlatforms = [
      { platform: '抖音', count: 234 },
      { platform: '小红书', count: 156 },
      { platform: '微博', count: 98 }
    ];

    const actionItems: string[] = [];
    if (redCities.length > 0) {
      actionItems.push(`【紧急处理】${redCities.map(c => c.cityName).join('、')} - 建议法务介入`);
    }
    if (yellowCities.length > 0) {
      actionItems.push(`【持续观察】${yellowCities.map(c => c.cityName).join('、')} - 请店长关注`);
    }
    if (changes.downgraded.length > 0) {
      actionItems.push(`【已好转】${changes.downgraded.map(c => c.cityName).join('、')} - 风险下降中`);
    }
    if (greenCities.length > 0) {
      actionItems.push(`【平稳运行】${greenCities.length}个城市运营正常`);
    }

    const today = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[new Date().getDay()];

    const formatLevel = (l: RiskLevel | null) => {
      if (l === 'red') return '红色预警';
      if (l === 'yellow') return '黄色关注';
      if (l === 'green') return '平稳';
      return '新增';
    };

    return `【${companyInfo.name}·每日舆情早报】
日期：${today} ${weekDay}

━━━━ 风险概览 ━━━━
🔴 需马上处理：${redCities.length} 个城市
🟡 持续关注中：${yellowCities.length} 个城市
🟢 运行平稳：${greenCities.length} 个城市

━━━━ 昨日变动 ━━━━
📈 新增风险：${changes.newRisks.length} 个
⬆️ 等级升级：${changes.upgraded.length} 个
📉 风险下降：${changes.downgraded.length} 个

${changes.newRisks.length > 0 ? `📌 新增风险明细：
${changes.newRisks.map((r, i) => `${i + 1}. ${r.cityName}（${formatLevel(r.toLevel)}）- ${r.reason || '监控中出现异常讨论'}`).join('\n')}

` : ''}${changes.upgraded.length > 0 ? `⬆️ 升级明细：
${changes.upgraded.map((r, i) => `${i + 1}. ${r.cityName}：${formatLevel(r.fromLevel)} → ${formatLevel(r.toLevel)}${r.reason ? ` - ${r.reason}` : ''}`).join('\n')}

` : ''}${changes.downgraded.length > 0 ? `📉 降级明细：
${changes.downgraded.map((r, i) => `${i + 1}. ${r.cityName}：${formatLevel(r.fromLevel)} → ${formatLevel(r.toLevel)}${r.reason ? ` - ${r.reason}` : ''}`).join('\n')}

` : ''}━━━━ 重点关注城市 ━━━━
${[...redCities, ...yellowCities].length > 0
  ? [...redCities, ...yellowCities].slice(0, 5).map((c, i) => `${i + 1}. ${c.cityName}（${c.level === 'red' ? '红色预警' : '黄色关注'}）
   讨论量：${c.discussionCount}
   ${c.summary.whatHappened.slice(0, 30)}...`).join('\n')
  : '所有城市运行平稳，无重点关注项'}

━━━━ 负面热词 TOP5 ━━━━
${topKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

━━━━ 最活跃平台 ━━━━
${topPlatforms.map((p, i) => `${i + 1}. ${p.platform} - ${p.count}条讨论`).join('\n')}

━━━━ 今日行动建议 ━━━━
${actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}

—— 由舆情预警助手自动生成`;
  }, [cityRisks, companyInfo, getYesterdayChanges]);

  return (
    <AppContext.Provider value={{
      isOnboarded,
      setIsOnboarded,
      companyInfo,
      setCompanyInfo,
      cityRisks,
      getCityRisk,
      updateCityRiskLevel,
      syncCitiesFromCompany,
      eventNotes,
      addEventNote,
      getNotesByCity,
      cityCoords: CITY_COORDS,
      generateReportContent,
      getYesterdayChanges,
      riskHistory,
      getCityTimeline,
      isOverdueUnprocessed,
      getRecentlyUpgraded
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
