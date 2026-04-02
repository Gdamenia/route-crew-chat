import { useRef, useCallback } from 'react';

export function useRateLimiter(maxMessages = 10, windowMs = 10000, cooldownMs = 5000) {
  const timestampsRef = useRef<number[]>([]);
  const cooldownUntilRef = useRef(0);

  const checkLimit = useCallback((): { allowed: boolean; cooldownEnd: number } => {
    const now = Date.now();
    if (now < cooldownUntilRef.current) {
      return { allowed: false, cooldownEnd: cooldownUntilRef.current };
    }

    // Remove old timestamps
    timestampsRef.current = timestampsRef.current.filter(t => now - t < windowMs);

    if (timestampsRef.current.length >= maxMessages) {
      cooldownUntilRef.current = now + cooldownMs;
      return { allowed: false, cooldownEnd: cooldownUntilRef.current };
    }

    timestampsRef.current.push(now);
    return { allowed: true, cooldownEnd: 0 };
  }, [maxMessages, windowMs, cooldownMs]);

  return { checkLimit };
}
