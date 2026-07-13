import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const [open, setOpen] = useState(null);
  const { t } = useLanguage();

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  return (
    <footer className="bg-[#001529] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ABOUT */}
          <div className="md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-widest">
              {t("footer.brand_title")}
            </h3>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              {t("footer.brand_desc")}
            </p>
          </div>

          {/* LINKS */}
          <div>
            <button
              onClick={() => toggle("links")}
              className="w-full flex justify-between items-center text-white font-bold
              text-sm uppercase tracking-wider mb-6 md:cursor-default"
            >
              {t("footer.links")}
              <FiChevronDown
                className={`md:hidden transition-transform duration-300 ease-in-out ${
                  open === "links" ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-[max-height,opacity]
              duration-500 ease-in-out
              ${
                open === "links"
                  ? "max-h-[300px] opacity-100"
                  : "max-h-0 opacity-0 md:max-h-full md:opacity-100"
              }`}
            >
              <ul className="space-y-3 text-sm pb-6 md:pb-0">
                <li>
                  <a href="/about" className="hover:text-blue-400 transition-colors">
                    {t("footer.about")}
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-blue-400 transition-colors">
                    {t("footer.privacy")}
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-blue-400 transition-colors">
                    {t("footer.terms")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <button
              onClick={() => toggle("contact")}
              className="w-full flex justify-between items-center text-white font-bold
              text-sm uppercase tracking-wider mb-6 md:cursor-default"
            >
              {t("footer.contact")}
              <FiChevronDown
                className={`md:hidden transition-transform duration-300 ease-in-out ${
                  open === "contact" ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-[max-height,opacity]
              duration-500 ease-in-out
              ${
                open === "contact"
                  ? "max-h-[200px] opacity-100"
                  : "max-h-0 opacity-0 md:max-h-full md:opacity-100"
              }`}
            >
              <div className="text-sm space-y-3 pb-6 md:pb-0">
                <p className="flex flex-col">
                  <span className="text-gray-500 text-xs font-bold uppercase mb-1">{t("footer.email")}</span>
                  <a href="mailto:stacknowa@gmail.com" className="text-white hover:text-blue-400">stacknowa@gmail.com</a>
                </p>
                <p className="flex flex-col">
                  <span className="text-gray-500 text-xs font-bold uppercase mb-1">{t("footer.phone")}</span>
                  <a href="tel:+998200146667" className="text-white hover:text-blue-400">+998 (20) 014-66-67</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
