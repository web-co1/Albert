// piiDetector.js - Pure PII detection functions for TextScore.io
// Extracted from main.js for better modularity and testability
// No dependencies, no side effects - pure detection logic

/**
 * Detect Personally Identifiable Information (PII) in text
 * @param {string} text - Text to analyze
 * @returns {Object} Detection result with details
 */
export function detectPII(text) {
    if (!text || text.trim().length < 5) return { hasPII: false, details: null };
    
    // Comprehensive PII detection patterns
    const PII_PATTERNS = {
        email: {
            regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
            name: 'Email addresses',
            description: 'email addresses'
        },
        phone: {
            regex: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}\b/g,
            name: 'Phone numbers',
            description: 'phone numbers'
        },
        ssn: {
            regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
            name: 'Social Security Numbers',
            description: 'social security numbers'
        },
        hexKey: {
            regex: /\b[0-9A-Fa-f]{64}\b/g,
            name: 'Private keys',
            description: 'private keys or long hex strings'
        },
        creditCard: {
            regex: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
            name: 'Credit card numbers',
            description: 'credit card numbers'
        },
        apiKey: {
            regex: /\b(?:sk|pk|api|key)_[A-Za-z0-9]{20,}\b/gi,
            name: 'API keys',
            description: 'API keys'
        }
    };
    
    const detectedTypes = [];
    const allMatches = [];
    const piiHighlights = [];
    
    // Scan for each PII type
    Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
        const matches = [...text.matchAll(pattern.regex)];
        
        if (matches.length > 0) {
            detectedTypes.push({
                type,
                name: pattern.name,
                description: pattern.description,
                count: matches.length,
                matches: matches.map(match => ({
                    value: match[0],
                    index: match.index,
                    length: match[0].length
                }))
            });
            
            // Store matches for highlighting
            matches.forEach(match => {
                allMatches.push({
                    type,
                    value: match[0],
                    index: match.index,
                    length: match[0].length
                });
                
                piiHighlights.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type,
                    value: match[0]
                });
            });
        }
    });
    
    const hasPII = detectedTypes.length > 0;
    
    const details = {
        detectedTypes,
        totalMatches: allMatches.length,
        allMatches,
        piiHighlights,
        summary: hasPII ? 
            `Found ${detectedTypes.map(t => `${t.count} ${t.description}`).join(', ')}` :
            'No PII detected'
    };
    
    return { hasPII, details };
}

/**
 * Check if text contains specific PII types
 * @param {string} text - Text to analyze
 * @param {string[]} types - PII types to check for
 * @returns {Object} Detection result for specified types
 */
export function detectSpecificPII(text, types = []) {
    const fullResult = detectPII(text);
    
    if (!fullResult.hasPII || types.length === 0) {
        return fullResult;
    }
    
    const filteredTypes = fullResult.details.detectedTypes.filter(
        detected => types.includes(detected.type)
    );
    
    const filteredMatches = fullResult.details.allMatches.filter(
        match => types.includes(match.type)
    );
    
    const filteredHighlights = fullResult.details.piiHighlights.filter(
        highlight => types.includes(highlight.type)
    );
    
    return {
        hasPII: filteredTypes.length > 0,
        details: {
            detectedTypes: filteredTypes,
            totalMatches: filteredMatches.length,
            allMatches: filteredMatches,
            piiHighlights: filteredHighlights,
            summary: filteredTypes.length > 0 ?
                `Found ${filteredTypes.map(t => `${t.count} ${t.description}`).join(', ')}` :
                'No specified PII types detected'
        }
    };
}

/**
 * Get PII statistics for text
 * @param {string} text - Text to analyze
 * @returns {Object} PII statistics
 */
export function getPIIStats(text) {
    const result = detectPII(text);
    
    if (!result.hasPII) {
        return {
            hasPII: false,
            typeCount: 0,
            totalMatches: 0,
            coverage: 0,
            types: []
        };
    }
    
    const totalChars = text.length;
    const piiChars = result.details.allMatches.reduce(
        (total, match) => total + match.length, 0
    );
    
    return {
        hasPII: true,
        typeCount: result.details.detectedTypes.length,
        totalMatches: result.details.totalMatches,
        coverage: ((piiChars / totalChars) * 100).toFixed(2),
        types: result.details.detectedTypes.map(type => ({
            type: type.type,
            name: type.name,
            count: type.count
        }))
    };
}

/**
 * Mask PII in text (for safe display)
 * @param {string} text - Text containing PII
 * @param {string} maskChar - Character to use for masking (default: '*')
 * @returns {string} Text with PII masked
 */
export function maskPII(text, maskChar = '*') {
    const result = detectPII(text);
    
    if (!result.hasPII) {
        return text;
    }
    
    let maskedText = text;
    
    // Sort matches by index in reverse order to avoid offset issues
    const sortedMatches = result.details.allMatches.sort((a, b) => b.index - a.index);
    
    sortedMatches.forEach(match => {
        const before = maskedText.substring(0, match.index);
        const after = maskedText.substring(match.index + match.length);
        const mask = maskChar.repeat(match.length);
        
        maskedText = before + mask + after;
    });
    
    return maskedText;
}

/**
 * Validate if a string matches a specific PII pattern
 * @param {string} value - Value to validate
 * @param {string} type - PII type to validate against
 * @returns {boolean} True if value matches the pattern
 */
export function validatePIIPattern(value, type) {
    const patterns = {
        email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        phone: /^(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}$/,
        ssn: /^\d{3}-?\d{2}-?\d{4}$/,
        hexKey: /^[0-9A-Fa-f]{64}$/,
        creditCard: /^(?:\d{4}[\s-]?){3}\d{4}$/,
        apiKey: /^(?:sk|pk|api|key)_[A-Za-z0-9]{20,}$/i
    };
    
    const pattern = patterns[type];
    return pattern ? pattern.test(value.trim()) : false;
}