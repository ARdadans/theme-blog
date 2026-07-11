import { initSeries } from './modules/series';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSeries();
  });
} else {
  initSeries();
}
