import { FeedPost } from './utils';

export function initSearch(): void {
  const searchModal = document.getElementById('search-command-dialog');
  const triggerSearchDesktop = document.getElementById('trigger-search-dialog');
  const triggerSearchMobile = document.getElementById('trigger-search-mobile');
  const closeSearchBtn = document.getElementById('close-search-dialog');
  const searchInput = document.getElementById('command-search-input') as HTMLInputElement | null;
  const searchResultsContainer = document.getElementById('command-search-results');

  const openSearch = () => {
    if (searchModal) {
      searchModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (searchInput) {
        searchInput.value = '';
        setTimeout(() => searchInput.focus(), 50);
      }
      loadAndRenderSuggestions();
    }
  };

  const closeSearch = () => {
    if (searchModal) {
      searchModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  if (triggerSearchDesktop) triggerSearchDesktop.addEventListener('click', openSearch);
  if (triggerSearchMobile) triggerSearchMobile.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

  // Global escape and key shortcuts listeners
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // Dynamic Search Catalog
  let postsCache: FeedPost[] = [];
  let isFetchingCache = false;

  const fetchPostCatalog = async (): Promise<FeedPost[]> => {
    if (postsCache.length > 0) return postsCache;
    if (isFetchingCache) return [];
    isFetchingCache = true;

    try {
      const response = await fetch('/feeds/posts/summary?alt=json&max-results=500');
      if (!response.ok) throw new Error('Failed to fetch posts feed.');
      const data = await response.json();

      const entries = data.feed?.entry || [];
      postsCache = entries.map((entry: any) => {
        const title = entry.title?.$t || 'Untitled';
        const linkObj = entry.link?.find((l: any) => l.rel === 'alternate');
        const url = linkObj?.href || '#';
        const image = entry.media$thumbnail?.url || entry.thumbnailUrl || '';
        const highResImage = image ? image.replace(/\/s72\-c\//, '/s240-c/') : '';

        return { title, url, image: highResImage };
      });
      return postsCache;
    } catch (err) {
      console.warn('Error downloading novel database feed: ', err);
      return [];
    } finally {
      isFetchingCache = false;
    }
  };

  const loadAndRenderSuggestions = async () => {
    const suggestionsContainer = document.getElementById('search-initial-suggestions');
    if (!suggestionsContainer) return;

    const posts = await fetchPostCatalog();
    if (posts.length === 0) {
      suggestionsContainer.innerHTML = `<div class='text-center text-muted text-xs py-4 font-sans'>No database posts found.</div>`;
      return;
    }

    renderResults(posts.slice(0, 5), suggestionsContainer);
  };

  const renderResults = (posts: FeedPost[], container: HTMLElement) => {
    if (posts.length === 0) {
      container.innerHTML = `<div class='text-center text-muted text-xs py-8 font-sans'>No results found.</div>`;
      return;
    }

    container.innerHTML = posts.map(p => `
      <a href="${p.url}" class="flex items-center gap-3 p-2 hover:bg-surface border border-transparent hover:border-border rounded-theme transition-fast group font-sans">
        <div class="w-9 h-12 rounded overflow-hidden bg-surface flex-shrink-0 relative border border-border">
          ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover" alt="" />` : `<div class="w-full h-full bg-gradient-to-br from-surface to-card flex items-center justify-center text-[8px] text-muted">No Image</div>`}
        </div>
        <div class="flex-grow min-w-0">
          <div class="text-xs font-semibold text-text group-hover:text-primary transition-fast truncate">${p.title}</div>
          <div class="text-[10px] text-muted mt-0.5 truncate">${p.url}</div>
        </div>
      </a>
    `).join('');
  };

  if (searchInput && searchResultsContainer) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          window.location.href = `/search?q=${encodeURIComponent(val)}`;
        }
      }
    });

    searchInput.addEventListener('input', async () => {
      const query = searchInput.value.toLowerCase().trim();

      if (!query) {
        searchResultsContainer.innerHTML = `
          <div class='search-suggestions-group'>
            <div class='text-[10px] font-bold text-muted uppercase tracking-wider px-3 py-2'>Suggestions</div>
            <div class='flex flex-col gap-1' id='search-initial-suggestions'></div>
          </div>
        `;
        loadAndRenderSuggestions();
        return;
      }

      searchResultsContainer.innerHTML = `<div class='text-center text-muted text-xs py-8 font-sans'>Searching catalog...</div>`;
      const posts = await fetchPostCatalog();
      const filtered = posts.filter(p => p.title.toLowerCase().includes(query));

      if (filtered.length === 0) {
        searchResultsContainer.innerHTML = `
          <div class='search-suggestions-group p-4 text-center font-sans'>
            <div class='text-xs text-muted mb-3 leading-relaxed'>
              <span class='text-[10px]'>Get comprehensive results with Deep Search — beyond basic keywords, it uncovers synopsis, alternative titles, and related details.</span>
            </div>
            <a href='/search?q=${encodeURIComponent(query)}' class='inline-flex items-center justify-center bg-primary text-bg font-semibold py-1.5 px-4 rounded-theme text-xs transition-fast cursor-pointer hover:opacity-90'>
              Deep Search
            </a>
          </div>
        `;
        return;
      }

      searchResultsContainer.innerHTML = `
        <div class='search-suggestions-group'>
          <div class='text-[10px] font-bold text-muted uppercase tracking-wider px-3 py-2'>Search Results (${filtered.length})</div>
          <div class='flex flex-col gap-1' id='search-results-list'></div>
        </div>
      `;
      const listContainer = document.getElementById('search-results-list');
      if (listContainer) {
        renderResults(filtered, listContainer);
      }
    });
  }
}
