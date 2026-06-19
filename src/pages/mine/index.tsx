import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import NoteTag from '@/components/NoteTag';
import { NOTE_STATUS_OPTIONS } from '@/types';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { companyInfo, cityRisks, eventNotes } = useApp();

  const stats = useMemo(() => {
    const handled = eventNotes.length;
    const pending = cityRisks.filter(c => c.level === 'red' || c.level === 'yellow').length;
    return { cities: companyInfo.cities.length, handled, pending };
  }, [companyInfo, cityRisks, eventNotes]);

  const getStatusColor = (status: string) => {
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.color || 'gray';
  };

  const handleEditCompany = () => {
    Taro.navigateTo({ url: '/pages/onboarding/index?edit=1' });
  };

  const handleMenuItem = (action: string) => {
    Taro.showToast({ title: `${action}功能开发中`, icon: 'none' });
  };

  const firstChar = companyInfo.name.charAt(0);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.companyInfo}>
          <View className={styles.companyLogo}>
            <Text className={styles.companyLogoText}>{firstChar}</Text>
          </View>
          <View className={styles.companyDetail}>
            <Text className={styles.companyName}>{companyInfo.name}</Text>
            <Text className={styles.companyShort}>简称：{companyInfo.shortNames.join('、')}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.cities}</Text>
            <Text className={styles.statLabel}>监控城市</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#f53f3f' }}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待处理风险</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#00b42a' }}>{stats.handled}</Text>
            <Text className={styles.statLabel}>已处理事件</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>公司信息</Text>
          <View className={styles.menuItem} onClick={handleEditCompany}>
            <View className={styles.menuIcon} style={{ backgroundColor: '#165dff' }}>
              <Text className={styles.menuIconText}>公</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>编辑公司信息</Text>
              <Text className={styles.menuDesc}>修改公司名称、简称、监控城市</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.cityList}>
            {companyInfo.cities.map((city, idx) => (
              <View key={idx} className={styles.cityTag}>
                <Text className={styles.cityTagText}>{city}</Text>
              </View>
            ))}
          </View>
        </View>

        {eventNotes.length > 0 && (
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>最近处理记录</Text>
            <View className={styles.notesList}>
              {eventNotes.slice(0, 5).map(note => (
                <View key={note.id} className={styles.noteItem}>
                  <View className={styles.noteHeader}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                      <Text className={styles.noteCity}>{note.cityName}</Text>
                      <NoteTag label={note.statusText} color={getStatusColor(note.status)} />
                    </View>
                    <Text className={styles.noteTime}>{note.createdAt}</Text>
                  </View>
                  <Text className={styles.noteDesc}>{note.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>更多</Text>
          <View className={styles.menuItem} onClick={() => handleMenuItem('消息通知')}>
            <View className={styles.menuIcon} style={{ backgroundColor: '#ff7d00' }}>
              <Text className={styles.menuIconText}>通</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>消息通知设置</Text>
              <Text className={styles.menuDesc}>设置预警推送时间和频率</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItem('使用帮助')}>
            <View className={styles.menuIcon} style={{ backgroundColor: '#00b42a' }}>
              <Text className={styles.menuIconText}>帮</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>使用帮助</Text>
              <Text className={styles.menuDesc}>新手引导、常见问题</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItem('关于我们')}>
            <View className={styles.menuIcon} style={{ backgroundColor: '#86909c' }}>
              <Text className={styles.menuIconText}>关</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>关于我们</Text>
              <Text className={styles.menuDesc}>版本 v1.0.0</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
