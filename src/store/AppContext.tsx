import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CompanyInfo, CityRisk, EventNote, RiskLevel } from '@/types';
import { defaultCompanyInfo, cityRisks as initialCityRisks, eventNotes as initialNotes } from '@/data/mockData';

interface AppContextType {
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
  cityRisks: CityRisk[];
  getCityRisk: (id: string) => CityRisk | undefined;
  updateCityRiskLevel: (cityId: string, level: RiskLevel) => void;
  eventNotes: EventNote[];
  addEventNote: (note: Omit<EventNote, 'id' | 'createdAt'>) => void;
  getNotesByCity: (cityId: string) => EventNote[];
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [cityRisks, setCityRisks] = useState<CityRisk[]>(initialCityRisks);
  const [eventNotes, setEventNotes] = useState<EventNote[]>(initialNotes);

  const getCityRisk = useCallback((id: string) => {
    return cityRisks.find(c => c.id === id);
  }, [cityRisks]);

  const updateCityRiskLevel = useCallback((cityId: string, level: RiskLevel) => {
    setCityRisks(prev => prev.map(c => c.id === cityId ? { ...c, level } : c));
  }, []);

  const addEventNote = useCallback((note: Omit<EventNote, 'id' | 'createdAt'>) => {
    const newNote: EventNote = {
      ...note,
      id: 'n' + Date.now(),
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    };
    setEventNotes(prev => [newNote, ...prev]);
  }, []);

  const getNotesByCity = useCallback((cityId: string) => {
    return eventNotes.filter(n => n.cityId === cityId);
  }, [eventNotes]);

  return (
    <AppContext.Provider value={{
      isOnboarded,
      setIsOnboarded,
      companyInfo,
      setCompanyInfo,
      cityRisks,
      getCityRisk,
      updateCityRiskLevel,
      eventNotes,
      addEventNote,
      getNotesByCity
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
