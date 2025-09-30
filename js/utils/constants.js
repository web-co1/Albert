// constants.js - Application constants for TextScore.io
// Extracted from main.js for better centralization and maintainability
// All numeric and string constants used throughout the application

// Text analysis limits
export const MIN_CHARS = 70;
export const MAX_CHARS = 2000;


// UI interaction constants
export const FEEDBACK_DEBOUNCE_DELAY = 300; // milliseconds
export const AUTOSAVE_DELAY = 5000; // milliseconds
export const TOAST_DURATION = 3000; // milliseconds

// Character limits for different validations
export const CODE_DETECTION_MIN_LENGTH = 20;
export const EMOJI_DETECTION_MIN_LENGTH = 10;
export const PII_DETECTION_MIN_LENGTH = 5;
export const LOREM_DETECTION_MIN_LENGTH = 20;

// Live feedback constants
export const LIVE_FEEDBACK_MIN_LENGTH = 10;
export const REPETITIVE_PUNCTUATION_THRESHOLD = 3; // 3+ consecutive punctuation marks

// History management
export const MAX_HISTORY_ENTRIES = 10;
export const HISTORY_CLEANUP_THRESHOLD = 15; // Clean when exceeding this

// Font and UI sizing
export const DEFAULT_FONT_SIZE = 16; // pixels
export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 24;
export const DEFAULT_LINE_HEIGHT = 1.5;
export const MIN_LINE_HEIGHT = 1.0;
export const MAX_LINE_HEIGHT = 2.5;

// Editor snap heights (for resize functionality)
export const SNAP_HEIGHTS = [200, 300, 400, 500, 600, 800];

// API and performance constants
export const ANALYSIS_TIMEOUT = 30000; // 30 seconds
export const CACHE_EXPIRY = 300000; // 5 minutes
export const RETRY_DELAY = 1000; // 1 second
export const MAX_RETRIES = 3;

// Platform identification constants
export const PLATFORM_SHORTCUTS = {
    bold: { mac: '⌘+B', pc: 'Ctrl+B' },
    italic: { mac: '⌘+I', pc: 'Ctrl+I' },
    underline: { mac: '⌘+U', pc: 'Ctrl+U' },
    undo: { mac: '⌘+Z', pc: 'Ctrl+Z' },
    redo: { mac: '⌘+Y', pc: 'Ctrl+Y' },
    selectAll: { mac: '⌘+A', pc: 'Ctrl+A' }
};

// Validation thresholds
export const VALIDATION_THRESHOLDS = {
    emoji: {
        percentageLimit: 8,
        wordRatioLimit: 0.5,
        densityLimit: 0.6,
        frequencyLimit: 2,
        sequenceLimit: 5
    },
    code: {
        indentedLinesThreshold: 3,
        syntaxDensityThreshold: 0.05,
        structuralScoreThreshold: 3,
        patternsThreshold: 2
    },
};

// CSS class names for consistency
export const CSS_CLASSES = {
    hidden: 'hidden',
    visible: 'visible',
    error: 'error',
    warning: 'warning',
    success: 'success',
    loading: 'loading',
    disabled: 'disabled',
    active: 'active',
    highlighted: 'highlighted',
    feedbackTooltip: 'feedback-tooltip',
    highlightPunctuation: 'highlight-punctuation'
};

// Error and warning messages
export const MESSAGES = {
    codeDetected: 'TextScore is designed for analyzing written content, not source code.',
    emojiOverload: 'High emoji usage detected. Consider reducing emojis for better readability.',
    loremIpsum: 'Lorem Ipsum placeholder text detected. Replace with actual content for analysis.',
    piiDetected: 'Personally identifiable information detected. Review before proceeding.',
    textTooShort: `Text must be at least ${MIN_CHARS} characters for analysis.`,
    textTooLong: `Text exceeds ${MAX_CHARS} character limit. Please shorten your text.`,
    analysisTimeout: 'Analysis is taking longer than expected. Please try again.',
    networkError: 'Network error occurred. Please check your connection and try again.',
    genericError: 'An error occurred during analysis. Please try again.'
};

// File size and type constants
export const FILE_LIMITS = {
    maxSizeBytes: 1024 * 1024, // 1MB
    allowedTypes: ['text/plain', 'text/markdown', 'application/rtf'],
    allowedExtensions: ['.txt', '.md', '.rtf']
};

// Feature flags (for gradual rollouts)
export const FEATURES = {
    liveFeedback: true,
    advancedDetection: true,
    historyManagement: true,
    exportFeatures: false, // Not yet implemented
    collaborativeEditing: false // Future feature
};

// Development and debugging
export const DEBUG = {
    logStateChanges: false,
    enablePerformanceMetrics: false,
    showDetectionDetails: false
};

// Accessibility constants
export const A11Y = {
    focusableElements: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ariaLabels: {
        analyzeButton: 'Analyze text content',
        characterCounter: 'Character count',
        fontSizeSlider: 'Adjust font size',
        lineHeightSlider: 'Adjust line height',
        previewToggle: 'Toggle preview panel',
    }
};

// Regular expressions for common patterns
export const REGEX_PATTERNS = {
    emailBasic: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    phoneUS: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}\b/g,
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    whitespace: /\s+/g,
    nonAlphanumeric: /[^a-zA-Z0-9\s]/g
};

// Export helper function to check if a feature is enabled
export function isFeatureEnabled(featureName) {
    return FEATURES[featureName] === true;
}

// Export helper function to get platform-specific shortcut
export function getPlatformShortcut(action) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const platform = isMac ? 'mac' : 'pc';
    return PLATFORM_SHORTCUTS[action]?.[platform] || '';
}

// Export helper function to get validation threshold
export function getValidationThreshold(category, metric) {
    return VALIDATION_THRESHOLDS[category]?.[metric];
}

// Export helper function for consistent class name usage
export function getClassName(className) {
    return CSS_CLASSES[className] || className;
}