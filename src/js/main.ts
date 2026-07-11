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
    Array.from(author.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.textContent || '';
        const cleaned = value
          .replace(/\s*(mengatakan|says|said)\s*/i, '')
          .replace(/[.…]+/g, '')
          .trim();
        node.textContent = cleaned;
      }
    });
    author.normalize();
  });
}

function setupCommentActions() {
  const commentRoot = document.querySelector('.comments-shell');
  if (!commentRoot) return;

  commentRoot.querySelectorAll('.comment').forEach((comment) => {
    const author = comment.querySelector('.comment-author');
    const body = comment.querySelector('.comment-body');

    if (!author || !body || comment.querySelector('.comment-meta-row')) return;

    const footer = comment.querySelector('.comment-footer') || comment;
    const deleteLink = footer.querySelector('a.comment-delete') || comment.querySelector('a.comment-delete');
    const existingReply = (footer.querySelector('a.comment-reply, a[href*="comment/reply"]') || comment.querySelector('a.comment-reply, a[href*="comment/reply"]')) as HTMLAnchorElement | null;
    const timestamp = footer.querySelector('.comment-timestamp') || comment.querySelector('.comment-timestamp');

    if (!timestamp) return;

    let replyUrl = '';
    if (deleteLink && deleteLink.getAttribute('href')) {
      const deleteHref = deleteLink.getAttribute('href') || '';
      const replyHref = deleteHref.replace(/\/comment\/delete\//i, '/comment/reply/');
      if (replyHref && replyHref !== deleteHref) {
        replyUrl = replyHref.startsWith('http') ? replyHref : `https://www.blogger.com${replyHref}`;
      }
    }

    const metaRow = document.createElement('div');
    metaRow.className = 'comment-meta-row';

    const authorWrap = document.createElement('div');
    authorWrap.className = 'comment-author-wrap';

    if (author.parentNode) {
      author.parentNode.removeChild(author);
    }
    authorWrap.appendChild(author);

    if (timestamp.parentNode) {
      timestamp.parentNode.removeChild(timestamp);
    }
    authorWrap.appendChild(timestamp);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'comment-actions-inline';

    const replyLink = existingReply || document.createElement('a');
    replyLink.className = 'comment-reply';

    if (!existingReply) {
      replyLink.setAttribute('href', replyUrl || '#');
      replyLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg><span>Reply</span>';
    }

    if (!body.querySelector('.comment-reply')) {
      const replyWrap = document.createElement('div');
      replyWrap.className = 'comment-reply-row';

      if (replyLink.parentNode && replyLink.parentNode !== replyWrap) {
        replyLink.parentNode.removeChild(replyLink);
      }

      replyWrap.appendChild(replyLink);
      body.appendChild(replyWrap);
    }

    if (deleteLink) {
      deleteLink.textContent = 'Delete';
      deleteLink.classList.add('comment-delete');
      deleteLink.querySelector('img')?.remove();

      const menuBtn = document.createElement('button');
      menuBtn.type = 'button';
      menuBtn.className = 'comment-menu-toggle';
      menuBtn.setAttribute('aria-label', 'Comment actions');
      menuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';

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

    metaRow.appendChild(authorWrap);
    metaRow.appendChild(actionsWrap);

    body.parentNode?.insertBefore(metaRow, body);
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
  cleanCommentAuthorText();
  setupCommentActions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
