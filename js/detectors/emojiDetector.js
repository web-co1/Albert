// emojiDetector.js - Pure emoji detection functions for TextScore.io
// Extracted from main.js for better modularity and testability
// No dependencies, no side effects - pure detection logic

/**
 * Detect if text has emoji overload based on multiple criteria
 * @param {string} text - Text to analyze
 * @returns {Object} Detection result with details
 */
export function isEmojiOverload(text) {
    if (!text || text.trim().length < 10) return { hasOverload: false, details: null };
    
    // Comprehensive emoji regex covering major Unicode ranges
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu;
    
    // Common emoticons regex - refined to prevent false positives with punctuation
    // Only matches emoticons that are properly separated by word boundaries
    const emoticonRegex = /(?:^|\s)([:;=8xX][-o*'^]?[)D(\/\\OpPdpb]|[)D(\/\\OpPdpb][-o*'^]?[:;=8xX]|<3|<\/3|\^_\^|\^-\^|>_<|@_@|\*_\*|\+_\+|[oO]_[oO]|[tT]_[tT]|;_;|:'[()]|:-?\)|;-?\)|=-?\)|8-?\)|:-?\(|;-?\(|=-?\(|8-?\()(?=\s|$|[.!?])/g;
    
    // Find all emoji matches
    const emojiMatches = text.match(emojiRegex) || [];
    const emoticonMatches = text.match(emoticonRegex) || [];
    const totalEmojis = emojiMatches.length + emoticonMatches.length;
    
    // Calculate basic emoji percentage (lowered threshold)
    const emojiPercentage = (totalEmojis / text.length) * 100;
    
    // NEW: Word-based ratio analysis
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const emojiToWordRatio = wordCount > 0 ? (totalEmojis / wordCount) : 0;
    
    // NEW: Sentence-based density analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(sentences.length, 1); // Avoid division by zero
    
    // Count sentences containing emojis
    const combinedRegex = new RegExp(`(${emojiRegex.source}|${emoticonRegex.source.replace(/\//g, '\\/')})`, 'gu');
    const emojiSentences = sentences.filter(sentence => combinedRegex.test(sentence));
    const sentenceDensityRatio = emojiSentences.length / sentenceCount;
    
    // NEW: Emoji frequency analysis (emojis per sentence)
    const emojisPerSentence = totalEmojis / sentenceCount;
    
    // Check for contiguous sequences (keep existing logic)
    let maxContiguousSequence = 0;
    let contiguousRuns = [];
    
    const allMatches = [...text.matchAll(combinedRegex)];
    
    if (allMatches.length > 0) {
        let currentRun = [];
        let lastIndex = -2;
        
        allMatches.forEach((match, i) => {
            const currentIndex = match.index;
            
            // Check if this emoji is adjacent to the previous one (allowing for spaces)
            if (currentIndex <= lastIndex + 2) {
                currentRun.push({ match: match[0], index: currentIndex });
            } else {
                // End of current run
                if (currentRun.length >= 5) {
                    contiguousRuns.push({
                        start: currentRun[0].index,
                        end: currentRun[currentRun.length - 1].index + currentRun[currentRun.length - 1].match.length,
                        count: currentRun.length,
                        emojis: currentRun.map(r => r.match)
                    });
                }
                maxContiguousSequence = Math.max(maxContiguousSequence, currentRun.length);
                currentRun = [{ match: match[0], index: currentIndex }];
            }
            
            lastIndex = currentIndex + match[0].length;
        });
        
        // Check final run
        if (currentRun.length >= 5) {
            contiguousRuns.push({
                start: currentRun[0].index,
                end: currentRun[currentRun.length - 1].index + currentRun[currentRun.length - 1].match.length,
                count: currentRun.length,
                emojis: currentRun.map(r => r.match)
            });
        }
        maxContiguousSequence = Math.max(maxContiguousSequence, currentRun.length);
    }
    
    // Enhanced detection criteria
    const hasSequenceOverload = maxContiguousSequence >= 5;
    const hasPercentageOverload = emojiPercentage > 8; // Lowered from 20% to 8%
    const hasWordRatioOverload = emojiToWordRatio > 0.5; // More than 1 emoji per 2 words
    const hasDensityOverload = sentenceDensityRatio > 0.6; // 60% of sentences contain emojis
    const hasFrequencyOverload = emojisPerSentence > 2; // More than 2 emojis per sentence on average
    
    // Determine if there's an overload (any trigger condition)
    const hasOverload = hasSequenceOverload || hasPercentageOverload || 
                       hasWordRatioOverload || hasDensityOverload || hasFrequencyOverload;
    
    const details = {
        // Original metrics
        totalEmojis,
        emojiPercentage: Math.round(emojiPercentage * 10) / 10,
        maxContiguousSequence,
        contiguousRuns,
        
        // New metrics
        wordCount,
        emojiToWordRatio: Math.round(emojiToWordRatio * 10) / 10,
        sentenceCount,
        emojiSentences: emojiSentences.length,
        sentenceDensityRatio: Math.round(sentenceDensityRatio * 100) / 100,
        emojisPerSentence: Math.round(emojisPerSentence * 10) / 10,
        
        // Trigger flags
        hasSequenceOverload,
        hasPercentageOverload,
        hasWordRatioOverload,
        hasDensityOverload,
        hasFrequencyOverload,
        
        triggers: []
    };
    
    // Build descriptive trigger messages
    if (hasSequenceOverload) {
        details.triggers.push(`${maxContiguousSequence} emojis in sequence`);
    }
    if (hasPercentageOverload) {
        details.triggers.push(`${details.emojiPercentage}% emoji content`);
    }
    if (hasWordRatioOverload) {
        details.triggers.push(`${details.emojiToWordRatio} emojis per word`);
    }
    if (hasDensityOverload) {
        details.triggers.push(`${Math.round(sentenceDensityRatio * 100)}% of sentences contain emojis`);
    }
    if (hasFrequencyOverload) {
        details.triggers.push(`${details.emojisPerSentence} emojis per sentence average`);
    }
    
    return { hasOverload, details };
}

/**
 * Count emojis in text (simple count)
 * @param {string} text - Text to analyze
 * @returns {number} Total emoji count
 */
export function countEmojis(text) {
    if (!text) return 0;
    
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu;
    const emoticonRegex = /(?:^|\s)([:;=8xX][-o*'^]?[)D(\/\\OpPdpb]|[)D(\/\\OpPdpb][-o*'^]?[:;=8xX]|<3|<\/3|\^_\^|\^-\^|>_<|@_@|\*_\*|\+_\+|[oO]_[oO]|[tT]_[tT]|;_;|:'[()]|:-?\)|;-?\)|=-?\)|8-?\)|:-?\(|;-?\(|=-?\(|8-?\()(?=\s|$|[.!?])/g;
    
    const emojiMatches = text.match(emojiRegex) || [];
    const emoticonMatches = text.match(emoticonRegex) || [];
    
    return emojiMatches.length + emoticonMatches.length;
}

/**
 * Get emoji analysis with threshold customization
 * @param {string} text - Text to analyze
 * @param {Object} thresholds - Custom thresholds for detection
 * @returns {Object} Detailed emoji analysis
 */
export function analyzeEmojis(text, thresholds = {}) {
    const defaultThresholds = {
        percentageLimit: 8,
        wordRatioLimit: 0.5,
        densityLimit: 0.6,
        frequencyLimit: 2,
        sequenceLimit: 5
    };
    
    const config = { ...defaultThresholds, ...thresholds };
    const result = isEmojiOverload(text);
    
    return {
        ...result,
        thresholds: config,
        recommendation: result.hasOverload 
            ? 'Consider reducing emoji usage for better readability'
            : 'Emoji usage is within acceptable limits'
    };
}