import '../css/global.css';
import { initMenu } from './modules/menu';
import { initBookmarks } from './modules/bookmarks';
import { initSettings } from './modules/settings';
import { initSearch } from './modules/search';
import { initShare } from './modules/share';

function applyLazyLoadingToComments() {
  const commentRoot = document.querySelector('.comments-shell');
  if (!commentRoot) return;

  const applyLazy = (root: ParentNode) => {
    root.querySelectorAll('img, iframe').forEach((node) => {
      const element = node as HTMLElement;
      if (!element.hasAttribute('loading')) {
        element.setAttribute('loading', 'lazy');
      }
      if (element.tagName.toLowerCase() === 'iframe' && !element.hasAttribute('loading')) {
        element.setAttribute('loading', 'lazy');
      }
    });
  };

  applyLazy(commentRoot);

  const observer = new MutationObserver(() => applyLazy(commentRoot));
  observer.observe(commentRoot, { childList: true, subtree: true });
}

function formatCommentTimestamps() {
  const commentRoot = document.querySelector('.comments-shell');
  if (!commentRoot) return;

  const parseCommentDate = (value: string): Date | null => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    const match = normalized.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2})[.:](\d{2})/);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);

    const fullYear = year < 100 ? 2000 + year : year;
    const parsed = new Date(fullYear, month - 1, day, hour, minute, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatRelativeTime = (date: Date): string => {
    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 45) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const timestampLinks = commentRoot.querySelectorAll('.comment-timestamp a, .comment-footer a[href*="showComment"]');
  timestampLinks.forEach((link) => {
    const rawText = link.textContent?.trim() || '';
    if (!rawText || rawText.includes('ago')) return;

    const parsedDate = parseCommentDate(rawText);
    if (!parsedDate) return;

    link.textContent = formatRelativeTime(parsedDate);
  });
}

function cleanCommentAuthorText() {
  const commentRoot = document.querySelector('.comments-shell');
  if (!commentRoot) return;

  commentRoot.querySelectorAll('.comment-author').forEach((author) => {
    const textNodes = Array.from(author.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
    textNodes.forEach((node) => {
      if (/mengatakan|says|said/i.test(node.textContent || '')) {
        node.textContent = '';
      }
    });
    author.normalize();
  });
}

function setupCommentActions() {
  const commentRoot = document.querySelector('.comments-shell');
  if (!commentRoot) return;

  commentRoot.querySelectorAll('.comment').forEach((comment) => {
    const footer = comment.querySelector('.comment-footer');
    if (!footer || footer.querySelector('.comment-actions-inline')) return;

    const deleteLink = footer.querySelector('a.comment-delete');
    const replyLink = footer.querySelector('a.comment-reply');
    const timestamp = footer.querySelector('.comment-timestamp');

    if (!timestamp) return;

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'comment-actions-inline';

    if (replyLink) {
      replyLink.classList.add('comment-reply');
      actionsWrap.appendChild(replyLink);
    }

    if (deleteLink) {
      const menuBtn = document.createElement('button');
      menuBtn.type = 'button';
      menuBtn.className = 'comment-menu-toggle';
      menuBtn.setAttribute('aria-label', 'Comment actions');
      menuBtn.innerHTML = '⋯';

      const menu = document.createElement('div');
      menu.className = 'comment-menu hidden';
      menu.appendChild(deleteLink);
      menuBtn.appendChild(menu);

      menuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => menu.classList.add('hidden'));
      actionsWrap.appendChild(menuBtn);
    }

    footer.appendChild(actionsWrap);
  });
}

function initAll() {
  initMenu();
  initBookmarks();
  initSettings();
  initSearch();
  initShare();
  applyLazyLoadingToComments();
  formatCommentTimestamps();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
