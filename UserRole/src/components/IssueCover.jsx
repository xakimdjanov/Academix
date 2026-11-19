import React, { useState } from "react";

// "2026 5(19)-son" -> "5(19)"; "12-jild, 4-son" -> "4"
export const issueNumber = (name = "") => {
  const m = String(name).match(/(\d+\(\d+\))/);
  if (m) return m[1];
  const s = String(name).match(/(\d+)-son/);
  return s ? s[1] : "";
};

/**
 * Jurnal sonining muqovasi. Rasm bo'lmasa — tipografik muqova:
 * to'q ko'k varaq, chap tomonda firuza "muqova cheti", pastda son raqami.
 */
const IssueCover = ({ imageUrl, journalName, issueName, year, className = "" }) => {
  const [broken, setBroken] = useState(false);
  const base =
    "relative aspect-[3/4] w-full overflow-hidden rounded-xl ring-1 ring-black/5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]";

  if (imageUrl && !broken) {
    return (
      <div className={`${base} bg-ax-paper ${className}`}>
        <img
          src={imageUrl}
          alt={issueName ? `${journalName} — ${issueName}` : journalName}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  const num = issueNumber(issueName);
  return (
    <div className={`${base} bg-ax-ink text-white ${className}`} aria-label={journalName}>
      <span className="absolute inset-y-0 left-0 w-[6%] bg-ax-firuza" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col justify-between py-[9%] pl-[16%] pr-[9%]">
        <p className="ax-serif text-[clamp(0.7rem,1.4vw,1rem)] leading-snug text-white/90 line-clamp-4">
          {journalName}
        </p>
        <div>
          {num && (
            <p className="ax-serif ax-num text-[clamp(1.6rem,4vw,2.75rem)] font-semibold leading-none text-ax-firuza-light">
              {num}
            </p>
          )}
          {year && <p className="ax-num mt-1 text-[clamp(0.65rem,1.1vw,0.8rem)] text-white/70">{year}</p>}
        </div>
      </div>
    </div>
  );
};

/**
 * Sarlavha bloki orqa foni: banner rasmi (bo'lmasa muqova xiralashtirilib) + to'q ko'k qoplama.
 * Ota element `relative overflow-hidden` bo'lishi kerak.
 */
export const HeroBackdrop = ({ bannerUrl, fallbackUrl }) => {
  const [broken, setBroken] = useState(false);
  const src = bannerUrl || fallbackUrl;
  return (
    <>
      {src && !broken && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          onError={() => setBroken(true)}
          className={`absolute inset-0 h-full w-full object-cover ${bannerUrl ? "" : "scale-110 blur-2xl opacity-70"}`}
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#002147]/65 via-[#002147]/80 to-[#002147]/95"
        aria-hidden="true"
      />
    </>
  );
};

export default IssueCover;
