import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import NoteTag from '@/components/NoteTag';
import StatusBadge from '@/components/StatusBadge';
import { NOTE_STATUS_OPTIONS, EventNote, RiskLevel } from '@/types';
import styles from './index.module.scss';

const HistoryPage: React.FC = () => {
  const { cityRisks, eventNotes, riskHistory, companyInfo } = useApp();

  const activeCityNames = useMemo(() => new Set(cityRisks.map(c => c.cityName)), [cityRisks]);
  const allCityNames = useMemo(() => {
    const set = new Set<string>();
    eventNotes.forEach(n => set.add(n.cityName));
    riskHistory.forEach(r => set.add(r.cityName));
    return Array.from(set);
  }, [eventNotes, riskHistory]);

  const statusOptions = useMemo(() => [
    { value: 'all', label: '全部状态' },
    ...NOTE_STATUS_OPTIONS
  ], []);

  const cityOptions = useMemo(() => [
    { value: 'all', label: '全部城市' },
    ...allCityNames.map(name => ({
      value: name,
      label: activeCityNames.has(name) ? name : `${name}（已删除）`
    }))
  ], [allCityNames, activeCityNames]);

  const onlyActive = useMemo(() => [
    { value: 'all', label: '全部记录' },
    { value: 'active', label: '仅监控中城市' },
    { value: 'removed', label: '仅已删除城市' }
  ], []);

  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScope, setFilterScope] = useState('all');

  const filteredNotes = useMemo(() => {
    let notes = [...eventNotes];

    if (filterCity !== 'all') {
      notes = notes.filter(n => n.cityName === filterCity);
    }

    if (filterStatus !== 'all') {
      notes = notes.filter(n => n.status === filterStatus);
    }

    if (filterScope === 'active') {
      notes = notes.filter(n => activeCityNames.has(n.cityName));
    } else if (filterScope === 'removed') {
      notes = notes.filter(n => !activeCityNames.has(n.cityName));
    }

    return notes;
  }, [eventNotes, filterCity, filterStatus, filterScope, activeCityNames]);

  const stats = useMemo(() => {
    const total = eventNotes.length;
    const activeNotes = eventNotes.filter(n => activeCityNames.has(n.cityName)).length;
    const removedNotes = total - activeNotes;
    const byStatus: Record<string, number> = {};
    NOTE_STATUS_OPTIONS.forEach(o => {
      byStatus[o.value] = eventNotes.filter(n => n.status === o.value).length;
    });
    return { total, activeNotes, removedNotes, byStatus };
  }, [eventNotes, activeCityNames]);

  const getStatusColor = (status: string) => {
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.color || 'gray';
  };

  const handleBack = () => Taro.navigateBack();

  const handleNoteClick = (note: EventNote) => {
    const city = cityRisks.find(c => c.id === note.cityId || c.cityName === note.cityName);
    if (city) {
      Taro.navigateTo({ url: `/pages/city-detail/index?id=${city.id}` });
    } else {
      Taro.showToast({ title: '该城市已停止监控', icon: 'none' });
    }
  };

  const getLevelName = (l: RiskLevel | null) => {
    if (l === 'red') return '红色预警';
    if (l === 'yellow') return '黄色关注';
    if (l === 'green') return '平稳';
    return '新增';
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.navBar}>
        <Text className={styles.navBack} onClick={handleBack}>‹</Text>
        <Text className={styles.navTitle}>历史归档</Text>
        <View style={{ width: 60 }}></View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{stats.total}</Text>
          <Text className={styles.statLabel}>总备注</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber} style={{ color: '#165dff' }}>{stats.activeNotes}</Text>
          <Text className={styles.statLabel}>监控中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber} style={{ color: '#86909c' }}>{stats.removedNotes}</Text>
          <Text className={styles.statLabel}>已归档</Text>
        </View>
      </View>

      {Object.keys(stats.byStatus).some(k => stats.byStatus[k] > 0) && (
        <View className={styles.statusStats}>
          {NOTE_STATUS_OPTIONS.filter(o => stats.byStatus[o.value] > 0).map(o => (
            <View key={o.value} className={styles.statusStatItem}>
              <NoteTag label={o.label} color={o.color} size="sm" />
              <Text className={styles.statusStatCount}>{stats.byStatus[o.value]}</Text>
            </View>
          ))}
        </View>
      )}

      <View className={styles.filterCard}>
        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>筛选范围</Text>
          <View className={styles.filterChips}>
            {onlyActive.map(opt => (
              <View
                key={opt.value}
                className={`${styles.filterChip} ${filterScope === opt.value ? styles.filterChipActive : ''}`}
                onClick={() => setFilterScope(opt.value)}
              >
                <Text className={`${styles.filterChipText} ${filterScope === opt.value ? styles.filterChipActiveText : ''}`}>
                  {opt.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>城市</Text>
          <View className={styles.filterChips}>
            {cityOptions.map(opt => (
              <View
                key={opt.value}
                className={`${styles.filterChip} ${filterCity === opt.value ? styles.filterChipActive : ''}`}
                onClick={() => setFilterCity(opt.value)}
              >
                <Text className={`${styles.filterChipText} ${filterCity === opt.value ? styles.filterChipActiveText : ''}`}>
                  {opt.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>处理状态</Text>
          <View className={styles.filterChips}>
            {statusOptions.map(opt => (
              <View
                key={opt.value}
                className={`${styles.filterChip} ${filterStatus === opt.value ? styles.filterChipActive : ''}`}
                onClick={() => setFilterStatus(opt.value)}
              >
                <Text className={`${styles.filterChipText} ${filterStatus === opt.value ? styles.filterChipActiveText : ''}`}>
                  {opt.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.listHeader}>
        <Text className={styles.listTitle}>处理记录</Text>
        <Text className={styles.listCount}>共 {filteredNotes.length} 条</Text>
      </View>

      {filteredNotes.length > 0 ? (
        <View className={styles.noteList}>
          {filteredNotes.map(note => {
            const isActive = activeCityNames.has(note.cityName);
            const opt = NOTE_STATUS_OPTIONS.find(o => o.value === note.status);
            return (
              <View
                key={note.id}
                className={`${styles.noteItem} ${!isActive ? styles.noteItemArchived : ''}`}
                onClick={() => handleNoteClick(note)}
              >
                <View className={styles.noteHeader}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                    <Text className={styles.noteCity}>{note.cityName}</Text>
                    {!isActive && (
                      <View className={styles.archivedBadge}>
                        <Text className={styles.archivedText}>已停止监控</Text>
                      </View>
                    )}
                  </View>
                  {opt && <NoteTag label={opt.label} color={opt.color} size="sm" />}
                </View>
                <Text className={styles.noteDesc}>{note.description}</Text>
                <Text className={styles.noteTime}>{note.createdAt}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyText}>暂无符合条件的记录</Text>
        </View>
      )}

      {filterScope !== 'removed' && (
        <>
          <View className={styles.listHeader}>
            <Text className={styles.listTitle}>风险变动历史</Text>
            <Text className={styles.listCount}>共 {riskHistory.length} 条</Text>
          </View>
          {riskHistory.length > 0 ? (
            <View className={styles.historyList}>
              {riskHistory
                .filter(r => filterCity === 'all' || r.cityName === filterCity)
                .filter(r => filterScope === 'all' || (filterScope === 'active' ? activeCityNames.has(r.cityName) : !activeCityNames.has(r.cityName)))
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 50)
                .map(r => {
                  const isActive = activeCityNames.has(r.cityName);
                  return (
                    <View
                      key={r.id}
                      className={`${styles.historyItem} ${!isActive ? styles.noteItemArchived : ''}`}
                    >
                      <View className={styles.historyHeader}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                          <Text className={styles.noteCity}>{r.cityName}</Text>
                          {!isActive && (
                            <View className={styles.archivedBadge}>
                              <Text className={styles.archivedText}>已停止监控</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                          {r.fromLevel && <StatusBadge level={r.fromLevel} size="sm" />}
                          <Text className={styles.historyArrow}>→</Text>
                          <StatusBadge level={r.toLevel} size="sm" />
                        </View>
                      </View>
                      <Text className={styles.noteDesc}>
                        {r.reason || `${getLevelName(r.fromLevel)} → ${getLevelName(r.toLevel)}`}
                      </Text>
                      <Text className={styles.noteTime}>
                        {new Date(r.timestamp).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                      </Text>
                    </View>
                  );
                })}
            </View>
          ) : null}
        </>
      )}

      <View style={{ height: 80 }}></View>
    </ScrollView>
  );
};

export default HistoryPage;
