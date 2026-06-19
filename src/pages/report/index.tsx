import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import { getRiskLevelText } from '@/utils';
import StatusBadge from '@/components/StatusBadge';
import styles from './index.module.scss';

const ReportPage: React.FC = () => {
  const { companyInfo, cityRisks, generateReportContent, eventNotes } = useApp();
  const [showPreview, setShowPreview] = useState(false);

  const stats = useMemo(() => {
    const red = cityRisks.filter(c => c.level === 'red').length;
    const yellow = cityRisks.filter(c => c.level === 'yellow').length;
    const green = cityRisks.filter(c => c.level === 'green').length;
    return { red, yellow, green, total: cityRisks.length };
  }, [cityRisks]);

  const riskChanges = useMemo(() => {
    const changes: Array<{ city: string; level: string; type: 'up' | 'down' }> = [];
    cityRisks.forEach(c => {
      if (c.level === 'red') {
        changes.push({ city: c.cityName, level: c.level, type: 'up' });
      } else if (c.level === 'yellow') {
        changes.push({ city: c.cityName, level: c.level, type: 'up' });
      }
    });
    return changes.slice(0, 6);
  }, [cityRisks]);

  const negativeKeywords = useMemo(() => {
    const baseKeywords = ['过期食品', '价格欺诈', '配送延迟', '服务态度', '促销秩序'];
    if (stats.red >= 2) return baseKeywords.slice(0, 5);
    if (stats.red === 1) return baseKeywords.slice(0, 4);
    return baseKeywords.slice(0, 3);
  }, [stats.red]);

  const mostActivePlatforms = useMemo(() => {
    const total = stats.red * 2 + stats.yellow;
    return [
      { platform: '抖音', count: Math.max(20, total * 45) },
      { platform: '小红书', count: Math.max(15, total * 30) },
      { platform: '微博', count: Math.max(10, total * 20) },
      { platform: '大众点评', count: Math.max(8, total * 14) },
      { platform: '微信视频号', count: Math.max(5, total * 9) }
    ];
  }, [stats]);

  const maxPlatformCount = useMemo(() => {
    return Math.max(...mostActivePlatforms.map(p => p.count));
  }, [mostActivePlatforms]);

  const previewContent = useMemo(() => generateReportContent(), [generateReportContent]);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['转发给店长', '转发给法务', '转发给客服', '复制早报全文'],
      success: (res) => {
        const roles = ['店长', '法务', '客服'];
        if (res.tapIndex < 3) {
          Taro.showToast({
            title: `已转发给${roles[res.tapIndex]}`,
            icon: 'success'
          });
        } else {
          Taro.setClipboardData({
            data: previewContent,
            success: () => {
              Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
            }
          });
        }
      }
    });
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`;
  }, []);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.dateText}>{todayStr}</Text>
        <Text className={styles.title}>每日舆情早报</Text>
        <Text className={styles.subtitle}>{companyInfo.name} · 全国 {stats.total} 个城市</Text>
      </View>

      <View className={styles.highlightCard}>
        <Text className={styles.highlightLabel}>昨日新增风险点</Text>
        <Text className={styles.highlightNumber}>{stats.red + stats.yellow}</Text>
        <Text className={styles.highlightDesc}>
          {stats.red > 0 ? `其中 ${stats.red} 个城市需紧急处理` : '持续关注中，暂无紧急风险'}
        </Text>
      </View>

      <View className={styles.quickStats}>
        <View className={styles.quickStatItem} style={{ backgroundColor: '#ffece8' }}>
          <Text className={styles.quickStatNumber} style={{ color: '#f53f3f' }}>{stats.red}</Text>
          <Text className={styles.quickStatLabel} style={{ color: '#f53f3f' }}>需马上处理</Text>
        </View>
        <View className={styles.quickStatItem} style={{ backgroundColor: '#fff3e8' }}>
          <Text className={styles.quickStatNumber} style={{ color: '#ff7d00' }}>{stats.yellow}</Text>
          <Text className={styles.quickStatLabel} style={{ color: '#ff7d00' }}>需关注</Text>
        </View>
        <View className={styles.quickStatItem} style={{ backgroundColor: '#e8ffea' }}>
          <Text className={styles.quickStatNumber} style={{ color: '#00b42a' }}>{stats.green}</Text>
          <Text className={styles.quickStatLabel} style={{ color: '#00b42a' }}>运行平稳</Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionIcon} style={{ backgroundColor: '#f53f3f' }}>
            <Text>城</Text>
          </View>
          <Text className={styles.sectionTitle}>风险城市一览</Text>
        </View>
        <View className={styles.cityGrid}>
          {cityRisks.filter(c => c.level !== 'green').length > 0 ? (
            cityRisks.filter(c => c.level !== 'green').map(city => (
              <View
                key={city.id}
                className={styles.cityGridItem}
                onClick={() => Taro.navigateTo({ url: `/pages/city-detail/index?id=${city.id}` })}
              >
                <View className={styles.cityGridHeader}>
                  <Text className={styles.cityGridName}>{city.cityName}</Text>
                  <StatusBadge level={city.level} size="sm" />
                </View>
                <Text className={styles.cityGridDesc}>
                  {city.summary.whatHappened.slice(0, 20)}...
                </Text>
              </View>
            ))
          ) : (
            <View className={styles.allGood}>
              <Text className={styles.allGoodText}>🎉 所有城市运行平稳</Text>
            </View>
          )}
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
          {negativeKeywords.map((kw, idx) => (
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
          {mostActivePlatforms.map((p, idx) => (
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

      <View className={styles.actionSection}>
        <Button className={styles.previewBtn} onClick={handlePreview}>
          <Text className={styles.previewBtnText}>📄 预览早报全文</Text>
        </Button>
        <Button className={styles.shareBtn} onClick={handleShare}>
          <Text className={styles.shareBtnText}>一键转发给团队</Text>
        </Button>
        <View className={styles.shareOptions}>
          <View className={styles.shareOption} onClick={() => {
            Taro.setClipboardData({ data: previewContent });
            Taro.showToast({ title: '已复制', icon: 'success' });
          }}>
            <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(22, 93, 255, 0.1)' }}>
              <Text style={{ color: '#165dff', fontSize: '28rpx', fontWeight: 600 }}>店</Text>
            </View>
            <Text className={styles.shareOptionText}>店长</Text>
          </View>
          <View className={styles.shareOption} onClick={() => {
            Taro.setClipboardData({ data: previewContent });
            Taro.showToast({ title: '已复制', icon: 'success' });
          }}>
            <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(245, 63, 63, 0.1)' }}>
              <Text style={{ color: '#f53f3f', fontSize: '28rpx', fontWeight: 600 }}>法</Text>
            </View>
            <Text className={styles.shareOptionText}>法务</Text>
          </View>
          <View className={styles.shareOption} onClick={() => {
            Taro.setClipboardData({ data: previewContent });
            Taro.showToast({ title: '已复制', icon: 'success' });
          }}>
            <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(0, 180, 42, 0.1)' }}>
              <Text style={{ color: '#00b42a', fontSize: '28rpx', fontWeight: 600 }}>客</Text>
            </View>
            <Text className={styles.shareOptionText}>客服</Text>
          </View>
          <View className={styles.shareOption} onClick={() => {
            Taro.setClipboardData({ data: previewContent });
            Taro.showToast({ title: '已复制', icon: 'success' });
          }}>
            <View className={styles.shareOptionIcon} style={{ backgroundColor: 'rgba(255, 125, 0, 0.1)' }}>
              <Text style={{ color: '#ff7d00', fontSize: '28rpx', fontWeight: 600 }}>复</Text>
            </View>
            <Text className={styles.shareOptionText}>复制</Text>
          </View>
        </View>
      </View>

      {showPreview && (
        <View className={styles.previewMask} onClick={() => setShowPreview(false)}>
          <View className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.previewHeader}>
              <Text className={styles.previewTitle}>早报预览</Text>
              <Text className={styles.previewClose} onClick={() => setShowPreview(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.previewContent}>
              <Text className={styles.previewText}>{previewContent}</Text>
            </ScrollView>
            <View className={styles.previewActions}>
              <Button className={styles.previewActionSecondary} onClick={() => setShowPreview(false)}>
                <Text className={styles.previewActionSecondaryText}>关闭</Text>
              </Button>
              <Button className={styles.previewActionPrimary} onClick={handleShare}>
                <Text className={styles.previewActionPrimaryText}>转发</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReportPage;
