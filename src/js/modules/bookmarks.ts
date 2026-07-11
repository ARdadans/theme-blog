import { Bookmark } from './utils';

declare global {
  interface Window {
    removeSingleBookmark: (id: string) => void;
  }
}

export function initBookmarks(): void {
  // 1. Bookmark Action Handling (Add / Remove on Single Pages)
  const bookmarkBtn = document.getElementById('bookmark-btn');
  if (bookmarkBtn) {
    const postId = bookmarkBtn.getAttribute('data-id') || '';
    const postTitle = bookmarkBtn.getAttribute('data-title') || '';
    const postUrl = bookmarkBtn.getAttribute('data-url') || '';
    const postImage = bookmarkBtn.getAttribute('data-image') || '';

    let bookmarks: Bookmark[] = JSON.parse(localStorage.getItem('series_bookmarks') || '[]');
    let isBookmarked = bookmarks.some(b => b.id === postId);

    const iconAdd = bookmarkBtn.querySelector('.icon-bookmark-add') as HTMLElement;
    const iconRemove = bookmarkBtn.querySelector('.icon-bookmark-remove') as HTMLElement;
    const btnText = bookmarkBtn.querySelector('.btn-text') as HTMLElement;

    const updateBtnUI = () => {
      if (isBookmarked) {
        bookmarkBtn.classList.add('bookmarked');
        if (iconAdd) iconAdd.style.display = 'none';
        if (iconRemove) iconRemove.style.display = 'inline-block';
        if (btnText) btnText.textContent = 'Bookmarked';
      } else {
        bookmarkBtn.classList.remove('bookmarked');
        if (iconAdd) iconAdd.style.display = 'inline-block';
        if (iconRemove) iconRemove.style.display = 'none';
        if (btnText) btnText.textContent = 'Add to Bookmarks';
      }
    };

    updateBtnUI();

    bookmarkBtn.addEventListener('click', () => {
      bookmarks = JSON.parse(localStorage.getItem('series_bookmarks') || '[]');
      isBookmarked = bookmarks.some(b => b.id === postId);

      if (isBookmarked) {
        bookmarks = bookmarks.filter(b => b.id !== postId);
        isBookmarked = false;
      } else {
        bookmarks.push({
          id: postId,
          title: postTitle,
          url: postUrl,
          image: postImage
        });
        isBookmarked = true;
      }
      localStorage.setItem('series_bookmarks', JSON.stringify(bookmarks));
      updateBtnUI();
    });
  }

  // 2. Render User Bookmarks (Index Drawer Grid)
  const bookmarksGrid = document.getElementById('bookmarks-grid');
  const bookmarksSection = document.getElementById('bookmarks-section');
  const navBookmarks = document.getElementById('nav-bookmarks');
  const clearBookmarks = document.getElementById('clear-bookmarks');

  const renderBookmarks = () => {
    if (!bookmarksGrid) return;
    const bookmarks: Bookmark[] = JSON.parse(localStorage.getItem('series_bookmarks') || '[]');

    if (bookmarks.length === 0) {
      bookmarksGrid.innerHTML = '<div class="no-bookmarks" style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: var(--muted);">You have no bookmarked series yet. Click &quot;Add to Bookmarks&quot; on any series page.</div>';
      return;
    }

    bookmarksGrid.innerHTML = bookmarks.map(b => `
      <div class="group flex flex-col bg-card rounded-theme border border-border overflow-hidden p-3 w-full" data-bookmark-id="${b.id}">
        <a class="block relative aspect-[2/3] overflow-hidden rounded bg-surface mb-2" href="${b.url}">
          ${b.image ? `<img class="w-full h-full object-cover transition-normal" alt="${b.title}" src="${b.image}" loading="lazy"/>` : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-card p-2 text-center text-[10px] font-bold text-muted"><span>${b.title}</span></div>`}
        </a>
        <div class="flex flex-col flex-grow justify-between min-h-[50px]">
          <h3 class="text-xs font-semibold leading-snug line-clamp-2 text-text group-hover:text-primary transition-fast mb-2">
            <a href="${b.url}">${b.title}</a>
          </h3>
          <button class="text-[11px] font-semibold text-muted hover:text-primary transition-fast cursor-pointer text-left self-start mt-auto" onclick="removeSingleBookmark('${b.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  };

  window.removeSingleBookmark = (id: string) => {
    let bookmarks: Bookmark[] = JSON.parse(localStorage.getItem('series_bookmarks') || '[]');
    bookmarks = bookmarks.filter(b => b.id !== id);
    localStorage.setItem('series_bookmarks', JSON.stringify(bookmarks));
    renderBookmarks();

    // update button if viewing bookmarked page
    const currentBookmarkBtn = document.getElementById('bookmark-btn');
    if (currentBookmarkBtn && currentBookmarkBtn.getAttribute('data-id') === id) {
      currentBookmarkBtn.classList.remove('bookmarked');
      const addIcon = currentBookmarkBtn.querySelector('.icon-bookmark-add') as HTMLElement;
      const removeIcon = currentBookmarkBtn.querySelector('.icon-bookmark-remove') as HTMLElement;
      const labelText = currentBookmarkBtn.querySelector('.btn-text') as HTMLElement;

      if (addIcon) addIcon.style.display = 'inline-block';
      if (removeIcon) removeIcon.style.display = 'none';
      if (labelText) labelText.textContent = 'Add to Bookmarks';
    }
  };

  if (clearBookmarks) {
    clearBookmarks.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all your bookmarks?')) {
        localStorage.removeItem('series_bookmarks');
        renderBookmarks();
        const currentBookmarkBtn = document.getElementById('bookmark-btn');
        if (currentBookmarkBtn) {
          currentBookmarkBtn.classList.remove('bookmarked');
          const addIcon = currentBookmarkBtn.querySelector('.icon-bookmark-add') as HTMLElement;
          const removeIcon = currentBookmarkBtn.querySelector('.icon-bookmark-remove') as HTMLElement;
          const labelText = currentBookmarkBtn.querySelector('.btn-text') as HTMLElement;

          if (addIcon) addIcon.style.display = 'inline-block';
          if (removeIcon) removeIcon.style.display = 'none';
          if (labelText) labelText.textContent = 'Add to Bookmarks';
        }
      }
    });
  }

  if (navBookmarks) {
    navBookmarks.addEventListener('click', (e) => {
      e.preventDefault();
      if (bookmarksSection) {
        bookmarksSection.style.display = bookmarksSection.style.display === 'none' ? 'block' : 'none';
        if (bookmarksSection.style.display === 'block') {
          renderBookmarks();
          bookmarksSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Check url hash directly
    if (window.location.hash === '#bookmarks-section' && bookmarksSection) {
      bookmarksSection.style.display = 'block';
      renderBookmarks();
    }
  }
}
