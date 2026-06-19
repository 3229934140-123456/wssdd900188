export type RiskLevel = 'green' | 'yellow' | 'red';

export interface CompanyInfo {
  name: string;
  shortNames: string[];
  cities: string[];
}

export interface CityRisk {
  id: string;
  cityName: string;
  level: RiskLevel;
  discussionCount: number;
  lastUpdated: string;
  summary: {
    whatHappened: string;
    whoDiscussing: string;
    businessImpact: string;
  };
  sources: Array<{
    id: string;
    title: string;
    platform: string;
    url: string;
  }>;
}

export interface DailyReport {
  date: string;
  newRiskCount: number;
  riskChanges: Array<{
    city: string;
    from: RiskLevel;
    to: RiskLevel;
  }>;
  negativeKeywords: string[];
  mostActivePlatforms: Array<{
    platform: string;
    count: number;
  }>;
}

export interface EventNote {
  id: string;
  cityId: string;
  cityName: string;
  status: 'contacted_customer' | 'issued_statement' | 'rumor' | 'monitoring' | 'resolved' | 'other';
  statusText: string;
  description: string;
  createdAt: string;
}

export const NOTE_STATUS_OPTIONS = [
  { value: 'contacted_customer', label: '已联系客户', color: 'blue' },
  { value: 'issued_statement', label: '已发声明', color: 'green' },
  { value: 'rumor', label: '纯属谣言', color: 'green' },
  { value: 'monitoring', label: '持续观察', color: 'yellow' },
  { value: 'resolved', label: '已解决', color: 'green' },
  { value: 'other', label: '其他', color: 'gray' }
] as const;
