/**
 * Performance optimization utilities for GlucoMate
 */

import { InteractionManager } from "react-native";

/**
 * Run a task after all interactions/animations have completed
 * Useful for expensive operations that shouldn't block UI
 */
export const runAfterInteractions = (task: () => void): void => {
  InteractionManager.runAfterInteractions(() => {
    task();
  });
};

/**
 * Debounce function to limit how often a function can be called
 * Useful for search inputs, window resize, etc.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Throttle function to ensure it's only called once per specified time period
 * Useful for scroll events, resize events, etc.
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Batch multiple state updates to reduce re-renders
 */
export const batchUpdates = (updates: (() => void)[]): void => {
  updates.forEach((update) => update());
};
