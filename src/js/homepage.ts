import { initHomepage } from './modules/homepage';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHomepage();
  });
} else {
  initHomepage();
}
