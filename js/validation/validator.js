// validator.js - Validation Orchestrator for TextScore.io
// Coordinates all detection utilities with clear interfaces
// Centralizes validation logic and provides unified results

import { isCodeDetected } from '../detectors/codeDetector.js';
import { isEmojiOverload } from '../detectors/emojiDetector.js';
import { detectPII } from '../detectors/piiDetector.js';
import { isLoremIpsum } from '../detectors/loremDetector.js';
import { MIN_CHARS, MAX_CHARS } from '../utils/constants.js';

/**
 * Run comprehensive validation on text
 * Orchestrates all detection utilities and determines primary issues
 * @param {string} text - Text to validate
 * @returns {Object} Validation results with recommendations
 */
export function runValidation(text) {
    if (!text || typeof text !== 'string') {
        return {
            isValid: false,
            primaryIssue: 'empty',
            shouldDisable: true,
            issues: ['No text provided'],
            details: {
                hasCode: false,
                emojiResult: { hasOverload: false, details: null },
                piiResult: { hasPII: false, details: null },
                hasLoremIpsum: false,
                textLength: 0
            },
            warnings: [],
            canProceed: false,
            message: 'Please enter text to analyze'
        };
    }

    const textLength = text.length;
    
    // Length validation
    const lengthValidation = validateLength(text);
    if (!lengthValidation.isValid) {
        return {
            isValid: false,
            primaryIssue: lengthValidation.issue,
            shouldDisable: true,
            issues: [lengthValidation.message],
            details: {
                hasCode: false,
                emojiResult: { hasOverload: false, details: null },
                piiResult: { hasPII: false, details: null },
                hasLoremIpsum: false,
                textLength
            },
            warnings: [],
            canProceed: false,
            message: lengthValidation.message
        };
    }

    // Run all detections
    const hasCode = isCodeDetected(text);
    const emojiResult = isEmojiOverload(text);
    const piiResult = detectPII(text);
    const hasLoremIpsum = isLoremIpsum(text);

    // Determine primary issue (priority order)
    const primaryIssue = determinePrimaryIssue(text, {
        hasCode,
        emojiResult,
        piiResult,
        hasLoremIpsum
    });

    // Determine if analysis should be disabled
    const shouldDisable = shouldDisableAnalysis(text, {
        hasCode,
        emojiResult,
        piiResult,
        hasLoremIpsum
    });

    // Collect all issues
    const issues = collectIssues({
        hasCode,
        emojiResult,
        piiResult,
        hasLoremIpsum
    });

    // Generate warnings (non-blocking issues)
    const warnings = generateWarnings({
        hasCode,
        emojiResult,
        piiResult,
        hasLoremIpsum
    });

    return {
        isValid: issues.length === 0,
        primaryIssue,
        shouldDisable,
        issues,
        details: {
            hasCode,
            emojiResult,
            piiResult,
            hasLoremIpsum,
            textLength
        },
        warnings,
        canProceed: !shouldDisable,
        message: getValidationMessage(primaryIssue, issues, warnings)
    };
}

/**
 * Validate text length against limits
 * @param {string} text - Text to validate
 * @returns {Object} Length validation result
 */
function validateLength(text) {
    const length = text.length;
    
    if (length < MIN_CHARS) {
        return {
            isValid: false,
            issue: 'too_short',
            message: `Text must be at least ${MIN_CHARS} characters for analysis. Current: ${length} characters.`
        };
    }
    
    if (length > MAX_CHARS) {
        return {
            isValid: false,
            issue: 'too_long',
            message: `Text exceeds ${MAX_CHARS} character limit. Current: ${length} characters. Please shorten your text.`
        };
    }
    
    return {
        isValid: true,
        issue: null,
        message: `Text length is valid (${length} characters)`
    };
}

/**
 * Determine the primary issue that should be displayed to user
 * Priority: Code > Lorem > Emoji > PII
 * @param {string} text - Original text
 * @param {Object} detectionResults - Results from all detectors
 * @returns {string|null} Primary issue type
 */
function determinePrimaryIssue(text, detectionResults) {
    const { hasCode, emojiResult, piiResult, hasLoremIpsum } = detectionResults;
    
    // Priority-based issue detection
    if (hasCode) return 'code';
    if (hasLoremIpsum) return 'lorem';
    if (emojiResult.hasOverload) return 'emoji';
    if (piiResult.hasPII) return 'pii';
    
    return null; // No issues found
}

/**
 * Determine if analysis should be completely disabled
 * @param {string} text - Original text
 * @param {Object} detectionResults - Results from all detectors
 * @returns {boolean} True if analysis should be disabled
 */
function shouldDisableAnalysis(text, detectionResults) {
    const { hasCode, hasLoremIpsum, emojiResult } = detectionResults;
    
    // Hard blockers - prevent analysis entirely
    if (hasCode) return true;
    if (hasLoremIpsum) return true;
    if (emojiResult.hasOverload) return true;
    
    // PII is a warning but doesn't block analysis (user can proceed)
    return false;
}

/**
 * Collect all detected issues
 * @param {Object} detectionResults - Results from all detectors
 * @returns {string[]} Array of issue descriptions
 */
function collectIssues(detectionResults) {
    const { hasCode, emojiResult, piiResult, hasLoremIpsum } = detectionResults;
    const issues = [];
    
    if (hasCode) {
        issues.push('Code detected - TextScore is designed for written content, not source code');
    }
    
    if (hasLoremIpsum) {
        issues.push('Lorem Ipsum placeholder text detected - Replace with actual content for analysis');
    }
    
    if (emojiResult.hasOverload) {
        const triggers = emojiResult.details?.triggers || [];
        issues.push(`Emoji overload detected: ${triggers.join(', ')}`);
    }
    
    if (piiResult.hasPII) {
        issues.push(`Personally identifiable information detected: ${piiResult.details.summary}`);
    }
    
    return issues;
}

/**
 * Generate warnings for non-blocking issues
 * @param {Object} detectionResults - Results from all detectors
 * @returns {string[]} Array of warning messages
 */
function generateWarnings(detectionResults) {
    const { piiResult } = detectionResults;
    const warnings = [];
    
    // PII is a warning that user can acknowledge and proceed
    if (piiResult.hasPII) {
        warnings.push('Personal information detected - Review before proceeding with analysis');
    }
    
    return warnings;
}

/**
 * Generate appropriate validation message based on results
 * @param {string|null} primaryIssue - Main issue detected
 * @param {string[]} issues - All issues found
 * @param {string[]} warnings - All warnings found
 * @returns {string} User-friendly validation message
 */
function getValidationMessage(primaryIssue, issues, warnings) {
    if (issues.length === 0 && warnings.length === 0) {
        return 'Text is ready for analysis';
    }
    
    if (primaryIssue === 'code') {
        return 'Code detected. TextScore is designed for analyzing written content, not source code.';
    }
    
    if (primaryIssue === 'lorem') {
        return 'Lorem Ipsum placeholder text detected. Please replace with actual content for meaningful analysis.';
    }
    
    if (primaryIssue === 'emoji') {
        return 'High emoji usage detected. Consider reducing emojis for better readability analysis.';
    }
    
    if (primaryIssue === 'pii' && warnings.length > 0) {
        return 'Personal information detected. Please review before proceeding with analysis.';
    }
    
    // Fallback message
    return issues.length > 0 ? issues[0] : warnings[0] || 'Text validation complete';
}

/**
 * Get validation summary for debugging
 * @param {string} text - Text that was validated
 * @returns {Object} Detailed validation summary
 */
export function getValidationSummary(text) {
    const validation = runValidation(text);
    
    return {
        textLength: text?.length || 0,
        lengthValid: text?.length >= MIN_CHARS && text?.length <= MAX_CHARS,
        detectionResults: validation.details,
        primaryIssue: validation.primaryIssue,
        totalIssues: validation.issues.length,
        totalWarnings: validation.warnings.length,
        canProceed: validation.canProceed,
        recommendedAction: getRecommendedAction(validation)
    };
}

/**
 * Get recommended action based on validation results
 * @param {Object} validation - Validation results
 * @returns {string} Recommended action for user
 */
function getRecommendedAction(validation) {
    if (validation.canProceed && validation.warnings.length === 0) {
        return 'Proceed with analysis';
    }
    
    if (!validation.canProceed) {
        switch (validation.primaryIssue) {
            case 'code':
                return 'Replace code with written content';
            case 'lorem':
                return 'Replace placeholder text with actual content';
            case 'emoji':
                return 'Reduce emoji usage';
            case 'too_short':
                return `Add more text (need ${MIN_CHARS - (validation.details?.textLength || 0)} more characters)`;
            case 'too_long':
                return `Shorten text by ${(validation.details?.textLength || 0) - MAX_CHARS} characters`;
            default:
                return 'Fix detected issues';
        }
    }
    
    if (validation.warnings.length > 0) {
        return 'Review warnings and proceed if acceptable';
    }
    
    return 'Review and proceed';
}