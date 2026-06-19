import React from 'react';
import { View, Text } from '@tarojs/components';
import { RiskLevel } from '@/types';
import { getRiskLevelText, getRiskLevelColor, getRiskLevelBgColor } from '@/utils';
import styles from './index.module.scss';

interface StatusBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ level, size = 'md' }) => {
  const color = getRiskLevelColor(level);
  const bgColor = getRiskLevelBgColor(level);
  const text = getRiskLevelText(level);

  return (
    <View
      className={`${styles.badge} ${styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}
      style={{ backgroundColor: bgColor, color }}
    >
      <View className={styles.dot} style={{ backgroundColor: color }}></View>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default StatusBadge;
