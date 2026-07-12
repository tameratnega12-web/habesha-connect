/* Habesha Agenagn Supabase configuration loader.
   This file intentionally does not contain private service-role credentials.
   Keep the existing public project URL and anon key here when deploying. */
(function () {
  'use strict';

  // Preserve values already injected by the deployment environment.
  const injected = window.HABESHA_SUPABASE_CONFIG || {};
  const storedUrl = localStorage.getItem('hc_supabase_url') || '';
  const storedAnonKey = localStorage.getItem('hc_supabase_anon_key') || '';

  window.SUPABASE_URL = window.SUPABASE_URL || injected.url || storedUrl;
  window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || injected.anonKey || storedAnonKey;

  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase public URL/key are not configured. Preserve your current js/supabase-config.js values before deployment.');
  }
})();
