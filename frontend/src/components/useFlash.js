import { useState, useCallback } from "react";

/**
 * useFlash - Hook for managing flash/toast notifications
 * 
 * Returns:
 *  - flashes: array of active flash messages
 *  - showFlash(type, title, message, duration?) - show a flash message
 *  - dismissFlash(id) - dismiss a specific flash message
 * 
 * Types: 'success' | 'error' | 'info' | 'warning'
 */
export default function useFlash() {
  const [flashes, setFlashes] = useState([]);

  const showFlash = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setFlashes((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismissFlash = useCallback((id) => {
    setFlashes((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { flashes, showFlash, dismissFlash };
}
