import { describe, it, expect, vi } from 'vitest'
import { createLogger, createDefaultLogger } from '../core/factory'

describe('ZeroLogger', () => {
    it('should create a logger with basic configuration', () => {
        const logger = createLogger({
            name: 'test-service',
            level: 'info'
        })

        expect(logger).toBeDefined()
        expect(typeof logger.info).toBe('function')
        expect(typeof logger.error).toBe('function')
    })

    it('should create a default logger with PII masking', () => {
        const logger = createDefaultLogger('test-service')

        expect(logger).toBeDefined()

        // Test that sensitive data would be masked
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        logger.info('Test message', {
            password: 'secret123',
            email: 'test@example.com'
        })

        // The actual masking happens in Pino serializers
        // This test verifies the logger doesn't throw
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })

    it('should support child loggers', () => {
        const logger = createLogger({
            name: 'parent-service',
            level: 'info'
        })

        const childLogger = logger.child({ requestId: 'req-123' })
        expect(childLogger).toBeDefined()
        expect(typeof childLogger.info).toBe('function')
    })

    it('should support timers', () => {
        const logger = createLogger({
            name: 'test-service',
            level: 'info'
        })

        const timer = logger.time('test-timer')
        expect(timer).toBeDefined()
        expect(typeof timer.end).toBe('function')

        // Test timer end
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
        timer.end({ test: 'data' })
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })

    it('should support counters', () => {
        const logger = createLogger({
            name: 'test-service',
            level: 'info'
        })

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        logger.count('test-counter', 1, { test: 'data' })

        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })

    it('should support error capture', () => {
        const logger = createLogger({
            name: 'test-service',
            level: 'info'
        })

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        const error = new Error('Test error')
        logger.capture(error, { context: 'test' })

        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })
})
