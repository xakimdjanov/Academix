# Academix — frontend

[akademix.uz](https://akademix.uz) — ilmiy jurnallar va maqolalar platformasi.
Bu repozitoriyda platformaning to'rtta React ilovasi bor. Backend alohida repozitoriyda (`academix-backend`, Node.js + Express + PostgreSQL).

## Ilovalar

| Papka | Kim uchun | Vazifasi |
|---|---|---|
| `UserRole/` | o'quvchi va muallif | Asosiy sayt: jurnallar, sonlar arxivi, maqolalar, maqola yuborish, shaxsiy kabinet |
| `JournalAdmin/` | jurnal admini | Jurnal, sonlar (Bob), maqolalar, tahririyat va sahifalarni boshqarish |
| `SuperAdmin/` | platforma admini | Jurnal adminlari, jurnallar va maqolalarni tasdiqlash, ruxsatlar |
| `Editor/` | muharrir / taqrizchi | Biriktirilgan maqolalarni ko'rib chiqish |

Texnologiyalar: React 19, Vite, Tailwind CSS 3, React Router 7, Axios.

## Ishga tushirish

Har bir ilova mustaqil. Masalan, asosiy sayt:

```bash
cd UserRole
npm install
npm run dev        # http://localhost:5173
```

`.env` (har bir ilova papkasida):

```env
VITE_API_BASE_URL=https://academixbackend-production.up.railway.app
# lokal backend bilan ishlash uchun:
# VITE_API_BASE_URL=http://localhost:5000
```

Lokal backend ishlatilsa, u `5000`-portda ishlab turishi kerak (`academix-backend` papkasida `npm run local`).
Aks holda brauzerda `ERR_CONNECTION_REFUSED` / `Network Error` chiqadi.

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | Dev server (`UserRole`da avval `sitemap.xml` yangilanadi) |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Build natijasini lokal ko'rish |
| `npm run lint` | ESLint |

Deploy — Vercel, har bir ilovada `vercel.json` bor.

## Ma'lumotlar tuzilmasi

```
JournalAdmin ──< Journal ──< Bob (son: yil, nom, PDF) ──< Article
```

- Jurnal sahifasida sonlar faqat jurnal adminiga `allow_bob_creation` ruxsati berilganda ko'rinadi.
- Saytda faqat `status = "Published"`, `is_approved_by_admin = true` va `is_active = true` bo'lgan maqolalar chiqadi.

## Jurnal va maqola sahifalari dizayni

`UserRole/src/pages/JournalDetail.jsx` va `ArticleDetails.jsx` bosma jurnal uslubida qurilgan:

- **Jurnal sahifasi** — muqova (so'nggi son), faktlar (ISSN, tillar, sonlar, maqolalar), sonlar arxivi.
  Arxiv chap tomonda yillar va sonlar ro'yxati, o'ngda tanlangan sonning mundarijasidan iborat.
  Tanlangan son URL'da saqlanadi: `/journals/<slug>?son=<id>`. Mundarijada qidiruv bor.
- **Maqola sahifasi** — sarlavha, mualliflar, PDF tugmasi, annotatsiya va kalit so'zlar, mualliflar (ORCID havolasi bilan),
  GOST/APA iqtibos (nusxalash bilan), muhokama. Yon tomonda son muqovasi va sonning to'liq PDF'i.
- `src/components/IssueCover.jsx` — son muqovasi. Rasm bo'lmasa son raqami bilan tipografik muqova chizadi.

Dizayn tokenlari (`tailwind.config.js`, `ax-*`):

| Token | Qiymat | Ishlatilishi |
|---|---|---|
| `ax-ink` | `#002147` | sarlavhalar, asosiy tugmalar |
| `ax-firuza` | `#127C82` | havolalar, faol holat, fokus |
| `ax-paper` | `#F4F6F9` | sahifa foni |
| `ax-rule` | `#DCE1E8` | chegaralar |
| `ax-text` / `ax-muted` | `#1A2433` / `#5A6475` | asosiy / ikkinchi darajali matn |

Shriftlar: sarlavha va annotatsiya uchun **Source Serif 4** (lotin va kirill), interfeys uchun **Inter**.
`src/index.css`dagi global `* { font-family: sans-serif }` qoidasi tufayli bu shriftlar faqat `.ax-page` ichida ishlaydi
(`.ax-serif` — serif, `.ax-num` — jadval raqamlari).
