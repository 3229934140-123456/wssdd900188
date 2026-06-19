import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { PropsWithChildren } from '@tarojs/taro';
import { AppProvider, useApp } from './store/AppContext';
import './app.scss';

const AppContent: React.FC<PropsWithChildren> = ({ children }) => {
  const { isOnboarded } = useApp();

  useEffect(() => {
    if (!isOnboarded) {
      Taro.navigateTo({ url: '/pages/onboarding/index' });
    }
  }, [isOnboarded]);

  return <>{children}</>;
};

function App({ children }: PropsWithChildren) {
  return (
    <AppProvider>
      <AppContent>{children}</AppContent>
    </AppProvider>
  );
}

export default App;
