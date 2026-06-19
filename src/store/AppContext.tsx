import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { CompanyInfo, CityRisk, EventNote, RiskLevel } from '@/types';
import { defaultCompanyInfo, cityRisks as seedCityRisks } from '@/data/mockData';

const STORAGE_KEYS = {
  IS_ONBOARDED: 'yp_is_onboarded',
  COMPANY_INFO: 'yp_company_info',
  CITY_RISKS: 'yp_city_risks',
  EVENT_NOTES: 'yp_event_notes'
};

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

interface AppContextType {
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
  cityRisks: CityRisk[];
  getCityRisk: (id: string) => CityRisk | undefined;
  updateCityRiskLevel: (cityId: string, level: RiskLevel, reason?: string) => void;
  syncCitiesFromCompany: () => void;
  eventNotes: EventNote[];
  addEventNote: (note: Omit<EventNote, 'id' | 'createdAt'>) => void;
  getNotesByCity: (cityId: string) => EventNote[];
  cityCoords: Record<string, { x: number; y: number }>;
  generateReportContent: () => string;
}

const AppContext = createContext<AppContextType | null>(null);

const getInitialOnboarded = (): boolean => {
  try {
    const val = Taro.getStorageSync(STORAGE_KEYS.IS_ONBOARDED);
    return val === true || val === 'true';
  } catch {
    return false;
  }
};

const getInitialCompanyInfo = (): CompanyInfo => {
  try {
    const val = Taro.getStorageSync(STORAGE_KEYS.COMPANY_INFO);
    if (val && typeof val === 'object') return val;
  } catch {}
  return defaultCompanyInfo;
};

const getInitialCityRisks = (company: CompanyInfo): CityRisk[] => {
  try {
    const val = Taro.getStorageSync(STORAGE_KEYS.CITY_RISKS);
    if (val && Array.isArray(val) && val.length > 0) return val;
  } catch {}
  return mergeCitiesWithSeed(company.cities);
};

const getInitialNotes = (): EventNote[] => {
  try {
    const val = Taro.getStorageSync(STORAGE_KEYS.EVENT_NOTES);
    if (val && Array.isArray(val)) return val;
  } catch {}
  return [];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialCompany = getInitialCompanyInfo();
  const [isOnboarded, setIsOnboardedState] = useState<boolean>(getInitialOnboarded());
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(initialCompany);
  const [cityRisks, setCityRisks] = useState<CityRisk[]>(() => getInitialCityRisks(initialCompany));
  const [eventNotes, setEventNotes] = useState<EventNote[]>(() => getInitialNotes());

  useEffect(() => {
    try {
      const storedOnboarded = Taro.getStorageSync(STORAGE_KEYS.IS_ONBOARDED);
      const storedCompany = Taro.getStorageSync(STORAGE_KEYS.COMPANY_INFO);
      const storedCities = Taro.getStorageSync(STORAGE_KEYS.CITY_RISKS);
      const storedNotes = Taro.getStorageSync(STORAGE_KEYS.EVENT_NOTES);

      if (storedOnboarded === true || storedOnboarded === 'true') {
        setIsOnboardedState(true);
      }

      if (storedCompany && typeof storedCompany === 'object') {
        setCompanyInfoState(storedCompany);
        if (storedCities && Array.isArray(storedCities) && storedCities.length > 0) {
          setCityRisks(storedCities);
        } else {
          setCityRisks(mergeCitiesWithSeed(storedCompany.cities || defaultCompanyInfo.cities));
        }
      } else {
        setCityRisks(mergeCitiesWithSeed(defaultCompanyInfo.cities));
      }

      if (storedNotes && Array.isArray(storedNotes)) {
        setEventNotes(storedNotes);
      }

      console.log('[AppContext] 本地数据加载完成', {
        isOnboarded: storedOnboarded,
        cities: storedCities?.length || 0,
        notes: storedNotes?.length || 0
      });
    } catch (e) {
      console.error('[AppContext] 读取本地存储失败', e);
      setCityRisks(mergeCitiesWithSeed(defaultCompanyInfo.cities));
    }
  }, []);

  const setIsOnboarded = useCallback((v: boolean) => {
    setIsOnboardedState(v);
    try { Taro.setStorageSync(STORAGE_KEYS.IS_ONBOARDED, v); } catch (e) {
      console.error('[AppContext] 保存isOnboarded失败', e);
    }
  }, []);

  const setCompanyInfo = useCallback((info: CompanyInfo) => {
    setCompanyInfoState(info);
    try { Taro.setStorageSync(STORAGE_KEYS.COMPANY_INFO, info); } catch (e) {
      console.error('[AppContext] 保存companyInfo失败', e);
    }
  }, []);

  const persistCityRisks = useCallback((risks: CityRisk[]) => {
    try { Taro.setStorageSync(STORAGE_KEYS.CITY_RISKS, risks); } catch (e) {
      console.error('[AppContext] 保存cityRisks失败', e);
    }
  }, []);

  const persistEventNotes = useCallback((notes: EventNote[]) => {
    try { Taro.setStorageSync(STORAGE_KEYS.EVENT_NOTES, notes); } catch (e) {
      console.error('[AppContext] 保存eventNotes失败', e);
    }
  }, []);

  const getCityRisk = useCallback((id: string) => {
    return cityRisks.find(c => c.id === id);
  }, [cityRisks]);

  const updateCityRiskLevel = useCallback((cityId: string, level: RiskLevel, reason?: string) => {
    setCityRisks(prev => {
      const updated = prev.map(c => {
        if (c.id === cityId) {
          const newCount = level === 'green' 
            ? Math.floor(Math.random() * 5) + 1 
            : level === 'yellow' 
              ? Math.floor(Math.random() * 50) + 30 
              : Math.floor(Math.random() * 200) + 100;
          return { 
            ...c, 
            level, 
            discussionCount: newCount,
            lastUpdated: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
          };
        }
        return c;
      });
      persistCityRisks(updated);
      return updated;
    });
    console.log(`[AppContext] 城市${cityId}风险等级更新为${level}`, reason || '');
  }, [persistCityRisks]);

  const syncCitiesFromCompany = useCallback(() => {
    setCompanyInfoState(currentCompany => {
      setCityRisks(prevRisks => {
        const existingMap = new Map(prevRisks.map(c => [c.cityName, c]));
        const newRisks = currentCompany.cities.map(cityName => {
          if (existingMap.has(cityName)) {
            return existingMap.get(cityName)!;
          }
          return createDefaultCityRisk(cityName);
        });
        persistCityRisks(newRisks);
        console.log('[AppContext] 城市列表同步完成，共', newRisks.length, '个城市');
        return newRisks;
      });
      return currentCompany;
    });
  }, [persistCityRisks]);

  const addEventNote = useCallback((note: Omit<EventNote, 'id' | 'createdAt'>) => {
    const newNote: EventNote = {
      ...note,
      id: 'n' + Date.now(),
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    };

    setEventNotes(prev => {
      const updated = [newNote, ...prev];
      persistEventNotes(updated);
      return updated;
    });

    if (note.status === 'resolved' || note.status === 'rumor' || note.status === 'issued_statement') {
      setTimeout(() => {
        updateCityRiskLevel(note.cityId, 'green', `备注：${note.statusText}`);
      }, 300);
    } else if (note.status === 'monitoring') {
      setTimeout(() => {
        setCityRisks(prev => {
          const city = prev.find(c => c.id === note.cityId);
          if (city && city.level === 'red') {
            const updated = prev.map(c => 
              c.id === note.cityId 
                ? { ...c, level: 'yellow' as RiskLevel, lastUpdated: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
                : c
            );
            persistCityRisks(updated);
            return updated;
          }
          return prev;
        });
      }, 300);
    }

    console.log('[AppContext] 新增备注', newNote);
    return newNote;
  }, [updateCityRiskLevel, persistCityRisks, persistEventNotes]);

  const getNotesByCity = useCallback((cityId: string) => {
    return eventNotes.filter(n => n.cityId === cityId);
  }, [eventNotes]);

  const generateReportContent = useCallback(() => {
    const redCities = cityRisks.filter(c => c.level === 'red');
    const yellowCities = cityRisks.filter(c => c.level === 'yellow');
    const greenCities = cityRisks.filter(c => c.level === 'green');

    const topKeywords = ['过期食品', '价格欺诈', '配送延迟', '服务态度', '促销秩序'];
    const topPlatforms = [
      { platform: '抖音', count: 234 },
      { platform: '小红书', count: 156 },
      { platform: '微博', count: 98 }
    ];

    const actionItems: string[] = [];
    if (redCities.length > 0) {
      actionItems.push(`【紧急】${redCities.map(c => c.cityName).join('、')}需立即处理，建议法务介入`);
    }
    if (yellowCities.length > 0) {
      actionItems.push(`【关注】${yellowCities.map(c => c.cityName).join('、')}请店长持续观察`);
    }
    if (greenCities.length > 0) {
      actionItems.push(`【平稳】${greenCities.length}个城市运营正常`);
    }

    const today = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');

    return `【${companyInfo.name}·每日舆情早报】
日期：${today}

━━━━ 风险概览 ━━━━
🔴 需马上处理：${redCities.length} 个城市
🟡 持续关注中：${yellowCities.length} 个城市
🟢 运行平稳：${greenCities.length} 个城市

━━━━ 重点关注城市 ━━━━
${[...redCities, ...yellowCities].slice(0, 5).map((c, i) => `${i + 1}. ${c.cityName}（${c.level === 'red' ? '红色预警' : '黄色关注'}）
   ${c.summary.whatHappened.slice(0, 30)}...`).join('\n')}

━━━━ 负面热词 TOP5 ━━━━
${topKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

━━━━ 最活跃平台 ━━━━
${topPlatforms.map((p, i) => `${i + 1}. ${p.platform} - ${p.count}条讨论`).join('\n')}

━━━━ 今日行动建议 ━━━━
${actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}

—— 由舆情预警助手自动生成`;
  }, [cityRisks, companyInfo]);

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
      generateReportContent
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
