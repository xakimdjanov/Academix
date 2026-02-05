import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  
  // Linklar ro'yxati
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'journals', label: 'Journals' },
    { id: 'articles', label: 'Articles' },
    { id: 'contact', label: 'Contact' }
  ];

  // Scroll holatiga qarab active linkni o'zgartiramiz
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveLink(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Link bosilganda scroll qilish
  const handleNavClick = (id) => {
    setActiveLink(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Mobile menyuni yopish
  };

  // Mobile menyu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Esc tugmasi bilan menyuni yopish
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Mobile menyu ochiq bo'lsa, scroll ni block qilish
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-[#002147] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
                JOURNAL<span className="text-blue-400">.</span>UZ
              </span>
            </div>

            {/* Desktop Navigatsiya menyusi */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`pb-1 transition-all duration-200 text-sm font-medium relative group ${
                    activeLink === item.id 
                      ? 'text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* Active underline */}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 transition-all duration-300 ${
                    activeLink === item.id 
                      ? 'w-full' 
                      : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
            </nav>

            {/* Desktop Amallar tugmalari */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-5 rounded-lg text-sm font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl active:scale-95">
                Create a Journal
              </button>
              <button className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-4 py-2.5 md:px-5 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg active:scale-95">
                Create an Article
              </button>
            </div>

            {/* Mobile Hamburger menyu tugmasi */}
            <div className="flex md:hidden items-center space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-300">
                Create
              </button>
              <button 
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Menyuni ochish</span>
                {/* Hamburger icon */}
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`} />
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menyu */}
        <div className={`md:hidden fixed inset-0 z-40 transform transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}>
          {/* Orqa fon */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menyu paneli */}
          <div className="fixed inset-y-0 right-0 w-64 bg-[#002147] shadow-xl overflow-y-auto">
            <div className="pt-5 pb-6 px-4">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-white">
                  JOURNAL<span className="text-blue-400">.</span>UZ
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  <span className="sr-only">Menyuni yopish</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                      activeLink === item.id
                        ? 'bg-blue-900 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {activeLink === item.id && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700 space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
                  Create a Journal
                </button>
                <button className="w-full border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300">
                  Create an Article
                </button>
              </div>

              {/* Mobile menyu footer */}
              <div className="mt-12 text-center text-gray-400 text-sm">
                <p>© {new Date().getFullYear()} Journal.uz</p>
                <p className="mt-1">Barcha huquqlar himoyalangan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menyu ochiq bo'lsa, scroll ni oldini olish uchun */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" />
      )}
    </>
  );
};

export default Header;