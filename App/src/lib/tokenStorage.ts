// ==== BELANGRIJK!! =======================================================================================================================================================================
//
// Later access token in-memory opslaan en refresh token in httpOnly cookie (om XSS te voorkomen). Nu beide in localStorage voor development gemak, maar dit is niet veilig voor productie.
//
// ==========================================================================================================================================================================================
const ACCESS = 'vuur.access';
const REFRESH = 'vuur.refresh';

// Pub/sub zodat React-componenten mee kunnen re-renderen als de tokens veranderen.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS),
  getRefresh: () => localStorage.getItem(REFRESH),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
    notify();
  },
  clear: () => {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    notify();
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};
