const config = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'zh-CN', 'es', 'fr', 'de'],
        localeDetection: true,
    },
    fallbackLng: {
        'zh-CN': ['zh', 'en'],
        'zh-TW': ['zh', 'en'],
        'zh-HK': ['zh', 'en'],
        default: ['en'],
    },
    ns: [
        'common',
        'auth',
        'users',
        'subscriptions',
        'analytics',
        'navigation',
        'forms',
        'errors',
    ],
    defaultNS: 'common',
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};

export default config;