import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Environment
    environment: process.env.NODE_ENV,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // Server-specific configuration
    beforeSend(event, hint) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
            console.error('Sentry Error:', hint.originalException || event);
            return null;
        }

        return event;
    },

    // Initial scope
    initialScope: {
        tags: {
            component: 'admin-dashboard-server',
        },
    },
});