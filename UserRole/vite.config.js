import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://akademix.uz';
const API_URL  = 'https://academixbackend-productionn.up.railway.app';
const today    = new Date().toISOString().split('T')[0];

async function safeFetch(url) {
  try {
    const { default: fetch } = await import('node-fetch').catch(() => ({ default: globalThis.fetch }));
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || json?.articles || (Array.isArray(json) ? json : []);
  } catch {
    return [];
  }
}

function makeUrl(loc, lastmod = today, changefreq = 'monthly', priority = '0.80') {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function buildSitemap(outDir) {
  const staticPages = [
    makeUrl(`${BASE_URL}/`,         today, 'daily',   '1.00'),
    makeUrl(`${BASE_URL}/journals`, today, 'daily',   '0.90'),
    makeUrl(`${BASE_URL}/articles`, today, 'daily',   '0.90'),
    makeUrl(`${BASE_URL}/pricing`,  today, 'monthly', '0.70'),
    makeUrl(`${BASE_URL}/about`,    today, 'monthly', '0.70'),
    makeUrl(`${BASE_URL}/contact`,  today, 'monthly', '0.60'),
  ];

  const rawJournals = await safeFetch(`${API_URL}/journal/getAll`);
  const journals = Array.isArray(rawJournals) ? rawJournals : [];
  const journalUrls = journals
    .filter(j => j.status === 'Active' || j.status === 'active')
    .map(j => {
      const slug = j.slug || encodeURIComponent(j.name || j.journal_name || '');
      const lm   = j.updatedAt ? new Date(j.updatedAt).toISOString().split('T')[0] : today;
      return makeUrl(`${BASE_URL}/journals/${slug}`, lm, 'weekly', '0.85');
    });

  const rawArticles = await safeFetch(`${API_URL}/article/getAll`);
  const articles = Array.isArray(rawArticles) ? rawArticles : [];
  const articleUrls = articles
    .filter(a => a.status === 'Published')
    .map(a => {
      const lm = a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : today;
      return makeUrl(`${BASE_URL}/articles/${a.id}`, lm, 'monthly', '0.80');
    });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    '  <!-- Asosiy sahifalar -->',
    staticPages.join('\n'),
    '',
    `  <!-- Jurnallar: ${journalUrls.length} ta -->`,
    ...journalUrls,
    '',
    `  <!-- Maqolalar: ${articleUrls.length} ta -->`,
    ...articleUrls,
    '',
    '</urlset>',
  ].join('\n');

  const dest = path.resolve(outDir, 'sitemap.xml');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, xml, 'utf-8');
  console.log(
    `\x1b[32m✓\x1b[0m sitemap.xml yangilandi` +
    ` (${staticPages.length} statik + ${journalUrls.length} jurnal + ${articleUrls.length} maqola)`
  );
}

/** Vite plugin: dev server ishga tushganda va build vaqtida sitemap hosil qiladi */
function sitemapPlugin() {
  return {
    name: 'vite-plugin-sitemap',
    // npm run dev — server tayyor bo'lgandan keyin
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        buildSitemap(path.resolve(__dirname, 'public'));
      });
    },
    // npm run build — barcha assetlar yig'ilgandan keyin
    async closeBundle() {
      await buildSitemap(path.resolve(__dirname, 'dist'));
      // dist/sitemap.xml ham public/sitemap.xml ni yangilaydi
      await buildSitemap(path.resolve(__dirname, 'public'));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitemapPlugin()],
});

