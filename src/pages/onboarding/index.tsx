import React, { useState, useEffect } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

const OPTIONAL_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京',
  '成都', '武汉', '西安', '重庆', '苏州', '天津',
  '长沙', '郑州', '青岛', '宁波', '厦门', '福州',
  '济南', '合肥'
];

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const isEdit = router.params.edit === '1';
  const { companyInfo, setCompanyInfo, setIsOnboarded, syncCitiesFromCompany } = useApp();

  const [companyName, setCompanyName] = useState(companyInfo.name);
  const [shortNames, setShortNames] = useState(companyInfo.shortNames.join('、'));
  const [selectedCities, setSelectedCities] = useState<string[]>(companyInfo.cities);

  useEffect(() => {
    if (isEdit) {
      Taro.setNavigationBarTitle({ title: '编辑公司信息' });
    }
  }, [isEdit]);

  const canSubmit = companyName.trim() && selectedCities.length > 0;

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      Taro.showToast({ title: '请填写公司名称', icon: 'none' });
      return;
    }
    if (selectedCities.length === 0) {
      Taro.showToast({ title: '请至少选择一个城市', icon: 'none' });
      return;
    }

    const names = shortNames
      .split(/[、,，\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    setCompanyInfo({
      name: companyName.trim(),
      shortNames: names.length > 0 ? names : [companyName.trim()],
      cities: selectedCities
    });

    setTimeout(() => {
      syncCitiesFromCompany();
    }, 50);

    setIsOnboarded(true);

    if (isEdit) {
      Taro.showToast({ title: '已保存', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 800);
    } else {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  };

  const handleBack = () => {
    if (isEdit) {
      Taro.navigateBack();
    }
  };

  return (
    <View className={styles.page}>
      {isEdit && (
        <View className={styles.navBar}>
          <Text className={styles.navBack} onClick={handleBack}>‹</Text>
        </View>
      )}

      <View className={styles.hero}>
        <Text className={styles.heroTitle}>
          {isEdit ? '更新公司信息' : '欢迎使用舆情预警'}
        </Text>
        <Text className={styles.heroDesc}>
          {isEdit
            ? '修改以下信息，我们将继续为您监控相关城市的舆情风险。'
            : '填写基本信息，我们将为您监控相关城市的舆情风险，第一时间推送预警。'
          }
        </Text>
      </View>

      <View className={styles.form}>
        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formLabelRequired}>*</Text>公司名称
            </Text>
            <View className={styles.inputBox}>
              <Input
                className={styles.input}
                type="text"
                placeholder="请输入您的公司全称"
                value={companyName}
                onInput={(e) => setCompanyName(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>常见简称</Text>
            <Text className={styles.formHint}>多个简称用顿号、逗号或空格分隔，如"悦鲜、悦鲜生鲜"</Text>
            <View className={styles.inputBox}>
              <Input
                className={styles.input}
                type="text"
                placeholder="选填，方便我们更精准地识别相关讨论"
                value={shortNames}
                onInput={(e) => setShortNames(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formLabelRequired}>*</Text>主要门店/工厂所在城市
            </Text>
            <Text className={styles.formHint}>点击选择有门店或工厂的城市，我们将重点监控这些地区</Text>

            {selectedCities.length > 0 && (
              <View className={styles.selectedCities}>
                {selectedCities.map(city => (
                  <View key={city} className={styles.selectedCityTag}>
                    <Text className={styles.selectedCityText}>{city}</Text>
                    <Text
                      className={styles.selectedCityClose}
                      onClick={() => toggleCity(city)}
                    >×</Text>
                  </View>
                ))}
              </View>
            )}

            <View className={styles.cityChips}>
              {OPTIONAL_CITIES.map(city => (
                <View
                  key={city}
                  className={`${styles.cityChip} ${selectedCities.includes(city) ? styles.cityChipSelected : ''}`}
                  onClick={() => toggleCity(city)}
                >
                  <Text className={`${styles.cityChipText} ${selectedCities.includes(city) ? styles.cityChipSelectedText : ''}`}>
                    {city}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={`${styles.submitBtn} ${!canSubmit ? styles.submitBtnDisabled : ''}`}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          <Text className={styles.submitBtnText}>
            {isEdit ? '保存修改' : '开始使用'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default OnboardingPage;
