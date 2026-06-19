import { RiskLevel } from '@/types';

export const getRiskLevelText = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    green: '平稳',
    yellow: '需关注',
    red: '需处理'
  };
  return map[level];
};

export const getRiskLevelColor = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    green: '#00b42a',
    yellow: '#ff7d00',
    red: '#f53f3f'
  };
  return map[level];
};

export const getRiskLevelBgColor = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    green: '#e8ffea',
    yellow: '#fff3e8',
    red: '#ffece8'
  };
  return map[level];
};

export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
