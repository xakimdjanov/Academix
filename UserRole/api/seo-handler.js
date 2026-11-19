import fs from "fs";
import path from "path";

// Build qilingan index.html (ichida /assets/index-*.js va .css bor) — bir marta olinib keshlanadi
let cachedTemplate = null;

const isBuiltHtml = (h) => typeof h === "string" && /<script[^>]+src="\/assets\//.test(h);

async function loadTemplate(req) {
  if (cachedTemplate) return cachedTemplate;

  // 1) Funksiya bilan birga qo'shilgan dist/index.html (vercel.json -> includeFiles)
  for (const p of [path.join(process.cwd(), "dist", "index.html"), path.join(process.cwd(), "UserRole", "dist", "index.html")]) {
    try {
      const h = fs.readFileSync(p, "utf8");
      if (isBuiltHtml(h)) return (cachedTemplate = h);
    } catch {
      /* keyingisini sinaymiz */
    }
  }

  // 2) Deploy'ning o'zidagi statik /index.html (statik fayllar rewrite'lardan oldin beriladi)
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const r = await fetch(`${proto}://${req.headers.host}/index.html`);
    if (r.ok) {
      const h = await r.text();
      if (isBuiltHtml(h)) return (cachedTemplate = h);
    }
  } catch (err) {
    console.error("Could not fetch /index.html:", err);
  }
  return null;
}

export default async function handler(req, res) {
  const { type, id, slug } = req.query;
  const API_URL = "https://academixbackend-productionn.up.railway.app";
  const SITE_NAME = "Academix | Akademix.uz";

  // 1. Base template. Skriptsiz "bo'sh qobiq" qaytarilsa sahifa oppoq qoladi —
  //    shablon topilmasa SPA'ning o'ziga yo'naltiramiz.
  let html = await loadTemplate(req);
  if (!html) {
    console.error("seo-handler: built index.html not found, serving loader shell");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    // URL o'zgarmaydi: brauzer haqiqiy index.html ni yuklab, sahifani u bilan almashtiradi
    return res
      .status(200)
      .send(
        `<!doctype html><html lang="uz"><head><meta charset="UTF-8" /><title>Academix</title></head><body><script>fetch("/index.html").then(function(r){return r.text()}).then(function(h){document.open();document.write(h);document.close();});</script></body></html>`
      );
  }

  // Helper to escape double quotes for HTML attributes
  const esc = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  try {
    if (type === "article" && id) {
      // ─── Fetch Article ───
      const apiRes = await fetch(`${API_URL}/article/getById/${id}`);
      if (apiRes.ok) {
        const json = await apiRes.json();
        const article = json?.data;

        if (article) {
          const title = `${article.title} | ${SITE_NAME}`;
          const desc = (article.abstract || "").substring(0, 160);
          const keywords = [
            article.title,
            article.category,
            ...(Array.isArray(article.keywords) ? article.keywords : []),
            ...(Array.isArray(article.authors) ? article.authors.map(a => a.fullName) : []),
            article.language,
            "ilmiy maqola",
            "akademix"
          ].filter(Boolean).join(", ");

          const img = article.journal?.banner_url || article.journal?.cover_image_url || "https://akademix.uz/logo.png";
          const url = `https://akademix.uz/articles/${article.slug || id}`;

          // Google Scholar Highwire Press Meta Tags
          let scholarTags = `\n  <!-- Google Scholar Meta Tags -->\n`;
          scholarTags += `  <meta name="citation_title" content="${esc(article.title)}" />\n`;

          if (Array.isArray(article.authors)) {
            article.authors.forEach(auth => {
              if (auth.fullName) {
                scholarTags += `  <meta name="citation_author" content="${esc(auth.fullName)}" />\n`;
                if (auth.orcidId) {
                  scholarTags += `  <meta name="citation_author_orcid" content="${esc(auth.orcidId)}" />\n`;
                }
              }
            });
          }

          if (article.createdAt) {
            const dateObj = new Date(article.createdAt);
            if (!isNaN(dateObj.getTime())) {
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
              const dd = String(dateObj.getDate()).padStart(2, "0");
              scholarTags += `  <meta name="citation_publication_date" content="${yyyy}/${mm}/${dd}" />\n`;
            }
          }

          if (article.journal?.name) {
            scholarTags += `  <meta name="citation_journal_title" content="${esc(article.journal.name)}" />\n`;
          }

          if (article.journal?.issn) {
            scholarTags += `  <meta name="citation_issn" content="${esc(article.journal.issn)}" />\n`;
          }

          if (article.file_url) {
            scholarTags += `  <meta name="citation_pdf_url" content="${esc(article.file_url)}" />\n`;
          }

          if (article.language) {
            scholarTags += `  <meta name="citation_language" content="${esc(article.language)}" />\n`;
          }

          const doi = article.doi || (Array.isArray(article.authors) && article.authors[0]?.doi);
          if (doi) {
            scholarTags += `  <meta name="citation_doi" content="${esc(doi)}" />\n`;
          }

          if (article.bob?.volume) {
            scholarTags += `  <meta name="citation_volume" content="${esc(article.bob.volume)}" />\n`;
          }

          if (article.bob?.name) {
            scholarTags += `  <meta name="citation_issue" content="${esc(article.bob.name)}" />\n`;
          }

          // Strip existing meta tags from base template
          html = html.replace(/<title>[\s\S]*?<\/title>/gi, "");
          html = html.replace(/<meta[^>]*?name=["'](?:title|description|keywords|author|robots|twitter:[^"']+)["'][^>]*?>/gi, "");
          html = html.replace(/<meta[^>]*?property=["']og:[^"']+["'][^>]*?>/gi, "");

          // Inject new tags before </head>
          const newMetaTags = `
  <title>${esc(title)}</title>
  <meta name="title" content="${esc(title)}" />
  <meta name="description" content="${esc(desc)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${esc(SITE_NAME)}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta property="og:locale" content="uz_UZ" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(img)}" />
  <meta name="twitter:url" content="${esc(url)}" />
  ${scholarTags}
</head>
`;
          html = html.replace("</head>", newMetaTags);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
          return res.status(200).send(html);
        }
      }
    } else if (type === "journal" && slug) {
      // ─── Fetch Journal ───
      const apiRes = await fetch(`${API_URL}/journal/getBySlug/${slug}`);
      if (apiRes.ok) {
        const json = await apiRes.json();
        const journal = json?.data?.data || json?.data || json;

        if (journal) {
          const title = `${journal.journal_name || journal.name} | ${SITE_NAME}`;
          const desc = (journal.short_description || journal.description || "").substring(0, 160);
          const keywords = [
            journal.journal_name || journal.name,
            journal.subject_area,
            journal.issn,
            ...(Array.isArray(journal.languages) ? journal.languages : []),
            "akademix",
            "ilmiy jurnal"
          ].filter(Boolean).join(", ");

          const img = journal.banner_url || journal.cover_image_url || "https://akademix.uz/logo.png";
          const url = `https://akademix.uz/journals/${slug}`;

          // Strip existing tags
          html = html.replace(/<title>[\s\S]*?<\/title>/gi, "");
          html = html.replace(/<meta[^>]*?name=["'](?:title|description|keywords|author|robots|twitter:[^"']+)["'][^>]*?>/gi, "");
          html = html.replace(/<meta[^>]*?property=["']og:[^"']+["'][^>]*?>/gi, "");

          const newMetaTags = `
  <title>${esc(title)}</title>
  <meta name="title" content="${esc(title)}" />
  <meta name="description" content="${esc(desc)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${esc(SITE_NAME)}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta property="og:locale" content="uz_UZ" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(img)}" />
  <meta name="twitter:url" content="${esc(url)}" />
</head>
`;
          html = html.replace("</head>", newMetaTags);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
          return res.status(200).send(html);
        }
      }
    }
  } catch (error) {
    console.error("Error in seo-handler API function:", error);
  }

  // 3. Fallback: return unmodified index.html
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}
