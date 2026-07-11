function getRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    return isoString;
  }
}

export function initHomepage(): void {
  const homepageSeriesList = document.getElementById('homepage-series-list');
  const homepagePagination = document.getElementById('homepage-pagination');
  const homepagePrevBtn = document.getElementById('homepage-prev-btn') as HTMLButtonElement | null;
  const homepageNextBtn = document.getElementById('homepage-next-btn') as HTMLButtonElement | null;

  if (!homepageSeriesList) return;

  let startIndex = 1;
  let detectedSeriesLabel = localStorage.getItem('blogger_series_label') || '';

  const extractChapterFromContent = (content: string): string => {
    if (!content) return '';
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const el = tempDiv.querySelector('.latest-chapter, #latest-chapter');
      if (el) {
        const val = el.textContent?.trim() || '';
        if (val) {
          return (val.toLowerCase().includes('ch') || val.toLowerCase().includes('chapter')) ? val : `Ch. ${val}`;
        }
      }
    } catch (e) {
      console.warn('Error parsing chapter content:', e);
    }
    return '';
  };

  const loadHomepageSeries = async () => {
    const postsPerPageStr = homepageSeriesList.getAttribute('data-posts-per-page');
    let postsPerPage = 12;
    if (postsPerPageStr) {
      const parsed = parseInt(postsPerPageStr, 10);
      if (!isNaN(parsed) && parsed > 0) {
        postsPerPage = parsed;
      }
    }

    // Show Skeletons during loading
    homepageSeriesList.innerHTML = Array(5).fill(0).map(() => `
      <div class="flex flex-col gap-2 w-full animate-pulse skeleton-card">
        <div class="aspect-[2/3] bg-surface border border-border rounded w-full"></div>
        <div class="h-2.5 bg-surface rounded w-2/3 mt-2"></div>
        <div class="h-3 bg-surface rounded w-full mt-1.5"></div>
      </div>
    `).join('');

    try {
      const labelsToTry = detectedSeriesLabel 
        ? [detectedSeriesLabel, 'type:series', 'Type:Series', 'Series', 'type: series']
        : ['type:series', 'Type:Series', 'Series', 'type: series'];

      let entries: any[] = [];
      let usedLabel = '';

      for (const label of labelsToTry) {
        try {
          const encodedLabel = encodeURIComponent(label);
          const response = await fetch(`/feeds/posts/default/-/${encodedLabel}?alt=json&orderby=updated&start-index=${startIndex}&max-results=${postsPerPage}`);
          if (response.ok) {
            const data = await response.json();
            const foundEntries = data.feed?.entry || [];
            if (foundEntries.length > 0) {
              entries = foundEntries;
              usedLabel = label;
              break;
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch homepage feed for label: ${label}`, e);
        }
      }

      if (usedLabel && usedLabel !== detectedSeriesLabel) {
        detectedSeriesLabel = usedLabel;
        localStorage.setItem('blogger_series_label', usedLabel);
      }

      const posts = entries.map((entry: any) => {
        const title = entry.title?.$t || 'Untitled';
        const linkObj = entry.link?.find((l: any) => l.rel === 'alternate');
        const url = linkObj?.href || '#';

        let image = '';
        if (entry.media$thumbnail?.url) {
          image = entry.media$thumbnail.url.replace(/\/s72\-c\//, '/s300/');
        }
        if (!image) {
          const htmlContent = entry.content?.$t || entry.summary?.$t || '';
          if (htmlContent) {
            const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) {
              image = imgMatch[1];
            }
          }
        }

        const labels = (entry.category || []).map((cat: any) => cat.term || '');
        const dateStr = entry.updated?.$t || entry.published?.$t || '';

        // Extract chapter directly from metadata at the bottom of the content
        const contentStr = entry.content?.$t || entry.summary?.$t || '';
        const chapterText = extractChapterFromContent(contentStr);

        return { title, url, image, labels, date: dateStr, chapterText };
      });

      renderHomepageSeries(posts);

      // Update pagination buttons
      if (homepagePagination && homepagePrevBtn && homepageNextBtn) {
        homepagePagination.classList.remove('hidden');
        homepagePrevBtn.disabled = startIndex <= 1;
        homepageNextBtn.disabled = posts.length < postsPerPage;
      }
    } catch (err) {
      console.warn('Error loading homepage series feed: ', err);
      homepageSeriesList.innerHTML = `<div class='col-span-full text-center text-muted text-xs py-8 font-sans'>Failed to load latest updates. Please verify feed configurations.</div>`;
    }
  };

  const renderHomepageSeries = (posts: any[]) => {
    if (posts.length === 0) {
      homepageSeriesList.innerHTML = `<div class='col-span-full text-center text-muted text-xs py-8 font-sans'>No series found.</div>`;
      return;
    }

    homepageSeriesList.innerHTML = posts.map(p => {
      const relativeTime = getRelativeTime(p.date);
      const hasNewLabel = p.labels.includes('New') || p.labels.includes('badge:new');

      return `
        <div class="group flex flex-col transition-normal overflow-hidden w-full font-sans">
          <a class="block relative aspect-[2/3] overflow-hidden rounded bg-surface mb-2 flex-shrink-0" href="${p.url}">
            ${p.image ? `<img class="w-full h-full object-cover transition-normal" alt="${p.title}" src="${p.image}" loading="lazy"/>` : `
              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-card p-2 text-center">
                <span class="text-[10px] font-bold text-muted">${p.title}</span>
              </div>
            `}
            ${hasNewLabel ? `<span class="absolute top-1.5 left-1.5 bg-primary text-bg text-[8px] font-black px-1.5 py-0.5 rounded shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase tracking-[0.5px] pointer-events-none z-[2]">New</span>` : ''}
          </a>

          <div class="flex justify-between items-center text-[10px] text-muted font-semibold">
            <div class="truncate max-w-[65%] font-sans">
              ${p.chapterText ? `<span>${p.chapterText}</span>` : ''}
            </div>
            <div class="flex items-center gap-1 text-muted flex-shrink-0">
              <time class="timeago" datetime="${p.date}">${relativeTime}</time>
            </div>
          </div>

          <h3 class="text-xs md:text-sm font-semibold leading-snug line-clamp-2 text-text group-hover:text-primary transition-fast">
            <a href="${p.url}">${p.title}</a>
          </h3>
        </div>
      `;
    }).join('');

    // Trigger relative times recalculation
    updateRelativeTimes();
  };

  const updateRelativeTimes = () => {
    document.querySelectorAll('.timeago').forEach(el => {
      const datetime = el.getAttribute('datetime');
      if (datetime) {
        el.textContent = getRelativeTime(datetime);
      }
    });
  };

  if (homepagePrevBtn && homepageNextBtn) {
    homepagePrevBtn.addEventListener('click', () => {
      const postsPerPageStr = homepageSeriesList.getAttribute('data-posts-per-page');
      let postsPerPage = 10;
      if (postsPerPageStr) {
        const parsed = parseInt(postsPerPageStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          postsPerPage = parsed;
        }
      }
      if (startIndex > 1) {
        startIndex -= postsPerPage;
        loadHomepageSeries();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    homepageNextBtn.addEventListener('click', () => {
      const postsPerPageStr = homepageSeriesList.getAttribute('data-posts-per-page');
      let postsPerPage = 10;
      if (postsPerPageStr) {
        const parsed = parseInt(postsPerPageStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          postsPerPage = parsed;
        }
      }
      startIndex += postsPerPage;
      loadHomepageSeries();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initial load
  loadHomepageSeries().then(updateRelativeTimes);
  updateRelativeTimes();
}
