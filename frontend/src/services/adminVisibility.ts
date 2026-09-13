import { authService } from './authService';

let observer: MutationObserver | null = null;
let refreshTimer: number | null = null;

const setAdminLinksVisible = (visible: boolean) => {
  document.querySelectorAll<HTMLAnchorElement>('a[href="/admin"]').forEach((link) => {
    link.hidden = !visible;
    link.setAttribute('aria-hidden', String(!visible));
  });
};

const refresh = async () => {
  try {
    const isAdmin = await authService.isAdmin();
    setAdminLinksVisible(isAdmin);
  } catch {
    setAdminLinksVisible(false);
  }
};

export const initAdminVisibility = () => {
  if (typeof document === 'undefined') return () => {};

  setAdminLinksVisible(false);
  void refresh();

  const handleAuthChange = () => {
    void refresh();
  };

  window.addEventListener('auth-change', handleAuthChange);

  observer = new MutationObserver(() => {
    if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      void refresh();
    }, 50);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    window.removeEventListener('auth-change', handleAuthChange);
    observer?.disconnect();
    observer = null;
    if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    refreshTimer = null;
  };
};
