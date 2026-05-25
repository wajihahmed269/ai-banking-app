export const schedulePrefetch = (loader) => {
  if (typeof window === 'undefined') return;
  const run = () => {
    try {
      loader().catch(() => {});
    } catch {
      // Prefetching is opportunistic and should never affect the visible UI.
    }
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1400 });
    return;
  }
  window.setTimeout(run, 220);
};

export const prefetchAboutChunks = (includeHeavyVisuals = true) => schedulePrefetch(() => Promise.all([
  includeHeavyVisuals ? import('../components/backgrounds/GridScan') : Promise.resolve(),
  import('../components/cards/ProfileCard'),
  import('../components/cards/ChromaGrid'),
]));

export const prefetchProfileChunks = () => schedulePrefetch(() => Promise.all([
  import('../components/cards/ReflectiveCard'),
  import('../components/cards/MagicBento'),
]));

export const prefetchDashboardChunks = () => {
  prefetchProfileChunks();
};
