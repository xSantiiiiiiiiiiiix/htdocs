(function () {
  const config = window.SUPABASE_CONFIG || {};
  const url = config.url || 'https://yftqsypswohrkedeoqtk.supabase.co';
  const key = config.anonKey || '';

  if (!window.supabase || !key) {
    console.error('Falta cargar la anon key de Supabase en window.SUPABASE_CONFIG.');
    window.supabaseClient = null;
    return;
  }

  window.supabaseClient = window.supabase.createClient(url, key);
})();
