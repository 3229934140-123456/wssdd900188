import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { CityRisk, RiskLevel } from '@/types';
import { getRiskLevelColor } from '@/utils';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

interface RiskMapProps {
  cities: CityRisk[];
}

const FALLBACK_POSITIONS = [
  { x: 25, y: 30 }, { x: 45, y: 25 }, { x: 65, y: 30 }, { x: 80, y: 35 },
  { x: 30, y: 50 }, { x: 50, y: 45 }, { x: 70, y: 50 }, { x: 85, y: 55 },
  { x: 35, y: 70 }, { x: 55, y: 65 }, { x: 75, y: 70 }, { x: 88, y: 75 },
  { x: 28, y: 85 }, { x: 48, y: 80 }, { x: 68, y: 85 }, { x: 82, y: 88 },
  { x: 22, y: 60 }, { x: 42, y: 55 }, { x: 62, y: 60 }, { x: 78, y: 65 }
];

const RiskMap: React.FC<RiskMapProps> = ({ cities }) => {
  const { cityCoords } = useApp();

  const positionedCities = useMemo(() => {
    let fallbackIndex = 0;
    return cities.map(city => {
      const pos = cityCoords[city.cityName];
      if (pos) {
        return { ...city, x: pos.x, y: pos.y };
      }
      const fallback = FALLBACK_POSITIONS[fallbackIndex % FALLBACK_POSITIONS.length];
      fallbackIndex++;
      return { ...city, x: fallback.x, y: fallback.y };
    });
  }, [cities, cityCoords]);

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

  const hasPositionedCities = positionedCities.length > 0;

  return (
    <View className={styles.mapContainer}>
      <View className={styles.mapOutline}>
        {hasPositionedCities ? positionedCities.map((city) => {
          const color = getRiskLevelColor(city.level);
          return (
            <View
              key={city.id}
              className={styles.cityMarker}
              style={{ left: `${city.x}%`, top: `${city.y}%` }}
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
        }) : (
          <View className={styles.emptyMap}>
            <Text className={styles.emptyText}>暂无监控城市</Text>
          </View>
        )}
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
