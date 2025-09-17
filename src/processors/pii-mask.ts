import type { LogEntry, PIIMaskingConfig } from '../types'

/**
 * Enhanced PII masking processor with custom patterns
 */
export function createPIIMaskProcessor(config: PIIMaskingConfig) {
    return (entry: LogEntry): LogEntry => {
        const maskedEntry = { ...entry }
        const maskValue = config.maskValue || '[REDACTED]'

        // Apply path-based masking
        if (config.sensitivePaths && config.sensitivePaths.length > 0) {
            maskedEntry.attrs = maskObjectByPaths(entry.attrs || {}, config.sensitivePaths, maskValue)
            maskedEntry.ctx = maskObjectByPaths(entry.ctx || {}, config.sensitivePaths, maskValue)
        }

        // Apply custom regex patterns
        if (config.customPatterns) {
            maskedEntry.msg = applyCustomPatterns(entry.msg, config.customPatterns)
            if (maskedEntry.attrs) {
                maskedEntry.attrs = applyCustomPatternsToObject(maskedEntry.attrs, config.customPatterns)
            }
            if (maskedEntry.ctx) {
                maskedEntry.ctx = applyCustomPatternsToObject(maskedEntry.ctx, config.customPatterns)
            }
        }

        return maskedEntry
    }
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

function applyCustomPatterns(text: string, patterns: Array<{ pattern: RegExp; replacement: string }>): string {
    let result = text
    for (const { pattern, replacement } of patterns) {
        result = result.replace(pattern, replacement)
    }
    return result
}

function applyCustomPatternsToObject(
    obj: Record<string, unknown>,
    patterns: Array<{ pattern: RegExp; replacement: string }>
): Record<string, unknown> {
    const result = { ...obj }

    for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'string') {
            result[key] = applyCustomPatterns(value, patterns)
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = applyCustomPatternsToObject(value as Record<string, unknown>, patterns)
        }
    }

    return result
}
