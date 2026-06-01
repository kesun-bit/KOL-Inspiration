const { normalizeSupabaseUrl, readSupabaseEnv } = require('../scripts/normalize-supabase-url.cjs');

module.exports = (req, res) => {
  const { url, key } = readSupabaseEnv();
  const config = {
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: key,
    STORAGE_BUCKET: 'creator_bucket',
  };

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).send(`window.CREATORLOOK_CONFIG = ${JSON.stringify(config)};`);
};
