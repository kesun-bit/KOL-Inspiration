import { writeFileSync } from 'fs';

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const config = {
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: key,
  STORAGE_BUCKET: 'creator_bucket',
};

writeFileSync(
  'config.js',
  `/* Auto-generated at build — do not edit */\nwindow.CREATORLOOK_CONFIG = ${JSON.stringify(config, null, 2)};\n`
);

console.log('Wrote config.js', url ? '(Supabase URL set)' : '(WARNING: missing Supabase URL)');
