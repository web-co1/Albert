// codeDetector.js - Pure code detection functions for TextScore.io
// Extracted from main.js for better modularity and testability
// No dependencies, no side effects - pure detection logic

/**
 * Detect if text contains code/programming content
 * @param {string} text - Text to analyze
 * @returns {boolean} True if code is detected
 */
export function isCodeDetected(text) {
    if (!text || text.trim().length < 20) return false;
    
    const lines = text.split('\n');
    
    // 1. Check for indentation patterns (multiple lines with leading whitespace)
    const indentedLines = lines.filter(line => 
        line.match(/^[\s]{2,}/) && line.trim().length > 0
    );
    
    // 2. Check for high density of programming syntax characters
    const syntaxChars = text.match(/[{}();<>[\]]/g) || [];
    const syntaxDensity = syntaxChars.length / text.length;
    
    // 3. Define structural patterns with weights
    const structuralPatterns = [
        // Function/Method Definitions (High confidence - 2 points)
        { pattern: /\w+\s*\([^)]*\)\s*{/, weight: 2, name: 'function_with_brace' },
        { pattern: /function\s+\w+\s*\([^)]*\)/, weight: 2, name: 'function_declaration' },
        { pattern: /def\s+\w+\s*\([^)]*\):/, weight: 2, name: 'python_function' },
        { pattern: /\w+\s*:\s*function\s*\([^)]*\)/, weight: 2, name: 'object_method' },
        { pattern: /\w+\s*=\s*\([^)]*\)\s*=>/, weight: 2, name: 'arrow_function' },
        { pattern: /document\.querySelector\s*\(.*\)\.addEventListener\s*\(.*\)/, weight: 2, name: 'js_event_listener' },
        
        // Variable Declarations/Assignments (Medium confidence - 1.5 points)
        { pattern: /(?:const|let|var)\s+\w+\s*=\s*[^;]+;/, weight: 1.5, name: 'js_declaration' },
        { pattern: /\w+\s*=\s*['"`].*['"`];/, weight: 1.5, name: 'string_assignment' },
        { pattern: /\w+\s*=\s*\d+;/, weight: 1.5, name: 'numeric_assignment' },
        { pattern: /\w+\s*=\s*\[.*\];/, weight: 1.5, name: 'array_assignment' },
        { pattern: /\w+\s*=\s*{.*};/, weight: 1.5, name: 'object_assignment' },
        
        // Control Flow Structures (High confidence - 2 points)
        { pattern: /if\s*\([^)]+\)\s*{/, weight: 2, name: 'if_statement' },
        { pattern: /for\s*\([^)]+\)\s*{/, weight: 2, name: 'for_loop' },
        { pattern: /while\s*\([^)]+\)\s*{/, weight: 2, name: 'while_loop' },
        { pattern: /switch\s*\([^)]+\)\s*{/, weight: 2, name: 'switch_statement' },
        { pattern: /try\s*{.*}\s*catch/, weight: 2, name: 'try_catch' },
        
        // Import/Export Statements (High confidence - 2 points)
        { pattern: /import\s+.*\s+from\s+['"`]/, weight: 2, name: 'es6_import' },
        { pattern: /require\s*\(['"`][^'"`]+['"`]\)/, weight: 2, name: 'commonjs_require' },
        { pattern: /export\s+(?:default\s+)?(?:function|class|const)/, weight: 2, name: 'export_statement' },
        
        // Class/Object Patterns (High confidence - 2 points)
        { pattern: /class\s+\w+\s*(?:extends\s+\w+\s*)?{/, weight: 2, name: 'class_declaration' },
        { pattern: /new\s+\w+\s*\([^)]*\)/, weight: 1.5, name: 'object_instantiation' },
        
        // Additional Code Patterns
        { pattern: /\/\*[\s\S]*?\*\//, weight: 1.5, name: 'multiline_comment' },
        { pattern: /(?<!:)\/\/.*$/m, weight: 1.5, name: 'single_line_comment' },
        { pattern: /^#!\//, weight: 2, name: 'shebang' },
        { pattern: /\.(js|py|java|cpp|html|css|json|xml)$/m, weight: 2, name: 'file_extension' }
    ];
    
    // Count structural patterns found
    let structuralScore = 0;
    let patternsFound = [];
    
    structuralPatterns.forEach(({pattern, weight, name}) => {
        if (pattern.test(text)) {
            structuralScore += weight;
            patternsFound.push(name);
        }
    });
    
    // Check for explicit code markers
    const hasExplicitMarkers = text.includes('```') || text.includes('<code>') || text.includes('</code>');
    
    // Check for strong structural evidence (2+ patterns with significant score)
    const hasStructuralEvidence = patternsFound.length >= 2 && structuralScore >= 3;
    
    // Check for multiple strong indicators (indentation + patterns or high syntax density + patterns)
    const hasMultipleIndicators = (indentedLines.length >= 3 && patternsFound.length >= 1) ||
                                  (syntaxDensity > 0.05 && patternsFound.length >= 1);
    
    // Return true if any of the strong conditions are met
    return hasExplicitMarkers || hasStructuralEvidence || hasMultipleIndicators;
}

/**
 * Get detailed code detection analysis
 * @param {string} text - Text to analyze
 * @returns {Object} Detection details including language hints
 */
export function getCodeDetectionDetails(text) {
    if (!text || text.trim().length < 20) {
        return {
            isCode: false,
            confidence: 0,
            patterns: [],
            languageHints: []
        };
    }
    
    const lines = text.split('\n');
    const indentedLines = lines.filter(line => 
        line.match(/^[\s]{2,}/) && line.trim().length > 0
    );
    
    const syntaxChars = text.match(/[{}();<>[\]]/g) || [];
    const syntaxDensity = syntaxChars.length / text.length;
    
    const detectedPatterns = [];
    const languageHints = new Set();
    let totalScore = 0;
    
    // Language-specific patterns
    const languagePatterns = {
        javascript: [
            /(?:const|let|var)\s+\w+\s*=/,
            /function\s+\w+\s*\(/,
            /\w+\s*=>\s*{/,
            /document\./,
            /console\./
        ],
        python: [
            /def\s+\w+\s*\(/,
            /import\s+\w+/,
            /from\s+\w+\s+import/,
            /if\s+__name__\s*==\s*['"]__main__['"]/,
            /print\s*\(/
        ],
        java: [
            /public\s+class\s+\w+/,
            /public\s+static\s+void\s+main/,
            /System\.out\.println/,
            /private\s+\w+\s+\w+/
        ],
        html: [
            /<\w+[^>]*>/,
            /<\/\w+>/,
            /<!DOCTYPE/i,
            /<html/i,
            /<body/i
        ],
        css: [
            /\w+\s*{\s*[\w-]+\s*:/,
            /\.\w+\s*{/,
            /#\w+\s*{/,
            /@media\s+/,
            /:\s*(hover|active|focus)/
        ]
    };
    
    // Check language-specific patterns
    for (const [language, patterns] of Object.entries(languagePatterns)) {
        let matches = 0;
        patterns.forEach(pattern => {
            if (pattern.test(text)) {
                matches++;
            }
        });
        if (matches >= 2) {
            languageHints.add(language);
        }
    }
    
    // Check for explicit code markers
    const hasExplicitMarkers = text.includes('```') || text.includes('<code>') || text.includes('</code>');
    
    const isCode = isCodeDetected(text);
    const confidence = Math.min(100, (totalScore / 10) * 100);
    
    return {
        isCode,
        confidence,
        patterns: detectedPatterns,
        languageHints: Array.from(languageHints),
        hasExplicitMarkers,
        syntaxDensity: (syntaxDensity * 100).toFixed(2) + '%',
        indentedLines: indentedLines.length
    };
}