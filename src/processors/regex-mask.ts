import type { LogEntry, PIIMaskingConfig } from '../types'

/**
 * Enhanced regex-based PII masking processor
 */
export function createRegexMaskProcessor(config: PIIMaskingConfig) {
    return (entry: LogEntry): LogEntry => {
        const maskedEntry = { ...entry }
        const maskValue = config.maskValue || '[REDACTED]'
        const deepScan = config.deepScan ?? true

        // Combine regexPatterns and customPatterns for backward compatibility
        const allPatterns = [
            ...(config.regexPatterns || []),
            ...(config.customPatterns || [])
        ]

        // Apply regex patterns to message
        if (allPatterns.length > 0) {
            maskedEntry.msg = applyRegexPatterns(entry.msg, allPatterns)
        }

        // Apply regex patterns to attributes and context
        if (allPatterns.length > 0) {
            if (maskedEntry.attrs) {
                maskedEntry.attrs = deepScan
                    ? applyRegexToDeepObject(maskedEntry.attrs, allPatterns)
                    : applyRegexToShallowObject(maskedEntry.attrs, allPatterns)
            }

            if (maskedEntry.ctx) {
                maskedEntry.ctx = deepScan
                    ? applyRegexToDeepObject(maskedEntry.ctx, allPatterns)
                    : applyRegexToShallowObject(maskedEntry.ctx, allPatterns)
            }
        }

        // Apply path-based masking if specified
        if (config.sensitivePaths && config.sensitivePaths.length > 0) {
            maskedEntry.attrs = maskObjectByPaths(entry.attrs || {}, config.sensitivePaths, maskValue)
            maskedEntry.ctx = maskObjectByPaths(entry.ctx || {}, config.sensitivePaths, maskValue)
        }

        return maskedEntry
    }
}

function applyRegexPatterns(text: string, patterns: Array<{ pattern: RegExp; replacement: string }>): string {
    let result = text
    for (const { pattern, replacement } of patterns) {
        result = result.replace(pattern, replacement)
    }
    return result
}

function applyRegexToShallowObject(
    obj: Record<string, unknown>,
    patterns: Array<{ pattern: RegExp; replacement: string }>
): Record<string, unknown> {
    const result = { ...obj }

    for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string') {
            result[key] = applyRegexPatterns(value, patterns)
        }
    }

    return result
}

function applyRegexToDeepObject(
    obj: Record<string, unknown>,
    patterns: Array<{ pattern: RegExp; replacement: string }>
): Record<string, unknown> {
    const result = { ...obj }

    for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string') {
            result[key] = applyRegexPatterns(value, patterns)
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = applyRegexToDeepObject(value as Record<string, unknown>, patterns)
        } else if (Array.isArray(value)) {
            result[key] = value.map(item => {
                if (typeof item === 'string') {
                    return applyRegexPatterns(item, patterns)
                } else if (item && typeof item === 'object') {
                    return applyRegexToDeepObject(item as Record<string, unknown>, patterns)
                }
                return item
            })
        }
    }

    return result
}

function maskObjectByPaths(
    obj: Record<string, unknown>,
    paths: string[],
    maskValue: string
): Record<string, unknown> {
    const result = { ...obj }

    for (const path of paths) {
        const keys = path.split('.')
        maskNestedValue(result, keys, maskValue)
    }

    return result
}

function maskNestedValue(
    obj: Record<string, unknown>,
    keys: string[],
    maskValue: string
): void {
    if (keys.length === 0) return

    const [currentKey, ...remainingKeys] = keys
    if (!currentKey) return

    if (remainingKeys.length === 0) {
        // This is the final key, mask it
        if (obj[currentKey] !== undefined) {
            obj[currentKey] = maskValue
        }
    } else {
        // Navigate deeper
        const currentValue = obj[currentKey]
        if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
            maskNestedValue(currentValue as Record<string, unknown>, remainingKeys, maskValue)
        }
    }
}

/**
 * Common regex patterns for PII masking
 */
export const commonRegexPatterns = {
    // Credit card numbers (various formats)
    creditCard: {
        pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        replacement: '****-****-****-****',
        description: 'Credit card numbers'
    },

    // Aadhaar Number (India)
    aadhaar: {
        pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
        replacement: '****-****-****',
        description: 'Aadhaar Numbers'
    },

    // PAN Number (India)
    pan: {
        pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
        replacement: '*****####*',
        description: 'PAN Numbers'
    },

    // Email addresses
    email: {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: '***@***.***',
        description: 'Email addresses'
    },

    // Indian phone numbers
    phoneIndia: {
        pattern: /\b(?:\+91[-.\s]?)?[6-9]\d{9}\b/g,
        replacement: '**********',
        description: 'Indian phone numbers'
    },

    // International phone numbers (including India)
    phone: {
        pattern: /\b(?:\+91[-.\s]?)?[6-9]\d{9}\b|\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
        replacement: '***-***-****',
        description: 'Phone numbers (India & International)'
    },

    // IP addresses
    ipv4: {
        pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        replacement: '***.***.***.***',
        description: 'IPv4 addresses'
    },

    // API keys (common patterns)
    apiKey: {
        pattern: /\b[A-Za-z0-9]{20,}\b/g,
        replacement: '***API_KEY***',
        description: 'API keys'
    },

    // JWT tokens
    jwt: {
        pattern: /\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\b/g,
        replacement: '***JWT_TOKEN***',
        description: 'JWT tokens'
    },

    // Passwords (basic heuristic)
    password: {
        pattern: /(password|passwd|pwd)\s*[:=]\s*[^\s,}]+/gi,
        replacement: '$1=***REDACTED***',
        description: 'Password fields'
    },

    // Indian Bank Account Numbers
    bankAccount: {
        pattern: /\b\d{9,18}\b/g,
        replacement: '****-****-****-****',
        description: 'Bank account numbers'
    },

    // Indian IFSC Code
    ifsc: {
        pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
        replacement: '****0******',
        description: 'IFSC codes'
    },

    // Indian UPI ID
    upi: {
        pattern: /\b[A-Za-z0-9._-]+@[a-z]+\b/g,
        replacement: '***@***',
        description: 'UPI IDs'
    },

    // Indian Vehicle Number
    vehicleNumber: {
        pattern: /\b[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}\b/g,
        replacement: '** ** ** ****',
        description: 'Vehicle registration numbers'
    },

    // Indian Driving License
    drivingLicense: {
        pattern: /\b[A-Z]{2}\d{2}\d{4}\d{7}\b/g,
        replacement: '**##****#######',
        description: 'Driving license numbers'
    },

    // Indian Passport
    passport: {
        pattern: /\b[A-Z]{1}\d{7}\b/g,
        replacement: '*#######',
        description: 'Passport numbers'
    }
}
