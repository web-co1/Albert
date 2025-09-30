// textUtils.js - Text manipulation utilities for TextScore.io
// Extracted from main.js for better modularity
// Functions work with DOM element reference

/**
 * Get plain text content from a contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 * @returns {string} Plain text with preserved line breaks
 */
export function getTextContent(element) {
    // 1. Grab raw HTML
    let html = element.innerHTML;

    // 2. Convert block tags and <br> into newline markers
    html = html
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

    // 3. Strip any remaining tags (but keep spaces/newlines)
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let text = tmp.textContent || '';

    // 4. Normalize CRLF to LF
    return text.replace(/\r\n?/g, '\n');
}

/**
 * Set plain text content in a contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 * @param {string} text - Plain text to set
 */
export function setTextContent(element, text) {
    // Wrap on newlines to preserve paragraphs
    const html = text
        .split('\n')
        .map(line => line === '' ? '<div><br></div>' : `<div>${line}</div>`)
        .join('');
    element.innerHTML = html;
}

/**
 * Get word count from text
 * @param {string} text - Text to count words in
 * @returns {number} Number of words
 */
export function getWordCount(text) {
    if (!text || typeof text !== 'string') return 0;
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

/**
 * Get character count including whitespace
 * @param {string} text - Text to count characters in
 * @returns {number} Total number of characters
 */
export function getCharCount(text) {
    if (!text || typeof text !== 'string') return 0;
    
    return text.length;
}

/**
 * Get line count from text
 * @param {string} text - Text to count lines in
 * @returns {number} Number of lines
 */
export function getLineCount(text) {
    if (!text || typeof text !== 'string') return 0;
    
    const lines = text.split('\n');
    return lines.length;
}