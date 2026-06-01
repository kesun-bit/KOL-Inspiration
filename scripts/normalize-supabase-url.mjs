/** Supabase JS expects project root only: https://xxxx.supabase.co (no /rest/v1 suffix). */
export function normalizeSupabaseUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  try {
    const parsed = new URL(value);
    return parsed.origin.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function readSupabaseEnv() {
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
