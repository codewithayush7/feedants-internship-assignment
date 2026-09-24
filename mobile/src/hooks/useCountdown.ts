import { useState, useEffect } from "react";

export interface ICountdownResult {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  formattedString: string;
  isExpired: boolean;
  totalSecondsRemaining: number;
}

export function useCountdown(targetTimestamp: number): ICountdownResult {
  const calculate = (): ICountdownResult => {
    const now = Date.now();
    const diff = Math.max(0, targetTimestamp - now);
    const totalSeconds = Math.floor(diff / 1000);

    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const days = pad(d);
    const hours = pad(h);
    const minutes = pad(m);
    const seconds = pad(s);

    return {
      days,
      hours,
      minutes,
      seconds,
      formattedString: `${days}d : ${hours}h : ${minutes}m : ${seconds}s`,
      isExpired: diff <= 0,
      totalSecondsRemaining: totalSeconds
    };
  };

  const [countdown, setCountdown] = useState<ICountdownResult>(calculate);

  useEffect(() => {
    setCountdown(calculate());
    const interval = setInterval(() => {
      setCountdown(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return countdown;
}
