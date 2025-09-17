import { createLogger, createProductionLogger, commonRegexPatterns } from '../src'
import type { LoggerOptions } from '../src'

// India-specific PII masking configuration
const indiaConfig: LoggerOptions = {
    name: 'india-financial-service',
    level: 'info',
    piiMasking: {
        // Path-based masking for known sensitive fields
        sensitivePaths: [
            'aadhaar',
            'pan',
            'bankAccount',
            'ifsc',
            'upi',
            'vehicleNumber',
            'drivingLicense',
            'passport',
            'phone',
            'email',
            'password'
        ],
        maskValue: '[REDACTED]',

        // India-specific regex patterns
        regexPatterns: [
            commonRegexPatterns.aadhaar,
            commonRegexPatterns.pan,
            commonRegexPatterns.phoneIndia,
            commonRegexPatterns.bankAccount,
            commonRegexPatterns.ifsc,
            commonRegexPatterns.upi,
            commonRegexPatterns.vehicleNumber,
            commonRegexPatterns.drivingLicense,
            commonRegexPatterns.passport,
            commonRegexPatterns.email,
            commonRegexPatterns.password
        ],
        deepScan: true
    }
}

const logger = createLogger(indiaConfig)

// Test India-specific PII masking
console.log('Testing India-specific PII masking...\n')

// Test 1: Aadhaar and PAN masking
logger.info('User KYC verification', {
    user: {
        name: 'Rajesh Kumar',
        aadhaar: '1234 5678 9012', // Will be masked to ****-****-****
        pan: 'ABCDE1234F', // Will be masked to *****####*
        email: 'rajesh@example.com' // Will be masked to ***@***.***
    }
})

// Test 2: Banking information
logger.info('Bank account verification', {
    account: {
        accountNumber: '1234567890123456', // Will be masked to ****-****-****-****
        ifsc: 'SBIN0001234', // Will be masked to ****0******
        upi: 'rajesh@paytm', // Will be masked to ***@***
        phone: '+91 9876543210' // Will be masked to **********
    }
})

// Test 3: Vehicle and license information
logger.info('Vehicle registration', {
    vehicle: {
        number: 'KA01 AB 1234', // Will be masked to ** ** ** ****
        owner: {
            name: 'Rajesh Kumar',
            drivingLicense: 'KA0120141234567', // Will be masked to **##****#######
            passport: 'A1234567' // Will be masked to *#######
        }
    }
})

// Test 4: Financial transaction
logger.info('UPI payment processed', {
    transaction: {
        from: 'rajesh@paytm', // Will be masked to ***@***
        to: 'merchant@phonepe', // Will be masked to ***@***
        amount: 1500,
        upiRef: 'UPI123456789'
    },
    user: {
        phone: '9876543210', // Will be masked to **********
        aadhaar: '123456789012' // Will be masked to ****-****-****
    }
})

// Test 5: Mixed data with nested objects
logger.info('Loan application processing', {
    application: {
        applicant: {
            name: 'Priya Sharma',
            aadhaar: '9876 5432 1098', // Will be masked
            pan: 'XYZAB1234C', // Will be masked
            phone: '+91 8765432109', // Will be masked
            email: 'priya@example.com' // Will be masked
        },
        bankDetails: {
            accountNumber: '9876543210987654', // Will be masked
            ifsc: 'HDFC0001234', // Will be masked
            upi: 'priya@googlepay' // Will be masked
        },
        documents: {
            drivingLicense: 'DL0120149876543', // Will be masked
            passport: 'B9876543' // Will be masked
        }
    }
})

// Test 6: Production logger with all India patterns
console.log('\nTesting production logger with India patterns...')
const prodLogger = createProductionLogger('india-prod-service')

prodLogger.info('Production log with Indian PII', {
    customer: {
        name: 'Amit Singh',
        aadhaar: '1111 2222 3333',
        pan: 'ABCDE5678F',
        phone: '9123456789',
        email: 'amit@company.com',
        bankAccount: '1111222233334444',
        ifsc: 'ICIC0001111',
        upi: 'amit@ybl'
    },
    vehicle: {
        number: 'MH02 CD 5678',
        ownerLicense: 'MH0220141111111'
    }
})

console.log('\n✅ India-specific PII masking tests completed!')
