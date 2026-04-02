import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const HOS_KEY = 'routelink_hos';
const BREAK_AFTER_H = 8;
const OFF_DUTY_AFTER_H = 11;

interface HosData {
  drivingMinutes: number;
  onDutyMinutes: number;
  lastResetDate: string;
  lastTick: number;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function loadHos(): HosData {
  try {
    const raw = localStorage.getItem(HOS_KEY);
    if (raw) {
      const d = JSON.parse(raw) as HosData;
      if (d.lastResetDate === getToday()) return d;
    }
  } catch { /* ignore */ }
  return { drivingMinutes: 0, onDutyMinutes: 0, lastResetDate: getToday(), lastTick: Date.now() };
}

function saveHos(d: HosData) {
  localStorage.setItem(HOS_KEY, JSON.stringify(d));
}

function formatH(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function HosTimer({ isDriving }: { isDriving: boolean }) {
  const { t } = useTranslation();
  const [hos, setHos] = useState<HosData>(loadHos);

  useEffect(() => {
    const interval = setInterval(() => {
      setHos(prev => {
        const now = Date.now();
        const elapsed = (now - prev.lastTick) / 60000; // minutes
        const next = { ...prev, lastTick: now };
        if (isDriving) {
          next.drivingMinutes += elapsed;
          next.onDutyMinutes += elapsed;
        }
        if (prev.lastResetDate !== getToday()) {
          next.drivingMinutes = 0;
          next.onDutyMinutes = 0;
          next.lastResetDate = getToday();
        }
        saveHos(next);
        return next;
      });
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [isDriving]);

  const breakIn = Math.max(0, BREAK_AFTER_H * 60 - hos.drivingMinutes);
  const offDutyIn = Math.max(0, OFF_DUTY_AFTER_H * 60 - hos.drivingMinutes);
  const isWarning = breakIn <= 30 || offDutyIn <= 30;

  return (
    <div className={`rounded-xl border p-3.5 ${isWarning ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary border-border'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isWarning ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
        <span className={`text-sm font-semibold ${isWarning ? 'text-destructive' : 'text-foreground'}`}>
          HOS Timer
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Driving</p>
          <p className="text-foreground text-sm font-mono font-bold">{formatH(hos.drivingMinutes)}</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${breakIn <= 30 ? 'text-destructive' : 'text-muted-foreground'}`}>30m Break In</p>
          <p className={`text-sm font-mono font-bold ${breakIn <= 30 ? 'text-destructive' : 'text-foreground'}`}>{formatH(breakIn)}</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${offDutyIn <= 30 ? 'text-destructive' : 'text-muted-foreground'}`}>Off-duty In</p>
          <p className={`text-sm font-mono font-bold ${offDutyIn <= 30 ? 'text-destructive' : 'text-foreground'}`}>{formatH(offDutyIn)}</p>
        </div>
      </div>

      <p className="text-muted-foreground text-[10px] mt-2 leading-relaxed italic">
        ⚠️ Estimate only. Always follow your official ELD.
      </p>
    </div>
  );
}
