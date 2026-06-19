import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import { dailyReport } from '@/data/mockData';
import { getRiskLevelText } from '@/utils';
import StatusBadge from '@/components/StatusBadge';
import styles from './index.module.scss';

const ReportPage: React.FC = () => {
  const { companyInfo } = useApp();

  const maxPlatformCount = useMemo(() => {
    return Math.max(...dailyReport.mostActivePlatforms.map(p => p.count));
  }, []);

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['转发给店长', '转发给法务', '转发给客服', '复制内容'],
      success: (res) => {
        const roles = ['店长', '法务', '客服'];
        if (res.tapIndex < 3) {
          Taro.showToast({
            title: `已转发给${roles[res.tapIndex]}`,
            icon: 'success'
          });
        } else {
          Taro.setClipboardData({
            data: generateReportText(),
            success: () => {
              Taro.showToast({ title: '已复制', icon: 'success' });
            }
          });
        }
      }
    });
  };

  const generateReportText = () => {
    return `【${companyInfo.name}舆情早报 ${dailyReport.date}】
昨日新增风险点：${dailyReport.newRiskCount}个
风险变化：
${dailyReport.riskChanges.map(c => `· ${c.city}：${getRiskLevelText(c.from)} → ${getRiskLevelText(c.to)}`).join('\n')}
负面关键词：${dailyReport.negativeKeywords.join('、')}
最活跃平台：${dailyReport.mostActivePlatforms.map(p => `${p.platform}(${p.count})`).join('、')}`;
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.dateText}>{dailyReport.date} 星期五</Text>
        <Text className={styles.title}>每日舆情早报</Text>
      </View>

      <View className={styles.highlightCard}>
        <Text className={styles.highlightLabel}>昨日新增风险点</Text>
        <Text className={styles.highlightNumber}>{dailyReport.newRiskCount}</Text>
        <Text className={styles.highlightDesc}>较前日上升 1 个，建议重点关注</Text>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionIcon} style={{ backgroundColor: '#f53f3f' }}>
            <Text>变</Text>
          </View>
          <Text className={styles.sectionTitle}>风险等级变化</Text>
        </View>
        <View className={styles.changeList}>
          {dailyReport.riskChanges.map((change, idx) => (
            <View key={idx} className={styles.changeItem}>
              <Text className={styles.cityName}>{change.city}</Text>
              <StatusBadge level={change.from} size="sm" />
              <Text className={styles.arrow}>→</Text>
              <StatusBadge level={change.to} size="sm" />
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionIcon} style={{ backgroundColor: '#ff7d00' }}>
            <Text>词</Text>
          </View>
          <Text className={styles.sectionTitle}>负面热词</Text>
        </View>
        <View className={styles.keywordsWrap}>
          {dailyReport.negativeKeywords.map((kw, idx) => (
            <View key={idx} className={styles.keywordTag}>
              <Text className={styles.keywordText}>{kw}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionIcon} style={{ backgroundColor: '#165dff' }}>
            <Text>平</Text>
          </View>
          <Text className={styles.sectionTitle}>最活跃平台</Text>
        </View>
        <View className={styles.platformList}>
          {dailyReport.mostActivePlatforms.map((p, idx) => (
            <View key={idx} className={styles.platformItem}>
              <Text className={styles.platformName}>{p.platform}</Text>
              <View className={styles.platformBarWrap}>
                <View
                  className={styles.platformBar}
                  style={{ width: `${(p.count / maxPlatformCount) * 100}%` }}
                ></View>
              </View>
              <Text className={styles.platformCount}>{p.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button className={styles.shareBtn} onClick={handleShare}>
        <Text className={styles.shareBtnText}>一键转发给团队</Text>
      </Button>

      <View className={styles.shareOptions}>
        <View className={styles.shareOption}>
          <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(22, 93, 255, 0.1)' }}>
            <Text style={{ color: '#165dff', fontSize: '28rpx', fontWeight: 600 }}>店</Text>
          </View>
          <Text className={styles.shareOptionText}>店长</Text>
        </View>
        <View className={styles.shareOption}>
          <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(245, 63, 63, 0.1)' }}>
            <Text style={{ color: '#f53f3f', fontSize: '28rpx', fontWeight: 600 }}>法</Text>
          </View>
          <Text className={styles.shareOptionText}>法务</Text>
        </View>
        <View className={styles.shareOption}>
          <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(0, 180, 42, 0.1)' }}>
            <Text style={{ color: '#00b42a', fontSize: '28rpx', fontWeight: 600 }}>客</Text>
          </View>
          <Text className={styles.shareOptionText}>客服</Text>
        </View>
        <View className={styles.shareOption}>
          <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(255, 125, 0, 0.1)' }}>
            <Text style={{ color: '#ff7d00', fontSize: '28rpx', fontWeight: 600 }}>复</Text>
          </View>
          <Text className={styles.shareOptionText}>复制</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
