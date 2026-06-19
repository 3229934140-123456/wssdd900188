import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import NoteTag from '@/components/NoteTag';
import StatusBadge from '@/components/StatusBadge';
import { NOTE_STATUS_OPTIONS } from '@/types';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { companyInfo, cityRisks, eventNotes } = useApp();

  const stats = useMemo(() => {
    const red = cityRisks.filter(c => c.level === 'red').length;
    const yellow = cityRisks.filter(c => c.level === 'yellow').length;
    const green = cityRisks.filter(c => c.level === 'green').length;
    return {
      total: cityRisks.length,
      red,
      yellow,
      green,
      handled: eventNotes.length,
      pending: red + yellow
    };
  }, [cityRisks, eventNotes]);

  const getStatusColor = (status: string) => {
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.color || 'gray';
  };

  const handleEditCompany = () => {
    Taro.navigateTo({ url: '/pages/onboarding/index?edit=1' });
  };

  const handleCityClick = (cityId: string) => {
    const city = cityRisks.find(c => c.id === cityId);
    if (city) {
      Taro.navigateTo({ url: `/pages/city-detail/index?id=${city.id}` });
    } else {
      Taro.showToast({ title: '该城市已停止监控', icon: 'none' });
    }
  };

  const handleMenuItem = (action: string) => {
    Taro.showToast({ title: `${action}功能开发中`, icon: 'none' });
  };

  const firstChar = companyInfo.name.charAt(0);

  const sortedCities = useMemo(() => {
    const order = { red: 0, yellow: 1, green: 2 };
    return [...cityRisks].sort((a, b) => order[a.level] - order[b.level]);
  }, [cityRisks]);

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
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>监控城市</Text>
          </View>
          <View className={styles.statDivider}></View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#f53f3f' }}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待处理风险</Text>
          </View>
          <View className={styles.statDivider}></View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber} style={{ color: '#00b42a' }}>{stats.handled}</Text>
            <Text className={styles.statLabel}>已处理事件</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>监控城市一览</Text>
            <Text className={styles.sectionMore} onClick={handleEditCompany}>管理 ›</Text>
          </View>
          <View className={styles.cityGrid}>
            {sortedCities.map(city => (
              <View
                key={city.id}
                className={styles.cityGridItem}
                onClick={() => handleCityClick(city.id)}
              >
                <Text className={styles.cityGridName}>{city.cityName}</Text>
                <StatusBadge level={city.level} size="sm" />
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>公司信息</Text>
          <View className={styles.menuItem} onClick={handleEditCompany}>
            <View className={styles.menuIcon} style={{ backgroundColor: '#165dff' }}>
              <Text className={styles.menuIconText}>编</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>编辑公司信息</Text>
              <Text className={styles.menuDesc}>修改公司名称、简称、监控城市</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        {eventNotes.length > 0 && (
          <View className={styles.sectionCard}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>最近处理记录</Text>
              <Text
                className={styles.sectionMore}
                onClick={() => Taro.navigateTo({ url: '/pages/history/index' })}
              >查看全部 ›</Text>
            </View>
            <View className={styles.notesList}>
              {eventNotes.slice(0, 5).map(note => (
                <View
                  key={note.id}
                  className={styles.noteItem}
                  onClick={() => handleCityClick(note.cityId)}
                >
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
          <Text className={styles.sectionTitle}>数据与记录</Text>
          <View
            className={styles.menuItem}
            onClick={() => Taro.navigateTo({ url: '/pages/history/index' })}
          >
            <View className={styles.menuIcon} style={{ backgroundColor: '#722ed1' }}>
              <Text className={styles.menuIconText}>归</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuLabel}>历史归档</Text>
              <Text className={styles.menuDesc}>
                查看所有处理备注和风险变更记录，支持按城市和状态筛选
              </Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

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
              <Text className={styles.menuDesc}>版本 v1.1.0</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.footerTip}>
          <Text className={styles.footerTipText}>数据本地存储 · 保护您的隐私</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
