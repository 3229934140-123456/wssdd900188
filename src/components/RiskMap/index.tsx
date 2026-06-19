import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { CityRisk, RiskLevel } from '@/types';
import { getRiskLevelColor } from '@/utils';
import styles from './index.module.scss';

interface RiskMapProps {
  cities: CityRisk[];
}

const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  '北京': { x: 68, y: 25 },
  '上海': { x: 75, y: 55 },
  '广州': { x: 62, y: 85 },
  '深圳': { x: 58, y: 88 },
  '杭州': { x: 72, y: 60 },
  '成都': { x: 32, y: 55 },
  '武汉': { x: 55, y: 58 },
  '西安': { x: 40, y: 40 }
};

const RiskMap: React.FC<RiskMapProps> = ({ cities }) => {
  const handleCityClick = (city: CityRisk) => {
    Taro.navigateTo({
      url: `/pages/city-detail/index?id=${city.id}`
    });
  };

  const getLevelPulse = (level: RiskLevel) => {
    if (level === 'red') return styles.pulseRed;
    if (level === 'yellow') return styles.pulseYellow;
    return '';
  };

  return (
    <View className={styles.mapContainer}>
      <View className={styles.mapOutline}>
        {cities.map((city) => {
          const pos = CITY_POSITIONS[city.cityName];
          if (!pos) return null;
          const color = getRiskLevelColor(city.level);
          return (
            <View
              key={city.id}
              className={styles.cityMarker}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => handleCityClick(city)}
            >
              <View className={`${styles.markerPulse} ${getLevelPulse(city.level)}`} style={{ backgroundColor: color }}></View>
              <View className={styles.markerDot} style={{ backgroundColor: color }}></View>
              <Text className={styles.cityLabel}>{city.cityName}</Text>
              {city.level !== 'green' && (
                <View className={styles.countBadge} style={{ backgroundColor: color }}>
                  <Text className={styles.countText}>{city.discussionCount}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#00b42a' }}></View>
          <Text className={styles.legendText}>平稳</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#ff7d00' }}></View>
          <Text className={styles.legendText}>集中讨论</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#f53f3f' }}></View>
          <Text className={styles.legendText}>需马上处理</Text>
        </View>
      </View>
    </View>
  );
};

export default RiskMap;
