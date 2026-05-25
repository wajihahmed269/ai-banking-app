import { useCallback, useEffect, useState } from 'react';

const PERFORMANCE_MODE_KEY = 'zephyrPerformanceMode';
const LITE_SUGGESTION_KEY = 'zephyrLiteSuggestionDismissed';
const PERFORMANCE_MODES = ['auto', 'full', 'lite'];

function getStoredPerformanceMode() {
  if (typeof window === 'undefined') return 'auto';
  const storedMode = window.localStorage.getItem(PERFORMANCE_MODE_KEY);
  return PERFORMANCE_MODES.includes(storedMode) ? storedMode : 'auto';
}

function readDevicePerformance() {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, lowMemory: false, lowCpu: false, smallViewport: false };
  }
  return {
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    lowMemory: Boolean(navigator.deviceMemory && navigator.deviceMemory <= 4),
    lowCpu: Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4),
    smallViewport: window.innerWidth < 768,
  };
}

function getDevicePerformanceReason(device, lagDetected) {
  if (device.reducedMotion) return 'Reduced motion is enabled.';
  if (lagDetected) return 'Repeated frame delays were detected.';
  if (device.lowMemory) return 'This device reports limited memory.';
  if (device.lowCpu) return 'This device reports limited CPU cores.';
  if (device.smallViewport) return 'Small viewports use lighter visuals by default.';
  return '';
}

export function usePerformanceMode() {
  const [performanceMode, setPerformanceModeState] = useState(getStoredPerformanceMode);
  const [device, setDevice] = useState(readDevicePerformance);
  const [lagDetected, setLagDetected] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(() => (
    typeof window !== 'undefined' && window.localStorage.getItem(LITE_SUGGESTION_KEY) === 'true'
  ));

  const setPerformanceMode = useCallback((nextMode) => {
    const safeMode = PERFORMANCE_MODES.includes(nextMode) ? nextMode : 'auto';
    setPerformanceModeState(safeMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PERFORMANCE_MODE_KEY, safeMode);
      if (safeMode === 'auto') {
        window.localStorage.removeItem(LITE_SUGGESTION_KEY);
        setSuggestionDismissed(false);
      } else {
        window.localStorage.setItem(LITE_SUGGESTION_KEY, 'true');
        setSuggestionDismissed(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updateDevice = () => setDevice(readDevicePerformance());
    window.addEventListener('resize', updateDevice, { passive: true });
    motionQuery?.addEventListener?.('change', updateDevice);
    return () => {
      window.removeEventListener('resize', updateDevice);
      motionQuery?.removeEventListener?.('change', updateDevice);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || device.reducedMotion || performanceMode !== 'auto') return undefined;
    let frame = 0;
    let slowFrames = 0;
    let last = performance.now();
    const stopAt = last + 3200;
    const sample = (now) => {
      if (now - last > 80) slowFrames += 1;
      last = now;
      if (slowFrames >= 3) {
        setLagDetected(true);
        return;
      }
      if (now < stopAt) frame = window.requestAnimationFrame(sample);
    };
    frame = window.requestAnimationFrame(sample);
    return () => window.cancelAnimationFrame(frame);
  }, [device.reducedMotion, performanceMode]);

  const autoLite = device.reducedMotion || device.lowMemory || device.lowCpu || device.smallViewport || lagDetected;
  const effectivePerformanceMode = device.reducedMotion ? 'lite' : performanceMode === 'auto' ? (autoLite ? 'lite' : 'full') : performanceMode;
  const devicePerformanceReason = getDevicePerformanceReason(device, lagDetected);
  const shouldSuggestLiteMode = !device.reducedMotion && !suggestionDismissed && performanceMode === 'auto' && autoLite;

  const dismissLiteSuggestion = useCallback(({ keepFull = false } = {}) => {
    setSuggestionDismissed(true);
    if (typeof window !== 'undefined') window.localStorage.setItem(LITE_SUGGESTION_KEY, 'true');
    if (keepFull) setPerformanceMode('full');
  }, [setPerformanceMode]);

  return {
    performanceMode,
    setPerformanceMode,
    effectivePerformanceMode,
    isLiteMode: effectivePerformanceMode === 'lite',
    reducedMotion: device.reducedMotion,
    lowDevice: device.lowMemory || device.lowCpu || device.smallViewport || lagDetected,
    devicePerformanceReason,
    shouldSuggestLiteMode,
    dismissLiteSuggestion,
  };
}
