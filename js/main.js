import { runValidation } from './validation/validator.js';
// all variables
const menuBtn = document.querySelector(".menu-btn");
const analyzeButton = document.getElementById("analyze-button");
const editor = document.getElementById("editor");
const apiUrl = "https://textscore.io/";
// global (or module-level) state
let activeRequests = new Set();
let lastCheckState = null;
let requestCount = 0;
let lastResetTime = Date.now();
const codeErrorBanner = document.getElementById('code-error-banner');
const loremErrorBanner = document.getElementById('lorem-error-banner');
const emojiErrorBanner = document.getElementById('emoji-error-banner');
const emojiDetailsSpan = document.getElementById('emoji-details');

/* -- navigation menu starts from here -- */
if(menuBtn){
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    document.body.classList.toggle("is_open");
  });
  
  window.addEventListener("click", () => {
    if (document.body.classList.contains("is_open")) {
      document.body.classList.remove("is_open");
    }
  });
}
document.addEventListener('DOMContentLoaded', function () {
    codeErrorBanner.classList.add('hidden');
    loremErrorBanner.classList.add('hidden');
    emojiErrorBanner.classList.add('hidden');
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach((accordion) => {
        const head = accordion.querySelector('.accordion__head');

        head.addEventListener('click', () => {
            // Close all other accordions
            accordions.forEach((item) => {
                if (item !== accordion) {
                    item.classList.remove('active');
                }
            });

            // Toggle current accordion
            accordion.classList.toggle('active');
        });
    });

});
/* -- navigation menu ends from here -- */

/* -- Sepia Theme toggle starts here -- */
    const toggle = document.getElementById('toggle');
    toggle.addEventListener('change', function () {
      if (this.checked) {
        editor.style.backgroundColor = '#f7f3e9';
      } else {
        editor.style.backgroundColor = '#FAFAFA';
      }
    });

/* -- Sepia Theme toggle end here -- */

/* content editable starts from here */

function wrapSelection(style) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);

  // If collapsed (no selection)
  if (range.collapsed) {
    const span = document.createElement("span");
    Object.assign(span.style, style);
    span.appendChild(document.createTextNode("\u200B"));
    range.insertNode(span);

    // Move cursor inside span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 0);
    newRange.collapse(true);
    selection.addRange(newRange);
    return;
  }

  // If selection exists
  let parent = range.commonAncestorContainer;
  if (parent.nodeType === 3) parent = parent.parentNode; 

  if (parent.nodeName === "SPAN") {
    Object.assign(parent.style, style);
  } else {
    const span = document.createElement("span");
    Object.assign(span.style, style);

    try {
      range.surroundContents(span);
    } catch {
      const extracted = range.extractContents();
      span.appendChild(extracted);
      range.insertNode(span);
    }
  }
}

// Font size
document.getElementById("fontSize").addEventListener("change", (e) => {
wrapSelection({ fontSize: e.target.value });
});

// Line height
const lineHeightSelect = document.getElementById("lineHeight");
// set default (from HTML <option selected>)
editor.style.lineHeight = lineHeightSelect.value;

lineHeightSelect.addEventListener("change", (e) => {
    const value = e.target.value;

    // 🔄 toggle back to default if same value selected again
    if (editor.style.lineHeight === value) {
        editor.style.lineHeight = ""; // clears inline style → fallback to CSS
    } else {
        editor.style.lineHeight = value;
    }

    editor.focus();
});

// Bold
document.getElementById("bold").addEventListener("click", (e) => {
    e.preventDefault();
    editor.focus();
    document.execCommand("bold", false, null);
});

// Italic
document.getElementById("italic").addEventListener("click", (e) => {
    e.preventDefault();
    editor.focus();
    document.execCommand("italic", false, null);
});
// Insert Link
document.getElementById("link").addEventListener("click", (e) => {
    e.preventDefault();  // Prevent default navigation or other default behaviors
    const url = prompt("Enter URL (include https:// or http://):");
    if (!url) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    if (sel.isCollapsed) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = url;
        const range = sel.getRangeAt(0);
        range.insertNode(a);
        range.setStartAfter(a);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        document.execCommand("createLink", false, url);
    }
});

// Insert @ directly
document.getElementById("mention").addEventListener("click", (e) => {
    e.preventDefault()
    document.execCommand("insertHTML", false, '<span style="color:blue">@</span>&nbsp;');
});

// Insert # directly
document.getElementById("hashtag").addEventListener("click", (e) => {
    e.preventDefault();
    document.execCommand("insertHTML", false, '<span style="color:green">#</span>&nbsp;');
});

// Toolbar state (Bold/Italic active)
function updateToolbarState() {
    const boldBtn = document.getElementById("bold");
    const italicBtn = document.getElementById("italic");
    try {
        boldBtn.classList.toggle("active", document.queryCommandState("bold"));
        italicBtn.classList.toggle("active", document.queryCommandState("italic"));
    } catch {}
}

document.addEventListener("selectionchange", () => {
    if (editor.contains(window.getSelection().anchorNode)) {
        updateToolbarState();
    }
});



/* get data from analyze button */

editor.addEventListener("input", function(){
    codeErrorBanner.classList.add('hidden');
    loremErrorBanner.classList.add('hidden');
    emojiErrorBanner.classList.add('hidden');
  let text = editor.textContent.trim();
  document.getElementById("char-counter").textContent = `${text.length} / 70`;

  if (text.length >= 1200) {
      analyzeButton.disabled = true;
      document.querySelector(".char-counter").style.display = "block";
      document.getElementById("char-counter").textContent = `${text.length} / 1200`;
      document.getElementById("char-counter").style.color = "red";
  } else if (text.length >= 70) {
      document.querySelector(".char-counter").style.display = "none";
      analyzeButton.disabled = false;
  } else {
      analyzeButton.disabled = true;
      document.querySelector(".char-counter").style.display = "block";
      document.getElementById("char-counter").style.color = "#7f8383";
  }
    removeDuplicateWarning()
    const duplicateInfo = checkForDuplicates('normal', editor);
    if (duplicateInfo && duplicateInfo.is_duplicate) {
        showDuplicateWarning(duplicateInfo);
    }
    const validation = runInputValidation(editor);
    editor.classList.remove('code-detected-highlight');

    if (validation.primaryIssue === 'code') {
        codeErrorBanner.classList.remove('hidden');
        editor.classList.add('code-detected-highlight');
    }else if (validation.primaryIssue === 'lorem') {
        loremErrorBanner.classList.remove('hidden');
        editor.classList.add('lorem-detected-highlight');
    }else if (validation.primaryIssue === 'emoji') {
        emojiErrorBanner.classList.remove('hidden');
        editor.classList.add('emoji-detected-highlight');

        // Update emoji details
        const details = validation.details.emojiResult.details;
        const triggers = details.triggers.join(', ');
        emojiDetailsSpan.textContent = `(${triggers})`;

        // Highlight emoji runs in the editor
        highlightEmojiRuns(validation.details.emojiResult.details.contiguousRuns, editor);
    }
    analyzeButton.disabled = validation.shouldDisableButton;
})

function runInputValidation(textInput) {
    const text = getTextContent(textInput);
    const currentLength = text.length;

    const validation = runValidation(text);

    // Handle PII confirmation override
    let shouldDisableButton = validation.shouldDisable;
    let primaryIssue = validation.primaryIssue;

    // PII special case - allow user to proceed if confirmed
    if (validation.details.piiResult.hasPII && !appState.piiCheckConfirmed) {
        primaryIssue = 'pii';
        shouldDisableButton = true;
    } else if (validation.details.piiResult.hasPII && appState.piiCheckConfirmed) {
        // User confirmed PII, don't block for PII - check for other issues
        if (validation.primaryIssue === 'pii') {
            // PII was the primary issue, now find next issue or allow analysis
            primaryIssue = null; // No blocking issues
            shouldDisableButton = false;
        } else {
            // PII was not primary, respect other validation results
            shouldDisableButton = validation.shouldDisable;
        }
    }

    return {
        ...validation,
        primaryIssue,
        shouldDisableButton
    };
}

function highlightEmojiRuns(contiguousRuns, textInput) {
    if (!contiguousRuns || contiguousRuns.length === 0) return;

    // Store current selection
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const cursorOffset = range ? range.startOffset : 0;

    let content = textInput.textContent;
    let offset = 0;

    // Apply highlights to contiguous runs (work backwards to maintain indices)
    contiguousRuns.slice().reverse().forEach(run => {
        const beforeText = content.substring(0, run.start);
        const emojiText = content.substring(run.start, run.end);
        const afterText = content.substring(run.end);

        content = beforeText +
            `<span class="emoji-highlight" data-count="${run.count}">${emojiText}</span>` +
            afterText;
    });

    // Update content if there are highlights to apply
    if (contiguousRuns.length > 0) {
        // Convert newlines back to <br> tags to preserve formatting
        textInput.innerHTML = content.replace(/\n/g, '<br>');

        // Try to restore cursor position
        try {
            const textNodes = [];
            const walker = document.createTreeWalker(textInput, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            let currentOffset = 0;
            for (const textNode of textNodes) {
                if (currentOffset + textNode.textContent.length >= cursorOffset) {
                    const range = document.createRange();
                    range.setStart(textNode, Math.min(cursorOffset - currentOffset, textNode.textContent.length));
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    break;
                }
                currentOffset += textNode.textContent.length;
            }
        } catch (error) {
            console.warn('Could not restore cursor position:', error);
        }
    }
}

function checkForDuplicates(priority = 'normal', textInput) {
    const text = getTextContent(textInput);
    const platform = document.querySelector('input[name="social_media"]:checked').value;
    if (text && text.length >= 50) {

        const delays = {
            immediate: 0,
            fast: 200,
            normal: 800
        };
        const delay = delays[priority] || delays.normal;
        setTimeout(async () => {

            const duplicateInfo = await checkForDuplicate(text, platform);

            if (duplicateInfo && duplicateInfo.is_duplicate) {
                showDuplicateWarning(duplicateInfo);
            }
        }, delay);
    }
}

/**
 * Verifies whether the given text has already been analyzed,
 * with additional security checks applied.
 *
 * @param {string} text - The input string to verify.
 * @param {string} platform - The platform identifier or context for the check.
 * @returns {Promise<Object|null>} A promise that resolves with duplicate analysis details if found, or null otherwise.
 */
async function checkForDuplicate(text, platform = 'general') {
    // Input validation and security checks
    if (typeof text !== 'string' || text.length < 50 || text.length > 10000) {
        return null;
    }

    // Platform validation
    const validPlatforms = ['general', 'x', 'linkedin', 'tiktok', 'instagram'];
    if (!validPlatforms.includes(platform)) {
        platform = 'general';
    }

    // Rate limiting - reset counter every minute
    const now = Date.now();
    if (now - lastResetTime > 60000) {
        requestCount = 0;
        lastResetTime = now;
    }

    if (requestCount >= 10) {
        console.warn('Rate limit reached for duplicate checks');
        return null;
    }

    // Request deduplication
    const requestKey = `${text.slice(0, 50)}|${platform}`;
    if (activeRequests.has(requestKey)) {
        return null; // skip if same request already running
    }

    // Prevent redundant checks
    const currentState = `${text}|${platform}`;
    if (currentState === lastCheckState) {
        return null; // same as last completed
    }

    if (activeRequests.size >= 3) {
        console.warn('Too many concurrent requests, skipping duplicate check');
        return null;
    }

    activeRequests.add(requestKey);
    lastCheckState = currentState;
    requestCount++;

    try {
        const textHash = await generateTextHash(text, platform);
        if (!textHash) return null;

        const response = await fetch(`${apiUrl}api/check_duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text_hash: textHash })
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.warn('Duplicate check failed:', response.status);
            return null;
        }
    } catch (error) {
        console.warn('Cache check failed safely:', error);
        return null;
    } finally {
        activeRequests.delete(requestKey); // cleanup
    }
}


/**
 * Creates a SHA-256 hash from a given text using the Web Crypto API.
 *
 * @param {string} text - The input string to be hashed.
 * @param {string} platform - The platform identifier or context for hashing.
 * @returns {Promise<string>} A promise that resolves to the SHA-256 hash as a hex string.
 */
async function generateTextHash(text, platform = 'general') {
    try {
        const encoder = new TextEncoder();
        const content = `${text.trim().toLowerCase()}|${platform}`;
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.warn('Failed to generate text hash:', error);
        return null;
    }
}

function getTextContent(element) {
    if (!element) {
        return "";
    }
    let html = element.innerHTML;

    html = html
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let text = tmp.textContent || '';

    return text.replace(/\r\n?/g, '\n');
}


/**
 * Displays a warning banner when duplicate content is detected,
 * with built-in safety enhancements.
 *
 * @param {Object} duplicateInfo - Information describing the duplicate content.
 */
function showDuplicateWarning(duplicateInfo) {
    if (!duplicateInfo || typeof duplicateInfo !== 'object') {
        return;
    }

    this.removeDuplicateWarning();

    // DOM safety checks
    const analyzeButton = document.getElementById('analyze-button');
    if (!analyzeButton || !analyzeButton.parentElement) {
        console.warn('Cannot show warning: DOM element not found');
        return;
    }

    const warningBanner = document.createElement('div');
    warningBanner.id = 'duplicate-warning';
    warningBanner.className = 'duplicate-warning';

    // Format the date
    const lastDate = new Date(duplicateInfo.last_analyzed_date * 1000);
    const now = new Date();
    const diffHours = Math.floor((now - lastDate) / (1000 * 60 * 60));

    let timeText;
    if (diffHours < 1) {
        timeText = 'Less than an hour ago';
    } else if (diffHours < 24) {
        timeText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        timeText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    // Get text preview (truncate if too long)
    const preview = duplicateInfo.text_preview || '';
    const shortPreview = preview.length > 60 ? preview.substring(0, 60) + '...' : preview;

    warningBanner.innerHTML = `
            <div class="warning-content">
                <span class="warning-icon">🔄</span>
                <div class="warning-text">
                    <strong>Previously analyzed text detected</strong>
                    <p class="warning-details">
                        Last analysis: ${timeText} on ${duplicateInfo.platform}
                        <br><small class="text-preview">"${shortPreview}"</small>
                    </p>
                </div>
                <button class="dismiss-warning" onclick="document.getElementById('duplicate-warning').remove()" 
                        aria-label="Dismiss warning">×</button>
            </div>
            <div class="warning-actions">
                <small>The analysis will use cached results for faster response.</small>
            </div>
        `;

    // Insert before the analyze button
    analyzeButton.parentElement.insertBefore(warningBanner, analyzeButton);

    // Add animation class after a brief delay
    setTimeout(() => {
        warningBanner.classList.add('visible');
    }, 10);
}

function removeDuplicateWarning() {
    const existingWarning = document.getElementById('duplicate-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
}

analyzeButton.addEventListener("click", function(e){
    e.preventDefault();
    let editorText = editor.textContent.toString();
    let plateform = document.querySelector('[name="social_media"]:checked').value;
    let recaptchaSiteKey = "6LefJYcrAAAAAF7hmQfCgy73gHwy1HwSmW1bWZ_B";

    // Reset old alerts
    const summaryBar = document.getElementById('summary-bar');
    summaryBar.classList.remove('summary-spam', 'summary-warning', 'summary-info');
    const messageElement = summaryBar.querySelector('.alert-message');
    if (messageElement) {
        messageElement.innerHTML = '';
    }

    analyzeText(editorText, recaptchaSiteKey, plateform, false);

})


/* accordion open and close */

function dropdownAccordion() {
  document.querySelectorAll("#result .card__header").forEach(function(header) {
    header.addEventListener("click", function() {
      const isOpen = header.parentElement.classList.contains("accordion_open");

      document.querySelectorAll("#result .card__header").forEach(function(h) {
        h.parentElement.classList.remove("accordion_open");
      });

      if (!isOpen) {
        header.parentElement.classList.add("accordion_open");
      }
    });
  });
}
