/* Habesha Agenagn public Supabase browser configuration.
   Safe for client-side use with Row Level Security enabled.
   Never place a service-role or secret key in this file. */
(function () {
  'use strict';

  const PROJECT_URL = 'https://sesidgwxwtawfpoaocnr.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_-D3KzyE2vqMHQHmjj0LBFA_tKK-iLoC';

  window.SUPABASE_URL = PROJECT_URL;
  window.SUPABASE_ANON_KEY = PUBLISHABLE_KEY;
  window.HABESHA_SUPABASE_CONFIG = {
    url: PROJECT_URL,
    anonKey: PUBLISHABLE_KEY
  };
})();
