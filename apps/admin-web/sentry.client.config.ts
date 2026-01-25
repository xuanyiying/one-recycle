import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Environment
    environment: process.env.NODE_ENV,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION,

    // Error filtering
    beforeSend(event, hint) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
            return null;
        }

        // Filter out network errors that are not actionable
        if (event.exception) {
            const error = hint.originalException;
            if (error instanceof Error) {
                // Skip network timeout errors
                if (error.message.includes('timeout') || error.message.includes('Network Error')) {
                    return null;
                }

                // Skip authentication errors (handled by app)
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    return null;
                }
            }
        }

        return event;
    },

    // User context
    initialScope: {
        tags: {
            component: 'admin-dashboard',
        },
    },
});