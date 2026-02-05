import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const Footer = () => {
  const [open, setOpen] = useState(null);

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  return (
    <footer className="bg-[#001529] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ABOUT */}
          <div className="md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">
              JOURNAL PLATFORM
            </h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Ilmiy tadqiqotlar va maqolalarni boshqarish uchun zamonaviy yechim.
              Biz bilan bilimingizni dunyoga ulashing.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <button
              onClick={() => toggle("links")}
              className="w-full flex justify-between items-center text-white font-semibold
              text-sm uppercase tracking-wider mb-4 md:cursor-default"
            >
              Links
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
              <ul className="space-y-2 text-sm pb-4 md:pb-0">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <button
              onClick={() => toggle("contact")}
              className="w-full flex justify-between items-center text-white font-semibold
              text-sm uppercase tracking-wider mb-4 md:cursor-default"
            >
              Contact
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
              <div className="text-sm space-y-2 pb-4 md:pb-0">
                <p>Email: support@journal.uz</p>
                <p>Phone: +998 (71) 123-45-67</p>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} Journal Platform. Barcha huquqlar
            himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
