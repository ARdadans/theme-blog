import '../css/global.css';
import { initMenu } from './modules/menu';
import { initBookmarks } from './modules/bookmarks';
import { initSettings } from './modules/settings';
import { initSearch } from './modules/search';
import { initShare } from './modules/share';

function initAll() {
  initMenu();
  initBookmarks();
  initSettings();
  initSearch();
  initShare();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
