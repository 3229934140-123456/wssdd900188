import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import RiskMap from '@/components/RiskMap';
import StatusBadge from '@/components/StatusBadge';
import NoteTag from '@/components/NoteTag';
import { NOTE_STATUS_OPTIONS } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { companyInfo, cityRisks, getNotesByCity } = useApp();

  const stats = useMemo(() => {
    const red = cityRisks.filter(c => c.level === 'red').length;
    const yellow = cityRisks.filter(c => c.level === 'yellow').length;
    const green = cityRisks.filter(c => c.level === 'green').length;
    return { red, yellow, green, total: cityRisks.length };
  }, [cityRisks]);

  const sortedCities = useMemo(() => {
    const order = { red: 0, yellow: 1, green: 2 };
    return [...cityRisks].sort((a, b) => order[a.level] - order[b.level]);
  }, [cityRisks]);

  const handleCityClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/city-detail/index?id=${id}` });
  };

  const getStatusColor = (status: string) => {
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.color || 'gray';
  };

  const alertCity = sortedCities.find(c => c.level === 'red');

  return (
    <ScrollView scrollY className={styles.page} refresherEnabled onRefresh={() => Taro.stopPullDownRefresh()}>
      <View className={styles.header}>
        <Text className={styles.companyName}>{companyInfo.name}</Text>
        <Text className={styles.subtitle}>舆情风险实时监控 · 共 {stats.total} 个城市</Text>
      </View>

      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>今日风险概览</Text>
        <View className={styles.summaryStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#f53f3f' }}>{stats.red}</Text>
            <Text className={styles.statLabel}>需马上处理</Text>
          </View>
          <View className={styles.statDivider}></View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#ffd9a6' }}>{stats.yellow}</Text>
            <Text className={styles.statLabel}>需关注</Text>
          </View>
          <View className={styles.statDivider}></View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.green}</Text>
            <Text className={styles.statLabel}>运行平稳</Text>
          </View>
        </View>
        {alertCity && (
          <View className={styles.summaryTip}>
            <View className={styles.tipIcon}>
              <View className={styles.tipIconInner}></View>
            </View>
            <Text className={styles.tipText}>{alertCity.cityName}有紧急舆情需要处理，点击查看详情</Text>
          </View>
        )}
      </View>

      <Text className={styles.sectionTitle}>全国风险分布</Text>
      <RiskMap cities={cityRisks} />

      <Text className={styles.sectionTitle}>城市风险列表</Text>
      <View className={styles.cityList}>
        {sortedCities.map(city => {
          const notes = getNotesByCity(city.id);
          return (
            <View key={city.id} className={styles.cityCard} onClick={() => handleCityClick(city.id)}>
              <View className={styles.cityCardHeader}>
                <Text className={styles.cityName}>{city.cityName}</Text>
                <StatusBadge level={city.level} size="sm" />
              </View>
              <View className={styles.cityMeta}>
                <Text className={styles.discussionInfo}>
                  讨论量 <Text className={styles.discussionCount}>{city.discussionCount}</Text> 条
                </Text>
                <Text className={styles.updateTime}>更新 {city.lastUpdated.split(' ')[1]}</Text>
              </View>
              {notes.length > 0 && (
                <View className={styles.notesSection}>
                  <Text className={styles.notesLabel}>已处理：</Text>
                  <View className={styles.notesTags}>
                    {notes.slice(0, 3).map(note => (
                      <NoteTag key={note.id} label={note.statusText} color={getStatusColor(note.status)} />
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default HomePage;
