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
  const {
    companyInfo,
    cityRisks,
    getNotesByCity,
    getRecentlyUpgraded,
    isOverdueUnprocessed,
    getNotesByCity: _getNotesByCity
  } = useApp();

  const stats = useMemo(() => {
    const red = cityRisks.filter(c => c.level === 'red').length;
    const yellow = cityRisks.filter(c => c.level === 'yellow').length;
    const green = cityRisks.filter(c => c.level === 'green').length;
    return { red, yellow, green, total: cityRisks.length };
  }, [cityRisks]);

  const todoItems = useMemo(() => {
    type TodoItem = {
      cityId: string;
      cityName: string;
      level: 'red' | 'yellow' | 'green';
      tag: string;
      tagColor: 'red' | 'yellow' | 'blue' | 'gray';
      priority: number;
      reason: string;
    };

    const items: TodoItem[] = [];
    const recentlyUpgraded = getRecentlyUpgraded(24);
    const upgradedCityIds = new Set(recentlyUpgraded.map(r => r.cityId));

    cityRisks.forEach(city => {
      if (city.level === 'green') return;
      const isRed = city.level === 'red';
      const isUpgraded = upgradedCityIds.has(city.id);
      const isOverdue = isOverdueUnprocessed(city.id);

      let priority = 99;
      let tag = '';
      let tagColor: 'red' | 'yellow' | 'blue' | 'gray' = 'gray';
      let reason = '';

      if (isRed) {
        priority = 1;
        tag = '红色预警';
        tagColor = 'red';
        reason = '需要立即处理';
      } else if (isUpgraded) {
        priority = 2;
        tag = '刚升级';
        tagColor = 'yellow';
        reason = '24小时内风险升级，建议关注';
      } else if (isOverdue) {
        priority = 3;
        tag = '超期未处理';
        tagColor = 'yellow';
        reason = '超过一天无人跟进';
      } else if (city.level === 'yellow') {
        priority = 4;
        tag = '持续关注';
        tagColor = 'blue';
        reason = '讨论量上升，建议跟进';
      }

      if (priority < 99) {
        items.push({
          cityId: city.id,
          cityName: city.cityName,
          level: city.level,
          tag,
          tagColor,
          priority,
          reason
        });
      }
    });

    items.sort((a, b) => a.priority - b.priority);
    return items;
  }, [cityRisks, getRecentlyUpgraded, isOverdueUnprocessed]);

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

  const getLatestNoteTag = (cityId: string) => {
    const notes = _getNotesByCity(cityId);
    if (notes.length === 0) return null;
    const latest = notes[0];
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === latest.status);
    return opt ? { label: opt.label, color: opt.color } : null;
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
          <View className={styles.alertBanner} onClick={() => handleCityClick(alertCity.id)}>
            <Text className={styles.alertIcon}>⚠️</Text>
            <Text className={styles.alertText}>
              {alertCity.cityName}出现集中讨论，建议立即查看
            </Text>
            <Text className={styles.alertArrow}>›</Text>
          </View>
        )}
      </View>

      {todoItems.length > 0 && (
        <View className={styles.todoCard}>
          <View className={styles.todoHeader}>
            <View className={styles.todoIconWrap}>
              <Text className={styles.todoIcon}>✋</Text>
            </View>
            <View className={styles.todoHeaderInfo}>
              <Text className={styles.todoTitle}>老板待办</Text>
              <Text className={styles.todoSubtitle}>共 {todoItems.length} 件需要你关注</Text>
            </View>
          </View>
          <View className={styles.todoList}>
            {todoItems.map(item => {
              const latestTag = getLatestNoteTag(item.cityId);
              return (
                <View
                  key={item.cityId}
                  className={styles.todoItem}
                  onClick={() => handleCityClick(item.cityId)}
                >
                  <View className={styles.todoItemLeft}>
                    <View className={`${styles.todoPriorityDot} ${
                      item.priority === 1 ? styles.todoPriorityRed :
                      item.priority === 2 ? styles.todoPriorityYellow :
                      item.priority === 3 ? styles.todoPriorityOrange :
                      styles.todoPriorityBlue
                    }`}></View>
                    <View className={styles.todoItemContent}>
                      <View className={styles.todoItemRow}>
                        <Text className={styles.todoCityName}>{item.cityName}</Text>
                        <NoteTag label={item.tag} color={item.tagColor} />
                      </View>
                      <Text className={styles.todoReason}>{item.reason}</Text>
                      {latestTag && (
                        <View className={styles.todoLatestNote}>
                          <Text className={styles.todoLatestNoteLabel}>最近：</Text>
                          <NoteTag label={latestTag.label} color={latestTag.color} />
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <StatusBadge level={item.level} size="sm" />
                    <Text className={styles.todoArrow}>›</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View className={styles.mapCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>风险地图</Text>
          <Text className={styles.cardHint}>点击城市查看详情</Text>
        </View>
        <RiskMap cities={cityRisks} />
      </View>

      <View className={styles.cityListCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>城市风险列表</Text>
          <Text className={styles.cardHint}>按风险程度排序</Text>
        </View>
        {sortedCities.map(city => {
          const notes = getNotesByCity(city.id);
          const latestNote = notes.length > 0 ? notes[0] : null;
          const opt = latestNote ? NOTE_STATUS_OPTIONS.find(o => o.value === latestNote.status) : null;
          return (
            <View
              key={city.id}
              className={styles.cityListItem}
              onClick={() => handleCityClick(city.id)}
            >
              <View className={styles.cityListInfo}>
                <View className={styles.cityListRow}>
                  <Text className={styles.cityListName}>{city.cityName}</Text>
                  <StatusBadge level={city.level} size="sm" />
                </View>
                <Text className={styles.cityListDesc} numberOfLines={1}>
                  {city.summary.whatHappened}
                </Text>
                <View className={styles.cityListMeta}>
                  <Text className={styles.cityListMetaItem}>讨论 {city.discussionCount}</Text>
                  <Text className={styles.cityListMetaDot}>·</Text>
                  <Text className={styles.cityListMetaItem}>{city.lastUpdated}</Text>
                  {opt && (
                    <>
                      <Text className={styles.cityListMetaDot}>·</Text>
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <NoteTag label={opt.label} color={opt.color} size="sm" />
                      </View>
                    </>
                  )}
                </View>
              </View>
              <Text className={styles.cityListArrow}>›</Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: '40rpx' }}></View>
    </ScrollView>
  );
};

export default HomePage;
