import type { Logger, LoggerOptions } from '../types'
import { ZeroLogger } from './logger'
import { commonRegexPatterns } from '../processors/regex-mask'

/**
 * Create a new zero-log logger instance
 */
export function createLogger(options: LoggerOptions): Logger {
    return new ZeroLogger(options)
}

/**
 * Create a logger with sensible defaults
 */
export function createDefaultLogger(name: string, options: Partial<LoggerOptions> = {}): Logger {
    const defaultOptions: LoggerOptions = {
        name,
        level: 'info',
        mode: 'development',
        piiMasking: {
            sensitivePaths: [
                'password',
                'token',
                'secret',
                'key',
                'ssn',
                'creditCard',
                'cardNumber',
                'cvv',
                'email',
                'phone',
                'address'
            ],
            maskValue: '[REDACTED]',
            regexPatterns: [
                commonRegexPatterns.email,
                commonRegexPatterns.creditCard,
                commonRegexPatterns.aadhaar,
                commonRegexPatterns.pan,
                commonRegexPatterns.phoneIndia,
                commonRegexPatterns.password
            ],
            deepScan: true
        }
    }

    return createLogger({ ...defaultOptions, ...options })
}

/**
 * Create a production logger with enhanced PII masking
 */
export function createProductionLogger(name: string, options: Partial<LoggerOptions> = {}): Logger {
    const productionOptions: LoggerOptions = {
        name,
        level: 'info',
        mode: 'production',
        piiMasking: {
            sensitivePaths: [
                'password',
                'token',
                'secret',
                'key',
                'aadhaar',
                'pan',
                'creditCard',
                'cardNumber',
                'cvv',
                'email',
                'phone',
                'address',
                'firstName',
                'lastName',
                'dateOfBirth',
                'ip',
                'userAgent',
                'bankAccount',
                'ifsc',
                'upi',
                'vehicleNumber',
                'drivingLicense',
                'passport'
            ],
            maskValue: '[REDACTED]',
            partialMasking: true,
            regexPatterns: [
                commonRegexPatterns.email,
                commonRegexPatterns.creditCard,
                commonRegexPatterns.aadhaar,
                commonRegexPatterns.pan,
                commonRegexPatterns.phoneIndia,
                commonRegexPatterns.password,
                commonRegexPatterns.ipv4,
                commonRegexPatterns.apiKey,
                commonRegexPatterns.jwt,
                commonRegexPatterns.bankAccount,
                commonRegexPatterns.ifsc,
                commonRegexPatterns.upi,
                commonRegexPatterns.vehicleNumber,
                commonRegexPatterns.drivingLicense,
                commonRegexPatterns.passport
            ],
            deepScan: true
        }
    }

    return createLogger({ ...productionOptions, ...options })
}
