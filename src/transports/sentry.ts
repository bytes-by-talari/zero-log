import type { LogEntry, SentryTransportOptions } from '../types'

/**
 * Sentry transport for error reporting and breadcrumbs
 */
export function createSentryTransport(options: SentryTransportOptions) {
    let sentry: any = null

    // Lazy load Sentry to avoid requiring it as a hard dependency
    const loadSentry = async () => {
        if (sentry) return sentry

        try {
            // Try to load Sentry based on environment
            if (typeof window !== 'undefined') {
                // Browser environment
                try {
                    const sentryModule = await eval('import("@sentry/browser")')
                    sentry = {
                        init: sentryModule.init,
                        captureException: sentryModule.captureException,
                        addBreadcrumb: sentryModule.addBreadcrumb
                    }
                } catch (importError) {
                    console.warn('@sentry/browser not available, Sentry transport disabled')
                    return null
                }
            } else {
                // Node.js environment
                try {
                    const sentryModule = await eval('import("@sentry/node")')
                    sentry = {
                        init: sentryModule.init,
                        captureException: sentryModule.captureException,
                        addBreadcrumb: sentryModule.addBreadcrumb
                    }
                } catch (importError) {
                    console.warn('@sentry/node not available, Sentry transport disabled')
                    return null
                }
            }

            // Initialize Sentry if DSN is provided
            if (options.dsn) {
                sentry.init({
                    dsn: options.dsn,
                    environment: process.env.NODE_ENV || 'development'
                })
            }

            return sentry
        } catch (error) {
            console.warn('Failed to load Sentry transport:', error)
            return null
        }
    }

    return async (entry: LogEntry): Promise<void> => {
        const sentryInstance = await loadSentry()
        if (!sentryInstance) return

        const { level, msg, attrs, ctx } = entry
        const errorSampleRate = options.errorSampleRate ?? 1.0
        const breadcrumbSampleRate = options.breadcrumbSampleRate ?? 1.0

        // Handle error and fatal levels
        if ((level === 'error' || level === 'fatal') && Math.random() < errorSampleRate) {
            const error = attrs?.error || attrs?.err
            if (error instanceof Error) {
                sentryInstance.captureException(error, {
                    tags: {
                        level,
                        logger: entry.name
                    },
                    extra: {
                        message: msg,
                        context: ctx,
                        attributes: attrs
                    }
                })
            } else {
                // Create a synthetic error for non-Error objects
                const syntheticError = new Error(msg)
                sentryInstance.captureException(syntheticError, {
                    tags: {
                        level,
                        logger: entry.name
                    },
                    extra: {
                        message: msg,
                        context: ctx,
                        attributes: attrs
                    }
                })
            }
        }

        // Add breadcrumbs for all levels
        if (Math.random() < breadcrumbSampleRate) {
            sentryInstance.addBreadcrumb({
                message: msg,
                level: level as any,
                category: 'log',
                data: {
                    logger: entry.name,
                    context: ctx,
                    attributes: attrs,
                    ...options.context
                }
            })
        }
    }
}
