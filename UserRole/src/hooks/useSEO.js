import { useEffect } from "react";

/**
 * useSEO — Dynamic SEO meta tag manager for akademix.uz
 * 
 * Google, Bing, Yandex botlari JavaScript-ni bajarib, shu teglarni o'qiydi.
 * Har bir sahifa yuklanganda title, description, keywords, OG va Twitter card
 * meta teglari avtomatik yangilanadi — bu Google qidiruvida chiqish uchun asosiy mexanizm.
 *
 * @param {string} title       — Sahifa sarlavhasi (e.g. jurnal nomi, maqola sarlavhasi)
 * @param {string} description — Qisqacha tavsif (160 belgigacha, Google snippet uchun)
 * @param {string} keywords    — Kalit so'zlar, vergul bilan ajratilgan
 * @param {string} image       — Preview rasm URL (OG va Twitter Card uchun)
 * @param {string} url         — Canonical URL (https://akademix.uz/...)
 * @param {string} type        — OG type: 'website' | 'article' (default: 'website')
 */
export const useSEO = ({ title, description, keywords, image, url, type = "website" }) => {
  useEffect(() => {
    const SITE_NAME = "Academix";
    const FALLBACK_DESC =
      "Academix — O'zbekistonning eng ilg'or ilmiy jurnallari, maqolalari va tadqiqotlari platformasi. " +
      "Ilmiy ishlaringizni xalqaro darajada nashr qiling, o'qing va taqrizdan o'tkazing.";
    const FALLBACK_KEYS =
      "ilmiy maqolalar, jurnallar, akademik nashrlar, tadqiqotlar, o'zbekiston ilmiy ishlari, " +
      "akademix, akademix.uz, ochiq jurnallar, dissertatsiya, ilmiy ish";
    const FALLBACK_IMG = "https://akademix.uz/logo.png";
    const FALLBACK_URL = "https://akademix.uz";

    const finalTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Ilmiy tadqiqotlar platformasi`;
    const finalDesc  = description || FALLBACK_DESC;
    const finalKeys  = keywords    || FALLBACK_KEYS;
    const finalImg   = image       || FALLBACK_IMG;
    const finalUrl   = url         || FALLBACK_URL;

    // ── 1. Browser tab title ──────────────────────────────────────────
    document.title = finalTitle;

    // ── Helper: upsert any <meta> tag ─────────────────────────────────
    const setMeta = (attr, attrValue, contentValue) => {
      if (!contentValue) return;
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentValue); // always overwrite
    };

    // ── Helper: upsert <link rel="canonical"> ─────────────────────────
    const setCanonical = (href) => {
      let el = document.querySelector('link[rel="canonical"]');
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── 2. Standard SEO ──────────────────────────────────────────────
    setMeta("name", "title",       finalTitle);
    setMeta("name", "description", finalDesc);
    setMeta("name", "keywords",    finalKeys);
    setMeta("name", "author",      SITE_NAME);
    setMeta("name", "robots",      "index, follow");

    // ── 3. Canonical URL ─────────────────────────────────────────────
    setCanonical(finalUrl);

    // ── 4. Open Graph (Telegram, Facebook, LinkedIn) ──────────────────
    setMeta("property", "og:title",       finalTitle);
    setMeta("property", "og:description", finalDesc);
    setMeta("property", "og:type",        type);
    setMeta("property", "og:url",         finalUrl);
    setMeta("property", "og:image",       finalImg);
    setMeta("property", "og:site_name",   SITE_NAME);
    setMeta("property", "og:locale",      "uz_UZ");

    // ── 5. Twitter Card ───────────────────────────────────────────────
    setMeta("name", "twitter:card",        "summary_large_image");
    setMeta("name", "twitter:title",       finalTitle);
    setMeta("name", "twitter:description", finalDesc);
    setMeta("name", "twitter:image",       finalImg);
    setMeta("name", "twitter:site",        "@academixuz");

    // ── 6. Article-specific (only when type==="article") ─────────────
    if (type === "article") {
      setMeta("property", "article:publisher", "https://akademix.uz");
    }

  }, [title, description, keywords, image, url, type]);
};
