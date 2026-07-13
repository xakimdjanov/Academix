import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const translations = {
  uz: {
    common: {
      all: "Barchasi",
      uncategorized: "Kategoriyasiz",
      views: "ko'rildi",
      search: "Qidirish...",
      details: "Batafsil",
      submit: "Yuborish",
      back: "Orqaga",
      next: "Keyingisi",
      please_wait: "Iltimos, kuting...",
      register: "Ro'yxatdan o'tish",
      signin: "Kirish",
      active: "Faol",
      inactive: "Nofaol",
      no_data: "Ma'lumotlar mavjud emas.",
      views_count: "KO'RILDI",
      download_pdf: "PDF YUKLAB OLISH",
      read_article: "MAQOLANI O'QISH"
    },
    header: {
      home: "Bosh sahifa",
      journals: "Jurnallar",
      articles: "Maqolalar",
      pricing: "Tariflar",
      about: "Haqida",
      contact: "Bog'lanish",
      signin: "Kirish",
      signup: "Ro'yxatdan o'tish",
      dashboard: "Boshqaruv paneli",
      logout: "Chiqish"
    },
    footer: {
      brand_title: "ACADEMIX PLATFORMASI",
      brand_desc: "Ilmiy tadqiqotlar va maqolalarni boshqarish uchun zamonaviy yechim. Biz bilan bilimingizni dunyoga ulashing.",
      links: "Havolalar",
      about: "Biz haqimizda",
      privacy: "Maxfiylik siyosati",
      terms: "Foydalanish shartlari",
      contact: "Bog'lanish",
      email: "Elektron pochta",
      phone: "Telefon",
      copyright: "Academix Platformasi. Barcha huquqlar himoyalangan."
    },
    home: {
      hero_title: "Akademik Jurnallarni bitta platformada nashr eting va boshqaring",
      hero_desc: "Ilmiy maqolalarni to'liq shaffoflik bilan yuboring, taqrizdan o'tkazing va nashr eting. Bizning zamonaviy boshqaruv tizimimiz bilan tahririyat ish jarayonini soddalashtiring.",
      hero_btn_submit: "Maqola yuborish",
      hero_btn_journals: "Jurnallarni ko'rish",
      hero_badge_peer: "taqriz qilinadigan",
      hero_badge_open: "ochiq kirish",
      hero_badge_secure: "xavfsiz",
      features_title: "Platformaning ilg'or imkoniyatlari",
      features_desc: "Akademik jurnalning hayotiy tsiklini boshqarish uchun kerak bo'lgan hamma narsa.",
      feature_submit_title: "Maqola yuborish tizimi",
      feature_submit_desc: "Mualliflar uchun meta-ma'lumotlarni avtomatik ajratib olish imkoniyatiga ega qulay interfeys.",
      feature_review_title: "Taqriz jarayoni",
      feature_review_desc: "Mualliflar, muharrirlar va taqrizchilar o'rtasida uzluksiz aloqa.",
      feature_pay_title: "Integratsiyalashgan to'lovlar",
      feature_pay_desc: "Maqolani qayta ishlash to'lovlari (APC) va obunalarni xavfsiz boshqarish.",
      feature_track_title: "Real vaqtda kuzatuv",
      feature_track_desc: "Maqolangiz holatini yuborilgan paytdan boshlab nashr etilgunga qadar darhol kuzatib boring.",
      feature_role_title: "Rallarga asoslangan kirish",
      feature_role_desc: "Mualliflar, muharrirlar va taqrizchilar uchun maxsus ruxsatnomalarga ega xavfsiz muhit.",
      feature_mgmt_title: "Jurnalni boshqarish",
      feature_mgmt_desc: "Jurnal sozalamalari, sonlari va tahririyat kengashi ustidan to'liq nazorat.",
      how_it_works: "Bu qanday ishlaydi",
      step1_title: "Maqola yuborish",
      step1_desc: "Muallif maqolani foydalanuvchi paneli orqali yuboradi.",
      step2_title: "Tahririyat ko'rigi",
      step2_desc: "Muharrir sifat va texnik standartlarni tekshiradi.",
      step3_title: "Taqriz jarayoni",
      step3_desc: "Taqrizchilar maqolani yaxshilash bo'yicha fikr-mulohazalarini bildiradilar.",
      step4_title: "Nashr etish",
      step4_desc: "Yakuniy maqola nashr etiladi va unga DOI biriktiriladi.",
      explore_title: "Jurnallarni o'rganing",
      explore_desc: "Yuqori sifatli ilmiy jurnallarimizni ko'rib chiqing.",
      explore_all: "Barcha jurnallar",
      why_title: "Nima uchun Academix?",
      why1_title: "Shaffof ish jarayoni",
      why1_desc: "Taqriz va tahririyat jarayonining har bir bosqichini kuzatib boring.",
      why2_title: "Tezkor taqriz tizimi",
      why2_desc: "Maqolalar va malakali taqrizchilar o'rtasida optimallashtirilgan muvofiqlik.",
      why3_title: "Xavfsiz to'lovlar",
      why3_desc: "APC va obunalar uchun yuqori darajadagi xavfsizlik.",
      why4_title: "Global standartlar",
      why4_desc: "COPE va xalqaro akademik ko'rsatmalarga moslik.",
      stats_articles: "Nashr etilgan maqolalar",
      stats_journals: "Faol jurnallar",
      stats_reviewers: "Global taqrizchilar",
      stats_views: "Ko'rishlar soni",
      pricing_title: "Tariflar",
      pricing_desc: "Tadqiqotingiz yoki muassasangiz uchun eng ma'qul rejani tanlang.",
      pricing_free: "Bepul boshlash",
      pricing_start: "Hoziroq boshlash",
      pricing_month: "/oyiga",
      pricing_popular: "Eng mashhur",
      testimonials_title: "Foydalanuvchilar fikri",
      cta_title: "Nashr qilishga tayyormisiz?",
      cta_desc: "Ilmiy taraqqiyot sari birgalikda intilayotgan minglab tadqiqotchi va muharrirlarga qo'shiling.",
      cta_btn: "Bugun boshlang"
    },
    pricing: {
      h1: "Oddiy va shaffof tariflar",
      sub: "Akademik nashrlar uchun eng maqbul yechimlar. Yashirin to'lovlar va murakkabliklarsiz.",
      authors: "Maqolalar uchun (Mualliflar)",
      admins: "Jurnallar uchun (Adminlar)",
      popular: "Eng ko'p tanlangan",
      final: "/ yakuniy",
      no_tariffs: "Bu bo'limda hozircha tariflar mavjud emas.",
      compare: "Imkoniyatlarni solishtirish",
      features: "Xususiyatlar",
      starter: "Boshlang'ich",
      professional: "Professional",
      corporate: "Korporativ",
      articles_limit: "Maqolalar limiti",
      doi_service: "DOI xizmati",
      editorial_portal: "Tahririyat portali",
      support: "Qo'llab-quvvatlash",
      limited: "Cheklangan",
      unlimited: "Cheksiz",
      support_free: "Email",
      support_pro: "24/7 Chat",
      support_corp: "Shaxsiy menejer",
      btn_panel: "PANELGA O'TISH",
      btn_start: "HOZIROQ BOSHLASH",
      journal_limit: "ta jurnal",
      article_limit: "ta maqola",
      duration_days: "kunlik muddat",
      lifetime: "Umrbod foydalanish",
      default_desc: "uchun maxsus tarif."
    },
    journals: {
      h1: "Akademik jurnallar",
      sub: "Turli ilmiy sohalardagi taqrizdan o'tgan jurnallarni kashf eting. Yuqori sifatli tadqiqotlardan foydalaning va so'nggi yangiliklardan boxabar bo'ling.",
      search_placeholder: "Jurnalni nomi yoki sohasi bo'yicha qidirish...",
      not_found: "Jurnallar topilmadi",
      not_found_sub: "Qidiruv yoki filtrlarni o'zgartirib ko'ring.",
      back_search: "Qidiruvga qaytish",
      issue_pdf: "To'liq sonni yuklab olish (PDF)",
      years_title: "Nashr yillari",
      no_bobs: "Ushbu jurnalda hali nashrlar (boblar) yaratilmagan.",
      no_articles_bob: "Ushbu sonda maqolalar hali nashr etilmagan.",
      no_articles_journal: "Ushbu jurnalda hali maqolalar nashr etilmagan.",
      recent_articles: "Yaqinda nashr etilgan maqolalar",
      metrics: "Jurnal ko'rsatkichlari",
      metric_accept: "Qabul qilish darajasi",
      metric_decision: "Birinchi qarorgacha vaqt",
      metric_impact: "Impakt faktor",
      ready: "Nashr qilishga tayyormisiz?",
      ready_sub: "Bugun tadqiqotingizni yuboring va jahon darajasidagi olimlar jamoasiga qo'shiling.",
      submit_manuscript: "Qo'lyozmani yuborish",
      aims_scope: "Maqsad va yo'nalishlar",
      template: "Maqola shabloni",
      back_journals: "Jurnallarga qaytish",
      shared: "Sahifa havolasi nusxalandi!",
      share: "Ulashish",
      copy: "Nusxa olish",
      copied: "Nusxalandi",
      about_title: "Jurnal haqida",
      aims_title: "Maqsad va yo'nalishlar"
    },
    articles: {
      h1: "Ilmiy maqolalar",
      sub: "Nashr etilgan barcha ilmiy maqolalar bazasi. Qiziqarli tadqiqotlarni o'qing va yuklab oling.",
      search_placeholder: "Maqolani sarlavhasi, kalit so'zi yoki muallifi bo'yicha qidirish...",
      not_found: "Maqolalar topilmadi",
      not_found_sub: "Qidiruv yoki filtrlarni o'zgartirib ko'ring.",
      back_to_articles: "Maqolalar ro'yxatiga qaytish",
      read_online: "ONLAYN O'QISH",
      abstract: "Annotatsiya",
      keywords: "Kalit so'zlar",
      published_in: "Nashr etilgan jurnal",
      authors: "Mualliflar",
      published_date: "Nashr sanasi",
      status: "Holati",
      language: "Tili"
    },
    auth: {
      signin_title: "Tizimga kirish",
      signin_sub: "Hisobingizga kiring",
      email: "Elektron pochta",
      password: "Parol",
      enter_password: "Parolni kiriting",
      forgot: "Parolni unutdingizmi?",
      login_btn: "Kirish",
      logging_in: "Kirilmoqda...",
      no_account: "Hisobingiz yo'qmi?",
      signup_link: "Ro'yxatdan o'ting",
      signup_title: "Ro'yxatdan o'tish",
      signup_sub: "Yangi hisob yarating",
      fullname: "F.I.O. (To'liq ism-sharifingiz)",
      enter_fullname: "Ism va familiyangiz",
      phone: "Telefon raqami",
      orcid: "ORCID ID (Ixtiyoriy)",
      tariff: "Tarif",
      signing_up: "Ro'yxatdan o'tilmoqda...",
      has_account: "Hisobingiz bormi?",
      signin_link: "Kirish",
      reset_title: "Parolni tiklash",
      waiting: "Iltimos, kuting...",
      enter_email: "Elektron pochtangizni kiriting"
    },
    role_modal: {
      title: "Tizimga kirish",
      desc: "Iltimos, o'z rolingizga mos panelni tanlang",
      user: "Foydalanuvchi",
      user_desc: "Maqola yuborish va kuzatish",
      admin: "Jurnal Admin",
      admin_desc: "Jurnalni boshqarish va taqrizlar",
      editor: "Muharrir",
      editor_desc: "Maqolalarni tahrirlash",
      no_account: "Hisobingiz yo'qmi?",
      signup: "Ro'yxatdan o'tish"
    },
    status: {
      submitted: "Yuborilgan",
      under_review: "Ko'rib chiqilmoqda",
      needs_revision: "Tahrir talab",
      accepted: "Qabul qilingan",
      rejected: "Rad etilgan",
      published: "Nashr etilgan",
      unknown: "Noma'lum"
    }
  },
  en: {
    common: {
      all: "All",
      uncategorized: "Uncategorized",
      views: "views",
      search: "Search...",
      details: "Details",
      submit: "Submit",
      back: "Back",
      next: "Next",
      please_wait: "Please wait...",
      register: "Register",
      signin: "Sign In",
      active: "Active",
      inactive: "Inactive",
      no_data: "No data available.",
      views_count: "VIEWS",
      download_pdf: "DOWNLOAD PDF",
      read_article: "READ ARTICLE"
    },
    header: {
      home: "Home",
      journals: "Journals",
      articles: "Articles",
      pricing: "Pricing",
      about: "About",
      contact: "Contact",
      signin: "Sign In",
      signup: "Sign Up",
      dashboard: "Dashboard",
      logout: "Log Out"
    },
    footer: {
      brand_title: "ACADEMIX PLATFORM",
      brand_desc: "A modern solution for managing scientific research and articles. Share your knowledge with the world through us.",
      links: "Links",
      about: "About Us",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      contact: "Contact",
      email: "Email",
      phone: "Phone",
      copyright: "Academix Platform. All rights reserved."
    },
    home: {
      hero_title: "Publish and Manage Academic Journals on One Platform",
      hero_desc: "Submit, peer review, and publish scientific articles with full transparency. Simplify the editorial workflow with our modern management system.",
      hero_btn_submit: "Submit Article",
      hero_btn_journals: "View Journals",
      hero_badge_peer: "peer-reviewed",
      hero_badge_open: "open access",
      hero_badge_secure: "secure",
      features_title: "Advanced Platform Features",
      features_desc: "Everything you need to manage the lifecycle of an academic journal.",
      feature_submit_title: "Article Submission System",
      feature_submit_desc: "Convenient interface with automatic extraction of metadata for authors.",
      feature_review_title: "Peer Review Process",
      feature_review_desc: "Seamless communication between authors, editors, and reviewers.",
      feature_pay_title: "Integrated Payments",
      feature_pay_desc: "Secure management of article processing charges (APCs) and subscriptions.",
      feature_track_title: "Real-time Tracking",
      feature_track_desc: "Track the status of your article instantly from submission to publication.",
      feature_role_title: "Role-based Access",
      feature_role_desc: "Secure environment with custom permissions for authors, editors, and reviewers.",
      feature_mgmt_title: "Journal Management",
      feature_mgmt_desc: "Full control over journal settings, issues, and editorial board.",
      how_it_works: "How It Works",
      step1_title: "Article Submission",
      step1_desc: "The author submits the article via the user dashboard.",
      step2_title: "Editorial Review",
      step2_desc: "The editor checks quality and technical standards.",
      step3_title: "Peer Review",
      step3_desc: "Reviewers provide feedback on how to improve the article.",
      step4_title: "Publication",
      step4_desc: "The final article is published and assigned a DOI.",
      explore_title: "Explore Journals",
      explore_desc: "Browse our high-quality scientific journals.",
      explore_all: "All Journals",
      why_title: "Why Academix?",
      why1_title: "Transparent Workflow",
      why1_desc: "Track every stage of the review and editorial process.",
      why2_title: "Fast Review System",
      why2_desc: "Optimized matching between articles and qualified reviewers.",
      why3_title: "Secure Payments",
      why3_desc: "High-level security for APC and subscriptions.",
      why4_title: "Global Standards",
      why4_desc: "Compliance with COPE and international academic guidelines.",
      stats_articles: "Published Articles",
      stats_journals: "Active Journals",
      stats_reviewers: "Global Reviewers",
      stats_views: "Total Views",
      pricing_title: "Pricing Plans",
      pricing_desc: "Choose the best plan for your research or institution.",
      pricing_free: "Start Free",
      pricing_start: "Start Now",
      pricing_month: "/month",
      pricing_popular: "Most Popular",
      testimonials_title: "What Users Say",
      cta_title: "Ready to Publish?",
      cta_desc: "Join thousands of researchers and editors striving for scientific progress together.",
      cta_btn: "Start Today"
    },
    pricing: {
      h1: "Simple and Transparent Pricing",
      sub: "The best solutions for academic publishing. No hidden fees or complexities.",
      authors: "For Articles (Authors)",
      admins: "For Journals (Admins)",
      popular: "Most Popular",
      final: "/ final",
      no_tariffs: "There are no tariffs in this section yet.",
      compare: "Compare Features",
      features: "Features",
      starter: "Starter",
      professional: "Professional",
      corporate: "Corporate",
      articles_limit: "Articles Limit",
      doi_service: "DOI Service",
      editorial_portal: "Editorial Portal",
      support: "Support",
      limited: "Limited",
      unlimited: "Unlimited",
      support_free: "Email",
      support_pro: "24/7 Chat",
      support_corp: "Personal Manager",
      btn_panel: "GO TO DASHBOARD",
      btn_start: "START NOW",
      journal_limit: "journals",
      article_limit: "articles",
      duration_days: "days duration",
      lifetime: "Lifetime usage",
      default_desc: "special tariff plan."
    },
    journals: {
      h1: "Academic Journals",
      sub: "Discover peer-reviewed journals in various scientific fields. Access high-quality research and stay updated.",
      search_placeholder: "Search journal by name or field...",
      not_found: "Journals not found",
      not_found_sub: "Try changing your search query or filters.",
      back_search: "Back to search",
      issue_pdf: "Download full issue (PDF)",
      years_title: "Publishing Years",
      no_bobs: "No issues (chapters) have been created in this journal yet.",
      no_articles_bob: "Articles have not been published in this issue yet.",
      no_articles_journal: "No articles have been published in this journal yet.",
      recent_articles: "Recently published articles",
      metrics: "Journal Metrics",
      metric_accept: "Acceptance Rate",
      metric_decision: "Time to first decision",
      metric_impact: "Impact Factor",
      ready: "Ready to Publish?",
      ready_sub: "Submit your research today and join a world-class community of scientists.",
      submit_manuscript: "Submit Manuscript",
      aims_scope: "Aims & Scope",
      template: "Article Template",
      back_journals: "Back to Journals",
      shared: "Page link copied to clipboard!",
      share: "Share",
      copy: "Copy Link",
      copied: "Copied",
      about_title: "About the Journal",
      aims_title: "Aims and Scope"
    },
    articles: {
      h1: "Scientific Articles",
      sub: "Database of all published scientific articles. Read and download interesting research.",
      search_placeholder: "Search article by title, keyword, or author...",
      not_found: "Articles not found",
      not_found_sub: "Try changing your search query or filters.",
      back_to_articles: "Back to Articles List",
      read_online: "READ ONLINE",
      abstract: "Abstract",
      keywords: "Keywords",
      published_in: "Published in Journal",
      authors: "Authors",
      published_date: "Published Date",
      status: "Status",
      language: "Language"
    },
    auth: {
      signin_title: "Sign In",
      signin_sub: "Sign in to your account",
      email: "Email address",
      password: "Password",
      enter_password: "Enter password",
      forgot: "Forgot password?",
      login_btn: "Sign In",
      logging_in: "Signing In...",
      no_account: "Don't have an account?",
      signup_link: "Sign Up",
      signup_title: "Sign Up",
      signup_sub: "Create a new account",
      fullname: "Full Name",
      enter_fullname: "Your first & last name",
      phone: "Phone Number",
      orcid: "ORCID ID (Optional)",
      tariff: "Tariff Plan",
      signing_up: "Signing Up...",
      has_account: "Already have an account?",
      signin_link: "Sign In",
      reset_title: "Reset Password",
      waiting: "Please wait...",
      enter_email: "Enter your email address"
    },
    role_modal: {
      title: "Sign In",
      desc: "Please choose the panel according to your role",
      user: "User / Author",
      user_desc: "Submit and track articles",
      admin: "Journal Admin",
      admin_desc: "Manage journal and reviews",
      editor: "Editor",
      editor_desc: "Edit and review articles",
      no_account: "Don't have an account?",
      signup: "Sign Up"
    },
    status: {
      submitted: "Submitted",
      under_review: "Under Review",
      needs_revision: "Needs Revision",
      accepted: "Accepted",
      rejected: "Rejected",
      published: "Published",
      unknown: "Unknown"
    }
  },
  ru: {
    common: {
      all: "Все",
      uncategorized: "Без категории",
      views: "просмотров",
      search: "Поиск...",
      details: "Подробнее",
      submit: "Отправить",
      back: "Назад",
      next: "Далее",
      please_wait: "Пожалуйста, подождите...",
      register: "Регистрация",
      signin: "Войти",
      active: "Активный",
      inactive: "Неактивный",
      no_data: "Данные отсутствуют.",
      views_count: "ПРОСМОТРОВ",
      download_pdf: "СКАЧАТЬ PDF",
      read_article: "ЧИТАТЬ СТАТЬЮ"
    },
    header: {
      home: "Главная",
      journals: "Журналы",
      articles: "Статьи",
      pricing: "Тарифы",
      about: "О нас",
      contact: "Контакты",
      signin: "Войти",
      signup: "Регистрация",
      dashboard: "Панель управления",
      logout: "Выйти"
    },
    footer: {
      brand_title: "ПЛАТФОРМА ACADEMIX",
      brand_desc: "Современное решение для управления научными исследованиями и статьями. Поделитесь своими знаниями с миром вместе с нами.",
      links: "Ссылки",
      about: "О нас",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
      contact: "Контакты",
      email: "Электронная почта",
      phone: "Телефон",
      copyright: "Платформа Academix. Все права защищены."
    },
    home: {
      hero_title: "Публикуйте и управляйте научными журналами на одной платформе",
      hero_desc: "Отправляйте, рецензируйте и публикуйте научные статьи с полной прозрачностью. Упростите редакционный рабочий процесс с помощью нашей современной системы управления.",
      hero_btn_submit: "Отправить статью",
      hero_btn_journals: "Посмотреть журналы",
      hero_badge_peer: "рецензируемые",
      hero_badge_open: "открытый доступ",
      hero_badge_secure: "безопасный",
      features_title: "Передовые возможности платформы",
      features_desc: "Все необходимое для управления жизненным циклом научного журнала.",
      feature_submit_title: "Система подачи статей",
      feature_submit_desc: "Удобный интерфейс с автоматическим извлечением метаданных для авторов.",
      feature_review_title: "Процесс рецензирования",
      feature_review_desc: "Бесперебойное общение между авторами, редакторами и рецензентами.",
      feature_pay_title: "Интегрированные платежи",
      feature_pay_desc: "Безопасное управление сборами за обработку статей (APC) и подписками.",
      feature_track_title: "Отслеживание в реальном времени",
      feature_track_desc: "Мгновенно отслеживайте статус вашей статьи с момента подачи до публикации.",
      feature_role_title: "Ролевой доступ",
      feature_role_desc: "Безопасная среда со специальными разрешениями для авторов, редакторов и рецензентов.",
      feature_mgmt_title: "Управление журналом",
      feature_mgmt_desc: "Полный контроль над настройками журнала, выпусками и редакционной коллегией.",
      how_it_works: "Как это работает",
      step1_title: "Подача статьи",
      step1_desc: "Автор отправляет статью через панель пользователя.",
      step2_title: "Редакционный обзор",
      step2_desc: "Редактор проверяет качество и технические стандарты.",
      step3_title: "Рецензирование",
      step3_desc: "Рецензенты оставляют отзывы по улучшению статьи.",
      step4_title: "Публикация",
      step4_desc: "Финальная статья публикуется и ей присваивается DOI.",
      explore_title: "Изучите журналы",
      explore_desc: "Ознакомьтесь с нашими высококачественными научными журналами.",
      explore_all: "Все журналы",
      why_title: "Почему Academix?",
      why1_title: "Прозрачный процесс работы",
      why1_desc: "Следите за каждым этапом процесса рецензирования и редактирования.",
      why2_title: "Быстрая система рецензирования",
      why2_desc: "Оптимизированный подбор между статьями и квалифицированными рецензентами.",
      why3_title: "Безопасные платежи",
      why3_desc: "Высокий уровень безопасности для APC и подписок.",
      why4_title: "Мировые стандарты",
      why4_desc: "Соответствие COPE и международным академическим рекомендациям.",
      stats_articles: "Опубликованные статьи",
      stats_journals: "Активные журналы",
      stats_reviewers: "Глобальные рецензенты",
      stats_views: "Всего просмотров",
      pricing_title: "Тарифные планы",
      pricing_desc: "Выберите лучший тарифный план для ваших исследований или учреждения.",
      pricing_free: "Начать бесплатно",
      pricing_start: "Начать сейчас",
      pricing_month: "/месяц",
      pricing_popular: "Популярный",
      testimonials_title: "Отзывы пользователей",
      cta_title: "Готовы к публикации?",
      cta_desc: "Присоединяйтесь к тысячам исследователей и редакторов, стремящихся к научному прогрессу вместе.",
      cta_btn: "Начните сегодня"
    },
    pricing: {
      h1: "Простые и прозрачные тарифы",
      sub: "Лучшие решения для научных публикаций. Без скрытых комиссий и сложностей.",
      authors: "Для статей (Авторы)",
      admins: "Для журналов (Админы)",
      popular: "Самый популярный",
      final: "/ окончательно",
      no_tariffs: "В этом разделе пока нет тарифов.",
      compare: "Сравнение возможностей",
      features: "Характеристики",
      starter: "Начальный",
      professional: "Профессиональный",
      corporate: "Корпоративный",
      articles_limit: "Лимит статей",
      doi_service: "Служба DOI",
      editorial_portal: "Редакционный портал",
      support: "Поддержка",
      limited: "Ограничено",
      unlimited: "Безлимитно",
      support_free: "Эл. почта",
      support_pro: "Чат 24/7",
      support_corp: "Личный менеджер",
      btn_panel: "ПЕРЕЙТИ В ПАНЕЛЬ",
      btn_start: "НАЧАТЬ СЕЙЧАС",
      journal_limit: "журналов",
      article_limit: "статей",
      duration_days: "дней действия",
      lifetime: "Пожизненное пользование",
      default_desc: "специальный тарифный план."
    },
    journals: {
      h1: "Научные журналы",
      sub: "Откройте для себя рецензируемые журналы в различных научных областях. Получите доступ к качественным исследованиям.",
      search_placeholder: "Поиск журнала по названию или теме...",
      not_found: "Журналы не найдены",
      not_found_sub: "Попробуйте изменить поисковый запрос или фильтры.",
      back_search: "Назад к поиску",
      issue_pdf: "Скачать полный выпуск (PDF)",
      years_title: "Года публикаций",
      no_bobs: "В этом журнале пока не создано выпусков (глав).",
      no_articles_bob: "Статьи в этом выпуске еще не опубликованы.",
      no_articles_journal: "Статьи в этом журнале еще не опубликованы.",
      recent_articles: "Недавно опубликованные статьи",
      metrics: "Показатели журнала",
      metric_accept: "Процент принятия",
      metric_decision: "Время до первого решения",
      metric_impact: "Импакт-фактор",
      ready: "Готовы к публикации?",
      ready_sub: "Отправьте свое исследование сегодня и присоединяйтесь к мировому сообществу ученых.",
      submit_manuscript: "Отправить рукопись",
      aims_scope: "Цели и область",
      template: "Шаблон статьи",
      back_journals: "Назад к журналам",
      shared: "Ссылка на страницу скопирована в буфер обмена!",
      share: "Поделиться",
      copy: "Копировать ссылку",
      copied: "Скопировано",
      about_title: "О журнале",
      aims_title: "Цели и сфера применения"
    },
    articles: {
      h1: "Научные статьи",
      sub: "База данных всех опубликованных научных статей. Читайте и скачивайте интересные исследования.",
      search_placeholder: "Поиск статьи по названию, ключевому слову или автору...",
      not_found: "Статьи не найдены",
      not_found_sub: "Попробуйте изменить поисковый запрос или фильтры.",
      back_to_articles: "Назад к списку статей",
      read_online: "ЧИТАТЬ ОНЛАЙН",
      abstract: "Аннотация",
      keywords: "Ключевые слова",
      published_in: "Опубликовано в журнале",
      authors: "Авторы",
      published_date: "Дата публикации",
      status: "Статус",
      language: "Язык"
    },
    auth: {
      signin_title: "Вход в систему",
      signin_sub: "Войдите в свою учетную запись",
      email: "Электронная почта",
      password: "Пароль",
      enter_password: "Введите пароль",
      forgot: "Забыли пароль?",
      login_btn: "Войти",
      logging_in: "Вход...",
      no_account: "Нет учетной записи?",
      signup_link: "Зарегистрируйтесь",
      signup_title: "Регистрация",
      signup_sub: "Создайте новую учетную запись",
      fullname: "Ф.И.О.",
      enter_fullname: "Ваше имя и фамилия",
      phone: "Номер телефона",
      orcid: "ORCID ID (Необязательно)",
      tariff: "Тарифный план",
      signing_up: "Регистрация...",
      has_account: "Уже есть аккаунт?",
      signin_link: "Войти",
      reset_title: "Восстановление пароля",
      waiting: "Пожалуйста, подождите...",
      enter_email: "Введите адрес электронной почты"
    },
    role_modal: {
      title: "Вход в систему",
      desc: "Пожалуйста, выберите панель в соответствии с вашей ролью",
      user: "Пользователь / Автор",
      user_desc: "Отправка и отслеживание статей",
      admin: "Администратор журнала",
      admin_desc: "Управление журналом и рецензирование",
      editor: "Редактор",
      editor_desc: "Редактирование и обзор статей",
      no_account: "Нет учетной записи?",
      signup: "Регистрация"
    },
    status: {
      submitted: "Отправлено",
      under_review: "На проверке",
      needs_revision: "Требует доработки",
      accepted: "Принято",
      rejected: "Отклонено",
      published: "Опубликовано",
      unknown: "Неизвестно"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "uz"
  );

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
    }
  };

  const t = (path) => {
    const keys = path.split(".");
    let current = translations[lang];
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to uz translation if current language key is missing
        let fallback = translations.uz;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            fallback = path; // return path string if not found at all
            break;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  // Helper for backend status translations
  const translateStatus = (backendStatus) => {
    if (!backendStatus) return t("status.unknown");
    const cleanStatus = backendStatus.trim().toLowerCase();
    
    switch (cleanStatus) {
      case "submitted":
        return t("status.submitted");
      case "under review":
      case "under_review":
        return t("status.under_review");
      case "needs revision":
      case "needs_revision":
        return t("status.needs_revision");
      case "accepted":
        return t("status.accepted");
      case "rejected":
        return t("status.rejected");
      case "published":
        return t("status.published");
      default:
        return backendStatus; // if not matched, return original
    }
  };

  // Helper for translating category lists
  const translateCategory = (cat) => {
    if (!cat) return t("common.uncategorized");
    if (cat === "Barchasi" || cat === "All" || cat === "Все") return t("common.all");
    if (cat === "Kategoriyasiz" || cat === "Uncategorized" || cat === "Без категории") return t("common.uncategorized");
    
    // Custom database category translations
    const cleanCat = cat.trim().toLowerCase();
    if (cleanCat === "pedagogika" || cleanCat === "pedagogy") {
      return lang === "uz" ? "Pedagogika" : lang === "en" ? "Pedagogy" : "Педагогика";
    }
    if (cleanCat === "tibbiyot" || cleanCat === "medicine") {
      return lang === "uz" ? "Tibbiyot" : lang === "en" ? "Medicine" : "Медицина";
    }
    if (cleanCat === "filologiya" || cleanCat === "philology") {
      return lang === "uz" ? "Filologiya" : lang === "en" ? "Philology" : "Филология";
    }
    if (cleanCat === "tarix" || cleanCat === "history") {
      return lang === "uz" ? "Tarix" : lang === "en" ? "History" : "История";
    }
    if (cleanCat === "iqtisodiyot" || cleanCat === "economics") {
      return lang === "uz" ? "Iqtisodiyot" : lang === "en" ? "Economics" : "Экономика";
    }
    
    return cat; // Fallback to raw category
  };

  return (
    <LanguageContext.Provider
      value={{
        language: lang,
        changeLanguage,
        t,
        translateStatus,
        translateCategory
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
