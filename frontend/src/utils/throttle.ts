export function throttle(fn: Function, delay: number) {
  let last = 0;

  return (...args: any[]) => {
    const now = Date.now();

    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}
