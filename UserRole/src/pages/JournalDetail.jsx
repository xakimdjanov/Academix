import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiSend, FiLink, FiDownload, FiSearch } from "react-icons/fi";
import { journalService, articleService, settingsService, bobService, incrementArticleViewOnce } from "../services/api";
import { useSEO } from "../hooks/useSEO";
import toast, { Toaster } from "react-hot-toast";
import { formatTitle } from "../utils/textFormatter";
import { useLanguage } from "../context/LanguageContext";
import IssueCover, { HeroBackdrop } from "../components/IssueCover";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-firuza focus-visible:ring-offset-2";
const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-firuza-light focus-visible:ring-offset-2 focus-visible:ring-offset-[#002147]";
// Saytdagi kartochka uslubi (Home, Journals, Articles sahifalari bilan bir xil)
const card = "rounded-3xl border border-gray-100 bg-white shadow-sm";

const LOCALES = { uz: "uz-UZ", en: "en-GB", ru: "ru-RU" };
const LANG_NAMES = {
  uzbek: ["O'zbek", "Uzbek", "Узбекский"],
  usbek: ["O'zbek", "Uzbek", "Узбекский"],
  russian: ["Rus", "Russian", "Русский"],
  english: ["Ingliz", "English", "Английский"],
};

// "2026 5(19)-son" -> 19 (sonlarni tartiblash uchun)
const issueOrder = (b) => {
  const m = String(b?.name || "").match(/\((\d+)\)/);
  return m ? Number(m[1]) : 0;
};
const sortIssues = (list) =>
  [...list].sort((a, b) => (Number(b.year) - Number(a.year)) || (issueOrder(b) - issueOrder(a)) || (b.id - a.id));

const authorNames = (authors) => {
  if (!authors) return "";
  if (typeof authors === "string") return authors;
  if (Array.isArray(authors)) return authors.map((x) => x?.fullName || x?.name || x).filter(Boolean).join(", ");
  return "";
};

const useL = () => {
  const { language } = useLanguage();
  return (uz, en, ru) => (language === "uz" ? uz : language === "en" ? en : ru);
};

/* ---------- Mundarija qatori ---------- */
const ArticleEntry = ({ article }) => {
  const { language, translateCategory } = useLanguage();
  const L = useL();

  useEffect(() => {
    if (article.id) incrementArticleViewOnce(article.id);
  }, [article.id]);

  const authors = authorNames(article.authors);
  const date = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString(LOCALES[language] || "uz-UZ", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <li className="py-5">
      <Link
        to={`/articles/${article.slug || article._id || article.id}`}
        className={`ax-serif block rounded-sm text-[1.125rem] leading-snug text-ax-text hover:text-ax-firuza ${focusRing}`}
      >
        {formatTitle(article.title)}
      </Link>
      {authors && <p className="mt-1.5 text-sm text-ax-muted">{authors}</p>}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ax-muted">
        {date && <span className="ax-num">{date}</span>}
        <span className="ax-num inline-flex items-center gap-1" title={L("Ko'rishlar", "Views", "Просмотры")}>
          <FiEye size={13} aria-hidden="true" /> {article.view_count || 0}
        </span>
        {article.category && <span>{translateCategory(article.category)}</span>}
        {article.file_url && (
          <a
            href={article.file_url}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1 rounded-sm font-medium text-ax-firuza hover:text-ax-firuza-deep ${focusRing}`}
          >
            <FiDownload size={13} aria-hidden="true" /> PDF
          </a>
        )}
      </div>
    </li>
  );
};

/* ---------- Qidiruv bilan maqolalar ro'yxati ---------- */
const ArticleList = ({ articles, emptyText }) => {
  const L = useL();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = query
    ? articles.filter((a) => `${a.title} ${authorNames(a.authors)}`.toLowerCase().includes(query))
    : articles;

  if (articles.length === 0) {
    return <p className="py-10 text-center text-ax-muted">{emptyText}</p>;
  }

  return (
    <>
      {articles.length > 8 && (
        <label className="relative mt-5 block max-w-md">
          <span className="sr-only">{L("Qidirish", "Search", "Поиск")}</span>
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L("Sarlavha yoki muallif bo'yicha qidirish", "Search by title or author", "Поиск по названию или автору")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-ax-text placeholder:text-gray-400 focus:border-ax-firuza focus:bg-white focus:outline-none focus:ring-4 focus:ring-ax-firuza/10"
          />
        </label>
      )}
      {shown.length === 0 ? (
        <p className="py-10 text-center text-ax-muted">
          {L(`"${q}" bo'yicha maqola topilmadi.`, `No articles match "${q}".`, `По запросу «${q}» статьи не найдены.`)}
        </p>
      ) : (
        <ol className="divide-y divide-gray-100">
          {shown.map((a) => (
            <ArticleEntry key={a._id || a.id} article={a} />
          ))}
        </ol>
      )}
    </>
  );
};

/* ---------- Arxiv: yillar/sonlar + tanlangan son mundarijasi ---------- */
const Archive = ({ bobs, articles }) => {
  const { t } = useLanguage();
  const L = useL();
  const [params, setParams] = useSearchParams();

  const byBob = useMemo(() => {
    const map = {};
    for (const a of articles) (map[a.bob_id ?? "none"] ||= []).push(a);
    return map;
  }, [articles]);

  const issues = useMemo(() => {
    const list = sortIssues(bobs);
    if (byBob.none?.length) list.push({ id: "none", name: L("Songa biriktirilmagan", "Not assigned to an issue", "Вне выпусков"), year: null });
    return list;
  }, [bobs, byBob]); // eslint-disable-line react-hooks/exhaustive-deps

  const years = useMemo(() => {
    const groups = [];
    for (const b of issues) {
      const key = b.year ?? "other";
      let g = groups.find((x) => x.key === key);
      if (!g) groups.push((g = { key, label: b.year ?? L("Boshqa", "Other", "Другое"), items: [] }));
      g.items.push(b);
    }
    return groups;
  }, [issues]); // eslint-disable-line react-hooks/exhaustive-deps

  if (issues.length === 0) {
    return <div className={`${card} p-12 text-center text-ax-muted`}>{t("journals.no_bobs")}</div>;
  }

  const fallback = issues.find((b) => byBob[b.id]?.length) || issues[0];
  const selected = issues.find((b) => String(b.id) === params.get("son")) || fallback;
  const select = (id) => setParams((p) => { p.set("son", id); return p; }, { replace: true });
  const list = byBob[selected.id] || [];

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Yillar va sonlar */}
      <nav aria-label={L("Jurnal sonlari", "Journal issues", "Выпуски журнала")} className="hidden lg:block">
        <div className={`${card} sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto p-5 scrollbar-sleek`}>
          {years.map((g) => (
            <section key={g.key} className="mb-5 last:mb-0">
              <h3 className="ax-serif ax-num mb-1.5 px-3 text-lg font-semibold text-ax-ink">{g.label}</h3>
              <ul className="space-y-0.5">
                {g.items.map((b) => {
                  const active = b.id === selected.id;
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => select(b.id)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm ${focusRing} ${
                          active ? "bg-[#002147] font-medium text-white" : "text-ax-muted hover:bg-gray-50 hover:text-ax-ink"
                        }`}
                      >
                        <span>{b.name}</span>
                        <span className={`ax-num text-xs ${active ? "text-white/70" : ""}`}>{byBob[b.id]?.length || 0}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      {/* Tanlangan son mundarijasi */}
      <div className={`${card} min-w-0 p-6 sm:p-8`}>
        <label className="mb-6 block lg:hidden">
          <span className="mb-1.5 block text-sm text-ax-muted">{L("Sonni tanlang", "Choose an issue", "Выберите выпуск")}</span>
          <select
            value={selected.id}
            onChange={(e) => select(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ax-text focus:border-ax-firuza focus:outline-none focus:ring-4 focus:ring-ax-firuza/10"
          >
            {years.map((g) => (
              <optgroup key={g.key} label={String(g.label)}>
                {g.items.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({byBob[b.id]?.length || 0})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="ax-serif text-2xl font-semibold leading-tight text-ax-ink sm:text-[2rem]">{selected.name}</h2>
            <p className="ax-num mt-1 text-sm text-ax-muted">
              {L(`${list.length} ta maqola`, `${list.length} articles`, `Статей: ${list.length}`)}
            </p>
          </div>
          {selected.file_url && (
            <a
              href={selected.file_url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl bg-[#002147] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#002147]/10 hover:bg-[#00336b] ${focusRing}`}
            >
              <FiDownload aria-hidden="true" /> {t("journals.issue_pdf")}
            </a>
          )}
        </div>

        <ArticleList
          key={selected.id}
          articles={list}
          emptyText={
            selected.file_url
              ? L("Bu son faqat PDF ko'rinishida mavjud.", "This issue is available as a PDF only.", "Этот выпуск доступен только в PDF.")
              : t("journals.no_articles_bob")
          }
        />
      </div>
    </div>
  );
};

/* ---------- Matnli bo'limlar uchun kartochka ---------- */
const Sheet = ({ title, children }) => (
  <article className={`${card} p-8 md:p-12`}>
    <h2 className="ax-serif mb-6 text-2xl font-semibold text-ax-ink">{title}</h2>
    <div className="max-w-[68ch] text-ax-text">{children}</div>
  </article>
);

const TEMPLATE = {
  uz: {
    intro: "Maqolani yuborishdan oldin quyidagilarni tayyorlab qo'ying:",
    sections: [
      { title: "Maqola ma'lumotlari", items: [["Sarlavha", "maqolaning to'liq va aniq sarlavhasi."], ["Annotatsiya", "maqolaning qisqacha mazmuni va natijalari."], ["Kalit so'zlar", "mazmunni ochib beruvchi kamida bitta kalit so'z."], ["Toifa", "maqola turi (tadqiqot maqolasi, sharh va h.k.)."], ["Til", "maqola yozilgan til."]] },
      { title: "Mualliflar", note: "Har bir muallif uchun (birinchi muallif asosiy hisoblanadi):", items: [["To'liq ismi", "ism va familiya."], ["Telefon raqami", "bog'lanish uchun."], ["ORCID ID", "masalan, 0000-0000-0000-0000."], ["Rasm", "5 MB gacha sifatli rasm."]] },
      { title: "Maqola fayli", items: [["Format", "PDF, DOC yoki DOCX."], ["Hajm", "20 MB dan oshmasin."], ["Rasmiylashtirish", "shrift, hoshiya va adabiyotlar ro'yxati jurnal talablariga mos bo'lsin."]] },
    ],
  },
  en: {
    intro: "Prepare the following before you submit an article:",
    sections: [
      { title: "Article details", items: [["Title", "the full, precise title."], ["Abstract", "a short summary of the content and results."], ["Keywords", "at least one keyword describing the article."], ["Category", "article type (research article, review, etc.)."], ["Language", "the language the article is written in."]] },
      { title: "Authors", note: "For every author (the first author is the corresponding author):", items: [["Full name", "first name and surname."], ["Phone number", "for contact."], ["ORCID ID", "e.g. 0000-0000-0000-0000."], ["Photo", "a clear photo up to 5 MB."]] },
      { title: "Article file", items: [["Format", "PDF, DOC or DOCX."], ["Size", "up to 20 MB."], ["Formatting", "font, margins and references follow the journal requirements."]] },
    ],
  },
  ru: {
    intro: "Перед отправкой статьи подготовьте следующее:",
    sections: [
      { title: "Данные статьи", items: [["Название", "полное и точное название статьи."], ["Аннотация", "краткое содержание и результаты."], ["Ключевые слова", "не менее одного ключевого слова."], ["Категория", "тип статьи (исследование, обзор и т. д.)."], ["Язык", "язык статьи."]] },
      { title: "Авторы", note: "Для каждого автора (первый автор — основной):", items: [["Ф.И.О.", "имя и фамилия."], ["Телефон", "для связи."], ["ORCID ID", "например, 0000-0000-0000-0000."], ["Фото", "качественное фото до 5 МБ."]] },
      { title: "Файл статьи", items: [["Формат", "PDF, DOC или DOCX."], ["Размер", "не более 20 МБ."], ["Оформление", "шрифт, поля и список литературы по требованиям журнала."]] },
    ],
  },
};

const Fact = ({ label, children }) => (
  <div>
    <dt className="text-[13px] text-blue-100/60">{label}</dt>
    <dd className="ax-num mt-0.5 text-[15px] font-medium text-white">{children}</dd>
  </div>
);

const Tab = ({ active, onClick, children }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold ${focusRing} ${
      active ? "bg-[#002147] text-white shadow-lg shadow-[#002147]/15" : "text-gray-500 hover:bg-gray-50 hover:text-ax-ink"
    }`}
  >
    {children}
  </button>
);

/* ============================================================ */
const JournalDetail = () => {
  const { slug } = useParams();
  const [journal, setJournal] = useState(null);
  const [settings, setSettings] = useState([]);
  const [articles, setArticles] = useState([]);
  const [bobs, setBobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("archive");
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();
  const L = useL();

  const name = journal ? formatTitle(journal.journal_name || journal.name) : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(t("journals.shared"));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(
      L(
        `Academix platformasida ilmiy jurnal:\n\n${name}\n\n`,
        `Scientific journal on Academix:\n\n${name}\n\n`,
        `Научный журнал на платформе Academix:\n\n${name}\n\n`
      )
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`, "_blank");
  };

  useSEO({
    title: journal ? journal.journal_name || journal.name : undefined,
    description: journal
      ? [journal.short_description || journal.description || "", journal.aims_scope || ""].filter(Boolean).join(" ").substring(0, 250)
      : undefined,
    keywords: journal
      ? [journal.journal_name || journal.name, journal.subject_area, journal.issn, journal.languages?.join(", "), "akademix", "akademix.uz", "ilmiy jurnal", "o'zbekiston jurnali"]
          .filter(Boolean)
          .join(", ")
      : undefined,
    image: journal?.banner_url || journal?.cover_image_url,
    url: `https://akademix.uz/journals/${slug}`,
    type: "website",
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const jRes = await journalService.getBySlug(slug);
        const jData = jRes?.data?.data || jRes?.data;
        setJournal(jData);

        if (jData) {
          const jId = jData.id || jData._id;

          const aRes = await articleService.getAll();
          const all = Array.isArray(aRes?.data?.data) ? aRes.data.data : Array.isArray(aRes?.data) ? aRes.data : [];
          setArticles(
            all
              .filter(
                (a) =>
                  (String(a.journal_id) === String(jId) || String(a.journal?.id) === String(jId)) &&
                  a.status === "Published" &&
                  a.is_approved_by_admin &&
                  a.is_active
              )
              .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
          );

          const sRes = await settingsService.getAll();
          const allSettings = Array.isArray(sRes?.data?.data) ? sRes.data.data : Array.isArray(sRes?.data) ? sRes.data : [];
          setSettings(allSettings.filter((s) => String(s.journal_id) === String(jId)));

          if (jData.admin?.allow_bob_creation) {
            try {
              const bRes = await bobService.getByJournal(jId);
              setBobs(bRes?.data || []);
            } catch (err) {
              console.error("Error loading journal bobs:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching journal details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  const hasIssues = !!journal?.admin?.allow_bob_creation;
  const latestBob = useMemo(() => sortIssues(bobs)[0], [bobs]);

  if (loading) {
    return (
      <div className="ax-page flex min-h-screen items-center justify-center bg-ax-paper" role="status" aria-live="polite">
        <div className="h-12 w-12 rounded-full border-4 border-[#002147] border-t-transparent motion-safe:animate-spin" />
        <span className="sr-only">{L("Yuklanmoqda", "Loading", "Загрузка")}</span>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="ax-page flex min-h-screen flex-col items-center justify-center gap-4 bg-ax-paper px-4 text-center">
        <h2 className="ax-serif text-2xl text-ax-ink">{t("journals.not_found")}</h2>
        <Link to="/journals" className={`inline-flex items-center gap-2 font-medium text-ax-firuza hover:underline ${focusRing}`}>
          <FiArrowLeft aria-hidden="true" /> {t("journals.back_journals")}
        </Link>
      </div>
    );
  }

  const languages = (journal.languages || [])
    .map((l) => {
      const n = LANG_NAMES[String(l).toLowerCase()];
      return n ? L(...n) : l;
    })
    .join(", ");

  const description =
    journal.short_description ||
    journal.description ||
    L("Jurnal haqida ma'lumot tez orada qo'shiladi.", "Information about the journal will be added soon.", "Информация о журнале скоро появится.");

  const tabs = [
    { id: "archive", label: hasIssues ? L("Sonlar arxivi", "Issues", "Архив выпусков") : t("header.articles"), count: articles.length },
    { id: "about", label: t("journals.about_title") },
    { id: "scope", label: t("journals.aims_scope") },
    { id: "shablon", label: L("Mualliflar uchun", "For authors", "Авторам") },
    ...settings.map((s) => ({ id: `setting-${s.id}`, label: s.title || s.page_name })),
  ];

  const submitLink = `/submit-article?journalId=${journal.id || journal._id}`;
  const tpl = TEMPLATE[language] || TEMPLATE.uz;
  const activeSetting = settings.find((s) => activeTab === `setting-${s.id}`);

  return (
    <div className="ax-page min-h-screen bg-ax-paper pb-24 text-ax-text">
      <Toaster position="top-right" />

      {/* Sarlavha bloki: orqada banner */}
      <section className="relative overflow-hidden bg-[#002147] text-white">
        <HeroBackdrop bannerUrl={journal.banner_url} fallbackUrl={journal.cover_image_url} />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
          <Link to="/journals" className={`inline-flex items-center gap-2 rounded-sm text-sm text-blue-100/70 hover:text-white ${focusRingDark}`}>
            <FiArrowLeft aria-hidden="true" /> {t("journals.back_journals")}
          </Link>

          <div className="mt-8 grid grid-cols-[6rem_minmax(0,1fr)] gap-x-5 gap-y-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-10 lg:grid-cols-[12rem_minmax(0,1fr)]">
            <div className="sm:row-span-2">
              <IssueCover imageUrl={journal.cover_image_url} journalName={name} issueName={latestBob?.name} year={latestBob?.year} />
            </div>

            <div className="self-center sm:self-end">
              <h1 className="ax-serif text-[1.65rem] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-4xl lg:text-[2.9rem]">{name}</h1>
              {latestBob && (
                <p className="mt-3 text-sm text-blue-100/70">
                  {L("So'nggi son", "Latest issue", "Последний выпуск")}:{" "}
                  <Link
                    to={`?son=${latestBob.id}`}
                    replace
                    onClick={() => setActiveTab("archive")}
                    className={`rounded-sm font-medium text-ax-firuza-light hover:text-white hover:underline ${focusRingDark}`}
                  >
                    {latestBob.name}
                  </Link>
                </p>
              )}
            </div>

            <div className="col-span-2 sm:col-span-1 sm:col-start-2">
              <p className="max-w-[64ch] text-[15px] leading-relaxed text-blue-50/80 line-clamp-4">{description}</p>

              <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                <Fact label="ISSN">{journal.issn || L("Kutilmoqda", "Pending", "Ожидается")}</Fact>
                {languages && <Fact label={L("Tillar", "Languages", "Языки")}>{languages}</Fact>}
                {hasIssues && <Fact label={L("Sonlar", "Issues", "Выпуски")}>{bobs.length}</Fact>}
                <Fact label={L("Maqolalar", "Articles", "Статьи")}>{articles.length}</Fact>
                {!hasIssues && <Fact label={L("Ko'rishlar", "Views", "Просмотры")}>{journal.view_count || 0}</Fact>}
              </dl>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to={submitLink}
                  className={`inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#002147] shadow-xl hover:bg-blue-50 ${focusRingDark}`}
                >
                  {t("journals.submit_manuscript")}
                </Link>
                <button
                  type="button"
                  onClick={shareTelegram}
                  className={`inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20 ${focusRingDark}`}
                >
                  <FiSend aria-hidden="true" /> {t("journals.share")}
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20 ${focusRingDark}`}
                >
                  <FiLink aria-hidden="true" />
                  {copied ? t("journals.copied") : L("Havolani nusxalash", "Copy link", "Скопировать ссылку")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bo'limlar paneli (saytdagi kabi sarlavha ustiga chiqib turadi) */}
      <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div role="tablist" className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          {tabs.map((tb) => (
            <Tab key={tb.id} active={activeTab === tb.id} onClick={() => setActiveTab(tb.id)}>
              {tb.label}
              {tb.count !== undefined && (
                <span className={`ax-num rounded-full px-2 py-0.5 text-xs ${activeTab === tb.id ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {tb.count}
                </span>
              )}
            </Tab>
          ))}
        </div>
      </div>

      <main className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeTab === "archive" &&
          (hasIssues ? (
            <Archive bobs={bobs} articles={articles} />
          ) : (
            <div className={`${card} max-w-4xl p-6 sm:p-8`}>
              <h2 className="ax-serif border-b border-gray-100 pb-5 text-2xl font-semibold text-ax-ink sm:text-[2rem]">
                {t("journals.recent_articles")}
              </h2>
              <ArticleList articles={articles} emptyText={t("journals.no_articles_journal")} />
            </div>
          ))}

        {activeTab !== "archive" && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              {activeTab === "about" && (
                <Sheet title={t("journals.about_title")}>
                  <p className="ax-serif whitespace-pre-wrap text-[1.0625rem] leading-[1.75]">{journal.description || description}</p>
                </Sheet>
              )}

              {activeTab === "scope" && (
                <Sheet title={t("journals.aims_title")}>
                  <p className="ax-serif whitespace-pre-wrap text-[1.0625rem] leading-[1.75]">
                    {journal.aims_scope ||
                      L("Jurnalning maqsad va yo'nalishlari tez orada qo'shiladi.", "The journal's aims and scope will be added soon.", "Цели и тематика журнала скоро появятся.")}
                  </p>
                </Sheet>
              )}

              {activeTab === "shablon" && (
                <Sheet title={L("Mualliflar uchun", "For authors", "Авторам")}>
                  <p className="text-[15px] leading-relaxed">{tpl.intro}</p>
                  {tpl.sections.map((sec) => (
                    <section key={sec.title} className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <h3 className="ax-serif text-lg font-semibold text-ax-ink">{sec.title}</h3>
                      {sec.note && <p className="mt-1 text-sm text-ax-muted">{sec.note}</p>}
                      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed">
                        {sec.items.map(([k, v]) => (
                          <li key={k} className="flex gap-3">
                            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ax-firuza" aria-hidden="true" />
                            <span>
                              <span className="font-medium text-ax-ink">{k}</span> — {v}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </Sheet>
              )}

              {activeSetting && (
                <Sheet title={activeSetting.title || activeSetting.page_name}>
                  {activeSetting.image_url && (
                    <img src={activeSetting.image_url} alt="" className="mb-8 h-auto w-full rounded-2xl border border-gray-100 shadow-lg" loading="lazy" />
                  )}
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{activeSetting.content}</div>
                </Sheet>
              )}
            </div>

            <aside>
              <div className="relative overflow-hidden rounded-3xl bg-[#002147] p-8 text-white shadow-sm lg:sticky lg:top-6">
                <h3 className="ax-serif text-xl font-semibold">{t("journals.ready")}</h3>
                <p className="mt-3 text-sm leading-relaxed text-blue-100/70">{t("journals.ready_sub")}</p>
                <Link
                  to={submitLink}
                  className={`mt-6 block rounded-xl bg-white py-3.5 text-center text-sm font-semibold text-[#002147] hover:bg-blue-50 ${focusRingDark}`}
                >
                  {t("journals.submit_manuscript")}
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default JournalDetail;
