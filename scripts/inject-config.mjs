import { writeFileSync } from 'fs';
import { readSupabaseEnv } from './normalize-supabase-url.mjs';

const { url, key } = readSupabaseEnv();

const config = {
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: key,
  STORAGE_BUCKET: 'creator_bucket',
};

writeFileSync(
  'config.js',
  `/* Auto-generated at build — do not edit */\nwindow.CREATORLOOK_CONFIG = ${JSON.stringify(config, null, 2)};\n`
);

console.log('Wrote config.js', url ? `(Supabase URL: ${url})` : '(WARNING: missing Supabase URL)');
