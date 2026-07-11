export function initShare() {
  // Copy link share button helper
  const copyBtn = document.getElementById('share-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href).then(() => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg class="w-3.5 h-3.5 stroke-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
        `;
        copyBtn.classList.add('bg-emerald-500/10', 'text-emerald-400');
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.classList.remove('bg-emerald-500/10', 'text-emerald-400');
        }, 2000);
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    });
  }

  // Native web share API helper
  const shareBtn = document.getElementById('share-native-btn');
  if (shareBtn) {
    if (navigator.share) {
      shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(err => {
          console.warn('Native share failed or dismissed:', err);
        });
      });
    } else {
      shareBtn.style.display = 'none';
    }
  }
}
