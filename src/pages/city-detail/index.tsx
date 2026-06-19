import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/StatusBadge';
import NoteTag from '@/components/NoteTag';
import { NOTE_STATUS_OPTIONS, EventNote } from '@/types';
import { getRiskLevelColor } from '@/utils';
import styles from './index.module.scss';

const CityDetailPage: React.FC = () => {
  const router = useRouter();
  const cityId = router.params.id || '1';
  const { getCityRisk, getCityTimeline, addEventNote, updateCityRiskLevel } = useApp();

  const city = getCityRisk(cityId);
  const timeline = useMemo(() => getCityTimeline(cityId), [getCityTimeline, cityId]);

  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: city ? `${city.cityName} · 舆情详情` : '城市详情'
    });
  }, [city]);

  const getStatusColor = (status: string) => {
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === status);
    if (!opt) return '#86909c';
    const colorMap: Record<string, string> = {
      blue: '#165dff',
      green: '#00b42a',
      yellow: '#ff7d00',
      red: '#f53f3f',
      gray: '#86909c'
    };
    return colorMap[opt.color] || '#86909c';
  };

  const getTimelineColor = (item: any) => {
    if (item.type === 'note') {
      return getStatusColor(item.status || '');
    }
    if (item.type === 'level_change') {
      if (item.toLevel === 'red') return '#f53f3f';
      if (item.toLevel === 'yellow') return '#ff7d00';
      return '#00b42a';
    }
    return '#165dff';
  };

  const trendData = useMemo(() => {
    const base = city?.level === 'red' ? 0.9 : city?.level === 'yellow' ? 0.6 : 0.25;
    return [
      { day: '一', value: Math.min(1, base * 0.4) },
      { day: '二', value: Math.min(1, base * 0.5) },
      { day: '三', value: Math.min(1, base * 0.7) },
      { day: '四', value: Math.min(1, base * 0.6) },
      { day: '五', value: Math.min(1, base * 0.8) },
      { day: '六', value: Math.min(1, base * 0.9) },
      { day: '今', value: base }
    ];
  }, [city]);

  if (!city) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const handleSourceClick = (url: string, title: string) => {
    Taro.showModal({
      title: '原文链接',
      content: `《${title}》\n\n链接：${url}\n\n（示例链接，实际对接后可跳转）`,
      showCancel: false,
      confirmText: '我知道了'
    });
  };

  const handleMarkResolved = () => {
    if (saving) return;
    Taro.showModal({
      title: '确认标记为已解决？',
      content: '标记后该城市风险等级将降为"平稳"，并添加一条处理记录。',
      confirmText: '确认标记',
      confirmColor: '#00b42a',
      success: (res) => {
        if (res.confirm) {
          setSaving(true);
          try {
            addEventNote({
              cityId,
              cityName: city.cityName,
              status: 'resolved',
              statusText: '已解决',
              description: '已确认问题解决，舆情恢复平稳。'
            });
            Taro.showToast({ title: '已标记为平稳', icon: 'success' });
          } finally {
            setTimeout(() => setSaving(false), 100);
          }
        }
      }
    });
  };

  const handleAddNote = () => {
    if (saving) return;
    if (!selectedStatus) {
      Taro.showToast({ title: '请选择处理状态', icon: 'none' });
      return;
    }
    if (!noteDesc.trim()) {
      Taro.showToast({ title: '请填写备注说明', icon: 'none' });
      return;
    }
    const statusOpt = NOTE_STATUS_OPTIONS.find(o => o.value === selectedStatus);
    setSaving(true);
    try {
      addEventNote({
        cityId,
        cityName: city.cityName,
        status: selectedStatus as any,
        statusText: statusOpt?.label || '',
        description: noteDesc.trim()
      });
      Taro.showToast({ title: '备注已添加', icon: 'success' });
      setShowModal(false);
      setSelectedStatus('');
      setNoteDesc('');
    } finally {
      setTimeout(() => setSaving(false), 100);
    }
  };

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['转发给店长', '转发给法务', '转发给客服', '复制详情'],
      success: (res) => {
        const roles = ['店长', '法务', '客服'];
        if (res.tapIndex < 3) {
          Taro.showToast({
            title: `已转发给${roles[res.tapIndex]}`,
            icon: 'success'
          });
        } else {
          Taro.setClipboardData({
            data: `【${city.cityName}舆情预警】\n事件：${city.summary.whatHappened}\n讨论人群：${city.summary.whoDiscussing}\n业务影响：${city.summary.businessImpact}`,
            success: () => Taro.showToast({ title: '已复制', icon: 'success' })
          });
        }
      }
    });
  };

  const levelText = city.level === 'red' ? '高风险' : city.level === 'yellow' ? '中风险' : '低风险';
  const levelColor = city.level === 'red' ? 'red' : city.level === 'yellow' ? 'yellow' : 'green';

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View>
          <Text className={styles.cityName}>{city.cityName}</Text>
          <Text className={styles.cityMeta}>
            讨论量 {city.discussionCount} · 更新于 {city.lastUpdated}
          </Text>
        </View>
        <StatusBadge level={city.level} size="lg" />
      </View>

      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>情况说明</Text>

        <View className={styles.summaryItem}>
          <View className={styles.summaryIcon} style={{ backgroundColor: '#f53f3f' }}>
            <Text>事</Text>
          </View>
          <View className={styles.summaryContent}>
            <Text className={styles.summaryLabel}>发生了什么</Text>
            <Text className={styles.summaryText}>{city.summary.whatHappened}</Text>
          </View>
        </View>

        <View className={styles.summaryItem}>
          <View className={styles.summaryIcon} style={{ backgroundColor: '#ff7d00' }}>
            <Text>人</Text>
          </View>
          <View className={styles.summaryContent}>
            <Text className={styles.summaryLabel}>谁在讨论</Text>
            <Text className={styles.summaryText}>{city.summary.whoDiscussing}</Text>
          </View>
        </View>

        <View className={styles.summaryItem}>
          <View className={styles.summaryIcon} style={{ backgroundColor: '#165dff' }}>
            <Text>影</Text>
          </View>
          <View className={styles.summaryContent}>
            <Text className={styles.summaryLabel}>可能影响什么业务</Text>
            <Text className={styles.summaryText}>{city.summary.businessImpact}</Text>
          </View>
        </View>
      </View>

      <View className={styles.trendCard}>
        <View className={styles.trendHeader}>
          <Text className={styles.trendTitle}>近7日讨论趋势</Text>
          <View className={styles.trendLevel}>
            <Text className={styles.trendLevelText}>当前：</Text>
            <NoteTag label={levelText} color={levelColor} />
          </View>
        </View>
        <View className={styles.trendBars}>
          {trendData.map((item, idx) => (
            <View key={idx} className={styles.trendBarItem}>
              <View
                className={styles.trendBar}
                style={{
                  height: `${item.value * 100}%`,
                  backgroundColor: item.value > 0.7 ? '#f53f3f' : item.value > 0.4 ? '#ff7d00' : '#00b42a'
                }}
              ></View>
              <Text className={styles.trendDay}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sourcesCard}>
        <Text className={styles.sourcesTitle}>原始链接（点击核验）</Text>
        {city.sources.map(source => (
          <View
            key={source.id}
            className={styles.sourceItem}
            onClick={() => handleSourceClick(source.url, source.title)}
          >
            <Text className={styles.sourceTitle}>{source.title}</Text>
            <View className={styles.sourceMeta}>
              <Text className={styles.sourcePlatform}>{source.platform}</Text>
              <Text className={styles.sourceAction}>点击查看 ›</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.notesCard}>
        <View className={styles.notesHeader}>
          <Text className={styles.notesTitle}>处理进度流</Text>
          <Text className={styles.notesCount}>{timeline.length} 条记录</Text>
        </View>

        {timeline.length > 0 ? (
          <View className={styles.timeline}>
            {timeline.map((item: any, idx: number) => {
              const color = getTimelineColor(item);
              return (
                <View key={item.id} className={styles.timelineItem}>
                  <View className={styles.timelineDot} style={{ backgroundColor: color }}></View>
                  {idx < timeline.length - 1 && <View className={styles.timelineLine}></View>}
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineHeader}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                        <Text className={styles.timelineTitle} style={{ color }}>{item.title}</Text>
                        {item.type === 'level_change' && item.toLevel && (
                          <StatusBadge level={item.toLevel} size="sm" />
                        )}
                      </View>
                      <Text className={styles.timelineTime}>{item.time}</Text>
                    </View>
                    <Text className={styles.timelineDesc}>{item.description}</Text>
                    {item.fromLevel && item.type === 'level_change' && (
                      <View className={styles.timelineChange}>
                        <NoteTag
                          label={item.fromLevel === 'green' ? '平稳' : item.fromLevel === 'yellow' ? '关注' : '预警'}
                          color={item.fromLevel === 'green' ? 'green' : item.fromLevel === 'yellow' ? 'yellow' : 'red'}
                        />
                        <Text className={styles.timelineArrow}>→</Text>
                        <NoteTag
                          label={item.toLevel === 'green' ? '平稳' : item.toLevel === 'yellow' ? '关注' : '预警'}
                          color={item.toLevel === 'green' ? 'green' : item.toLevel === 'yellow' ? 'yellow' : 'red'}
                        />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.emptyNotes}>
            <Text className={styles.emptyText}>暂无处理记录，点击下方按钮添加备注</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={handleShare}>
          <Text className={styles.secondaryBtnText}>转发</Text>
        </Button>
        <Button
          className={styles.secondaryBtn}
          onClick={handleMarkResolved}
          disabled={saving || city.level === 'green'}
        >
          <Text className={styles.secondaryBtnText}>标为已解决</Text>
        </Button>
        <Button
          className={styles.primaryBtn}
          onClick={() => setShowModal(true)}
          disabled={saving}
        >
          <Text className={styles.primaryBtnText}>{saving ? '保存中...' : '添加备注'}</Text>
        </Button>
      </View>

      {showModal && (
        <View className={styles.modalMask} onClick={() => !saving && setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加处理备注</Text>
              <Text className={styles.modalClose} onClick={() => !saving && setShowModal(false)}>×</Text>
            </View>

            <Text className={styles.modalHint}>选择处理状态</Text>
            <View className={styles.statusOptions}>
              {NOTE_STATUS_OPTIONS.map(opt => (
                <View
                  key={opt.value}
                  className={`${styles.statusOption} ${selectedStatus === opt.value ? styles.statusOptionActive : ''}`}
                  onClick={() => !saving && setSelectedStatus(opt.value)}
                >
                  <Text className={`${styles.statusOptionText} ${selectedStatus === opt.value ? styles.statusOptionActiveText : ''}`}>
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>

            <Text className={styles.modalHint}>填写处理说明</Text>
            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="text"
                placeholder="例如：已与投诉客户取得联系，对方表示接受道歉..."
                value={noteDesc}
                disabled={saving}
                onInput={(e) => setNoteDesc(e.detail.value)}
              />
            </View>

            <Text className={styles.tipText}>
              💡 选择「已解决/纯属谣言/已发声明」后，风险会自动降级为平稳
            </Text>

            <Button
              className={styles.submitBtn}
              onClick={handleAddNote}
              disabled={saving}
            >
              <Text className={styles.submitBtnText}>{saving ? '保存中...' : '保存备注'}</Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default CityDetailPage;
