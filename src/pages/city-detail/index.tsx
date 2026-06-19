import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import StatusBadge from '@/components/StatusBadge';
import NoteTag from '@/components/NoteTag';
import { NOTE_STATUS_OPTIONS } from '@/types';
import styles from './index.module.scss';

const CityDetailPage: React.FC = () => {
  const router = useRouter();
  const cityId = router.params.id || '1';
  const { getCityRisk, getNotesByCity, addEventNote, updateCityRiskLevel } = useApp();

  const city = getCityRisk(cityId);
  const notes = getNotesByCity(cityId);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [noteDesc, setNoteDesc] = useState('');

  const trendData = useMemo(() => {
    return [
      { day: '一', value: 0.3 },
      { day: '二', value: 0.5 },
      { day: '三', value: 0.4 },
      { day: '四', value: 0.6 },
      { day: '五', value: 0.8 },
      { day: '六', value: city?.level === 'red' ? 1 : city?.level === 'yellow' ? 0.7 : 0.3 },
      { day: '今', value: city?.level === 'red' ? 0.95 : city?.level === 'yellow' ? 0.65 : 0.2 }
    ];
  }, [city]);

  if (!city) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    const opt = NOTE_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.color || 'gray';
  };

  const handleSourceClick = (url: string, title: string) => {
    Taro.showModal({
      title: '原文链接',
      content: `《${title}》\n\n链接：${url}\n\n（示例链接，实际对接后可跳转）`,
      showCancel: false,
      confirmText: '我知道了'
    });
  };

  const handleMarkResolved = () => {
    Taro.showModal({
      title: '确认标记',
      content: '确定将该城市风险标记为"已解决"吗？',
      success: (res) => {
        if (res.confirm) {
          updateCityRiskLevel(cityId, 'green');
          Taro.showToast({ title: '已标记为平稳', icon: 'success' });
        }
      }
    });
  };

  const handleAddNote = () => {
    if (!selectedStatus) {
      Taro.showToast({ title: '请选择处理状态', icon: 'none' });
      return;
    }
    if (!noteDesc.trim()) {
      Taro.showToast({ title: '请填写备注说明', icon: 'none' });
      return;
    }
    const statusOpt = NOTE_STATUS_OPTIONS.find(o => o.value === selectedStatus);
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

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.cityName}>{city.cityName}</Text>
        <StatusBadge level={city.level} size="lg" />
      </View>

      <View className={styles.metaInfo}>
        <Text className={styles.metaItem}>
          讨论量 <Text className={styles.metaValue}>{city.discussionCount}</Text>
        </Text>
        <Text className={styles.metaItem}>更新于 {city.lastUpdated}</Text>
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
        <Text className={styles.trendTitle}>近7日讨论趋势</Text>
        <View className={styles.trendBars}>
          {trendData.map((item, idx) => (
            <View key={idx} className={styles.trendBarItem}>
              <View
                className={styles.trendBar}
                style={{ height: `${item.value * 100}%` }}
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
          <Text className={styles.notesTitle}>处理备注</Text>
          <Text className={styles.notesCount}>{notes.length} 条记录</Text>
        </View>
        {notes.length > 0 ? (
          notes.map(note => (
            <View key={note.id} className={styles.noteItem}>
              <View className={styles.noteHeader}>
                <NoteTag label={note.statusText} color={getStatusColor(note.status)} />
                <Text className={styles.noteTime}>{note.createdAt}</Text>
              </View>
              <Text className={styles.noteDesc}>{note.description}</Text>
            </View>
          ))
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
        <Button className={styles.secondaryBtn} onClick={handleMarkResolved}>
          <Text className={styles.secondaryBtnText}>标为已解决</Text>
        </Button>
        <Button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
          <Text className={styles.primaryBtnText}>添加备注</Text>
        </Button>
      </View>

      {showModal && (
        <View className={styles.modalMask} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加处理备注</Text>
              <Text className={styles.modalClose} onClick={() => setShowModal(false)}>×</Text>
            </View>

            <View className={styles.statusOptions}>
              {NOTE_STATUS_OPTIONS.map(opt => (
                <View
                  key={opt.value}
                  className={`${styles.statusOption} ${selectedStatus === opt.value ? styles.statusOptionActive : ''}`}
                  onClick={() => setSelectedStatus(opt.value)}
                >
                  <Text className={`${styles.statusOptionText} ${selectedStatus === opt.value ? styles.statusOptionActiveText : ''}`}>
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className={styles.inputWrap}>
              <Input
                className={styles.input}
                type="text"
                placeholder="请填写处理说明，如：已与投诉客户取得联系..."
                value={noteDesc}
                onInput={(e) => setNoteDesc(e.detail.value)}
              />
            </View>

            <Button className={styles.submitBtn} onClick={handleAddNote}>
              <Text className={styles.submitBtnText}>保存备注</Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default CityDetailPage;
