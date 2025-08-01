import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getScheduleConfigs } from '@/lib/api/services/schedule';
import { ScheduleConfig } from '@/lib/api/types/schedule';

interface ScheduleConfigContextType {
  config: ScheduleConfig | null;
  hours: string[];
  loading: boolean;
  reload: () => Promise<void>;
}

const ScheduleConfigContext = createContext<ScheduleConfigContextType | undefined>(undefined);

function generateTimeSlots(start: string, end: string, interval: number): string[] {
  const result: string[] = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    result.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += interval;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return result;
}

export const ScheduleConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [hours, setHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await getScheduleConfigs();
      const cfg = res.data[0];
      setConfig(cfg);
      if (cfg) {
        setHours(generateTimeSlots(cfg.startTime, cfg.endTime, cfg.blockInterval));
      } else {
        setHours([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ScheduleConfigContext.Provider value={{ config, hours, loading, reload: fetchConfig }}>
      {children}
    </ScheduleConfigContext.Provider>
  );
};

export function useScheduleConfig() {
  const context = useContext(ScheduleConfigContext);
  if (context === undefined) {
    throw new Error('useScheduleConfig must be used within a ScheduleConfigProvider');
  }
  return context;
} 