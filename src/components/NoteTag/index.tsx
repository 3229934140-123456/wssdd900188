import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface NoteTagProps {
  label: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'rgba(22, 93, 255, 0.1)', text: '#165dff' },
  green: { bg: 'rgba(0, 180, 42, 0.1)', text: '#00b42a' },
  yellow: { bg: 'rgba(255, 125, 0, 0.1)', text: '#ff7d00' },
  red: { bg: 'rgba(245, 63, 63, 0.1)', text: '#f53f3f' },
  gray: { bg: '#f2f3f5', text: '#4e5969' }
};

const NoteTag: React.FC<NoteTagProps> = ({ label, color = 'gray' }) => {
  const colors = colorMap[color] || colorMap.gray;
  return (
    <View className={styles.tag} style={{ backgroundColor: colors.bg, color: colors.text }}>
      <Text className={styles.text}>{label}</Text>
    </View>
  );
};

export default NoteTag;
