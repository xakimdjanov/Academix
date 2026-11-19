import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMessageSquare, FiDownload, FiSend, FiLink, FiCopy, FiCheck, FiChevronRight } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { articleService, commentService } from "../services/api";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";
import { useSEO } from "../hooks/useSEO";
import { formatTitle } from "../utils/textFormatter";
import { useLanguage } from "../context/LanguageContext";
import IssueCover, { issueNumber } from "../components/IssueCover";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ax-firuza focus-visible:ring-offset-2";

const LOCALES = { uz: "uz-UZ", en: "en-GB", ru: "ru-RU" };
const LANG_NAMES = {
  uzbek: ["O'zbek", "Uzbek", "Узбекский"],
  russian: ["Rus", "Russian", "Русский"],
  english: ["Ingliz", "English", "Английский"],
};
const ORCID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

const initials = (name = "") =>
  name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const Section = ({ title, aside, children }) => (
  <section className="rounded-md border border-ax-rule bg-white px-6 py-8 sm:px-10 sm:py-10">
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="ax-serif text-2xl font-semibold text-ax-ink">{title}</h2>
      {aside}
    </div>
    {children}
  </section>
);

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const myId = useMemo(() => getUserIdFromToken(), []);
  const { t, language, translateCategory } = useLanguage();
  const L = (uz, en, ru) => (language === "uz" ? uz : language === "en" ? en : ru);

  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [citeStyle, setCiteStyle] = useState("gost");
  const [citeCopied, setCiteCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(t("journals.shared"));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(
      L(
        `Academix platformasida ilmiy maqola:\n\n"${article?.title}"\n\n`,
        `Scientific article on Academix:\n\n"${article?.title}"\n\n`,
        `Научная статья на платформе Academix:\n\n"${article?.title}"\n\n`
      )
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`, "_blank");
  };

  useSEO({
    title: article ? article.title : undefined,
    description: article ? (article.abstract || "").substring(0, 250) : undefined,
    keywords: article
      ? [
          article.title,
          article.category,
          ...(Array.isArray(article.keywords) ? article.keywords : []),
          ...(Array.isArray(article.authors) ? article.authors.map((a) => a.fullName).filter(Boolean) : []),
          article.language,
          "ilmiy maqola",
          "akademix",
          "akademix.uz",
        ]
          .filter(Boolean)
          .join(", ")
      : undefined,
    image: article?.journal?.banner_url || article?.journal?.cover_image_url,
    url: `https://akademix.uz/articles/${article?.slug || id}`,
    type: "article",
    googleScholar: article
      ? {
          title: article.title,
          authors: Array.isArray(article.authors) ? article.authors.map((a) => a.fullName).filter(Boolean) : [],
          publicationDate: article.createdAt,
          journalTitle: article.journal?.name,
          pdfUrl: article.file_url,
          doi: article.doi || (Array.isArray(article.authors) && article.authors[0]?.doi) || undefined,
          language: article.language,
          issn: article.journal?.issn,
          volume: article.bob?.volume,
          issue: article.bob?.name,
        }
      : undefined,
  });

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await articleService.getById(id);
      const data = res?.data;
      setArticle(data);

      // URL'da slug bo'lishi mumkin — izohlarni maqolaning haqiqiy id'si bo'yicha olamiz
      try {
        const cRes = await commentService.getAll();
        const all = Array.isArray(cRes?.data) ? cRes.data : [];
        const forThis = all.filter((c) => Number(c?.article_id || c?.articleId) === Number(data?.id));
        forThis.sort((x, y) => new Date(y?.createdAt) - new Date(x?.createdAt));
        setComments(forThis);
      } catch {
        setComments([]);
      }
    } catch {
      toast.error(L("Maqolani yuklab bo'lmadi", "Couldn't load the article", "Не удалось загрузить статью"));
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!myId) return toast.error(L("Izoh qoldirish uchun tizimga kiring", "Sign in to leave a comment", "Войдите, чтобы оставить комментарий"));
    if (!userComment.trim()) return toast.error(L("Izoh matnini yozing", "Write a comment first", "Напишите комментарий"));

    setIsSubmitting(true);
    try {
      await commentService.create({ article_id: article.id, user_id: myId, comment: userComment.trim(), visibility: "Pending" });
      toast.success(L("Izoh yuborildi. Tasdiqlangach ko'rinadi.", "Comment sent. It appears after approval.", "Комментарий отправлен. Он появится после проверки."));
      setUserComment("");
      fetchAll();
    } catch {
      toast.error(L("Izohni yuborib bo'lmadi", "Couldn't send the comment", "Не удалось отправить комментарий"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAuthor = useMemo(() => myId && Number(article?.user_id) === Number(myId), [article, myId]);

  if (loading) {
    return (
      <div className="ax-page flex min-h-screen items-center justify-center bg-ax-paper" role="status" aria-live="polite">
        <div className="h-10 w-10 rounded-full border-[3px] border-ax-firuza border-t-transparent motion-safe:animate-spin" />
        <span className="sr-only">{L("Yuklanmoqda", "Loading", "Загрузка")}</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="ax-page flex min-h-screen flex-col items-center justify-center gap-4 bg-ax-paper px-4 text-center">
        <h2 className="ax-serif text-2xl text-ax-ink">{L("Maqola topilmadi", "Article not found", "Статья не найдена")}</h2>
        <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-2 font-medium text-ax-firuza hover:underline ${focusRing}`}>
          <FiArrowLeft aria-hidden="true" /> {t("common.back")}
        </button>
      </div>
    );
  }

  /* ---------- hisoblangan qiymatlar ---------- */
  const title = formatTitle(article.title);
  const journalName = article.journal ? formatTitle(article.journal.name) : "";
  const bob = article.bob;
  const authors = Array.isArray(article.authors) ? article.authors.filter((a) => a?.fullName) : [];
  const authorList = authors.map((a) => a.fullName).join(", ");
  const keywords = Array.isArray(article.keywords) ? article.keywords.filter(Boolean) : [];
  const publicComments = comments.filter((c) => String(c.visibility).toLowerCase() === "public");
  const date = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString(LOCALES[language] || "uz-UZ", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const langName = (() => {
    const n = LANG_NAMES[String(article.language || "").toLowerCase()];
    return n ? L(...n) : article.language;
  })();

  const year = bob?.year || (article.createdAt ? new Date(article.createdAt).getFullYear() : "");
  const num = issueNumber(bob?.name);
  const url = `https://akademix.uz/articles/${article.slug || article.id}`;
  const citation =
    citeStyle === "gost"
      ? `${authorList ? authorList + " " : ""}${title} // ${journalName}. — ${year}.${num ? ` — № ${num}.` : ""} — URL: ${url}`
      : `${authorList ? authorList + " " : ""}(${year}). ${title}. ${journalName}${num ? `, ${num}` : ""}. ${url}`;

  const copyCitation = () => {
    navigator.clipboard.writeText(citation);
    setCiteCopied(true);
    setTimeout(() => setCiteCopied(false), 2000);
  };

  return (
    <div className="ax-page min-h-screen bg-ax-paper pb-24 text-ax-text">
      <Toaster position="top-right" />

      {/* Maqola boshi */}
      <header className="border-b border-ax-rule bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ax-muted">
              <li>
                <Link to="/journals" className={`rounded-sm hover:text-ax-ink ${focusRing}`}>
                  {L("Jurnallar", "Journals", "Журналы")}
                </Link>
              </li>
              {article.journal && (
                <li className="flex items-center gap-1.5">
                  <FiChevronRight size={13} aria-hidden="true" />
                  <Link to={`/journals/${article.journal.slug}`} className={`rounded-sm hover:text-ax-ink ${focusRing}`}>
                    {journalName}
                  </Link>
                </li>
              )}
              {bob && article.journal && (
                <li className="flex items-center gap-1.5">
                  <FiChevronRight size={13} aria-hidden="true" />
                  <Link to={`/journals/${article.journal.slug}?son=${bob.id}`} className={`rounded-sm hover:text-ax-ink ${focusRing}`}>
                    {bob.name}
                  </Link>
                </li>
              )}
            </ol>
          </nav>

          <div className="mt-8 max-w-[54rem]">
            <h1 className="ax-serif text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ax-ink sm:text-[2.25rem] lg:text-[2.6rem]">
              {title}
            </h1>
            {authorList && <p className="mt-5 text-base text-ax-text">{authorList}</p>}

            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
              {date && (
                <div>
                  <dt className="text-ax-muted">{L("Nashr etilgan", "Published", "Опубликовано")}</dt>
                  <dd className="ax-num mt-0.5 font-medium">{date}</dd>
                </div>
              )}
              {article.category && (
                <div>
                  <dt className="text-ax-muted">{L("Bo'lim", "Section", "Раздел")}</dt>
                  <dd className="mt-0.5 font-medium">{translateCategory(article.category)}</dd>
                </div>
              )}
              {langName && (
                <div>
                  <dt className="text-ax-muted">{L("Til", "Language", "Язык")}</dt>
                  <dd className="mt-0.5 font-medium">{langName}</dd>
                </div>
              )}
              <div>
                <dt className="text-ax-muted">{L("Ko'rishlar", "Views", "Просмотры")}</dt>
                <dd className="ax-num mt-0.5 font-medium">{article.view_count || 0}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {article.file_url && (
                <a
                  href={article.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-md bg-ax-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-[#00336b] ${focusRing}`}
                >
                  <FiDownload aria-hidden="true" /> {L("PDF ni ochish", "Open PDF", "Открыть PDF")}
                </a>
              )}
              <button
                type="button"
                onClick={shareTelegram}
                className={`inline-flex items-center gap-2 rounded-md border border-ax-rule px-4 py-2.5 text-sm hover:border-ax-ink ${focusRing}`}
              >
                <FiSend aria-hidden="true" /> {t("journals.share")}
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-2 rounded-md border border-ax-rule px-4 py-2.5 text-sm hover:border-ax-ink ${focusRing}`}
              >
                <FiLink aria-hidden="true" />
                {copied ? t("journals.copied") : L("Havolani nusxalash", "Copy link", "Скопировать ссылку")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8">
        <div className="min-w-0 space-y-8">
          {/* Tahririyat izohi (faqat muallifga) */}
          {isAuthor && article.editor_comment && (
            <section className="rounded-md border-l-4 border-amber-500 bg-amber-50 px-6 py-6 sm:px-8">
              <h2 className="flex items-center gap-2 font-semibold text-amber-900">
                <FiMessageSquare aria-hidden="true" /> {L("Tahririyat izohi", "Editor's note", "Комментарий редакции")}
              </h2>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-amber-950">{article.editor_comment}</p>
            </section>
          )}

          {/* Annotatsiya + kalit so'zlar */}
          <Section title={L("Annotatsiya", "Abstract", "Аннотация")}>
            <p className="ax-serif max-w-[68ch] whitespace-pre-wrap text-[1.125rem] leading-[1.75] text-ax-text">{article.abstract}</p>
            {keywords.length > 0 && (
              <p className="mt-6 max-w-[68ch] border-t border-ax-rule pt-5 text-[15px] leading-relaxed">
                <span className="font-semibold text-ax-ink">{L("Kalit so'zlar", "Keywords", "Ключевые слова")}:</span>{" "}
                <span className="ax-serif italic text-ax-text/90">{keywords.join(", ")}</span>
              </p>
            )}
          </Section>

          {/* Mualliflar */}
          {authors.length > 0 && (
            <Section title={t("articles.authors")}>
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {authors.map((a, i) => (
                  <li key={i} className="flex items-center gap-4">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ax-firuza-soft text-sm font-semibold text-ax-firuza-deep"
                        aria-hidden="true"
                      >
                        {initials(a.fullName)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-ax-ink">{a.fullName}</p>
                      {ORCID_RE.test(a.orcidId || "") && a.orcidId !== "0000-0000-0000-0000" && (
                        <a
                          href={`https://orcid.org/${a.orcidId}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`ax-num rounded-sm text-sm text-ax-firuza hover:underline ${focusRing}`}
                        >
                          ORCID {a.orcidId}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Iqtibos */}
          <Section
            title={L("Iqtibos keltirish", "Cite this article", "Цитирование")}
            aside={
              <div role="radiogroup" aria-label={L("Iqtibos uslubi", "Citation style", "Стиль цитирования")} className="flex rounded-md border border-ax-rule p-0.5 text-sm">
                {[
                  ["gost", "GOST"],
                  ["apa", "APA"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={citeStyle === k}
                    onClick={() => setCiteStyle(k)}
                    className={`rounded px-3 py-1 ${focusRing} ${citeStyle === k ? "bg-ax-ink text-white" : "text-ax-muted hover:text-ax-ink"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            <p className="ax-serif max-w-[68ch] break-words rounded-md bg-ax-paper px-5 py-4 text-[15px] leading-relaxed">{citation}</p>
            <button
              type="button"
              onClick={copyCitation}
              className={`mt-4 inline-flex items-center gap-2 rounded-md border border-ax-rule px-4 py-2 text-sm hover:border-ax-ink ${focusRing}`}
            >
              {citeCopied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
              {citeCopied ? L("Nusxalandi", "Copied", "Скопировано") : L("Iqtibosni nusxalash", "Copy citation", "Скопировать")}
            </button>
          </Section>

          {/* Muhokama */}
          <Section
            title={L("Muhokama", "Discussion", "Обсуждение")}
            aside={<span className="ax-num text-sm text-ax-muted">{publicComments.length}</span>}
          >
            {myId ? (
              <div className="mb-8">
                <label htmlFor="comment" className="sr-only">
                  {L("Izoh", "Comment", "Комментарий")}
                </label>
                <textarea
                  id="comment"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder={L("Tadqiqot haqida fikr yoki savolingizni yozing", "Share feedback or ask about this research", "Поделитесь мнением или задайте вопрос об исследовании")}
                  className="min-h-[7rem] w-full rounded-md border border-ax-rule bg-white p-4 text-[15px] leading-relaxed placeholder:text-ax-muted focus:border-ax-firuza focus:outline-none focus:ring-2 focus:ring-ax-firuza/30"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePostComment}
                    disabled={isSubmitting}
                    className={`inline-flex items-center gap-2 rounded-md bg-ax-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-[#00336b] disabled:opacity-50 ${focusRing}`}
                  >
                    {isSubmitting ? L("Yuborilmoqda", "Sending", "Отправка") : L("Izohni yuborish", "Send comment", "Отправить")}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mb-8 rounded-md bg-ax-paper px-5 py-4 text-[15px]">
                {L("Muhokamada qatnashish uchun", "To join the discussion,", "Чтобы участвовать в обсуждении,")}{" "}
                <Link to="/signin" className={`rounded-sm font-medium text-ax-firuza hover:underline ${focusRing}`}>
                  {L("tizimga kiring", "sign in", "войдите")}
                </Link>
                .
              </p>
            )}

            {publicComments.length === 0 ? (
              <p className="text-ax-muted">{L("Hali izoh yo'q.", "No comments yet.", "Комментариев пока нет.")}</p>
            ) : (
              <ul className="divide-y divide-ax-rule">
                {publicComments.map((c) => {
                  const who = c.author?.full_name || c.author?.fullName || L("Foydalanuvchi", "User", "Пользователь");
                  return (
                    <li key={c.id} className="flex gap-4 py-5">
                      {c.author?.avatar_url ? (
                        <img src={c.author.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" loading="lazy" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ax-paper text-xs font-semibold text-ax-muted" aria-hidden="true">
                          {initials(who)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-medium text-ax-ink">{who}</span>
                          <span className="ax-num ml-3 text-ax-muted">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString(LOCALES[language] || "uz-UZ") : ""}
                          </span>
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">{c.comment}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>

        {/* Son haqida */}
        {article.journal && (
          <aside className="order-first lg:order-none">
            <div className="flex gap-5 rounded-md border border-ax-rule bg-white p-5 lg:sticky lg:top-6 lg:flex-col lg:p-6">
              <Link
                to={`/journals/${article.journal.slug}${bob ? `?son=${bob.id}` : ""}`}
                className={`block w-24 shrink-0 rounded-[3px] sm:w-28 lg:w-40 ${focusRing}`}
                aria-label={bob ? `${journalName}, ${bob.name}` : journalName}
              >
                <IssueCover imageUrl={article.journal.cover_image_url} journalName={journalName} issueName={bob?.name} year={bob?.year} />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/journals/${article.journal.slug}`}
                  className={`ax-serif block rounded-sm text-lg font-semibold leading-snug text-ax-ink hover:text-ax-firuza ${focusRing}`}
                >
                  {journalName}
                </Link>
                {bob && (
                  <Link
                    to={`/journals/${article.journal.slug}?son=${bob.id}`}
                    className={`mt-1 block rounded-sm text-sm text-ax-muted hover:text-ax-ink ${focusRing}`}
                  >
                    {bob.name}
                  </Link>
                )}
                {article.journal.issn && <p className="ax-num mt-3 text-sm text-ax-muted">ISSN {article.journal.issn}</p>}
                {bob?.file_url && (
                  <a
                    href={bob.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-ax-firuza hover:text-ax-firuza-deep ${focusRing}`}
                  >
                    <FiDownload aria-hidden="true" /> {L("Sonning to'liq PDF'i", "Full issue PDF", "PDF всего выпуска")}
                  </a>
                )}
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default ArticleDetails;
