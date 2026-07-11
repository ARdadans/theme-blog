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

/**
 * Extracts label prefix and value from a label string (e.g., "genre:action" -> {prefix: "genre", value: "action"})
 */
function parseLabelString(labelStr: string): { prefix: string; value: string } | null {
  const match = labelStr.match(/^([^:]+):(.+)$/);
  if (match) {
    return { prefix: match[1].toLowerCase().trim(), value: match[2].toLowerCase().trim() };
  }
  return null;
}

/**
 * Normalizes label values so spaces become hyphens and casing is lower-case.
 */
function normalizeLabelValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generates a search URL with label filter and type:series filter.
 * Example: "genre:action" -> "/search?q=label:"genre:action"+label:"type:series""
 */
function generateSearchLink(labelPrefix: string, labelValue: string): string {
  const normalizedValue = normalizeLabelValue(labelValue);
  const encodedQuery = encodeURIComponent(`label:"${labelPrefix}:${normalizedValue}"+label:"type:series"`);
  return `/search?q=${encodedQuery}`;
}

export function initSeries(): void {
  const seriesContainer = document.querySelector('.series-profile-container');
  if (!seriesContainer) return;

  const metaContainer = seriesContainer.querySelector('.meta');
  if (!metaContainer) return;

  // Move Poster Image
  const poster = metaContainer.querySelector('img.poster') as HTMLImageElement | null;
  const coverPlaceholder = seriesContainer.querySelector('.series-cover-placeholder');
  if (coverPlaceholder) {
    coverPlaceholder.classList.remove('animate-pulse');
    coverPlaceholder.innerHTML = '';

    if (poster && poster.src) {
      poster.className = 'w-full h-full object-cover';
      poster.onerror = () => {
        coverPlaceholder.innerHTML = `
          <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface/50 text-muted font-sans border border-border rounded-theme">
            <svg class="w-8 h-8 mb-2 opacity-40 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span class="text-[10px] font-bold uppercase tracking-wider text-primary">Broken Link</span>
            <span class="text-[9px] mt-1 opacity-60">Failed to load cover</span>
          </div>
        `;
      };
      coverPlaceholder.appendChild(poster);
    } else {
      coverPlaceholder.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface/50 text-muted font-sans rounded-theme">
          <svg class="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span class="text-[10px] font-bold uppercase tracking-wider">No Cover</span>
          <span class="text-[9px] mt-1 opacity-60">Poster not provided</span>
        </div>
      `;
    }
  }

  // Move Alternative Titles (Render as Accordion)
  const alts = metaContainer.querySelector('ul.title-alts');
  const titlePlaceholder = seriesContainer.querySelector('.series-title-placeholder');
  if (alts && titlePlaceholder) {
    const titleItems = Array.from(alts.querySelectorAll('li')).map(li => li.textContent?.trim() || '').filter(Boolean);

    if (titleItems.length > 0) {
      const combinedText = titleItems.join(' / ');

      const accordionWrapper = document.createElement('div');
      accordionWrapper.className = 'mt-1.5 flex flex-col font-sans';

      const accordionHeader = document.createElement('button');
      accordionHeader.className = 'flex items-center justify-between gap-1.5 text-xs text-muted hover:text-primary transition-fast cursor-pointer text-left bg-transparent border-0 p-0 outline-none w-full md:max-w-[360px] min-w-0';
      accordionHeader.innerHTML = `
        <span class="truncate block italic font-medium">${combinedText}</span>
        <svg class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 icon-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
        </svg>
      `;

      const accordionContent = document.createElement('div');
      accordionContent.className = 'grid grid-rows-[0fr] transition-all duration-350 ease-in-out overflow-hidden';

      const innerContainer = document.createElement('div');
      innerContainer.className = 'min-h-0 flex flex-col gap-1.5 pt-2 text-xs text-muted font-medium italic';

      titleItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = item;
        innerContainer.appendChild(itemDiv);
      });
      accordionContent.appendChild(innerContainer);

      accordionHeader.addEventListener('click', (e) => {
        e.preventDefault();
        const chevron = accordionHeader.querySelector('.icon-chevron');
        if (accordionContent.classList.contains('grid-rows-[0fr]')) {
          accordionContent.classList.remove('grid-rows-[0fr]');
          accordionContent.classList.add('grid-rows-[1fr]');
          chevron?.classList.add('rotate-180');
        } else {
          accordionContent.classList.remove('grid-rows-[1fr]');
          accordionContent.classList.add('grid-rows-[0fr]');
          chevron?.classList.remove('rotate-180');
        }
      });

      accordionWrapper.appendChild(accordionHeader);
      accordionWrapper.appendChild(accordionContent);
      titlePlaceholder.appendChild(accordionWrapper);
    }
  }

  // Move Badges: Media, Status, Year, Badge, Latest Chapter
  const badgesPlaceholder = seriesContainer.querySelector('.series-badges-placeholder');
  if (badgesPlaceholder) {
    badgesPlaceholder.classList.remove('animate-pulse');
    badgesPlaceholder.innerHTML = '';
    const badgeClasses = ['.media', '.status', '.year', '.badge', '.latest-chapter'];
    badgeClasses.forEach(cls => {
      const el = metaContainer.querySelector(cls) as HTMLElement | null;
      if (!el) return;

      if (cls === '.badge' || cls === '.latest-chapter') {
        el.style.display = 'none';
      }

      let extraStyles = 'bg-surface border border-border text-muted px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]';
      const text = el.textContent?.toLowerCase().trim() || '';
      if (cls === '.status') {
        if (text.includes('ongoing') || text.includes('releasing') || text.includes('publish') || text.includes('aktif')) {
          extraStyles = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]';
        } else {
          extraStyles = 'bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]';
        }
      } else if (cls === '.badge') {
        extraStyles = 'bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]';
      }

      if (cls === '.media' || cls === '.status' || cls === '.year') {
        const badgeText = el.textContent?.trim() || '';
        const badgeValue = badgeText.toLowerCase().trim();
        let href = '';
        if (cls === '.media') {
          href = generateSearchLink('media', badgeValue);
        } else if (cls === '.status') {
          href = generateSearchLink('status', badgeValue);
        } else if (cls === '.year') {
          href = generateSearchLink('year', badgeValue);
        }

        const badgeLink = document.createElement('a');
        badgeLink.href = href;
        badgeLink.className = extraStyles;
        badgeLink.textContent = badgeText;
        badgesPlaceholder.appendChild(badgeLink);
      } else {
        el.className = extraStyles;
        badgesPlaceholder.appendChild(el);
      }
    });
  }

  // Helper to limit desktop genres/tags to 5 items and add a "More" button
  const setupDesktopItemLimit = (placeholder: HTMLElement, listEl: HTMLElement, limit: number = 5) => {
    const items = Array.from(listEl.children).filter((child): child is HTMLElement => child instanceof HTMLElement);

    const containerDiv = document.createElement('div');
    containerDiv.className = 'flex items-center gap-1.5 flex-wrap min-w-0 w-full';
    containerDiv.appendChild(listEl);

    if (items.length > limit) {
      items.forEach((item, index) => {
        item.classList.toggle('hidden', index >= limit);
      });

      const moreBtn = document.createElement('button');
      moreBtn.className = 'text-[11px] font-semibold px-2.5 py-1 rounded-full border border-dashed border-border text-muted hover:bg-card/40 hover:border-primary hover:text-primary transition-fast cursor-pointer flex items-center gap-1 flex-shrink-0';
      moreBtn.innerHTML = `More <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>`;

      moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        items.forEach(item => item.classList.remove('hidden'));
        moreBtn.remove();
      });

      containerDiv.appendChild(moreBtn);
    }

    placeholder.appendChild(containerDiv);
  };

  // Move Genres & Tags
  const genresPlaceholder = seriesContainer.querySelector('.series-genres-placeholder') as HTMLElement | null;
  if (genresPlaceholder) {
    genresPlaceholder.classList.remove('animate-pulse');
    genresPlaceholder.innerHTML = '';

    const genresList = metaContainer.querySelector('ul.genres') as HTMLElement | null;
    if (genresList) {
      const genresListClone = genresList.cloneNode(true) as HTMLElement;
      genresListClone.className = 'flex flex-wrap gap-1.5 list-none p-0 m-0';
      genresListClone.querySelectorAll('li').forEach((li) => {
        const genreText = li.textContent?.trim() || '';
        const link = document.createElement('a');
        link.href = generateSearchLink('genre', genreText);
        link.className = 'bg-surface border border-border text-muted hover:border-transparent hover:bg-primary/10 hover:text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full transition-fast cursor-pointer';
        link.textContent = genreText;
        li.replaceWith(link);
      });
      setupDesktopItemLimit(genresPlaceholder, genresListClone);
    }

    const tagsList = metaContainer.querySelector('ul.tag') as HTMLElement | null;
    if (tagsList) {
      const tagsListClone = tagsList.cloneNode(true) as HTMLElement;
      tagsListClone.className = 'flex flex-wrap gap-1.5 list-none p-0 m-0';
      tagsListClone.querySelectorAll('li').forEach((li) => {
        const tagText = li.textContent?.trim() || '';
        const link = document.createElement('a');
        link.href = generateSearchLink('tag', tagText);
        link.className = 'bg-surface border border-border text-muted hover:border-transparent hover:bg-primary/10 hover:text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full transition-fast cursor-pointer';
        link.textContent = tagText;
        li.replaceWith(link);
      });
      setupDesktopItemLimit(genresPlaceholder, tagsListClone);
    }
  }

  // Extract metadata values
  const getValueOf = (cls: string): string => {
    const el = metaContainer.querySelector(cls);
    if (!el) return '';
    if (el.tagName.toLowerCase() === 'ul') {
      return Array.from(el.querySelectorAll('li')).map(li => li.innerHTML.trim()).filter(Boolean).join(', ');
    }
    return el.innerHTML.trim();
  };

  const authorName = getValueOf('.author');
  const artistName = getValueOf('.artist');
  const publisherName = getValueOf('.publisher');
  const countryName = getValueOf('.country');
  const languageName = getValueOf('.language');

  // Move Author & Artist (Separated, under Alt Title)
  const authorArtPlaceholder = seriesContainer.querySelector('.series-author-art-placeholder');
  if (authorArtPlaceholder) {
    authorArtPlaceholder.innerHTML = '';
    if (authorName) {
      const authorDiv = document.createElement('div');
      authorDiv.className = 'flex items-center gap-1.5 text-text-soft font-sans';
      const authorLinks = authorName.split(',').map(author => {
        const cleanAuthor = author.trim();
        return `<a href="${generateSearchLink('author', cleanAuthor)}" class="text-muted hover:text-primary font-medium transition-fast">${cleanAuthor}</a>`;
      }).join(', ');
      authorDiv.innerHTML = `<span class="font-semibold text-text-soft">Author:</span><span class="text-muted font-medium flex items-center gap-1.5 flex-wrap">${authorLinks}</span>`;
      authorArtPlaceholder.appendChild(authorDiv);
    }
    if (artistName) {
      const artistDiv = document.createElement('div');
      artistDiv.className = 'flex items-center gap-1.5 text-text-soft font-sans';
      const artistLinks = artistName.split(',').map(artist => {
        const cleanArtist = artist.trim();
        return `<a href="${generateSearchLink('artist', cleanArtist)}" class="text-muted hover:text-primary font-medium transition-fast">${cleanArtist}</a>`;
      }).join(', ');
      artistDiv.innerHTML = `<span class="font-semibold text-text-soft">Art:</span><span class="text-muted font-medium flex items-center gap-1.5 flex-wrap">${artistLinks}</span>`;
      authorArtPlaceholder.appendChild(artistDiv);
    }
  }

  // Move Summary (Synopsis) with "Read more" toggle
  const summaryPlaceholder = seriesContainer.querySelector('.series-summary-placeholder');
  if (summaryPlaceholder) {
    summaryPlaceholder.classList.remove('animate-pulse');
    const summary = metaContainer.querySelector('.summary');

    // Build Publisher, Country, Language rows HTML
    let metaRowsHtml = '';
    if (publisherName) {
      const publisherLinks = publisherName.split(',').map(pub => {
        const cleanPub = pub.trim();
        return `<a href="${generateSearchLink('publisher', cleanPub)}" class="text-muted hover:text-primary font-medium transition-fast">${cleanPub}</a>`;
      }).join(', ');
      metaRowsHtml += `<div class="flex items-center gap-1.5"><span class="font-semibold text-text-soft">Publisher:</span><span class="text-muted font-medium flex items-center gap-1.5 flex-wrap">${publisherLinks}</span></div>`;
    }
    if (countryName) {
      const countryLinks = countryName.split(',').map(country => {
        const cleanCountry = country.trim();
        return `<a href="${generateSearchLink('country', cleanCountry)}" class="text-muted hover:text-primary font-medium transition-fast">${cleanCountry}</a>`;
      }).join(', ');
      metaRowsHtml += `<div class="flex items-center gap-1.5"><span class="font-semibold text-text-soft">Country:</span><span class="text-muted font-medium flex items-center gap-1.5 flex-wrap">${countryLinks}</span></div>`;
    }
    if (languageName) {
      const languageLinks = languageName.split(',').map(lang => {
        const cleanLang = lang.trim();
        return `<a href="${generateSearchLink('language', cleanLang)}" class="text-muted hover:text-primary font-medium transition-fast">${cleanLang}</a>`;
      }).join(', ');
      metaRowsHtml += `<div class="flex items-center gap-1.5"><span class="font-semibold text-text-soft">Language:</span><span class="text-muted font-medium flex items-center gap-1.5 flex-wrap">${languageLinks}</span></div>`;
    }

    // Build mobile genres/tags HTML
    let mobileGenresHtml = '';
    let mobileTagsHtml = '';

    const genresListRaw = metaContainer.querySelector('ul.genres');
    if (genresListRaw) {
      const genres = Array.from(genresListRaw.querySelectorAll('li')).map(li => li.innerHTML.trim()).filter(Boolean);
      if (genres.length > 0) {
        mobileGenresHtml = `<div class="flex flex-col gap-1.5"><span class="font-semibold text-text-soft">Genres:</span><div class="flex flex-wrap gap-1.5">${genres.map(g => `<a href="${generateSearchLink('genre', g)}" class="bg-surface border border-border text-muted text-[11px] font-semibold px-2.5 py-1 rounded-full transition-fast hover:border-transparent hover:bg-primary/10 hover:text-primary cursor-pointer">${g}</a>`).join('')}</div></div>`;
      }
    }

    const tagsListRaw = metaContainer.querySelector('ul.tag');
    if (tagsListRaw) {
      const tags = Array.from(tagsListRaw.querySelectorAll('li')).map(li => li.innerHTML.trim()).filter(Boolean);
      if (tags.length > 0) {
        mobileTagsHtml = `<div class="flex flex-col gap-1.5"><span class="font-semibold text-text-soft">Tags:</span><div class="flex flex-wrap gap-1.5">${tags.map(t => `<a href="${generateSearchLink('tag', t)}" class="bg-surface border border-border text-muted text-[11px] font-semibold px-2.5 py-1 rounded-full transition-fast hover:border-transparent hover:bg-primary/10 hover:text-primary cursor-pointer">${t}</a>`).join('')}</div></div>`;
      }
    }

    if (summary || metaRowsHtml || mobileGenresHtml || mobileTagsHtml) {
      summaryPlaceholder.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'summary-expand-container flex flex-col gap-3';

      const textDiv = document.createElement('div');
      textDiv.className = 'text-sm leading-relaxed text-text-soft line-clamp-3 transition-all duration-300';
      textDiv.innerHTML = summary ? summary.innerHTML : '<span class="text-xs text-muted italic">No synopsis available.</span>';
      container.appendChild(textDiv);

      const expandWrapper = document.createElement('div');
      expandWrapper.className = 'grid grid-rows-[0fr] transition-all duration-350 ease-in-out overflow-hidden';

      const expandInner = document.createElement('div');
      expandInner.className = 'min-h-0 flex flex-col gap-3 pt-2 text-xs font-sans';

      let expandBlockInner = '';
      if (metaRowsHtml) {
        expandBlockInner += `<div class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">${metaRowsHtml}</div>`;
      }
      if (mobileGenresHtml || mobileTagsHtml) {
        expandBlockInner += `<div class="flex md:hidden flex-col gap-3 pt-3">${mobileGenresHtml}${mobileTagsHtml}</div>`;
      }
      expandInner.innerHTML = expandBlockInner;
      expandWrapper.appendChild(expandInner);
      container.appendChild(expandWrapper);

      const toggleLink = document.createElement('a');
      toggleLink.className = 'text-primary text-xs font-bold hover:underline cursor-pointer inline-block mt-1 transition-fast';
      toggleLink.textContent = 'View more';

      toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (textDiv.classList.contains('line-clamp-3')) {
          textDiv.classList.remove('line-clamp-3');
          expandWrapper.classList.remove('grid-rows-[0fr]');
          expandWrapper.classList.add('grid-rows-[1fr]');
          toggleLink.textContent = 'View less';
        } else {
          textDiv.classList.add('line-clamp-3');
          expandWrapper.classList.remove('grid-rows-[1fr]');
          expandWrapper.classList.add('grid-rows-[0fr]');
          toggleLink.textContent = 'View more';
        }
      });

      container.appendChild(toggleLink);
      summaryPlaceholder.appendChild(container);
    } else {
      summaryPlaceholder.innerHTML = '<span class="text-xs text-muted italic">No information available.</span>';
    }
  }

  // Automatic Feed loading for Chapters List
  const labelSpans = document.querySelectorAll('#series-page-metadata .label-item');
  let seriesSlug = '';
  labelSpans.forEach(span => {
    const text = span.textContent?.trim() || '';
    const cleanText = text.toLowerCase().replace(/\s+/g, '');
    if (cleanText.startsWith('series:')) {
      seriesSlug = text;
    }
  });

  if (seriesSlug) {
    let currentChapterPage = 1;
    const chaptersPerPage = 100;
    let loadedChapters: any[] = [];
    let sortOrder: 'desc' | 'asc' = 'desc';
    let detectedChapterLabel = localStorage.getItem('blogger_chapter_label') || '';

    const fetchChapters = async (slug: string, page: number = 1) => {
      const startIndex = (page - 1) * chaptersPerPage + 1;

      // If we already know the label, and it's not the first page, only query the cached one
      if (page > 1 && detectedChapterLabel) {
        const feedUrl = `/feeds/posts/summary/-/${encodeURIComponent(slug)}/${encodeURIComponent(detectedChapterLabel)}?alt=json&max-results=${chaptersPerPage}&start-index=${startIndex}&orderby=updated`;
        try {
          const response = await fetch(feedUrl);
          if (response.ok) {
            const data = await response.json();
            return data.feed?.entry || [];
          }
        } catch (err) {
          console.error(`Failed to fetch chapters for cached label ${detectedChapterLabel}:`, err);
        }
        return [];
      }

      const labelsToTry = detectedChapterLabel
        ? [detectedChapterLabel, 'type:chapter', 'type: chapter', 'Type:Chapter', 'Chapter']
        : ['type:chapter', 'type: chapter', 'Type:Chapter', 'Chapter'];

      for (const label of labelsToTry) {
        const feedUrl = `/feeds/posts/summary/-/${encodeURIComponent(slug)}/${encodeURIComponent(label)}?alt=json&max-results=${chaptersPerPage}&start-index=${startIndex}&orderby=updated`;
        try {
          const response = await fetch(feedUrl);
          if (response.ok) {
            const data = await response.json();
            const entries = data.feed?.entry || [];
            if (entries.length > 0) {
              if (label !== detectedChapterLabel) {
                detectedChapterLabel = label;
                localStorage.setItem('blogger_chapter_label', label);
              }
              return entries;
            }
          }
        } catch (err) {
          console.error(`Failed to fetch chapters for label ${label}:`, err);
        }
      }
      return [];
    };

    const renderChaptersList = (entries: any[]) => {
      const listContainer = document.getElementById('chapters-list-container');
      if (!listContainer) return;

      if (entries.length === 0) {
        listContainer.innerHTML = `<div class='text-center text-muted text-xs py-8 font-sans'>No chapters released yet.</div>`;
        return;
      }

      const sorted = [...entries].sort((a, b) => {
        const dateA = new Date(a.updated?.$t || a.published?.$t).getTime();
        const dateB = new Date(b.updated?.$t || b.published?.$t).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      let html = '';
      sorted.forEach(entry => {
        const title = entry.title?.$t || 'Untitled Chapter';
        const linkObj = entry.link?.find((l: any) => l.rel === 'alternate');
        const url = linkObj ? linkObj.href : '#';
        const updatedDate = entry.updated?.$t || entry.published?.$t;
        const formattedTime = getRelativeTime(updatedDate);

        let displayTitle = title;
        let chapterTitleText = '';
        const match = title.match(/(?:Chapter|Ch\.?)\s*(\d+(\.\d+)?)/i);
        if (match) {
          displayTitle = match[0];
          const index = match.index || 0;
          const remaining = title.substring(index + match[0].length).trim();
          chapterTitleText = remaining.replace(/^[\s\-:\u2013\u2014]+/, '').trim();
        }

        html += `
          <a href="${url}" class="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-card last:border-0 transition-fast group border-b border-card">
            <div class="flex items-baseline gap-2 min-w-0 flex-grow">
              <span class="text-xs md:text-sm font-semibold text-text transition-fast whitespace-nowrap flex-shrink-0">${displayTitle}</span>
              ${chapterTitleText ? `<span class="text-[11px] md:text-xs text-muted font-medium truncate">${chapterTitleText}</span>` : ''}
            </div>
            <div class="flex items-center gap-4 text-xs text-muted flex-shrink-0">
              <span>${formattedTime}</span>
              <svg class="w-3.5 h-3.5 fill-none stroke-current opacity-60 group-hover:opacity-100 transition-fast" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          </a>
        `;
      });

      listContainer.innerHTML = html;

      // Update "Start Reading" button to point to Chapter 1
      const startReadingBtn = document.getElementById('start-reading-btn') as HTMLAnchorElement | null;
      if (startReadingBtn && entries.length > 0) {
        const chronSorted = [...entries].sort((a, b) => {
          const dateA = new Date(a.published?.$t || a.updated?.$t).getTime();
          const dateB = new Date(b.published?.$t || b.updated?.$t).getTime();
          return dateA - dateB;
        });
        const firstChObj = chronSorted[0].link?.find((l: any) => l.rel === 'alternate');
        if (firstChObj) {
          startReadingBtn.href = firstChObj.href;
        }
      }
    };

    const updateChaptersPagination = (hasMore: boolean) => {
      const pagContainer = document.getElementById('chapters-pagination');
      if (!pagContainer) return;

      if (currentChapterPage === 1 && !hasMore) {
        pagContainer.classList.add('hidden');
        return;
      }

      pagContainer.classList.remove('hidden');
      pagContainer.innerHTML = `
        <button id="chapters-prev-btn" class="bg-surface hover:bg-surface/80 border border-border text-text px-4 py-2 rounded-theme text-xs font-semibold flex items-center gap-1.5 transition-fast cursor-pointer disabled:opacity-50 disabled:pointer-events-none" ${currentChapterPage === 1 ? 'disabled' : ''}>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg> Previous
        </button>
        <span class="text-xs text-muted self-center font-semibold px-3">Page ${currentChapterPage}</span>
        <button id="chapters-next-btn" class="bg-surface hover:bg-surface/80 border border-border text-text px-4 py-2 rounded-theme text-xs font-semibold flex items-center gap-1.5 transition-fast cursor-pointer disabled:opacity-50 disabled:pointer-events-none" ${!hasMore ? 'disabled' : ''}>
          Next <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        </button>
      `;

      document.getElementById('chapters-prev-btn')?.addEventListener('click', async () => {
        if (currentChapterPage > 1) {
          currentChapterPage--;
          await loadChaptersPage();
        }
      });

      document.getElementById('chapters-next-btn')?.addEventListener('click', async () => {
        currentChapterPage++;
        await loadChaptersPage();
      });
    };

    const loadChaptersPage = async () => {
      const listContainer = document.getElementById('chapters-list-container');
      if (listContainer) {
        listContainer.innerHTML = `<div class='text-center text-muted text-xs py-8 font-sans'>Loading chapters page ${currentChapterPage}...</div>`;
      }

      const entries = await fetchChapters(seriesSlug, currentChapterPage);
      loadedChapters = entries;
      renderChaptersList(loadedChapters);

      const hasMore = entries.length === chaptersPerPage;
      updateChaptersPagination(hasMore);
    };

    const sectionContainer = document.getElementById('chapters-section');
    if (sectionContainer) {
      const filterBar = document.createElement('div');
      filterBar.className = 'flex flex-col md:flex-row gap-3 items-center justify-between p-4 bg-surface/50 text-xs rounded-t-theme';
      filterBar.innerHTML = `
        <div class="relative w-full md:w-72">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" id="chapter-search-input" placeholder="Search chapter number..." class="w-full bg-bg border border-border rounded-theme pl-9 pr-4 py-2 text-text outline-none" />
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button id="chapter-sort-btn" class="bg-surface hover:bg-surface/80 border border-border text-text px-3 py-2 rounded-theme font-semibold flex items-center gap-1.5 transition-fast cursor-pointer">
            Sort: Descending 
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
            </svg>
          </button>
        </div>
      `;

      const listWrapper = document.getElementById('chapters-list-container');
      if (listWrapper && listWrapper.parentNode) {
        listWrapper.parentNode.insertBefore(filterBar, listWrapper);
      }

      document.getElementById('chapter-sort-btn')?.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        const sortBtn = document.getElementById('chapter-sort-btn');
        if (sortBtn) {
          sortBtn.innerHTML = `
            Sort: ${sortOrder === 'desc' ? 'Descending' : 'Ascending'} 
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              ${sortOrder === 'desc'
              ? '<path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>'
              : '<path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m-5 8l4 4m0 0l4-4m-4 4V10"></path>'}
            </svg>
          `;
        }
        renderChaptersList(loadedChapters);
      });

      document.getElementById('chapter-search-input')?.addEventListener('input', (e) => {
        const q = (e.target as HTMLInputElement).value.toLowerCase().trim();
        const filtered = loadedChapters.filter(entry => {
          const title = (entry.title?.$t || '').toLowerCase();
          return title.includes(q);
        });
        renderChaptersList(filtered);
      });
    }

    loadChaptersPage();
  }
}
