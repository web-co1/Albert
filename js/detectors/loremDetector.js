// loremDetector.js - Pure Lorem Ipsum detection functions for TextScore.io
// Extracted from main.js for better modularity and testability
// No dependencies, no side effects - pure detection logic

/**
 * Detect if text is Lorem Ipsum placeholder content
 * @param {string} text - Text to analyze
 * @returns {boolean} True if Lorem Ipsum is detected
 */
export function isLoremIpsum(text) {
    if (!text || text.trim().length < 20) return false;
    
    // Signature Lorem Ipsum phrases (case-insensitive)
    const loremSignatures = [
        'lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
        'sed do eiusmod tempor incididunt',
        'ut labore et dolore magna aliqua',
        'enim ad minim veniam',
        'quis nostrud exercitation ullamco',
        'duis aute irure dolor in reprehenderit',
        'voluptate velit esse cillum dolore',
        'fugiat nulla pariatur',
        'excepteur sint occaecat cupidatat',
        'non proident sunt in culpa',
        'officia deserunt mollit anim',
        'laborum et dolorum fuga',
        'harum quidem rerum facilis',
        'temporibus autem quibusdam',
        'officiis debitis aut rerum',
        'saepe eveniet ut et voluptates',
        'repudiandae sint et molestiae',
        'itaque earum rerum hic tenetur',
        'sapiente delectus ut aut reiciendis'
    ];
    
    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
    let matchCount = 0;
    
    // Check for exact phrase matches
    for (const signature of loremSignatures) {
        if (normalizedText.includes(signature)) {
            matchCount++;
        }
    }
    
    // Also check for common Lorem Ipsum starting patterns
    const loremStartPatterns = [
        /lorem\s+ipsum/i,
        /dolor\s+sit\s+amet/i,
        /consectetur\s+adipiscing/i,
        /sed\s+do\s+eiusmod/i
    ];
    
    for (const pattern of loremStartPatterns) {
        if (pattern.test(text)) {
            matchCount++;
        }
    }
    
    // Consider it Lorem Ipsum if we find 2 or more signature phrases
    // This prevents false positives while catching most Lorem Ipsum variants
    return matchCount >= 2;
}

/**
 * Get detailed Lorem Ipsum analysis
 * @param {string} text - Text to analyze
 * @returns {Object} Detailed analysis including confidence and matched phrases
 */
export function analyzeLoremIpsum(text) {
    if (!text || text.trim().length < 20) {
        return {
            isLorem: false,
            confidence: 0,
            matchedPhrases: [],
            matchedPatterns: []
        };
    }
    
    const loremSignatures = [
        'lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
        'sed do eiusmod tempor incididunt',
        'ut labore et dolore magna aliqua',
        'enim ad minim veniam',
        'quis nostrud exercitation ullamco',
        'duis aute irure dolor in reprehenderit',
        'voluptate velit esse cillum dolore',
        'fugiat nulla pariatur',
        'excepteur sint occaecat cupidatat',
        'non proident sunt in culpa',
        'officia deserunt mollit anim',
        'laborum et dolorum fuga',
        'harum quidem rerum facilis',
        'temporibus autem quibusdam',
        'officiis debitis aut rerum',
        'saepe eveniet ut et voluptates',
        'repudiandae sint et molestiae',
        'itaque earum rerum hic tenetur',
        'sapiente delectus ut aut reiciendis'
    ];
    
    const loremStartPatterns = [
        { pattern: /lorem\s+ipsum/i, name: 'Lorem Ipsum' },
        { pattern: /dolor\s+sit\s+amet/i, name: 'Dolor Sit Amet' },
        { pattern: /consectetur\s+adipiscing/i, name: 'Consectetur Adipiscing' },
        { pattern: /sed\s+do\s+eiusmod/i, name: 'Sed Do Eiusmod' }
    ];
    
    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
    const matchedPhrases = [];
    const matchedPatterns = [];
    
    // Check for exact phrase matches
    loremSignatures.forEach(signature => {
        if (normalizedText.includes(signature)) {
            matchedPhrases.push(signature);
        }
    });
    
    // Check for pattern matches
    loremStartPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(text)) {
            matchedPatterns.push(name);
        }
    });
    
    const totalMatches = matchedPhrases.length + matchedPatterns.length;
    const isLorem = totalMatches >= 2;
    const confidence = Math.min(100, (totalMatches / loremSignatures.length) * 100);
    
    return {
        isLorem,
        confidence: Math.round(confidence),
        matchedPhrases,
        matchedPatterns,
        totalMatches,
        recommendation: isLorem 
            ? 'Replace Lorem Ipsum with actual content for analysis'
            : 'Content appears to be original text'
    };
}

/**
 * Check if text starts with common Lorem Ipsum patterns
 * @param {string} text - Text to analyze
 * @returns {boolean} True if text starts with Lorem Ipsum
 */
export function startsWithLorem(text) {
    if (!text || text.trim().length < 10) return false;
    
    const startPatterns = [
        /^\s*lorem\s+ipsum/i,
        /^\s*dolor\s+sit\s+amet/i,
        /^\s*consectetur\s+adipiscing/i
    ];
    
    return startPatterns.some(pattern => pattern.test(text));
}

/**
 * Calculate Lorem Ipsum density in text
 * @param {string} text - Text to analyze
 * @returns {Object} Density analysis
 */
export function getLoremDensity(text) {
    if (!text || text.trim().length < 20) {
        return {
            density: 0,
            loremWords: 0,
            totalWords: 0,
            percentage: 0
        };
    }
    
    const loremWords = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea',
        'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit',
        'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
        'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt',
        'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
        'est', 'laborum'
    ];
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    
    if (totalWords === 0) {
        return {
            density: 0,
            loremWords: 0,
            totalWords: 0,
            percentage: 0
        };
    }
    
    const foundLoremWords = words.filter(word => loremWords.includes(word)).length;
    const percentage = (foundLoremWords / totalWords) * 100;
    
    return {
        density: foundLoremWords / totalWords,
        loremWords: foundLoremWords,
        totalWords,
        percentage: Math.round(percentage * 10) / 10
    };
}

/**
 * Replace Lorem Ipsum with placeholder text
 * @param {string} text - Text containing Lorem Ipsum
 * @param {string} replacement - Replacement text (default: "[Content placeholder]")
 * @returns {string} Text with Lorem Ipsum replaced
 */
export function replaceLorem(text, replacement = '[Content placeholder]') {
    if (!isLoremIpsum(text)) {
        return text;
    }
    
    // If the entire text is Lorem Ipsum, replace it entirely
    const analysis = analyzeLoremIpsum(text);
    if (analysis.confidence > 80) {
        return replacement;
    }
    
    // Otherwise, try to replace Lorem Ipsum phrases
    const loremPatterns = [
        /lorem\s+ipsum[^.!?]*[.!?]/gi,
        /dolor\s+sit\s+amet[^.!?]*[.!?]/gi,
        /consectetur\s+adipiscing[^.!?]*[.!?]/gi
    ];
    
    let replacedText = text;
    loremPatterns.forEach(pattern => {
        replacedText = replacedText.replace(pattern, replacement + '. ');
    });
    
    return replacedText;
}