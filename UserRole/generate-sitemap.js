/**
 * generate-sitemap.js
 * =====================
 * Build vaqtida ishga tushuvchi script.
 * Backend API-dan barcha aktiv jurnallar va nashr qilingan maqolalarni olib,
 * public/sitemap.xml faylni avtomatik tarzda hosil qiladi.
 * 
 * Ishlatilishi: node generate-sitemap.js
 * Yoki: npm run build  (package.json ichida pre-build holatida ulangan)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://akademix.uz";
const API_URL  = "https://academixbackend-production.up.railway.app";
const OUTPUT   = path.join(__dirname, "public", "sitemap.xml");
const today    = new Date().toISOString().split("T")[0];

// ──────────────────────────────────────────────
// Helper: safe fetch that never crashes the build
// ──────────────────────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || json?.articles || json || [];
  } catch (e) {
    console.warn(`⚠️  ${url} ga ulanib bo'lmadi (${e.message}). Bo'sh ro'yxat qaytarildi.`);
    return [];
  }
}

// ──────────────────────────────────────────────
// XML helpers
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function generate() {
  console.log("🗺️  Sitemap generatsiya boshlanmoqda...");

  // 1. Static core pages
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

  // 4. Build full XML
  const allEntries = [
    `  <!-- ===== Asosiy sahifalar ===== -->`,
    ...staticEntries,
    ``,
    `  <!-- ===== Jurnallar: ${journalEntries.length} ta ===== -->`,
    ...journalEntries,
    ``,
    `  <!-- ===== Maqolalar: ${articleEntries.length} ta ===== -->`,
    ...articleEntries,
  ];

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ``,
    allEntries.join("\n"),
    ``,
    `</urlset>`,
  ].join("\n");

  // 5. Write to public/sitemap.xml
  fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
  fs.writeFileSync(OUTPUT, xml, "utf-8");

  console.log(`✅ Sitemap yaratildi → ${OUTPUT}`);
  console.log(`   📂 Statik sahifalar : ${staticEntries.length}`);
  console.log(`   📰 Jurnallar        : ${journalEntries.length}`);
  console.log(`   📄 Maqolalar        : ${articleEntries.length}`);
  console.log(`   📦 Jami URL'lar     : ${staticEntries.length + journalEntries.length + articleEntries.length}`);
}

generate();
