export function initMenu(): void {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!navMenu.contains(target) && !menuToggle.contains(target)) {
        navMenu.classList.remove('active');
      }
    });
  }
}
