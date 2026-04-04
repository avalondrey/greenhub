import { useState, useEffect } from 'react';

/**
 * Tick toutes les 60s pour rafraîchir les animations de croissance.
 * @returns {number} tick count
 */
export function useRealtimeGrowth() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  return tick;
}
