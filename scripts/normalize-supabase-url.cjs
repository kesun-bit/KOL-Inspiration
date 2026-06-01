/** Supabase JS expects project root only: https://xxxx.supabase.co (no /rest/v1 suffix). */
function normalizeSupabaseUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  try {
    const parsed = new URL(value);
    return parsed.origin.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function readSupabaseEnv() {
  const url = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  );
  const key = String(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  return { url, key };
}

function validateSupabaseAnonKey(raw) {
  const key = String(raw || '').trim();
  if (!key) return { key: '', error: 'empty' };
  if (/^https?:\/\//i.test(key) || key.includes('.supabase.co')) {
    return { key: '', error: 'url_as_key' };
  }
  if (key.startsWith('sb_secret_')) {
    return { key: '', error: 'secret_key' };
  }
  const ok = key.startsWith('eyJ') || key.startsWith('sb_publishable_');
  if (!ok) return { key: '', error: 'format' };
  return { key, error: null };
}

module.exports = { normalizeSupabaseUrl, readSupabaseEnv, validateSupabaseAnonKey };
