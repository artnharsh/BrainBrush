// src/utils/throttle.ts
export const throttle = <T extends (...args: any[]) => void>(func: T, limit: number) => {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};