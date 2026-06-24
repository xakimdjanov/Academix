export default async function handler(req, res) {
  const BASE_URL = "https://akademix.uz";
  const API_URL  = "https://academixbackend-productionn.up.railway.app";
  const today    = new Date().toISOString().split("T")[0];

  async function safeFetch(url) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) return [];
      const json = await response.json();
      return json?.data || json?.articles || (Array.isArray(json) ? json : []);
    } catch (e) {
      console.error(`Error fetching ${url}:`, e);
      return [];
    }
  }

  function urlEntry({ loc, lastmod = today, changefreq = "monthly", priority = "0.80" }) {
    return (
      `  <url>\n` +
      `    <loc>${loc}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`
    );
  }

  // 1. Static pages
  const staticEntries = [
    { loc: `${BASE_URL}/`,        changefreq: "daily",   priority: "1.00" },
    { loc: `${BASE_URL}/journals`, changefreq: "daily",   priority: "0.90" },
    { loc: `${BASE_URL}/articles`, changefreq: "daily",   priority: "0.90" },
    { loc: `${BASE_URL}/pricing`,  changefreq: "monthly", priority: "0.70" },
    { loc: `${BASE_URL}/about`,    changefreq: "monthly", priority: "0.70" },
    { loc: `${BASE_URL}/contact`,  changefreq: "monthly", priority: "0.60" },
  ].map(urlEntry);

  // 2. Dynamic journals
  const rawJournals = await safeFetch(`${API_URL}/journal/getAll`);
  const journals = Array.isArray(rawJournals) ? rawJournals : [];
  const journalEntries = journals
    .filter(j => j.status === "Active" || j.status === "active")
    .map(j => {
      const path = j.slug || encodeURIComponent(j.name || j.journal_name || "");
      const lastmod = j.updatedAt ? new Date(j.updatedAt).toISOString().split("T")[0] : today;
      return urlEntry({
        loc: `${BASE_URL}/journals/${path}`,
        lastmod,
        changefreq: "weekly",
        priority: "0.85",
      });
    });

  // 3. Dynamic articles
  const rawArticles = await safeFetch(`${API_URL}/article/getAll`);
  const articles = Array.isArray(rawArticles) ? rawArticles : [];
  const articleEntries = articles
    .filter(a => a.status === "Published")
    .map(a => {
      const lastmod = a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : today;
      return urlEntry({
        loc: `${BASE_URL}/articles/${a.slug || a.id}`,
        lastmod,
        changefreq: "monthly",
        priority: "0.80",
      });
    });

  // Combine
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <!-- Static Core Pages -->`,
    staticEntries.join("\n"),
    ``,
    `  <!-- Active Journals (${journalEntries.length}) -->`,
    journalEntries.join("\n"),
    ``,
    `  <!-- Published Articles (${articleEntries.length}) -->`,
    articleEntries.join("\n"),
    `</urlset>`,
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Cache in Edge CDN for 30 minutes, revalidate in background
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");
  return res.status(200).send(xml);
}
