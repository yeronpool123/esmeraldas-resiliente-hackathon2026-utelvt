export const DEMO_AUTH_ENABLED =
  import.meta.env.VITE_DEMO_AUTH_ENABLED === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_DEMO_AUTH_ENABLED !== 'false');

export const DEMO_SESSION_STORAGE_KEY = 'er2026_demo_session';

export const DEMO_COE_IDENTIFIER = 'operador.coe@esmeraldas.gob.ec';
export const DEMO_PASSWORD = 'COE_Esmeraldas*2026!';
