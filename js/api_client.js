const baseURL = "https://textscore.io/";


const resultContainer = document.getElementById("result");
const errorMsg = document.querySelector(".error-message");
let loader = document.querySelector(".loader");


async function analyzeText(text, recaptchaToken, plateform, forceAnalysis = false){
    const payload = {
        text: text,
        recaptcha_token: recaptchaToken,
        platform: plateform,
        force_analysis: forceAnalysis
    };

    try {
        document.querySelector(".result").style.display = "block";
         loader.style.display = "block";
         errorMsg.style.display = "none";
         resultContainer.innerHTML = "";
        const response = await fetch(`${baseURL}/api/analyze`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

         loader.style.display = "none";
        if(response.status === 429){
            errorMsg.style.display = "block";
        }else {
             errorMsg.style.display = "none";
        }
        
     if (!response.ok) {
        
            try {
                const errorData = await response.json();
                
                // Handle security warnings specially - don't throw error, return data
                if (errorData.status === 'security_warning') {
                    return errorData;
                }
                
                // For other errors, throw as usual
                const errorMessage = errorData.error || 'Request failed';
                console.log("hello", errorMessage)
                throw new Error(errorMessage);
            } catch (e) {
                // If we couldn't parse JSON, it's a server error
                if (e instanceof SyntaxError) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                // Re-throw our custom errors
                throw e;
            }
        }

        const data = await response.json();
        console.log("data is: ", data);
      // Check for gibberish response
        if (data.status === 'gibberish') {
          const resultsGrid = document.getElementById('result');
          const summaryBar = document.getElementById('summary-bar');
          const selectedPlatform = document.querySelector('input[name="social_media"]:checked').value;
          resultsGrid.innerHTML = '';
          const messageElement = summaryBar.querySelector('.alert-message');
          summaryBar.classList.add('summary-spam');
        // Create custom content for gibberish detection
        messageElement.innerHTML = `
            <div class="gibberish-content">
                <strong class="error-message__title">🤖 Gibberish Detected!</strong>
                <p>${data.message}</p>
                <button id="not-spam-link" class="not-spam-button btn btn-danger">
                    Click here if this isn't gibberish
                </button>
            </div>
        `;
        
        // Show the summary bar for gibberish
        summaryBar.hidden = false;
        }else {
       const selected = document.querySelector('input[name="social_media"]:checked').value;
        data.platform = selected;
        populateData(data)
        }
    } catch (error) {
         if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Failed to connect to the API');
        }
        console.log(error);
        
        throw error;
    }

}


function getContext(tier) {
    const contexts = {
        'good': 'Professional quality content',
        'fair': 'Good content with minor improvements needed',
        'poor': 'Content requires significant improvement'
    };
    return contexts[tier] || 'Content evaluation completed';
}


function getInsightText(tier) {
    if (tier === 'good') {
        return 'Content meets high professional standards for communication';
    } else if (tier === 'fair') {
        return 'Content shows good quality with room for refinement';
    } else {
        return 'Content needs improvement to meet professional standards';
    }
}


function getComplexSentenceInsightText(tier, count) {
    if (tier === 'good') {
        return 'Shorter sentences = easier to read and better engagement';
    } else if (tier === 'fair') {
        return 'Consider breaking longer sentences for better readability';
    } else {
        return 'Long sentences = readers lose focus and skip content';
    }
}

function getComplexSentenceSummaryText(count, tier) {
    if (tier === 'good') {
        return 'Your sentences are well-structured and easy to read';
    } else if (tier === 'fair') {
        return `${count} ${count === 1 ? 'sentence' : 'sentences'} may be challenging to read`;
    } else {
        return `${count} complex sentences detected - consider simplifying`;
    }
}

function sanitizeHTML(dirtyHTML) {
    // Ensure DOMPurify is available
    if (typeof DOMPurify === 'undefined') {
        console.warn('DOMPurify not available. Falling back to text content only.');
        // Create a temporary element to extract text content as fallback
        const temp = document.createElement('div');
        temp.innerHTML = dirtyHTML;
        return temp.textContent || temp.innerText || '';
    }

    // Configure DOMPurify to allow safe HTML tags commonly used in text analysis
    const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'li', 'blockquote', 'span', 'div'];
    const allowedAttributes = ['class']; // Only allow class attributes for styling

    return DOMPurify.sanitize(dirtyHTML, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
        KEEP_CONTENT: true,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM_IMPORT: false
    });
}

function getPlatformDisplayName(platform) {
    const platformNames = {
        'x': 'X',
        'twitter': 'X',
        'facebook': 'Facebook',
        'medium': 'Medium',
        'discord': 'Discord',
        'general': 'General'
    };
    return platformNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
}

function getPlatformGuideline(platform) {
    const guidelines = {
        'x': "X automatically scans links for safety, but users remain cautious of shortened URLs",
        'facebook': 'Facebook blocks many suspicious domains and warns users about potential risks',
        'discord': 'Discord servers often have strict rules about external links and malware',
        'general': 'Most platforms flag suspicious links, but user vigilance remains important'
    };

    return guidelines[platform] || guidelines.general;
}

function getConfidenceLevel(score) {
    if (score <= 0.2) return 'Very Low';
    if (score <= 0.4) return 'Low';
    if (score <= 0.6) return 'Moderate';
    if (score <= 0.8) return 'High';
    return 'Very High';
}

function getDetectionLevel(score) {
    if (score <= 0.3) return 'Undetectable';
    if (score <= 0.7) return 'Potentially Detectable';
    return 'Likely Detectable';
}

function getScoreExplanation(score) {
    if (score <= 0.2) return 'Writing patterns strongly suggest human authorship with natural variations';
    if (score <= 0.4) return 'Mostly human-like patterns with some structured elements';
    if (score <= 0.6) return 'Mixed signals - could be human or AI-assisted writing';
    if (score <= 0.8) return 'Several patterns suggest AI assistance or generation';
    return 'Strong indicators of AI generation with formal, structured language';
}

function getPatternExplanation(tier) {
    const explanations = {
        'good': 'Natural variations, personal voice, and conversational flow indicate human writing',
        'fair': 'Some formal structures mixed with personal elements suggest hybrid authorship',
        'poor': 'Consistent formal tone and perfect structure are typical AI characteristics'
    };
    return explanations[tier] || 'Unable to determine pattern characteristics';
}

function getRiskContext(riskLevel, factorCount) {
    if (riskLevel === 'low') {
        return factorCount === 0 ? 'No algorithmic concerns detected' : `${factorCount} minor concern${factorCount === 1 ? '' : 's'}`;
    } else if (riskLevel === 'medium') {
        return `${factorCount} moderate risk factor${factorCount === 1 ? '' : 's'} detected`;
    } else {
        return `${factorCount} significant concern${factorCount === 1 ? '' : 's'} found`;
    }
}

function getStatusLabel(tier) {
    const labels = {
        'good': 'Professional',
        'fair': 'Elevated',
        'poor': 'Excessive'
    };
    return labels[tier] || 'Professional';
}

function getSummaryText(percentage, tier) {
    if (tier === 'good') {
        return `Your use of capitalization is balanced and appropriate at ${percentage}%`;
    } else if (tier === 'fair') {
        return `Capitalization usage is slightly elevated at ${percentage}% - consider reducing`;
    } else {
        return `High capitalization usage at ${percentage}% may trigger spam filters`;
    }
}

function getContextText(tier) {
    const contexts = {
        'good': 'Professional capitalization usage',
        'fair': 'Slightly elevated caps usage',
        'poor': 'Excessive caps usage detected'
    };
    return contexts[tier] || 'Capitalization analysis complete';
}

function getComplexSentenceContextText(tier) {
    const contexts = {
        'good': 'Easy to read and understand',
        'fair': 'Some sentences may be challenging',
        'poor': 'Multiple complex sentences detected'
    };
    return contexts[tier] || 'Sentence analysis complete';
}

function getRecommendation(tier) {
    if (tier === 'fair') {
        return 'Target: Under 5% for professional communication';
    } else {
        return 'Reduce caps usage to avoid spam detection';
    }
}

function getTargetRange(platform) {
    const ranges = {
        'x': '0-15%',
        'twitter': '0-15%',
        'facebook': '0-10%',
        'discord': '0-20%',
        'general': '0-5%'
    };
    return ranges[platform] || '0-5%';
}

function getQualityLabel(score) {
    // Standardized assessment labels
    if (score >= 70) return 'Excellent Quality';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor Quality';
}

function createSummaryText(breakdown) {
    if (!breakdown) return 'Content quality assessment completed';
    
    // Count actual contributing factors (merged and filtered)
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Count merged readability
    const readabilityTotal = (breakdown.readability || 0) + (breakdown.readability_penalties || 0);
    if (readabilityTotal > 0) positiveCount++;
    else if (readabilityTotal < 0) negativeCount++;
    
    // Count merged sentiment
    const sentimentTotal = (breakdown.sentiment || 0) + (breakdown.sentiment_extremity_penalties || 0);
    if (sentimentTotal > 0) positiveCount++;
    else if (sentimentTotal < 0) negativeCount++;
    
    // Count other non-zero metrics (excluding merged components and ignored metrics)
    const IGNORED_METRICS = ['injection_penalties', 'gibberish_penalties', 'total_score'];
    Object.entries(breakdown).forEach(([key, value]) => {
        if (key === 'readability' || key === 'readability_penalties' ||
            key === 'sentiment' || key === 'sentiment_extremity_penalties' ||
            IGNORED_METRICS.includes(key) || value === 0) {
            return;
        }
        if (value > 0) positiveCount++;
        else if (value < 0) negativeCount++;
    });
    
    if (positiveCount > 0 && negativeCount === 0) {
        return `Strong performance across ${positiveCount} Positive Factors`;
    } else if (positiveCount > 0 && negativeCount > 0) {
        return `${positiveCount} Positive Factors, ${negativeCount} Issues Found`;
    } else if (negativeCount > 0) {
        return `${negativeCount} Issues Found`;
    } else {
        return 'Quality assessment completed';
    }
}


function getContentQualityInsightText(tier, breakdown) {
    if (breakdown.spam_penalties < 0) {
        return 'Spammy language detected – remove forbidden keywords';
    }
    if (breakdown.readability_penalties < -15) {
        return 'Readability is poor – simplify complex text';
    }
    // Existing tier-based logic remains unchanged.
    if (tier === 'good') {
        return 'Content demonstrates professional standards with strong clarity and structure';
    } else if (tier === 'fair') {
        return 'Content foundation is solid - focus on refinement for optimal impact';
    } else {
        return 'Content requires significant improvements across multiple quality factors';
    }
}


function getContentQualityContext(tier) {
    const contexts = {
        'good': 'Excellent professional quality',
        'fair': 'Quality needs improvement in key areas',
        'poor': 'Multiple quality issues require attention'
    };
    return contexts[tier] || 'Content quality assessment';
}


function createFactorsPreview(breakdown) {
    if (!breakdown) return '';
    
    // Use same counting logic as createSummaryText for consistency
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Count merged readability
    const readabilityTotal = (breakdown.readability || 0) + (breakdown.readability_penalties || 0);
    if (readabilityTotal > 0) positiveCount++;
    else if (readabilityTotal < 0) negativeCount++;
    
    // Count merged sentiment
    const sentimentTotal = (breakdown.sentiment || 0) + (breakdown.sentiment_extremity_penalties || 0);
    if (sentimentTotal > 0) positiveCount++;
    else if (sentimentTotal < 0) negativeCount++;
    
    // Count other non-zero metrics (excluding merged components and ignored metrics)
    const IGNORED_METRICS = ['injection_penalties', 'gibberish_penalties', 'total_score'];
    Object.entries(breakdown).forEach(([key, value]) => {
        if (key === 'readability' || key === 'readability_penalties' ||
            key === 'sentiment' || key === 'sentiment_extremity_penalties' ||
            IGNORED_METRICS.includes(key) || value === 0) {
            return;
        }
        if (value > 0) positiveCount++;
        else if (value < 0) negativeCount++;
    });
    
    if (positiveCount === 0 && negativeCount === 0) return '';
    
    return `
        <div class="content-quality-factors-preview">
            <span class="factors-label">Breakdown:</span>
            <span class="factors-list">
                ${positiveCount > 0 ? `<span class="tag factor-positive">✓ ${positiveCount}</span>` : ''}
                ${negativeCount > 0 ? `<span class="tag factor-negative">⚠ ${negativeCount}</span>` : ''}
            </span>
        </div>
    `;
}

function createQualityBreakdown(breakdown, score) {
  if (!breakdown) return '<p>No detailed breakdown available</p>';

  const IGNORED_METRICS = ['injection_penalties', 'gibberish_penalties', 'total_score'];

  const mergedBreakdown = {};

  // Merge readability
  const readabilityTotal = (breakdown.readability || 0) + (breakdown.readability_penalties || 0);
  if (readabilityTotal !== 0) mergedBreakdown.readability = readabilityTotal;

  // Merge sentiment
  const sentimentTotal = (breakdown.sentiment || 0) + (breakdown.sentiment_extremity_penalties || 0);
  if (sentimentTotal !== 0) mergedBreakdown.sentiment = sentimentTotal;

  // Add other non-merged
  Object.entries(breakdown).forEach(([key, value]) => {
    if (
      key === 'readability' || key === 'readability_penalties' ||
      key === 'sentiment' || key === 'sentiment_extremity_penalties' ||
      IGNORED_METRICS.includes(key) || value === 0
    ) {
      return;
    }
    mergedBreakdown[key] = value;
  });

  // Convert to structured list
  let factorEntries = Object.entries(mergedBreakdown).map(([key, value]) => {
    const isPositive = value > 0;
    const displayName = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    return {
      key,
      value,
      isPositive,
      formattedName,
      impactLabel: getFactorImpactLabelForMerged(key, value),
      badge: isPositive ? 'Success' : 'Error'
    };
  });

  // ✅ Sort here before HTML
  factorEntries.sort((a, b) => {
    if (a.isPositive && !b.isPositive) return -1; // positives first
    if (!a.isPositive && b.isPositive) return 1;  // negatives after
    return Math.abs(b.value) - Math.abs(a.value); // bigger absolute value first
  });

  const rowsHtml = factorEntries.map(f => `
    <div class="quality__table-row">
      <div class="quality__table-item first-col">
        <span class="quality__title weight-700">${f.formattedName}</span>
        <span class="quality__value weight-500">${f.value > 0 ? '+' : ''}${Math.round(f.value * 100) / 100}</span>
      </div>
      <div class="quality__table-item">
        <span>${f.impactLabel}</span>
      </div>
      <div class="quality__table-item">
        <span class="quality__badge">${f.badge}</span>
      </div>
    </div>
  `).join('');

  if (!rowsHtml) {
    if (score >= 70) return '<p>All quality factors within normal range</p>';
    if (score >= 40) return '<p>Quality factors detected - review recommended</p>';
    return '<p>Quality analysis indicates multiple areas for improvement</p>';
  }

  return `
    <div class="analysis-metric margin-top-sm">
      <div class="quality__table">
        ${rowsHtml}
      </div>
    </div>
  `;
}

function getFactorImpactLabelForMerged(key, value) {
  if (key === 'readability') return value < 0 ? 'Difficult to Read' : 'Clear and Accessible';
  if (key === 'sentiment') return value < 0 ? 'Tone Issues Detected' : 'Positive Tone';
  return value > 0 ? 'Positive Contribution to Quality' : 'Area Requiring Improvement';
}


function createImprovementGuidelines(breakdown, score) {
  let guidelines = [];
  
  // Pick recommendations based on score
  if (score >= 70) {
    guidelines = [
      'Continue maintaining professional standards',
      'Consider minor refinements for optimal impact',
      'Review content for consistency and flow',
      'Ensure key messages are clearly emphasized'
    ];
  } else if (score >= 40) {
    guidelines = [
      'Improve clarity and conciseness',
      'Strengthen professional tone',
      'Review grammar and punctuation',
      'Enhance content structure and flow',
      'Simplify complex sentences'
    ];
  } else {
    guidelines = [
      'Rewrite for clarity and professionalism',
      'Fix grammar and punctuation errors',
      'Improve content structure and organization',
      'Reduce complexity and improve readability',
      'Remove spam-like elements and excessive formatting'
    ];
  }

  const listItems = guidelines.map(guide => `<li>${guide}</li>`).join('');

  return `
    <div class="card__platform-guidance margin-top-sm">
      <div class="analysis-metric">
        <div class="platform-guidance__info">
          <div>
            ${getInfoIcon()}
          </div>
          <div>
            <h5 class="heading-style-h6">Recommended Actions:</h5>
            <ul class="platform-guidance__info-list">
              ${listItems}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// SVG helper
function getInfoIcon() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <g clip-path="url(#clip0_8576_3928)">
        <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
      </g>
      <defs>
        <clipPath id="clip0_8576_3928">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  `;
}

function getRiskCategoryIcon(category) {
    const icons = {
        'urgency': '⏰',
        'financial': '💰',
        'links': '🔗',
        'link': '🔗',
        'phishing': '🎣',
        'social': '👥',
        'phrase': '💬',
        'hype': '🚀',
        'general': '⚠️'
    };
    return icons[category] || '⚠️';
}

function getEducationLevel(gradeLevel) {
    if (gradeLevel <= 6) return 'Elementary';
    if (gradeLevel <= 8) return 'Middle School';
    if (gradeLevel <= 12) return 'High School';
    if (gradeLevel <= 16) return 'College';
    return 'Graduate';
}

function getAudienceLevel(gradeLevel) {
    if (gradeLevel <= 8) return 'General Public';
    if (gradeLevel <= 12) return 'Educated Adults';
    if (gradeLevel <= 16) return 'College Educated';
    return 'Academic/Professional';
}

function getReadingEaseExplanation(easeScore) {
    if (easeScore >= 90) return 'Very easy to read - accessible to most 5th graders';
    if (easeScore >= 80) return 'Easy to read - accessible to most 6th graders';
    if (easeScore >= 70) return 'Fairly easy to read - accessible to most 7th graders';
    if (easeScore >= 60) return 'Standard reading level - accessible to most 8th-9th graders';
    if (easeScore >= 50) return 'Fairly difficult - accessible to most high school students';
    if (easeScore >= 30) return 'Difficult - accessible to most college students';
    return 'Very difficult - accessible to college graduates and professionals';
}

function getGradeLevelExplanation(gradeLevel) {
    if (gradeLevel <= 6) return 'Elementary school reading level - very accessible';
    if (gradeLevel <= 8) return 'Middle school reading level - easily understood';
    if (gradeLevel <= 10) return 'High school reading level - accessible to most adults';
    if (gradeLevel <= 12) return 'Late high school reading level - standard for general content';
    if (gradeLevel <= 16) return 'College reading level - may be challenging for some readers';
    return 'Graduate school level - specialized audience required';
}

function getSentimentContext(score) {
    if (score < -0.3) return 'May limit audience appeal';
    if (score < 0.05) return 'Consider more positive framing';
    if (score <= 0.6) return 'Optimal for engagement';
    if (score <= 0.8) return 'Very enthusiastic tone';
    return 'May seem overly promotional';
}

function getSentimentLabel(score) {
    if (score < -0.3) return 'Very Negative';
    if (score < 0.05) return 'Slightly Negative';
    if (score <= 0.6) return 'Balanced Positive';
    if (score <= 0.8) return 'Very Positive';
    return 'Extremely Positive';
}

function getSentimentDescription(score) {
    if (score < -0.3) return 'Strong negative emotions detected';
    if (score < 0.05) return 'Cautious or reserved tone';
    if (score <= 0.6) return 'Professional and engaging';
    if (score <= 0.8) return 'Enthusiastic and optimistic';
    return 'Overwhelming positivity';
}

function getAudienceAppeal(tier) {
    const appeals = {
        'good': 'High',
        'fair': 'Moderate',
        'poor': 'Limited'
    };
    return appeals[tier] || 'Unknown';
}

function populateData(data){
    const tier = data?.evaluation_report?.tier;
    const qualitativeLabels = { good: 'Excellent', fair: 'Good', poor: 'Needs Improvement' };
    const qualitativeLabel = qualitativeLabels[tier] || 'Unknown';
    const contextText = getContext(tier);
    const insightText = getInsightText(tier);
    const evaluation_summary = data?.evaluation_summary
    const summary = data?.evaluation_report?.summary
    const displayData = data?.display_data || {};
    const contextMode = data?.context_mode || 'creator';
    const platform = data.platform || data.selected_platform || 'general';
    const platformName = getPlatformDisplayName(platform);

    // Advance Link Analysis
    const details = data?.advanced_link_analysis?.details;
    const totalLinks = details?.total_links || 0;
    const riskyLinks = details?.risky_links || 0;
    const linkTier = data?.advanced_link_analysis?.tier || (totalLinks === 0 ? 'fair' : riskyLinks > 2 ? 'poor' : riskyLinks > 0 ? 'fair' : 'good');
    const linkQualitativeLabel = totalLinks === 0 ? 'No Links' : (riskyLinks > 0 ? 'Security Issues' : 'Safe Links');
    const linkAnalysis = details.links_analysis || [];
    const quickInsight = displayData.quick_insight?.[contextMode] ||
        details.quick_insight?.[contextMode] ||
        (totalLinks === 0 ? 'No links means no link-related security risks' :
            riskyLinks > 0 ? 'Suspicious links = reduced user trust and engagement' : 'Trusted links enhance credibility and security');
    const cardSummary = displayData.card_summary?.[tier]?.[contextMode] ||
        details.card_summary?.[tier]?.[contextMode] ||
        (totalLinks === 0 ? 'No external links detected in your content.' :
            riskyLinks > 0 ? 'Some links detected security concerns.' : 'All links appear safe and trustworthy.');

    // AI Linguistic
    ai_linguistic_pattern_data = data?.ai_linguistic_pattern;
    const value = ai_linguistic_pattern_data?.value !== undefined ? ai_linguistic_pattern_data?.value : ai_linguistic_pattern_data;
    const scorePercentage = Math.round(value * 100);
    const aiLinguisticTier = ai_linguistic_pattern_data?.tier || (value <= 0.3 ? 'good' : value <= 0.7 ? 'fair' : 'poor');
    const aiLinguisticDetails = ai_linguistic_pattern_data?.details || {};
    const aiLinguisticLabel = aiLinguisticTier === 'good' ? 'Human-like' :
        aiLinguisticTier === 'fair' ? 'Mixed Signals' : 'AI-like';

    const aiLinguisticQuickInsight = ai_linguistic_pattern_data?.displayData?.quick_insight?.[contextMode] ||
        aiLinguisticDetails?.quick_insight?.[contextMode] ||
        (tier === 'good' ? 'Natural writing style builds authentic audience connection' :
            'Consider personalizing content to reduce AI detection signals');

    // AI Shadowban
    ai_shadowban_risk_data = data?.ai_shadowban_risk;
    const shadowbanValue = ai_shadowban_risk_data?.value !== undefined ? ai_shadowban_risk_data?.value : ai_shadowban_risk_data;
    const shadowbanVDetails = ai_shadowban_risk_data?.details || {};
    const shadowbanTier = ai_shadowban_risk_data?.tier || (value === 'low' ? 'good' : value === 'medium' ? 'fair' : 'poor');
    const shadowbanDisplayData = ai_shadowban_risk_data?.display_data || {};
    const shadowbanQualitativeLabel = shadowbanTier === 'good' ? 'Low Risk' :
        shadowbanTier === 'fair' ? 'Medium Risk' : 'High Risk';
    const aiAnalysisV2 = data?.ai_analysis_v2 || {};
    const riskFactors = aiAnalysisV2?.risk_factors || [];
    const executiveSummary = aiAnalysisV2?.executive_summary || '';
    const shadowbanQuickInsight = shadowbanDisplayData?.quick_insight?.[contextMode] ||
        shadowbanVDetails.quick_insight?.[contextMode] ||
        (tier === 'good' ? 'Optimized content = better reach and engagement' :
            'Content adjustments = improved algorithmic visibility');
    const shadowbanCardSummary = shadowbanDisplayData?.card_summary?.[tier]?.[contextMode] ||
        shadowbanVDetails.card_summary?.[tier]?.[contextMode] ||
        (tier === 'good' ? 'Your content shows low risk of algorithmic suppression.' :
            tier === 'fair' ? 'Some content elements may reduce algorithmic reach.' :
                'Multiple factors may trigger algorithmic suppression.');

  // Caps Lock
  const capitalization_ratio_data = data?.capitalization_ratio ?? {};

  const capitalizationRatioValue =
    capitalization_ratio_data?.value !== undefined
      ? capitalization_ratio_data.value
      : capitalization_ratio_data || 0;
  const capitalizationPercentage = Math.round(capitalizationRatioValue * 100 * 10) / 10;

  const capitalizationRatioDetails = capitalization_ratio_data.details || {};
  const capitalizationRatioTier =
    capitalization_ratio_data.tier ||
    (capitalizationRatioValue <= 0.05
      ? "good"
      : capitalizationRatioValue <= 0.15
      ? "fair"
      : "poor");

  const capitalizationRatioDisplayData = capitalization_ratio_data.display_data || {};
  const capitalizationRatioLabel = getStatusLabel(capitalizationRatioTier);

  const capitalizationRatioCardSummary =
    capitalizationRatioDisplayData.card_summary?.[capitalizationRatioTier]?.[contextMode] ||
    capitalizationRatioDetails.card_summary?.[capitalizationRatioTier]?.[contextMode] ||
    getSummaryText(capitalizationPercentage, capitalizationRatioTier);

  const capitalizationRatioQuickInsight =
    capitalizationRatioDisplayData.quick_insight?.[contextMode] ||
    capitalizationRatioDetails.quick_insight?.[contextMode] ||
    getInsightText(capitalizationRatioTier, capitalizationPercentage);

  // Complex Sentences
  const complexSentencesData = data?.complex_sentences ?? {};
  const complexSentencesValue =
    complexSentencesData?.value !== undefined
      ? complexSentencesData.value
      : complexSentencesData || 0;
  const sentenceCount = complexSentencesValue;
  const complexSentencesDetails = complexSentencesData.details || {};
  const complexSentencesInstances = data.complex_sentences_details?.instances || [];
  const longestWordCount = complexSentencesInstances.length > 0 
        ? Math.max(...complexSentencesInstances.map(i => i.word_count || 0))
        : 0;
    
  const complexSentencesTier = complexSentencesData.tier || (complexSentencesValue === 0 ? 'good' : complexSentencesValue <= 2 ? 'fair' : 'poor');
    const labels = {
        'good': 'Clear',
        'fair': 'Some Complexity', 
        'poor': 'High Complexity'
    };
  const complexSentenceLabel = labels[complexSentencesTier] || 'Clear';

  const complexSentenceQuickInsight = capitalizationRatioDisplayData?.quick_insight?.[contextMode] || 
        complexSentencesDetails.quick_insight?.[contextMode] ||
        getComplexSentenceInsightText(complexSentencesTier, sentenceCount);
  
const complexSentenceCardSummary = capitalizationRatioDisplayData?.card_summary?.[complexSentencesTier]?.[contextMode] || 
        complexSentencesDetails.card_summary?.[complexSentencesTier]?.[contextMode] ||
        getComplexSentenceSummaryText(sentenceCount, tier);

// Content Quality
const contentQualityData = data?.content_quality_score ?? {};
const breakdown = data.content_quality_breakdown?.value
                   || contentQualityData.details?.quality_breakdown
                   || contentQualityData.details?.breakdown
                   || data.quality_breakdown
                   || data.breakdown
const total = Number(breakdown.total_score);
const contentQualityScore = Number.isFinite(total)
                ? Math.round(total)
                : Math.round(contentQualityData?.value || 0);
const contentQualityTier = contentQualityScore >= 70 ? 'good' : contentQualityScore >= 40 ? 'fair' : 'poor';
const contentQualityLabel = getQualityLabel(contentQualityScore);
const summaryText = createSummaryText(breakdown);
const contentQualityInsightText = getContentQualityInsightText(contentQualityTier, breakdown);
const contentQualityContextText = getContentQualityContext(contentQualityTier);
        // Use tier-based assessment for consistency
const assessmentMap = {
    'good': 'Excellent Quality',
    'fair': 'Needs Improvement', 
    'poor': 'Poor Quality'
};

const contentQualitAssessment = assessmentMap[contentQualityTier] || 'Unknown';

// spam analysis

const spamAnalysisData = data?.content_risk_score ?? {};
const spamAnalysisValue = spamAnalysisData.value !== undefined ? spamAnalysisData.value : 0;
const spamAnalysisTier = spamAnalysisValue <= 20 ? 'good' : spamAnalysisValue <= 50 ? 'fair' : 'poor';
const spamAnalysisDisplayData = spamAnalysisData.display_data || {};
if (spamAnalysisData.breakdown) {
    data.content_risk_score_details = {
        breakdown: spamAnalysisData.breakdown,
        category_scores: spamAnalysisData.category_scores || {},
        escalated: spamAnalysisData.escalated || false,
        escalation_reason: spamAnalysisData.escalation_reason || null
    };
}
const spamAnalysisLabel = spamAnalysisValue <= 20 ? 'Low Risk' : spamAnalysisValue <= 50 ? 'Medium Risk' : 'High Risk';
const displayPercentage = Math.round(spamAnalysisValue);

// Excessive Punctuation
const puncuationData = data?.excessive_punctuation ?? {};
const puncuationValue = puncuationData.value !== undefined ? puncuationData.value : metricObject;
const puncuationDetails = puncuationData.details || {};
const puncuationInstances = data.excessive_punctuation_details || [];
const puncuationInstanceCount = puncuationInstances.length;
const puncuationTier = puncuationValue ? 'poor' : 'good';
const puncuationDisplayData = puncuationData.display_data || {};
const puncuationLabel = puncuationValue ? 'Issues Found' : 'Clean';
const punctuationSummary = puncuationDisplayData.card_summary?.[tier]?.[contextMode] || 
  puncuationDetails.card_summary?.[tier]?.[contextMode] ||
  (puncuationValue ? 'Multiple exclamation marks or question marks detected.' : 'No excessive punctuation detected.');
const punctuationInsight = puncuationDisplayData.quick_insight?.[contextMode] || 
  puncuationDetails.quick_insight?.[contextMode] ||
  (puncuationValue ? 'Too many !!! or ??? = spam filters block your message' : 'Clean punctuation maintains credibility');

// flagged keywords
    const flaggedKeyWordData = data?.forbidden_keywords ?? {};
    const flaggedKeyWordValue = flaggedKeyWordData.value !== undefined ? flaggedKeyWordData.value : metricObject;
    const flaggedKeyWordDetails = flaggedKeyWordData.details || {};

    // Extract keywords list from additional data following backend structure
    const keywords = flaggedKeyWordData.forbidden_keywords_details || [];

    // Use the actual value (count) from backend, not complex fallback logic
    const keywordCount = typeof flaggedKeyWordValue === 'number' ? flaggedKeyWordValue : keywords.length;

    // Determine tier based on actual count - use backend tier if available, otherwise calculate
    const flaggedKeywordTier = flaggedKeyWordData.tier || (keywordCount === 0 ? 'good' : keywordCount <= 2 ? 'fair' : 'poor');

    // Get display data from glossary if available (loaded via backend)
    const flaggedKeywordDisplayData = flaggedKeyWordData.display_data || {};
    const flaggedKeywordGlossaryData = flaggedKeywordDisplayData || {};
    const flaggedKeywordQuickInsight = flaggedKeywordGlossaryData?.quick_insight?.creator || 'Certain words = instant spam folder or shadowban';

    // Determine qualitative labels and context
    const flaggedKeywordQualitativeLabel = flaggedKeywordTier === 'good' ? 'Clean' : flaggedKeywordTier === 'fair' ? 'Caution' : 'Warning';
    const flaggedKeywordContextMessage = flaggedKeywordTier === 'good' ? 'No restricted terms' :
        flaggedKeywordTier === 'fair' ? 'Some keywords detected' :
            'Multiple keywords found';

    // Determine filter risk level
    const filterRiskLevel = flaggedKeywordTier === 'good' ? 'Low' : flaggedKeywordTier === 'fair' ? 'Moderate' : 'High';

    // passive voice
    const passiveVoiceData = data?.passive_voice ?? {};
    const passiveValue = passiveVoiceData.value !== undefined ? passiveVoiceData.value : passiveVoiceData;
    const passiveVoiceDetails = passiveVoiceData.details || {};
    const passiveDetails = data.passive_voice_details || {};
    const passiveVoiceInstances = Array.isArray(passiveDetails.instances) ? passiveDetails.instances : [];
    const passiveVoicePhrases = Array.isArray(passiveDetails.phrases) ? passiveDetails.phrases : [];
    const passiveCount = Math.max(passiveValue || 0, passiveVoiceInstances.length, passiveVoicePhrases.length);

    // Determine tier based on backend data - use backend tier if available
    const passiveVoiceTier = passiveVoiceData.tier || (passiveCount >= 6 ? 'poor' : passiveCount >= 3 ? 'fair' : 'good');

    // Get display data from glossary if available (loaded via backend)
    const passiveVoicedisplayData = passiveVoiceData.display_data || {};
    const passiveVoiceGlossaryData = passiveVoicedisplayData || {};

    const passiveVoiceQualitativeLabel = passiveCount === 0 ? 'Active Voice' :
        passiveCount <= 2 ? 'Mostly Active' :
            passiveCount <= 5 ? 'Moderate Use' : 'Frequent Use';

    // Context-aware messages - use safe access patterns
    const passiveVoiceCardSummary = passiveVoicedisplayData.card_summary?.[tier]?.[contextMode] ||
        passiveVoiceDetails.card_summary?.[tier]?.[contextMode] ||
        (passiveCount === 0 ? 'Your writing uses active voice effectively.' :
            passiveCount <= 2 ? 'Good balance of active voice with minimal passive constructions.' :
                'Consider converting some passive constructions to active voice for stronger impact.');

    const passiveVoiceQuickInsight = passiveVoicedisplayData.quick_insight?.[contextMode] ||
        passiveVoiceDetails.quick_insight?.[contextMode] ||
        (passiveCount === 0 ? 'Active voice = more engaging and direct communication' :
            'Active voice creates stronger, more engaging content');
    // readability
    const readabilityData = data?.readability ?? {};

    const ease = readabilityData.ease !== undefined ? readabilityData.ease : 0;
    const grade = readabilityData.grade !== undefined ? readabilityData.grade : 0;
    const readabilityTier = readabilityData.tier || (ease >= 60 ? 'good' : ease >= 30 ? 'fair' : 'poor');

    // Calculate display values
    const easeScore = Math.round(ease);
    const gradeLevel = Math.round(grade);

    // Get display data - readability might not have standard display_data structure
    const readabilityDisplayData = readabilityData.display_data || {};
    const readabilityGlossaryData = readabilityDisplayData || {};

    // Build qualitative labels
    const readabilityQualitativeLabel = readabilityTier === 'good' ? 'Easy to Read' :
        readabilityTier === 'fair' ? 'Moderate' : 'Difficult';

    // Get platform-specific information - MULTI-SOURCE DETECTION PATTERN

    // Context-aware messages - use safe access patterns
    const readabilityCardSummary = readabilityDisplayData.card_summary?.[readabilityTier]?.[contextMode] ||
        (readabilityTier === 'good' ? 'Your content is accessible to most readers.' :
            readabilityTier === 'fair' ? 'Readability could be improved for broader accessibility.' :
                'Content may be challenging for many readers to understand.');

    const readabilityQuickInsight = readabilityDisplayData.quick_insight?.[contextMode] ||
        (readabilityTier === 'good' ? 'Easy reading = better engagement and reach' :
            'Simpler language = wider audience and better retention');

    //snetiment analysis
    //snetiment analysis
    const sentimentAnalysisData = data?.sentiment_compound_score ?? {};

    // Handle both structured metric objects and simple values - DEFENSIVE PATTERN
    const sentimentAnalysisValue = sentimentAnalysisData.value !== undefined ? sentimentAnalysisData.value : sentimentAnalysisData;
    const sentimentAnalysisDetails = sentimentAnalysisData.details || {};
    const sentimentScore = typeof sentimentAnalysisValue === 'number' ? sentimentAnalysisValue : 0.0;

    // Convert sentiment score (-1 to 1) to percentage (0% to 100%)
    const sentimentPercent = Math.round((sentimentScore + 1) * 50);

    // Determine tier based on backend data - use backend tier if available
    const sentimentAnalysisTier = sentimentAnalysisData.tier || getSentimentTier(sentimentScore);

    // Get display data from glossary if available (loaded via backend)
    const sentimentAnalysisDisplayData = sentimentAnalysisData.display_data || {};
    const sentimentAnalysisGlossaryData = sentimentAnalysisDisplayData || {};


    // Build qualitative labels
    const sentimentAnalysisQualitativeLabel = sentimentAnalysisTier === 'good' ? 'Balanced' :
        sentimentAnalysisTier === 'fair' ? 'Moderate' : 'Extreme';

    // Context-aware messages - use safe access patterns
    const sentimentAnalysisCardSummary = displayData.card_summary?.[sentimentAnalysisTier]?.[contextMode] ||
        sentimentAnalysisDetails.card_summary?.[sentimentAnalysisTier]?.[contextMode] ||
        (sentimentAnalysisTier === 'good' ? 'Your emotional tone is balanced and engaging.' :
            sentimentAnalysisTier === 'fair' ? 'Tone is moderately emotional - consider slight adjustments.' :
                'Very emotional tone detected - may impact audience reception.');

    const sentimentAnalysisQuickInsight = displayData.quick_insight?.[contextMode] ||
        sentimentAnalysisDetails.quick_insight?.[contextMode] ||
        (sentimentAnalysisTier === 'good' ? 'Balanced tone = better engagement across audiences' :
            'Extreme emotions can limit audience appeal');

    resultContainer.innerHTML = `
      ${data?.evaluation_report ? ` 
    <div class="result__card evaluation-report-card tie-${tier}"> 
        <div class="card__header">
          <div class="card__header-row">
            <h3 class="card__header-title heading-style-h3">Evaluation Report</h3>
            <div class="card__header-controls">
              <span class="card__header-badge">${qualitativeLabel}</span>
            </div>
          </div>
        </div>
        <div class="card__body">
            <div class="card__body-inner">
              <div class="evaluation-indicator-unified">
                <h2 class="heading-style-h1">${data.evaluation_report.score}</h2>
                <span class="indicator-label">${qualitativeLabel} Quality</span>
              </div>
              <div class="evaluation-insight">
                <h3 class="heading-style-h5">${insightText}</h3>
                <p class="evaluation-insight__desc score-summary">${data.evaluation_report.summary}</p>
                
              </div>
            </div>
              
        </div>
      </div>
     ` : ''}

      <div class="result_detail">
      ${data?.advanced_link_analysis ? ` 
        <div class="result__card advanced-link-analysis-card tie-${linkTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Advanced Link Analysis</h3>
              <div class="card__controls">
                <span class="badge">${linkQualitativeLabel}</span>
                <span class="card__value">${totalLinks} ${totalLinks === 0 ? 'No Links' :
        totalLinks === 1 ? 'Link Found' : 'Links Found'}</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3334 8.00033C13.3334 5.05481 10.9455 2.66699 8.00002 2.66699C5.0545 2.66699 2.66669 5.05481 2.66669 8.00033C2.66669 10.9458 5.0545 13.3337 8.00002 13.3337C10.9455 13.3337 13.3334 10.9458 13.3334 8.00033ZM8.00002 4.93366C8.22093 4.93366 8.40002 5.11274 8.40002 5.33366V8.53366C8.40002 8.75457 8.22093 8.93366 8.00002 8.93366C7.77911 8.93366 7.60002 8.75457 7.60002 8.53366V5.33366C7.60002 5.11274 7.77911 4.93366 8.00002 4.93366ZM8.00002 10.667C8.29457 10.667 8.53335 10.4282 8.53335 10.1337C8.53335 9.83911 8.29457 9.60033 8.00002 9.60033C7.70547 9.60033 7.46669 9.83911 7.46669 10.1337C7.46669 10.4282 7.70547 10.667 8.00002 10.667Z" fill="currentColor"/>
                </svg>
                <strong>${StatusMapper.getLabel('analysis', linkTier)}:</strong>
                <span class="indicator-context">${totalLinks === 0 ?
        'Content contains no external links' :
        riskyLinks > 0 ?
            `${riskyLinks} security concern${riskyLinks === 1 ? '' : 's'}` : 'All links verified safe'}</span>
              </div>
              
              
                ${totalLinks > 0 && Array.isArray(linkAnalysis) && linkAnalysis.length > 0 ? `
                <div class="info-block">
                    <span class="instances-label">Detected:</span>
                    <span class="instances-list">${linkAnalysis.slice(0, 3).map(link =>
        `<code class="tag link-domain ${link.is_risky ? 'risky-domain' : 'safe-domain'}">${sanitizeHTML(link.domain)}</code>`
    ).join(' ')}</span>
                    ${linkAnalysis.length > 3 ? `<span class="more-instances">+${linkAnalysis.length - 3} more</span>` : ''}
                </div>
            ` : ''}
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="12" viewBox="0 0 10 12" fill="none">
                    <path d="M0.200012 5.15587C0.200012 3.4505 0.200012 2.59781 0.401354 2.31094C0.602696 2.02408 1.40445 1.74964 3.00797 1.20075L3.31347 1.09617C4.14934 0.810053 4.56727 0.666992 5.00001 0.666992C5.43275 0.666992 5.85069 0.810053 6.68656 1.09617L6.99206 1.20075C8.59557 1.74964 9.39733 2.02408 9.59867 2.31094C9.80001 2.59781 9.80001 3.4505 9.80001 5.15587C9.80001 5.41347 9.80001 5.69281 9.80001 5.99572C9.80001 9.00269 7.53923 10.4619 6.12078 11.0815C5.73601 11.2496 5.54362 11.3337 5.00001 11.3337C4.45641 11.3337 4.26402 11.2496 3.87924 11.0815C2.46079 10.4619 0.200012 9.00269 0.200012 5.99572C0.200012 5.69281 0.200012 5.41347 0.200012 5.15587Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="insight-text">${sanitizeHTML(quickInsight)}</span>
                   <p class="score-summary">${sanitizeHTML(cardSummary)}</p>
              </div>
            </div>
          </div>
          <div class="card__body">
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Link Security Analysis</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Total Links</div>
                  <div class="metric-count">${totalLinks}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Security Status</div>
                  <div class="metric-count">${totalLinks === 0 ? 'No Links' : riskyLinks === 0 ? 'All Safe' : `${riskyLinks} Risk${riskyLinks === 1 ? '' : 's'}`}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Risk Level</div>
                  <div class="metric-count">${totalLinks === 0 ? 'None' : linkTier === 'good' ? 'Low' : linkTier === 'fair' ? 'Medium' : 'High'}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>

              </div>
            </div>
            ${totalLinks > 0 && Array.isArray(linkAnalysis) && linkAnalysis.length > 0 ? `
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Detailed Link Analysis</h4>
              <div class="card__links-analysis">
                     ${linkAnalysis.map((link, index) => `
                              <div class="analysis-metric ${link.risk_level}-risk">
                                <div class="link-analysis__head">
                                    <span class="link-num">${index + 1} Link</span>
                                     <div class="risk-indicator">
                                          <span class="status-badge"></span>
                                          <span>${link.risk_level} Risk</span>
                                     </div>
                                </div>
                                <div class="link-analysis__links">
                                  <span class="link-url">${sanitizeHTML(link.domain)}</span>
                                </div>
                                ${link.risk_factors && link.risk_factors.length > 0 ? `
                                      <div class="link-analysis__factor-list">
                                        <span class="factors-label">Risk factors:</span>
                                        <div class="factors-list">
                                            ${link.risk_factors.map(factor =>
        `<span class="risk-factor">${sanitizeHTML(factor)}</span>`
    ).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
              </div>
            </div>

            ` : `
                <div class="details-section no-issues-found">
                    <div class="safe-links-message">
                        <span class="safe-icon">${totalLinks === 0 ? 'ℹ️' : '✅'}</span>
                        <div class="safe-text">
                            <h4>${totalLinks === 0 ? 'No External Links Found' : 'All Links Verified Safe'}</h4>
                            <p>${totalLinks === 0 ? 'Your content does not contain any external links, which eliminates link-related security risks.' : 'No security concerns detected. All links appear legitimate and trustworthy.'}</p>
                        </div>
                    </div>
                </div>
            `}
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Link Security Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Use well-known, reputable domains when possible</li>
                        <li>Avoid URL shorteners in professional contexts</li>
                        <li>Check domain spelling carefully for typos</li>
                        <li>Be cautious with new or unusual top-level domains</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">How to Improve Link Security</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label">Avoid:</span>
                        <span class="comparison__title">bit.ly/xyz123 (shortened URL)</span>
                      </div>
                      <div>
                        <span class="comparison__label">Risky:</span>
                        <span class="comparison__title">g00gle.com (typosquatting)</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label">Use</span>
                        <span class="example-text">github.com/project/repo (full domain)</span>
                      </div>
                      <div>
                        <span class="comparison__label">Safe</span>
                        <span class="comparison__title">google.com (verified domain)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        ` : ''}
        <!-- Advanced Link Analysis ends here -->
      ${data?.ai_linguistic_pattern ? ` 
        <div class="result__card ai-pattern-analysis tie-${aiLinguisticTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">AI Linguistic Pattern</h3>
              <div class="card__controls">
                <span class="badge">${aiLinguisticLabel}</span>
                <span class="card__value"><span>${scorePercentage}</span> AI Likelihood</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="info-block__wrapper">
                <div class="info-block">
                  <span class="instances__label">Assessment:</span>
                  <div class="instances__list">
                    <span class="instances__list-item">Score: ${(value ?? 0).toFixed(2)}</span>
                    <span class="instances__list-item">Confidence: ${getConfidenceLevel(value)}</span>
                  </div>
                </div>
                <span class="detection-level weight-500">${getDetectionLevel(value)}</span>
              </div>
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.1899 2.85486C11.289 2.60372 11.6444 2.60372 11.7434 2.85486L12.0925 3.73979C12.1227 3.81647 12.1834 3.87716 12.2601 3.9074L13.145 4.25641C13.3961 4.35546 13.3961 4.71088 13.145 4.80993L12.2601 5.15894C12.1834 5.18918 12.1227 5.24988 12.0925 5.32655L11.7434 6.21148C11.6444 6.46262 11.289 6.46262 11.1899 6.21148L10.8409 5.32655C10.8107 5.24988 10.75 5.18918 10.6733 5.15894L9.78837 4.80993C9.53724 4.71088 9.53724 4.35546 9.78837 4.25641L10.6733 3.9074C10.75 3.87716 10.8107 3.81647 10.8409 3.73979L11.1899 2.85486Z" fill="#1C274C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6667 9.33317C10.6667 11.5423 8.87583 13.3332 6.66669 13.3332C4.45755 13.3332 2.66669 11.5423 2.66669 9.33317C2.66669 7.12403 4.45755 5.33317 6.66669 5.33317C8.87583 5.33317 10.6667 7.12403 10.6667 9.33317ZM8.00002 10.5332C8.22093 10.5332 8.40002 10.3541 8.40002 10.1332C8.40002 9.91226 8.22093 9.73317 8.00002 9.73317H6.93335C6.71244 9.73317 6.53335 9.91226 6.53335 10.1332C6.53335 10.3541 6.71244 10.5332 6.93335 10.5332H8.00002ZM9.06669 8.2665C9.06669 8.70833 8.82791 9.0665 8.53335 9.0665C8.2388 9.0665 8.00002 8.70833 8.00002 8.2665C8.00002 7.82468 8.2388 7.4665 8.53335 7.4665C8.82791 7.4665 9.06669 7.82468 9.06669 8.2665ZM6.40002 9.0665C6.69457 9.0665 6.93335 8.70833 6.93335 8.2665C6.93335 7.82468 6.69457 7.4665 6.40002 7.4665C6.10547 7.4665 5.86669 7.82468 5.86669 8.2665C5.86669 8.70833 6.10547 9.0665 6.40002 9.0665Z" fill="#1C274C"/>
                    <path d="M10.5424 6.02323L10.1427 6.42292C9.97108 6.21818 9.78173 6.02883 9.577 5.85723L9.97671 5.45752L10.3824 5.6175L10.5424 6.02323Z" fill="#1C274C"/>
                  </svg>
                </div>
                <span class="insight__text">${sanitizeHTML(aiLinguisticQuickInsight)}</span>
              </div>
            </div>
          </div>

          <div class="card__body">
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">AI Detection Analysis</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">AI Likelihood</div>
                  <div class="metric-count">${scorePercentage}%</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Writing Style</div>
                  <div class="metric-count">${aiLinguisticLabel}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Confidence</div>
                  <div class="metric-count">${getConfidenceLevel(value)}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>

              </div>
            </div>

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Score Interpretation</h4>
              <div class="card__links-analysis">

                <div class="analysis-metric">
                  <div class="link-analysis__head">
                    <span class="link-num">AI Detection Score</span>
                    <div class="risk-indicator">
                      <span>${(value ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div class="link-analysis__links">
                    <span class="link-url">${getScoreExplanation(value)}</span>
                  </div>
                </div>

                <div class="analysis-metric">
                  <div class="link-analysis__head">
                    <span class="link-num">Linguistic Patterns</span>
                    <div class="risk-indicator">
                      <span>${aiLinguisticLabel}</span>
                    </div>
                  </div>
                  <div class="link-analysis__links">
                    <span class="link-url">  ${getPatternExplanation(aiLinguisticTier)}</span>
                  </div>
                </div>
              </div>
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Writing Authenticity Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Use personal experiences and specific examples</li>
                        <li>Include natural pauses and conversational flow</li>
                        <li>Add personality through unique word choices and expressions</li>
                        <li>Vary sentence structure and avoid overly perfect grammar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- comparison -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">How to Fix Excessive Punctuation</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label weight-700">AI-like</span>
                        <span class="comparison__title">"This comprehensive solution optimizes performance while maintaining scalability."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Formal</span>
                        <span class="comparison__title">"Furthermore, it is important to consider the various factors that contribute to success."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Generic</span>
                        <span class="comparison__title">"Implementing best practices ensures optimal outcomes for stakeholders."</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label weight-700">Human-like</span>
                        <span class="example-text">"I found this approach works really well - it's fast and grows with your needs."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Personal</span>
                        <span class="comparison__title">"From my experience, there are a few key things that make the difference."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Specific</span>
                        <span class="comparison__title">"When I started following these steps, my clients saw immediate improvements."</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      ` : ''}
        <!-- AI Linguistic Pattern ends here -->
     ${data?.ai_shadowban_risk ? `
        <div class="result__card ai-shadowban-risk-card tie-${shadowbanTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">AI Shadowban Risk</h3>
              <div class="card__controls">
                <span class="badge">${shadowbanQualitativeLabel}</span>
                <span class="card__value">${getRiskContext(shadowbanValue, riskFactors.length)}</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.2667 8.93317C12.2667 8.71226 12.0876 8.53317 11.8667 8.53317H10.2667C10.0458 8.53317 9.8667 8.71226 9.8667 8.93317V12.5332H9.0667V3.8665C9.0667 3.47807 9.06585 3.22699 9.04097 3.04199C9.01765 2.86849 8.97999 2.81411 8.94954 2.78366C8.91909 2.75321 8.86471 2.71555 8.69121 2.69223C8.50621 2.66735 8.25513 2.6665 7.8667 2.6665C7.47826 2.6665 7.22718 2.66735 7.04218 2.69223C6.86868 2.71555 6.8143 2.75321 6.78385 2.78366C6.7534 2.81411 6.71574 2.86849 6.69242 3.04199C6.66754 3.22699 6.6667 3.47807 6.6667 3.8665V12.5332H5.8667V6.2665C5.8667 6.04559 5.68761 5.8665 5.4667 5.8665H3.8667C3.64578 5.8665 3.4667 6.04559 3.4667 6.2665V12.5332H2.6667H2.53336C2.31245 12.5332 2.13336 12.7123 2.13336 12.9332C2.13336 13.1541 2.31245 13.3332 2.53336 13.3332H13.2C13.4209 13.3332 13.6 13.1541 13.6 12.9332C13.6 12.7123 13.4209 12.5332 13.2 12.5332H13.0667H12.2667V8.93317Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="insight__text">${sanitizeHTML(shadowbanQuickInsight)}</span>
                 <p class="score-summary">${executiveSummary ? sanitizeHTML(executiveSummary) : sanitizeHTML(shadowbanCardSummary)}</p>
        </div>
              </div>
            </div>
          

          <div class="card__body">
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Shadowban Risk Analysis</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Risk Level</div>
                  <div class="metric-count"> ${(shadowbanValue ?? "N/A").toUpperCase()}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Assessment</div>
                  <div class="metric-count">${shadowbanQualitativeLabel}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Risk Factors</div>
                  <div class="metric-count">${(riskFactors ?? []).length}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>

              </div>
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">X</h5>
                    <p class="platform-rule">X's algorithm favors authentic engagement - avoid repetitive patterns and excessive hashtags</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Shadowban Prevention Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Avoid excessive promotional language and repetitive patterns</li>
                        <li>Engage authentically rather than using templated responses</li>
                        <li>Balance promotional content with valuable, educational material</li>
                        <li>Use natural language patterns and vary your posting style</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- AI Shadowban Risk ends here -->
        ` : ''}
       ${data?.capitalization_ratio ? `
  
        <div class="result__card caps-lock-card tie-${capitalizationRatioTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Caps Lock Check</h3>
              <div class="card__controls">
                <span class="badge">${capitalizationRatioLabel}</span>
                <span class="card__value"><span>${capitalizationPercentage}%</span> Caps Usage</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3334 8.00033C13.3334 5.05481 10.9455 2.66699 8.00002 2.66699C5.0545 2.66699 2.66669 5.05481 2.66669 8.00033C2.66669 10.9458 5.0545 13.3337 8.00002 13.3337C10.9455 13.3337 13.3334 10.9458 13.3334 8.00033ZM8.00002 4.93366C8.22093 4.93366 8.40002 5.11274 8.40002 5.33366V8.53366C8.40002 8.75457 8.22093 8.93366 8.00002 8.93366C7.77911 8.93366 7.60002 8.75457 7.60002 8.53366V5.33366C7.60002 5.11274 7.77911 4.93366 8.00002 4.93366ZM8.00002 10.667C8.29457 10.667 8.53335 10.4282 8.53335 10.1337C8.53335 9.83911 8.29457 9.60033 8.00002 9.60033C7.70547 9.60033 7.46669 9.83911 7.46669 10.1337C7.46669 10.4282 7.70547 10.667 8.00002 10.667Z" fill="currentColor"/>
                </svg>
                <strong class="weight-500">${StatusMapper.getLabel('professionalism', capitalizationRatioTier)}:</strong>
                <span>${getContextText(capitalizationRatioTier)}</span>
              </div>
              <div class="info-block__wrapper">
              
               ${capitalizationPercentage > 5 ? `
                <div class="usage_block">
                    <span class="weight-500">Current Level:</span>
                    <div class="card__usage-bars">
                      <span class="bar"></span>
                      <span class="bar"></span>
                      <span class="bar"></span>
                      <span class="bar"></span>
                      <span class="bar"></span>
                    </div>
                    <span class="usage-recommendation">${getRecommendation(tier)}</span>
                </div>
            ` : ''}
              </div>
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.20001 7.15539C3.20001 5.45001 3.20001 4.59732 3.40135 4.31046C3.6027 4.02359 4.40445 3.74915 6.00797 3.20026L6.31347 3.09569C7.14934 2.80956 7.56727 2.6665 8.00001 2.6665C8.43275 2.6665 8.85069 2.80956 9.68656 3.09569L9.99206 3.20026C11.5956 3.74915 12.3973 4.02359 12.5987 4.31046C12.8 4.59732 12.8 5.45001 12.8 7.15539C12.8 7.41298 12.8 7.69233 12.8 7.99523C12.8 11.0022 10.5392 12.4614 9.12078 13.081C8.73601 13.2491 8.54362 13.3332 8.00001 13.3332C7.45641 13.3332 7.26402 13.2491 6.87924 13.081C5.46079 12.4614 3.20001 11.0022 3.20001 7.99523C3.20001 7.69233 3.20001 7.41298 3.20001 7.15539Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="insight__text">${sanitizeHTML(capitalizationRatioQuickInsight)}</span>
              </div>
            </div>
          </div>

          <div class="card__body">
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Caps Lock Analysis</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Current Usage:</div>
                  <div class="metric-count">${capitalizationPercentage}%</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Status:</div>
                  <div class="metric-count">${capitalizationRatioLabel}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Target Range:</div>
                  <div class="metric-count">${getTargetRange(platform)}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>
              </div>
            </div>

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Score Interpretation</h4>
              <div class="card__usage-list margin-top-sm">

                <div class="card__usage-item">
                  <div class="card__usage-left">
                    <div class="card__usage-bars">
                      <span class="bar bg-success"></span>
                      <span class="bar bg-success"></span>
                      <span class="bar bg-success"></span>
                      <span class="bar bg-success"></span>
                      <span class="bar bg-success"></span>
                    </div>
                    <h5 class="heading-style-h5">Professional</h5>
                  </div>
                  <div class="card__usage-right">
                    <span class="card__usage-amount weight-700">0-5%</span>
                    <span class="card__usage-subtitle weight-500">Balanced and credible</span>
                  </div>
                </div>

                <div class="card__usage-item">
                  <div class="card__usage-left">
                    <div class="card__usage-bars">
                      <span class="bar bg-warning"></span>
                      <span class="bar bg-warning"></span>
                      <span class="bar bg-warning"></span>
                      <span class="bar bg-warning"></span>
                      <span class="bar bg-warning"></span>
                    </div>
                    <h5 class="heading-style-h5">Elevated</h5>
                  </div>
                  <div class="card__usage-right">
                    <span class="card__usage-amount weight-700">5-15%</span>
                    <span class="card__usage-subtitle weight-500">Consider reducing</span>
                  </div>
                </div>

                <div class="card__usage-item">
                  <div class="card__usage-left">
                    <div class="card__usage-bars">
                      <span class="bar bg-danger"></span>
                      <span class="bar bg-danger"></span>
                      <span class="bar bg-danger"></span>
                      <span class="bar bg-danger"></span>
                      <span class="bar bg-danger"></span>
                    </div>
                    <h5 class="heading-style-h5">Excessive</h5>
                  </div>
                  <div class="card__usage-right">
                    <span class="card__usage-amount weight-700">15%+</span>
                    <span class="card__usage-subtitle weight-500">May trigger spam filters</span>
                  </div>
                </div>

              </div>
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Use capital letters for proper emphasis only</li>
                        <li>Replace ALL CAPS with strong word choices</li>
                        <li>Consider bold or italic formatting instead</li>
                        <li>Let your content create impact, not caps lock</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- comparison -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">How to Reduce Caps Lock Usage</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label weight-700">Before</span>
                        <span class="comparison__title">"This is SO IMPORTANT!!!"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Before</span>
                        <span class="comparison__title">"DON'T MISS OUT ON THIS DEAL"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Risky</span>
                        <span class="comparison__title">g00gle.com (typosquatting)</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label weight-700">After</span>
                        <span class="example-text">"This is critically important"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">After</span>
                        <span class="comparison__title">"Limited-time offer you won't want to miss"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Safe</span>
                        <span class="comparison__title">google.com (verified domain)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- Caps Lock Check ends here -->
         ` : ''}

        <div class="result__card complex-sentences-card tie-${complexSentencesTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Complex Sentences</h3>
              <div class="card__controls">
                <span class="badge">${complexSentenceLabel}</span>
                <span class="card__value"><span>${sentenceCount}</span> ${sentenceCount === 0 ? 'Clean' : 
                        sentenceCount === 1 ? 'Sentence Found' : 'Sentences Found'}</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3334 5.99984C11.3334 8.94536 8.94554 11.3332 6.00002 11.3332C3.0545 11.3332 0.666687 8.94536 0.666687 5.99984C0.666687 3.05432 3.0545 0.666504 6.00002 0.666504C8.94554 0.666504 11.3334 3.05432 11.3334 5.99984ZM8.14953 4.38366C8.30574 4.53987 8.30574 4.79314 8.14953 4.94935L5.48286 7.61601C5.32665 7.77222 5.07339 7.77222 4.91718 7.61601L3.85051 6.54935C3.6943 6.39314 3.6943 6.13987 3.85051 5.98366C4.00672 5.82745 4.25999 5.82745 4.4162 5.98366L5.20002 6.76748L6.39193 5.57557L7.58384 4.38366C7.74005 4.22745 7.99332 4.22745 8.14953 4.38366Z" fill="currentColor"/>
                </svg>
                <strong class="weight-500">${StatusMapper.getLabel('readability', complexSentencesTier)}:</strong>
                <span>${getComplexSentenceContextText(complexSentencesTier)}</span>
              </div>
              <div class="card__insight">
               ${sentenceCount > 0 ? `
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.9034 3.0965C13.4767 3.66983 13.4767 4.59938 12.9034 5.17271L12.6391 5.437C12.5621 5.42034 12.4652 5.39498 12.3547 5.35666C12.0591 5.25409 11.6706 5.06025 11.3051 4.69477C10.9396 4.3293 10.7458 3.94076 10.6432 3.64512C10.6049 3.53467 10.5795 3.43775 10.5629 3.36079L10.8271 3.0965C11.4005 2.52317 12.33 2.52317 12.9034 3.0965Z" fill="#1C274C"/>
                    <path d="M9.37606 8.70001C9.16058 8.91548 9.05285 9.02322 8.93406 9.11587C8.79393 9.22517 8.6423 9.31888 8.48188 9.39534C8.34588 9.46015 8.20134 9.50833 7.91225 9.60469L6.3878 10.1128C6.24554 10.1603 6.08869 10.1232 5.98266 10.0172C5.87662 9.91116 5.83959 9.75432 5.88701 9.61206L6.39516 8.08761C6.49153 7.79852 6.53971 7.65398 6.60452 7.51798C6.68098 7.35755 6.77468 7.20593 6.88398 7.0658C6.97664 6.94701 7.08437 6.83927 7.29985 6.6238L9.92176 4.00189C10.0624 4.37213 10.309 4.83004 10.7394 5.26046C11.1698 5.69087 11.6277 5.93742 11.998 6.0781L9.37606 8.70001Z" fill="#1C274C"/>
                    <path d="M12.5523 12.5521C13.3334 11.7711 13.3334 10.514 13.3334 7.99984C13.3334 7.1741 13.3334 6.48396 13.3057 5.90176L9.91253 9.29492C9.7252 9.48233 9.58446 9.62315 9.42607 9.74668C9.24013 9.89172 9.03893 10.0161 8.82605 10.1175C8.64473 10.2039 8.45583 10.2668 8.20442 10.3506L6.64078 10.8718C6.21105 11.015 5.73727 10.9032 5.41697 10.5829C5.09667 10.2626 4.98482 9.7888 5.12807 9.35907L5.64928 7.79543C5.73301 7.54402 5.79592 7.35513 5.88234 7.1738C5.9838 6.96092 6.10814 6.75973 6.25317 6.57379C6.37671 6.4154 6.51753 6.27465 6.70494 6.08732L10.0981 2.69417C9.51589 2.6665 8.82576 2.6665 8.00002 2.6665C5.48586 2.6665 4.22878 2.6665 3.44774 3.44755C2.66669 4.2286 2.66669 5.48568 2.66669 7.99984C2.66669 10.514 2.66669 11.7711 3.44774 12.5521C4.22878 13.3332 5.48586 13.3332 8.00002 13.3332C10.5142 13.3332 11.7713 13.3332 12.5523 12.5521Z" fill="#1C274C"/>
                  </svg>
                </div>
                <span class="complexity-label">Longest:</span>
                 <span class="complexity-list">${longestWordCount} words</span>
                ${complexSentencesInstances.length > 1 ? `<span class="more-complexity">+${complexSentencesInstances.length - 1} more</span>` : ''}
                 ` : ''}
              </div>

            </div>
          </div>

          <div class="card__body">

          <!--
            <div class="card__body-inner">
                <div class="evaluation-insight">
                  <span class="insight-icon">📝</span>
                  <span class="insight-text">${sanitizeHTML(complexSentenceQuickInsight)}</span>
                  <p class="evaluation-insight__desc score-summary">${sanitizeHTML(complexSentenceCardSummary)}</p>
                </div>
                
            </div>
            -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Sentence Analysis</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Detection Status:</div>
                  <div class="metric-count">${sentenceCount === 0 ? 'Clean' : 'Complex Found'}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Sentence Count:</div>
                  <div class="metric-count">${sentenceCount}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Longest:</div>
                  <div class="metric-count">${longestWordCount} words</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>
              </div>
            </div>
  ${sentenceCount > 0 ? `
                <div class="details-section sentences-breakdown-panel">
                    <h4>Complexity Breakdown</h4>
                    <div class="sentences-instances-list">
                        ${complexSentencesInstances.map((instance, index) => `
                            <div class="sentences-instance">
                                <div class="instance-header">
                                    <span class="instance-number">#${index + 1}</span>
                                    <span class="instance-length">${instance.word_count} words</span>
                                    <span class="instance-severity">${instance.severity || 'medium'}</span>
                                </div>
                                <div class="instance-meta">
                                    <span class="complexity-indicator">📝 Complex sentence</span>
                                    ${instance.word_count > 35 ? '<span class="severity-high">High complexity</span>' : ''}
                                </div>
                                <div class="instance-text">"${sanitizeHTML((instance.sentence || '').substring(0, 150))}${(instance.sentence || '').length > 150 ? '...' : ''}"</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="card__result-message">
                    
                      <div class="result-message__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.6666 6.99992C13.6666 10.6818 10.6819 13.6666 6.99998 13.6666C3.31808 13.6666 0.333313 10.6818 0.333313 6.99992C0.333313 3.31802 3.31808 0.333252 6.99998 0.333252C10.6819 0.333252 13.6666 3.31802 13.6666 6.99992ZM9.68687 4.9797C9.88213 5.17496 9.88213 5.49154 9.68687 5.6868L6.35353 9.02014C6.15827 9.2154 5.84169 9.2154 5.64643 9.02014L4.31309 7.68681C4.11783 7.49154 4.11783 7.17496 4.31309 6.9797C4.50835 6.78444 4.82494 6.78444 5.0202 6.9797L5.99998 7.95948L7.48987 6.46959L8.97976 4.9797C9.17502 4.78444 9.4916 4.78444 9.68687 4.9797Z" fill="#187F48"></path>
                        </svg>
                      </div>
                      <div>
                        <h5 class="heading-style-h5 weight-500">Sentence Structure is Clear</h5>
                        <p class="result-message margin-top-sm">No complex sentences detected. Your text maintains excellent readability with appropriate sentence length.</p>
                      </div>

                </div>
            `}
             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Keep sentences under 25 words for optimal readability</li>
                        <li>Break complex ideas into multiple shorter sentences</li>
                        <li>Use active voice to reduce sentence length</li>
                        <li>Aim for 15-20 words per sentence for best engagement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- comparison -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">How to Simplify Complex Sentences</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label weight-700">Avoid</span>
                        <span class="comparison__title">"This comprehensive solution, which has been developed over several years by our expert team, provides unprecedented value."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Risky</span>
                        <span class="comparison__title">"When you consider all the factors that contribute to success, including planning, execution, and follow-through, it becomes clear that preparation is key."</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label weight-700">Use</span>
                        <span class="example-text">"Our expert team developed this comprehensive solution over several years. It provides unprecedented value."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Safe</span>
                        <span class="comparison__title">"Success depends on planning, execution, and follow-through. Preparation is key."</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- Complex Sentences ends here -->
${data?.content_quality_score ? `
        <div class="result__card content-quality-card tie-${contentQualityTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Content Quality</h3>
              <div class="card__controls">
                <span class="badge">${contentQualityLabel}</span>
                <span class="card__value">${contentQualityScore}/100 Quality Score</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3334 6.00008C11.3334 8.9456 8.94554 11.3334 6.00002 11.3334C3.0545 11.3334 0.666687 8.9456 0.666687 6.00008C0.666687 3.05456 3.0545 0.666748 6.00002 0.666748C8.94554 0.666748 11.3334 3.05456 11.3334 6.00008ZM4.38382 4.38389C4.54003 4.22768 4.7933 4.22768 4.94951 4.38389L6 5.43439L7.05049 4.38391C7.2067 4.2277 7.45996 4.2277 7.61617 4.38391C7.77238 4.54012 7.77238 4.79338 7.61617 4.94959L6.56569 6.00008L7.61616 7.05055C7.77237 7.20676 7.77237 7.46003 7.61616 7.61624C7.45995 7.77245 7.20669 7.77245 7.05048 7.61624L6 6.56576L4.94952 7.61625C4.79331 7.77246 4.54004 7.77246 4.38383 7.61625C4.22762 7.46004 4.22762 7.20677 4.38383 7.05056L5.43432 6.00008L4.38382 4.94958C4.22761 4.79337 4.22761 4.5401 4.38382 4.38389Z" fill="currentColor"/>
                </svg>
                <strong class="weight-700">${StatusMapper.getLabel( 'quality', contentQualityTier,)}</strong>
                <span>${contentQualityContextText}</span>
              </div>
              ${createFactorsPreview(breakdown)}
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.9034 3.09675C13.4767 3.67007 13.4767 4.59963 12.9034 5.17296L12.6391 5.43725C12.5621 5.42059 12.4652 5.39522 12.3547 5.3569C12.0591 5.25433 11.6706 5.06049 11.3051 4.69502C10.9396 4.32954 10.7458 3.941 10.6432 3.64536C10.6049 3.53491 10.5795 3.43799 10.5629 3.36104L10.8271 3.09675C11.4005 2.52342 12.33 2.52342 12.9034 3.09675Z" fill="#1C274C"/>
                    <path d="M9.37606 8.70025C9.16058 8.91573 9.05285 9.02346 8.93406 9.11612C8.79393 9.22542 8.6423 9.31912 8.48188 9.39558C8.34588 9.46039 8.20134 9.50857 7.91225 9.60494L6.3878 10.1131C6.24554 10.1605 6.08869 10.1235 5.98266 10.0174C5.87662 9.91141 5.83959 9.75456 5.88701 9.6123L6.39516 8.08785C6.49153 7.79877 6.53971 7.65422 6.60452 7.51822C6.68098 7.3578 6.77468 7.20618 6.88398 7.06605C6.97664 6.94725 7.08437 6.83952 7.29985 6.62404L9.92176 4.00213C10.0624 4.37237 10.309 4.83028 10.7394 5.2607C11.1698 5.69112 11.6277 5.93766 11.998 6.07834L9.37606 8.70025Z" fill="#1C274C"/>
                    <path d="M12.5523 12.5524C13.3334 11.7713 13.3334 10.5142 13.3334 8.00008C13.3334 7.17434 13.3334 6.48421 13.3057 5.902L9.91253 9.29516C9.7252 9.48258 9.58446 9.62339 9.42607 9.74693C9.24013 9.89196 9.03893 10.0163 8.82605 10.1178C8.64473 10.2042 8.45583 10.2671 8.20442 10.3508L6.64078 10.872C6.21105 11.0153 5.73727 10.9034 5.41697 10.5831C5.09667 10.2628 4.98482 9.78905 5.12807 9.35932L5.64928 7.79567C5.73301 7.54427 5.79592 7.35537 5.88234 7.17405C5.9838 6.96117 6.10814 6.75997 6.25317 6.57403C6.37671 6.41564 6.51753 6.27489 6.70494 6.08757L10.0981 2.69442C9.51589 2.66675 8.82576 2.66675 8.00002 2.66675C5.48586 2.66675 4.22878 2.66675 3.44774 3.4478C2.66669 4.22885 2.66669 5.48592 2.66669 8.00008C2.66669 10.5142 2.66669 11.7713 3.44774 12.5524C4.22878 13.3334 5.48586 13.3334 8.00002 13.3334C10.5142 13.3334 11.7713 13.3334 12.5523 12.5524Z" fill="#1C274C"/>
                  </svg>
                </div>
                <span class="insight__text">${contentQualityInsightText}</span>
              </div>
               <div class="card-context-row">
                  <p class="score-summary">${summaryText}</p>
              </div>
            </div>
          </div>

          <div class="card__body">

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Score Breakdown</h4>
              <div class="analysis-overview 2-col">

                <div class="analysis-metric">
                  <div class="metric-label">Overall Score:</div>
                  <div class="metric-count">${contentQualityScore}/100</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Assessment:</div>
                  <div class="metric-count">${contentQualitAssessment}</div>
                </div>

              </div>
            </div>

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Detailed Factor Analysis</h4>
              ${createQualityBreakdown(breakdown, contentQualityScore)}
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Content Improvement Guidelines</h4>
                ${createImprovementGuidelines(breakdown, contentQualityScore)}
            </div>
          </div>
        </div>
        <!-- Content Quality ends here -->
         ` : ''}
        ${data?.content_risk_score ? `
            <div class="result__card content-risk-score-card tie-${spamAnalysisTier}">
              <div class="card__header">
                <div class="card__header-row">
                  <h3 class="heading-style-h5">Spam Filter Analysis</h3>
                  <div class="card__controls">
                    <span class="badge">${spamAnalysisLabel}</span>
                    <span class="card__value">${displayPercentage}% ${spamAnalysisLabel}</span>
                   
                    <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
                  </div>
                </div>
                <div class="card_header-cap">
                  <div class="card__indicator-contenxt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3334 6.00008C11.3334 8.9456 8.94554 11.3334 6.00002 11.3334C3.0545 11.3334 0.666687 8.9456 0.666687 6.00008C0.666687 3.05456 3.0545 0.666748 6.00002 0.666748C8.94554 0.666748 11.3334 3.05456 11.3334 6.00008ZM4.38382 4.38389C4.54003 4.22768 4.7933 4.22768 4.94951 4.38389L6 5.43439L7.05049 4.38391C7.2067 4.2277 7.45996 4.2277 7.61617 4.38391C7.77238 4.54012 7.77238 4.79338 7.61617 4.94959L6.56569 6.00008L7.61616 7.05055C7.77237 7.20676 7.77237 7.46003 7.61616 7.61624C7.45995 7.77245 7.20669 7.77245 7.05048 7.61624L6 6.56576L4.94952 7.61625C4.79331 7.77246 4.54004 7.77246 4.38383 7.61625C4.22762 7.46004 4.22762 7.20677 4.38383 7.05056L5.43432 6.00008L4.38382 4.94958C4.22761 4.79337 4.22761 4.5401 4.38382 4.38389Z" fill="currentColor"/>
                    </svg>
                    <strong class="weight-700">${
                            spamAnalysisValue === 0 ? 'Your content is well-crafted' :
                            spamAnalysisValue <= 20 ? 'A few tweaks will help' :
                            spamAnalysisValue <= 50 ? 'Some improvements needed' :
                            'Let\'s enhance your content together'
                        }</strong>
                    <span>${
                            spamAnalysisValue === 0 ? 'Ready to share with confidence' :
                            spamAnalysisValue <= 50 ? 'Small changes can make a big difference' :
                            'We\'ll help you reach your audience effectively'
                        }</span>
                  </div>
                
                  <div class="card__insight">
                    <div class="insight__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2204 13.2204C13.371 13.0698 13.371 12.8257 13.2204 12.6751L11.2653 10.72C11.9939 9.86698 12.4338 8.75994 12.4338 7.55016C12.4338 4.85306 10.2473 2.66663 7.55022 2.66663C4.85312 2.66663 2.66669 4.85306 2.66669 7.55016C2.66669 10.2473 4.85312 12.4337 7.55022 12.4337C8.75997 12.4337 9.86699 11.9938 10.72 11.2653L12.6752 13.2204C12.8258 13.3709 13.0699 13.3709 13.2204 13.2204Z" fill="#1C274C"/>
                      </svg>
                    </div>
                    <span class="insight__text">${
                        sanitizeHTML(spamAnalysisDisplayData.quick_insight?.creator || 
                        'Platforms use filters to ensure content meets community standards. We help you navigate them successfully.')
                    }</span>
                  </div>
                </div>
              </div>
    
              <div class="card__body">
    
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">Content Analysis Summary</h4>
                  <div class="analysis-overview">
    
                    <div class="analysis-metric">
                      <div class="metric-label">Sensitivity Score:</div>
                      <div class="metric-count">${spamAnalysisValue}%</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Content Status:</div>
                      <div class="metric-count">${spamAnalysisLabel}</div>
                    </div>
    
                     ${data?.content_risk_score_details?.escalated ? `
                               <div class="analysis-metric">
                                  <div class="metric-label">Priority:</div>
                                  <div class="metric-count">⚠️ Needs Attention</div>
                              </div>
                        ` : ''}
    
                    <div class="analysis-metric">
                      <div class="metric-label">Platform</div>
                      <div class="metric-count">${platformName}</div>
                    </div>
    
                  </div>
                </div>
    
                
    
                <div class="card_detail-block">
                  ${data?.content_risk_score_details?.breakdown?.length > 0 ? `
                  <h4 class="heading-style-h5 weight-500">Areas for Improvement:</h4>
                  <div class="analysis-metric margin-top-sm">
                        <div class="risk-factors-list">
                          ${data.content_risk_score_details.breakdown.map(risk => `
                                      <div class="risk-factors__item">
                                          <span class="risk-icon">${getRiskCategoryIcon(risk.category)}</span>
                                          <span class="risk-description">${sanitizeHTML(risk.description)}</span>
                                          <span class="risk-weight">+${risk.weight}</span>
                                          <div class="risk-factor-meta">
                                              <span class="risk-category">${risk.category}</span>
                                              ${risk.auto_escalate ? '<span class="escalation-trigger">⚡ Auto-escalated</span>' : ''}
                                          </div>
                                      </div>
                                  `).join('')}
                        </div>
                  </div>
                  <h4 class="heading-style-h5 weight-500">Risk Category Analysis:</h4>
                  <div class="analysis-metric margin-top-sm">
                        <div class="risk-factors-list">
                        ${Object.entries(data.content_risk_score_details.category_scores || {})
                                .filter(([_, score]) => score > 0)
                                .map(([category, score]) => `
                                     <div class="risk-factors__item">
                                        <span class="category-icon">${getRiskCategoryIcon(category)}</span>
                                        <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                          <div class="risk-factor-meta">
                                            <span class="score-value">${score}</span>
                                          </div>
                                      </div>
                                </div>
                            `).join('')}
                        </div>
                  </div>

                  

                  <!-- information -->
                  <div class="card_detail-block">
                    <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
                    <div class="card__platform-guidance margin-top-sm">
                      <div class="analysis-metric">
                        <div class="platform-guidance__head">
                          <h5 class="heading-style-h5 weight-500">X</h5>
                          <p class="platform-rule">X automatically scans links for safety, but users remain cautious of shortened URLs</p>
                        </div>
                        <div class="platform-guidance__info">
                          <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <g clip-path="url(#clip0_8576_3928)">
                                <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                              </g>
                              <defs>
                                <clipPath id="clip0_8576_3928">
                                  <rect width="16" height="16" fill="white"/>
                                </clipPath>
                              </defs>
                            </svg>
                          </div>

                          <div>
                            <h5 class="heading-style-h6">Link Security Best Practices:</h5>
                            <ul class="platform-guidance__info-list">
                              <li>Use well-known, reputable domains when possible</li>
                              <li>Avoid URL shorteners in professional contexts</li>
                              <li>Check domain spelling carefully for typos</li>
                              <li>Be cautious with new or unusual top-level domains</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>
            <!-- Spam Filter Analysis ends here -->
        ` : ''}
        ${data?.excessive_punctuation ? `
            <div class="result__card excessive-punctuation-card tie-${puncuationTier}">
              <div class="card__header">
                <div class="card__header-row">
                  <h3 class="heading-style-h5">Excessive Punctuation</h3>
                  <div class="card__controls">
                    <span class="badge">${puncuationLabel}</span>
                    <span class="card__value">${puncuationInstanceCount} ${puncuationInstanceCount === 0 ? 'Clean' : 
                            puncuationInstanceCount === 1 ? 'Instance Found' : 'Instances Found'}</span>
                    <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
                  </div>
                </div>
                <div class="card_header-cap">
                  <div class="card__indicator-contenxt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3334 7.99996C13.3334 10.9455 10.9455 13.3333 8.00002 13.3333C5.0545 13.3333 2.66669 10.9455 2.66669 7.99996C2.66669 5.05444 5.0545 2.66663 8.00002 2.66663C10.9455 2.66663 13.3334 5.05444 13.3334 7.99996ZM6.38382 6.38377C6.54003 6.22756 6.7933 6.22756 6.94951 6.38377L8 7.43427L9.05049 6.38378C9.2067 6.22757 9.45996 6.22757 9.61617 6.38378C9.77238 6.53999 9.77238 6.79326 9.61617 6.94947L8.56569 7.99995L9.61616 9.05043C9.77237 9.20664 9.77237 9.4599 9.61616 9.61611C9.45995 9.77232 9.20669 9.77232 9.05048 9.61611L8 8.56564L6.94952 9.61612C6.79331 9.77233 6.54004 9.77233 6.38383 9.61612C6.22762 9.45991 6.22762 9.20665 6.38383 9.05044L7.43432 7.99995L6.38382 6.94946C6.22761 6.79325 6.22761 6.53998 6.38382 6.38377Z" fill="currentColor"/>
                    </svg>
                    <strong class="weight-700">${StatusMapper.getLabel('analysis', puncuationTier)}:</strong>
                    <span>${puncuationValue ? 
                            'Let\'s polish your punctuation' : 'Your punctuation looks professional'}</span>
                  </div>
                   ${puncuationInstances > 0 ? `
                      <div class="quality-factors">
                        <span class="instances__label weight-500">Examples:</span>
                        <div class="factors-list">
                          <span class="tag">${puncuationInstances.slice(0, 3).map(i => 
                                `<code class="instance-mark">${sanitizeHTML(i)}</code>`
                            ).join(' ')}</span>
                            ${puncuationInstances.length > 3 ? `<span class="more-instances">+${puncuationInstances.length - 3} more</span>` : ''}
                        </div>
                      </div>
                    ` : ''}
                  <div class="card__insight">
                    <div class="insight__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="12" viewBox="0 0 10 12" fill="none">
                        <path d="M0.200012 5.15551C0.200012 3.45013 0.200012 2.59744 0.401354 2.31058C0.602696 2.02371 1.40445 1.74927 3.00797 1.20038L3.31347 1.09581C4.14934 0.809687 4.56727 0.666626 5.00001 0.666626C5.43275 0.666626 5.85069 0.809687 6.68656 1.09581L6.99206 1.20038C8.59557 1.74927 9.39733 2.02371 9.59867 2.31058C9.80001 2.59744 9.80001 3.45013 9.80001 5.15551C9.80001 5.4131 9.80001 5.69245 9.80001 5.99535C9.80001 9.00232 7.53923 10.4616 6.12078 11.0812C5.73601 11.2493 5.54362 11.3333 5.00001 11.3333C4.45641 11.3333 4.26402 11.2493 3.87924 11.0812C2.46079 10.4616 0.200012 9.00232 0.200012 5.99535C0.200012 5.69245 0.200012 5.4131 0.200012 5.15551Z" fill="#1C274C"/>
                      </svg>
                    </div>
                    <span class="insight__text">${sanitizeHTML(punctuationInsight)}</span>
                  </div>
                  <div class="card__insight">
                    <span class="insight__text">${sanitizeHTML(punctuationSummary)}</span>
                  </div>
                </div>
              </div>
    
              <div class="card__body">
    
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">Punctuation Analysis</h4>
                  <div class="analysis-overview">
    
                    <div class="analysis-metric">
                      <div class="metric-label">Punctuation Status:</div>
                      <div class="metric-count">${puncuationValue ? 'Needs Review' : 'Looking Good'}</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Instances Found:</div>
                      <div class="metric-count">${puncuationInstanceCount}</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Impact Level:</div>
                      <div class="metric-count">${puncuationInstanceCount === 0 ? 'None' : 
                                puncuationInstanceCount <= 2 ? 'Minor' : 'Moderate'}</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Platform</div>
                      <div class="metric-count">${platformName}</div>
                    </div>
    
                  </div>
                </div>
    
                
                     ${puncuationInstanceCount > 0 ? `
                         <div class="card_detail-block">
                           <h4>${puncuationDisplayData.spam_signal_intro || puncuationDetails.spam_signal_intro || 'Punctuation Red Flags Found:'}</h4>
                           <div class="margin-top-sm">
                              ${puncuationInstances.map((instance, index) => `
                                <div class="analysis-metric margin-top-sm">
                                  <div class="link-analysis__head">
                                    <span class="instance-number">#${index + 1}</span>
                                        
                                        <span class="instance-length">${instance.length} marks</span>
                                  </div>
                                  <div><code class="instance-text">${sanitizeHTML(instance)}</code></div>
                                   <div class="instance-meta">
                                        <span class="spam-indicator">🚨 Spam trigger</span>
                                        ${instance.length > 5 ? '<span class="severity-high">High severity</span>' : ''}
                                    </div>
                                </div>
                              `).join('')}
                           </div>
                        </div>
                    ` : `
                     <div class="card__result-message">
                    
                      <div class="result-message__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.6666 6.99992C13.6666 10.6818 10.6819 13.6666 6.99998 13.6666C3.31808 13.6666 0.333313 10.6818 0.333313 6.99992C0.333313 3.31802 3.31808 0.333252 6.99998 0.333252C10.6819 0.333252 13.6666 3.31802 13.6666 6.99992ZM9.68687 4.9797C9.88213 5.17496 9.88213 5.49154 9.68687 5.6868L6.35353 9.02014C6.15827 9.2154 5.84169 9.2154 5.64643 9.02014L4.31309 7.68681C4.11783 7.49154 4.11783 7.17496 4.31309 6.9797C4.50835 6.78444 4.82494 6.78444 5.0202 6.9797L5.99998 7.95948L7.48987 6.46959L8.97976 4.9797C9.17502 4.78444 9.4916 4.78444 9.68687 4.9797Z" fill="#187F48"></path>
                        </svg>
                      </div>
                      <div>
                        <h5 class="heading-style-h5 weight-500">Punctuation Usage is Clean</h5>
                        <p class="result-message margin-top-sm">No excessive punctuation detected. Your text maintains professional standards and avoids common spam triggers.</p>
                      </div>
                       
                    </div>
                `}
    
                 <!-- information -->
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
                  <div class="card__platform-guidance margin-top-sm">
                    <div class="analysis-metric">
                      <div class="platform-guidance__head">
                        <h5 class="heading-style-h5 weight-500">X</h5>
                        <p class="platform-rule">X's algorithm flags posts with excessive punctuation as low-quality</p>
                      </div>
                      <div class="platform-guidance__info">
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <g clip-path="url(#clip0_8576_3928)">
                              <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_8576_3928">
                                <rect width="16" height="16" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
    
                        <div>
                          <h5 class="heading-style-h6">Best Practices:</h5>
                          <ul class="platform-guidance__info-list">
                            <li>Use single punctuation marks for emphasis</li>
                            <li>Replace !!! with stronger word choices</li>
                            <li>Avoid ??? - rephrase as clear questions</li>
                            <li>Let your words create impact, not punctuation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
                <!-- comparison -->
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">How to Fix Excessive Punctuation</h4>
                  <div class="card__comparison margin-top-sm">
                    <div class="analysis-metric">
                      <div class="comparison__row">
                        <div class="comparison__item before">
                          <div>
                            <span class="comparison__label weight-700">Before</span>
                            <span class="comparison__title">"This is AMAZING!!!"</span>
                          </div>
                          <div>
                            <span class="comparison__label weight-700">Before</span>
                            <span class="comparison__title">"Really??? Are you sure???"</span>
                          </div>
                        </div>
                        <div class="comparison__item after">
                          <div>
                            <span class="comparison__label weight-700">After</span>
                            <span class="example-text">"This is truly remarkable"</span>
                          </div>
                          <div>
                            <span class="comparison__label weight-700">After</span>
                            <span class="comparison__title">"Are you certain about this?"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
              </div>
            </div>
            <!-- Excessive Punctuation ends here -->
        ` : ''}
        ${data?.forbidden_keywords ? `
            <div class="result__card forbidden-keywords-card tie-${flaggedKeywordTier}">
              <div class="card__header">
                <div class="card__header-row">
                  <h3 class="heading-style-h5">Potentially Flagged Keywords</h3>
                  <div class="card__controls">
                    <span class="badge">${flaggedKeywordTier === 'good' ? 'Low Risk' : flaggedKeywordTier === 'fair' ? 'Fair Risk' : 'High Risk'}</span>
                    <span class="card__value">${keywordCount} ${StatusMapper.getLabel('analysis', flaggedKeywordTier)}</span>
                    <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
                  </div>
                </div>
                <div class="card_header-cap">
                  <div class="card__indicator-contenxt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3334 5.99984C11.3334 8.94536 8.94554 11.3332 6.00002 11.3332C3.0545 11.3332 0.666687 8.94536 0.666687 5.99984C0.666687 3.05432 3.0545 0.666504 6.00002 0.666504C8.94554 0.666504 11.3334 3.05432 11.3334 5.99984ZM8.14953 4.38366C8.30574 4.53987 8.30574 4.79314 8.14953 4.94935L5.48286 7.61601C5.32665 7.77222 5.07339 7.77222 4.91718 7.61601L3.85051 6.54935C3.6943 6.39314 3.6943 6.13987 3.85051 5.98366C4.00672 5.82745 4.25999 5.82745 4.4162 5.98366L5.20002 6.76748L6.39193 5.57557L7.58384 4.38366C7.74005 4.22745 7.99332 4.22745 8.14953 4.38366Z" fill="currentColor"/>
                    </svg>
                    <strong class="weight-700">${keywordCount === 0 ? 'Looking good!' :
        keywordCount === 1 ? 'One suggestion' : 'A few suggestions'}</strong>
                    <span>${keywordCount === 0 ? 'Your word choices work well' :
        keywordCount === 1 ? 'Let\'s refine one word for better reach' :
            'We\'ll help you find better alternatives'}</span>
                  </div>
                  <div class="card__insight">
                    <div class="insight__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12.9034 3.0965C13.4767 3.66983 13.4767 4.59938 12.9034 5.17271L12.6391 5.437C12.5621 5.42034 12.4652 5.39498 12.3547 5.35666C12.0591 5.25409 11.6706 5.06025 11.3051 4.69477C10.9396 4.3293 10.7458 3.94076 10.6432 3.64512C10.6049 3.53467 10.5795 3.43775 10.5629 3.36079L10.8271 3.0965C11.4005 2.52317 12.33 2.52317 12.9034 3.0965Z" fill="#1C274C"/>
                        <path d="M9.37606 8.70001C9.16058 8.91548 9.05285 9.02322 8.93406 9.11587C8.79393 9.22517 8.6423 9.31888 8.48188 9.39534C8.34588 9.46015 8.20134 9.50833 7.91225 9.60469L6.3878 10.1128C6.24554 10.1603 6.08869 10.1232 5.98266 10.0172C5.87662 9.91116 5.83959 9.75432 5.88701 9.61206L6.39516 8.08761C6.49153 7.79852 6.53971 7.65398 6.60452 7.51798C6.68098 7.35755 6.77468 7.20593 6.88398 7.0658C6.97664 6.94701 7.08437 6.83927 7.29985 6.6238L9.92176 4.00189C10.0624 4.37213 10.309 4.83004 10.7394 5.26046C11.1698 5.69087 11.6277 5.93742 11.998 6.0781L9.37606 8.70001Z" fill="#1C274C"/>
                        <path d="M12.5523 12.5521C13.3334 11.7711 13.3334 10.514 13.3334 7.99984C13.3334 7.1741 13.3334 6.48396 13.3057 5.90176L9.91253 9.29492C9.7252 9.48233 9.58446 9.62315 9.42607 9.74668C9.24013 9.89172 9.03893 10.0161 8.82605 10.1175C8.64473 10.2039 8.45583 10.2668 8.20442 10.3506L6.64078 10.8718C6.21105 11.015 5.73727 10.9032 5.41697 10.5829C5.09667 10.2626 4.98482 9.7888 5.12807 9.35907L5.64928 7.79543C5.73301 7.54402 5.79592 7.35513 5.88234 7.1738C5.9838 6.96092 6.10814 6.75973 6.25317 6.57379C6.37671 6.4154 6.51753 6.27465 6.70494 6.08732L10.0981 2.69417C9.51589 2.6665 8.82576 2.6665 8.00002 2.6665C5.48586 2.6665 4.22878 2.6665 3.44774 3.44755C2.66669 4.2286 2.66669 5.48568 2.66669 7.99984C2.66669 10.514 2.66669 11.7711 3.44774 12.5521C4.22878 13.3332 5.48586 13.3332 8.00002 13.3332C10.5142 13.3332 11.7713 13.3332 12.5523 12.5521Z" fill="#1C274C"/>
                      </svg>
                    </div>
                    <span class="insight__text">${flaggedKeywordQuickInsight}</span>
                  </div>
                </div>
                 ${keywordCount > 0 && Array.isArray(keywords) && keywords.length > 0 ? `
            <div class="keywords-instances-preview">
                <span class="instances-label">Words to review:</span>
                <span class="instances-list">${keywords.slice(0, 3).map(k =>
        `<code class="keyword-pill">${sanitizeHTML(k)}</code>`
    ).join(' ')}</span>
                ${keywords.length > 3 ? `<span class="more-keywords">+${keywords.length - 3} more</span>` : ''}
            </div>
        ` : ''}
              </div>
    
              <div class="card__body">
    
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">Word Choice Analysis</h4>
                  <div class="analysis-overview">
    
                    <div class="analysis-metric">
                      <div class="metric-label">Word Status:</div>
                      <div class="metric-count">${keywordCount === 0 ? 'All Clear' : 'Review Suggested'}</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Words to Review:</div>
                      <div class="metric-count">${keywordCount}</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Platform Impact:</div>
                      <div class="metric-count">${filterRiskLevel}</div>
                    </div>
    
                    <div class="analysis-metric">
                      <div class="metric-label">Platform</div>
                      <div class="metric-count">${platformName}</div>
                    </div>
                  </div>
                </div>
    
                <div class="card_detail-block">
                  <div class="card__result-message">
                    <div class="result-message__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.6666 6.99992C13.6666 10.6818 10.6819 13.6666 6.99998 13.6666C3.31808 13.6666 0.333313 10.6818 0.333313 6.99992C0.333313 3.31802 3.31808 0.333252 6.99998 0.333252C10.6819 0.333252 13.6666 3.31802 13.6666 6.99992ZM9.68687 4.9797C9.88213 5.17496 9.88213 5.49154 9.68687 5.6868L6.35353 9.02014C6.15827 9.2154 5.84169 9.2154 5.64643 9.02014L4.31309 7.68681C4.11783 7.49154 4.11783 7.17496 4.31309 6.9797C4.50835 6.78444 4.82494 6.78444 5.0202 6.9797L5.99998 7.95948L7.48987 6.46959L8.97976 4.9797C9.17502 4.78444 9.4916 4.78444 9.68687 4.9797Z" fill="#187F48"/>
                      </svg>
                    </div>
                    <div>
                      <h5 class="heading-style-h5 weight-500">${keywordCount} Potentially Flagged Keywords Detected</h5>
                      <p class="result-message margin-top-sm">Your content contains ${keywordCount} terms that may trigger platform filters. Consider reviewing your content for promotional language, urgency phrases, or financial claims.</p>
                    </div>
                  </div>
                </div>
    
                 <!-- information -->
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
                  <div class="card__platform-guidance margin-top-sm">
                    <div class="analysis-metric">
                      <div class="platform-guidance__head">
                        <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                        <p class="platform-rule">Platform filters vary by community standards</p>
                      </div>
                      <div class="platform-guidance__info">
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <g clip-path="url(#clip0_8576_3928)">
                              <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_8576_3928">
                                <rect width="16" height="16" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
    
                        <div>
                          <h5 class="heading-style-h6">Common Filtered Categories:</h5>
                          <ul class="platform-guidance__info-list">
                            <li>Financial: guaranteed, free money, get rich</li>
                            <li>Urgency: act now, limited time, don't miss</li>
                            <li>Clickbait: click here, this one trick</li>
                            <li>Medical: miracle cure, lose weight fast</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
                <!-- comparison -->
                <div class="card_detail-block">
                  <h4 class="heading-style-h5 weight-500">How to Replace Potentially Flagged Keywords</h4>
                  <div class="card__comparison margin-top-sm">
                    <div class="analysis-metric">
                      <div class="comparison__row">
                        <div class="comparison__item before">
                          <div>
                            <span class="comparison__label weight-700">Before</span>
                            <span class="comparison__title">"Get free money guaranteed!"</span>
                          </div>
                          <div>
                            <span class="comparison__label weight-700">Before</span>
                            <span class="comparison__title">"Click here for limited time offer"</span>
                          </div>
                          <div>
                            <span class="comparison__label weight-700">Before</span>
                            <span class="comparison__title">"Act now - 100% risk-free"</span>
                          </div>
                        </div>
                        <div class="comparison__item after">
                          <div>
                            <span class="comparison__label weight-700">After</span>
                            <span class="example-text">"Earn income with our proven system"</span>
                          </div>
                          <div>
                            <span class="comparison__label weight-700">After</span>
                            <span class="comparison__title">"View our current promotion details"</span>
                          </div>
                          <div>
                            <span class="comparison__label weight-700">After</span>
                            <span class="comparison__title">"Available today with our satisfaction guarantee"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
              </div>
            </div>
            <!-- Potentially Flagged Keywords ends here -->
           ` : ''}
${data?.passive_voice ? `
        <div class="result__card passive-voice-card tie-${passiveVoiceTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Passive Voice</h3>
              <div class="card__controls">
                <span class="badge">${passiveVoiceQualitativeLabel}</span>
                <span class="card__value">${passiveCount} ${passiveCount === 0 ? 'Active Voice' :
        passiveCount === 1 ? 'Construction Found' : 'Constructions Found'}</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3334 7.99996C13.3334 10.9455 10.9455 13.3333 8.00002 13.3333C5.0545 13.3333 2.66669 10.9455 2.66669 7.99996C2.66669 5.05444 5.0545 2.66663 8.00002 2.66663C10.9455 2.66663 13.3334 5.05444 13.3334 7.99996ZM10.1495 6.38378C10.3057 6.53999 10.3057 6.79326 10.1495 6.94947L7.48286 9.61614C7.32665 9.77234 7.07339 9.77234 6.91718 9.61614L5.85051 8.54947C5.6943 8.39326 5.6943 8.13999 5.85051 7.98378C6.00672 7.82757 6.25999 7.82757 6.4162 7.98378L7.20002 8.76761L8.39193 7.5757L9.58384 6.38378C9.74005 6.22757 9.99332 6.22757 10.1495 6.38378Z" fill="currentColor"/>
                </svg>
                <strong class="weight-700">${passiveVoiceQualitativeLabel}:</strong>
                <span>${passiveCount === 0 ?
        'Direct and engaging writing' : 'Consider active alternatives'}</span>
              </div>
               ${passiveCount > 0 && passiveVoicePhrases.length > 0 ? `
                <div class="passive-instances-preview">
                    <span class="instances-label">Detected:</span>
                    <span class="instances-list">${passiveVoicePhrases.slice(0, 3).map(phrase =>
        `<code class="passive-phrase">${sanitizeHTML(phrase)}</code>`
    ).join(' ')}</span>
                    ${passiveVoicePhrases.length > 3 ? `<span class="more-instances">+${passiveVoicePhrases.length - 3} more</span>` : ''}
                </div>
            ` : ''}
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.62375 6.88762L6.25689 4.678C7.31255 3.24971 7.84038 2.53556 8.33284 2.68647C8.8253 2.83739 8.8253 3.71329 8.8253 5.46509V5.63026C8.8253 6.2621 8.8253 6.57802 9.02719 6.77618L9.03787 6.78644C9.24411 6.98042 9.57292 6.98042 10.2305 6.98042C11.4139 6.98042 12.0056 6.98042 12.2056 7.33932C12.2089 7.34527 12.2121 7.35126 12.2153 7.35729C12.404 7.72175 12.0614 8.18527 11.3762 9.11232L9.7431 11.3219C8.68742 12.7502 8.15958 13.4644 7.66712 13.3134C7.17466 13.1625 7.17467 12.2866 7.1747 10.5348L7.1747 10.3697C7.17471 9.73785 7.17471 9.42192 6.97283 9.22376L6.96214 9.2135C6.7559 9.01952 6.42709 9.01952 5.76947 9.01952C4.58607 9.01952 3.99438 9.01952 3.7944 8.66061C3.79109 8.65467 3.78787 8.64868 3.78475 8.64265C3.59597 8.27819 3.93857 7.81467 4.62375 6.88762Z" fill="#1C274C"/>
                  </svg>
                </div>
                <span class="insight__text">${sanitizeHTML(passiveVoiceQuickInsight)}</span>
              </div>
            </div>
          </div>

          <div class="card__body">

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Voice Analysis Dashboard</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Writing Style:</div>
                  <div class="metric-count">${passiveVoiceQualitativeLabel}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Passive Count:</div>
                  <div class="metric-count">${passiveCount}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Engagement:</div>
                  <div class="metric-count">${passiveCount === 0 ? 'High' :
        passiveCount <= 2 ? 'Good' : 'Could Improve'}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>
              </div>
            </div>
            
            <div class="card_detail-block">
              <div class="card__result-message">
                <div class="result-message__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.6666 6.99992C13.6666 10.6818 10.6819 13.6666 6.99998 13.6666C3.31808 13.6666 0.333313 10.6818 0.333313 6.99992C0.333313 3.31802 3.31808 0.333252 6.99998 0.333252C10.6819 0.333252 13.6666 3.31802 13.6666 6.99992ZM9.68687 4.9797C9.88213 5.17496 9.88213 5.49154 9.68687 5.6868L6.35353 9.02014C6.15827 9.2154 5.84169 9.2154 5.64643 9.02014L4.31309 7.68681C4.11783 7.49154 4.11783 7.17496 4.31309 6.9797C4.50835 6.78444 4.82494 6.78444 5.0202 6.9797L5.99998 7.95948L7.48987 6.46959L8.97976 4.9797C9.17502 4.78444 9.4916 4.78444 9.68687 4.9797Z" fill="#187F48"/>
                  </svg>
                </div>
                <div>
                  <h5 class="heading-style-h5 weight-500">Excellent Use of Active Voice</h5>
                  <p class="result-message margin-top-sm">Your writing is direct and engaging. Active voice creates stronger, more compelling content that connects better with readers.</p>
                </div>
              </div>
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Writing Style Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Active Voice Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Put the subject before the action: "We solved the problem"</li>
                        <li>Use strong action verbs instead of "to be" + past participle</li>
                        <li>Make the doer of the action clear and prominent</li>
                        <li>Keep sentences direct and punchy for better engagement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- comparison -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Passive to Active Transformations</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label weight-700">Passive</span>
                        <span class="comparison__title">"Mistakes were made by the team"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Passive</span>
                        <span class="comparison__title">"The problem is being investigated"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Passive</span>
                        <span class="comparison__title">"Results will be announced soon"</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label weight-700">After</span>
                        <span class="example-text">"The team made mistakes"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">After</span>
                        <span class="comparison__title">"Our team is investigating the problem"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">After</span>
                        <span class="comparison__title">"We will announce results soon"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- Passive Voice ends here -->
  ` : ''}
${data?.readability ? `
         <div class="result__card readability-card tie-${readabilityTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Readability</h3>
              <div class="card__controls">
                <span class="badge">${readabilityQualitativeLabel}</span>
                <span class="card__value"><span>${easeScore}</span> Reading Ease</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3334 6.00008C11.3334 8.9456 8.94554 11.3334 6.00002 11.3334C3.0545 11.3334 0.666687 8.9456 0.666687 6.00008C0.666687 3.05456 3.0545 0.666748 6.00002 0.666748C8.94554 0.666748 11.3334 3.05456 11.3334 6.00008ZM4.38382 4.38389C4.54003 4.22768 4.7933 4.22768 4.94951 4.38389L6 5.43439L7.05049 4.38391C7.2067 4.2277 7.45996 4.2277 7.61617 4.38391C7.77238 4.54012 7.77238 4.79338 7.61617 4.94959L6.56569 6.00008L7.61616 7.05055C7.77237 7.20676 7.77237 7.46003 7.61616 7.61624C7.45995 7.77245 7.20669 7.77245 7.05048 7.61624L6 6.56576L4.94952 7.61625C4.79331 7.77246 4.54004 7.77246 4.38383 7.61625C4.22762 7.46004 4.22762 7.20677 4.38383 7.05056L5.43432 6.00008L4.38382 4.94958C4.22761 4.79337 4.22761 4.5401 4.38382 4.38389Z" fill="currentColor"/>
                </svg>
                <strong class="weight-700">${StatusMapper.getLabel('readability', readabilityTier)}:</strong>
                <span>Grade ${gradeLevel} level</span>
              </div>
              <div class="info-block quality-factors">
                <span class="instances__label">Analysis:</span>
                <div class="instances__list">
                  <span class="instances__list-item">Ease: ${easeScore}/100</span>
                  <span class="instances__list-item">Grade: ${gradeLevel}</span>
                  <span class="instances__list-item">${getEducationLevel(gradeLevel)}</span>
                </div>
              </div>
                
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.666687 7.2098V1.26538C0.666687 0.67969 1.13938 0.203898 1.72397 0.239827C2.2447 0.271831 2.86055 0.335092 3.33335 0.459856C3.89293 0.607518 4.55795 0.922025 5.08389 1.20013C5.24768 1.28674 5.42185 1.34681 5.60011 1.38067V9.47594C5.43851 9.44033 5.28085 9.38284 5.13198 9.30348C4.59892 9.01933 3.91013 8.68988 3.33335 8.53768C2.86578 8.41429 2.2583 8.35106 1.74128 8.31872C1.14991 8.28174 0.666687 7.80232 0.666687 7.2098ZM2.3638 3.01183C2.14948 2.95825 1.9323 3.08855 1.87872 3.30287C1.82515 3.51719 1.95545 3.73436 2.16977 3.78794L4.3031 4.32128C4.51742 4.37486 4.73459 4.24455 4.78817 4.03023C4.84175 3.81592 4.71145 3.59874 4.49713 3.54516L2.3638 3.01183ZM2.3638 5.14516C2.14948 5.09158 1.9323 5.22189 1.87872 5.43621C1.82515 5.65052 1.95545 5.8677 2.16977 5.92128L4.3031 6.45461C4.51742 6.50819 4.73459 6.37789 4.78817 6.16357C4.84175 5.94925 4.71145 5.73208 4.49713 5.6785L2.3638 5.14516Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.40011 9.4759C6.56165 9.44028 6.71925 9.38281 6.86806 9.30348C7.40112 9.01933 8.08991 8.68988 8.66669 8.53768C9.13426 8.41429 9.74174 8.35106 10.2588 8.31872C10.8501 8.28174 11.3334 7.80232 11.3334 7.2098V1.23092C11.3334 0.658951 10.882 0.189439 10.3104 0.209351C9.7085 0.230318 8.95837 0.292701 8.40002 0.459856C7.91595 0.604773 7.35218 0.895451 6.89273 1.16135C6.73731 1.25131 6.57119 1.31738 6.40011 1.35928V9.4759ZM9.83046 3.78794C10.0448 3.73436 10.1751 3.51719 10.1215 3.30287C10.0679 3.08855 9.85075 2.95825 9.63643 3.01183L7.5031 3.54516C7.28878 3.59874 7.15848 3.81592 7.21206 4.03023C7.26564 4.24455 7.48281 4.37486 7.69713 4.32128L9.83046 3.78794ZM9.83046 5.92128C10.0448 5.8677 10.1751 5.65052 10.1215 5.43621C10.0679 5.22189 9.85075 5.09158 9.63643 5.14516L7.5031 5.6785C7.28878 5.73208 7.15848 5.94925 7.21206 6.16357C7.26564 6.37789 7.48281 6.50819 7.69713 6.45461L9.83046 5.92128Z" fill="currentColor"/>
                  </svg>
                </div>
                <span class="insight__text">${sanitizeHTML(readabilityQuickInsight)}</span>
              </div>
            </div>
          </div>

          <div class="card__body">
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Readability Overview</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Reading Ease:</div>
                  <div class="metric-count">${easeScore}/100</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Grade Level:</div>
                  <div class="metric-count">${gradeLevel}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Audience:</div>
                  <div class="metric-count">${getAudienceLevel(gradeLevel)}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>

              </div>
            </div>

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Score Interpretation</h4>
              <div class="card__links-analysis">

                <div class="analysis-metric">
                  <div class="link-analysis__head">
                    <span class="link-num">Score</span>
                    <div class="risk-indicator">
                      <span class="status-badge"></span>
                      <span>${easeScore}/100</span>
                    </div>
                  </div>
                  <div class="link-analysis__links">
                    <span class="link-url">Flesch Reading Ease</span>
                  </div>
                  <span class="spam-indicator">${getReadingEaseExplanation(easeScore)}</span>
                </div>

                <div class="analysis-metric">
                  <div class="link-analysis__head">
                    <span class="link-num">Score</span>
                    <div class="risk-indicator">
                      <span class="status-badge"></span>
                      <span>${gradeLevel}</span>
                    </div>
                  </div>
                  <div class="link-analysis__links">
                    <span class="link-url">Grade Level</span>
                  </div>
                  <span class="spam-indicator">${getGradeLevelExplanation(gradeLevel)}</span>
                </div>
                
              </div>
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Readability Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Keep sentences under 20 words for better comprehension</li>
                        <li>Use common, everyday vocabulary when possible</li>
                        <li>Break up long paragraphs into shorter, digestible chunks</li>
                        <li>Use active voice and clear subject-verb-object structure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- comparison -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Simple Ways to Improve</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label weight-700">Before</span>
                        <span class="comparison__title">"The implementation of comprehensive strategies facilitates optimization."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Long</span>
                        <span class="comparison__title">"Due to the fact that we have limited resources, it is necessary to prioritize our efforts."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Passive</span>
                        <span class="comparison__title">"Mistakes were made in the analysis that was conducted."</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label weight-700">Simple</span>
                        <span class="example-text">"Good strategies help us improve."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Concise</span>
                        <span class="comparison__title">"We have limited resources, so we must prioritize."</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Active</span>
                        <span class="comparison__title">"We made mistakes in our analysis."</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- Readability ends here -->
           ` : ''}

 ${data?.sentiment_compound_score ? `
        <div class="result__card sentiment-compound-score-card tie-${sentimentAnalysisTier}">
          <div class="card__header">
            <div class="card__header-row">
              <h3 class="heading-style-h5">Sentiment Analysis</h3>
              <div class="card__controls">
                <span class="badge">${sentimentAnalysisQualitativeLabel}</span>
                <span class="card__value"><span>${sentimentPercent}%</span> Emotional Tone</span>
                <img src="./assets/images/arrow.svg" alt="arrow" class="card__icon">
              </div>
            </div>
            <div class="card_header-cap">
              <div class="card__indicator-contenxt">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3334 6.00008C11.3334 8.9456 8.94554 11.3334 6.00002 11.3334C3.0545 11.3334 0.666687 8.9456 0.666687 6.00008C0.666687 3.05456 3.0545 0.666748 6.00002 0.666748C8.94554 0.666748 11.3334 3.05456 11.3334 6.00008ZM4.38382 4.38389C4.54003 4.22768 4.7933 4.22768 4.94951 4.38389L6 5.43439L7.05049 4.38391C7.2067 4.2277 7.45996 4.2277 7.61617 4.38391C7.77238 4.54012 7.77238 4.79338 7.61617 4.94959L6.56569 6.00008L7.61616 7.05055C7.77237 7.20676 7.77237 7.46003 7.61616 7.61624C7.45995 7.77245 7.20669 7.77245 7.05048 7.61624L6 6.56576L4.94952 7.61625C4.79331 7.77246 4.54004 7.77246 4.38383 7.61625C4.22762 7.46004 4.22762 7.20677 4.38383 7.05056L5.43432 6.00008L4.38382 4.94958C4.22761 4.79337 4.22761 4.5401 4.38382 4.38389Z" fill="currentColor"/>
                </svg>
                <strong class="weight-700">${StatusMapper.getLabel('analysis', sentimentAnalysisTier)}:</strong>
                <span>${getSentimentContext(sentimentScore)}</span>
              </div>
              <div class="info-block quality-factors">
                <span class="instances__label">Tone:</span>
                <div class="instances__list">
                  <span class="instances__list-item">>${getSentimentLabel(sentimentScore)}</span>
                  <span class="instances__list-item">${getSentimentDescription(sentimentScore)}</span>
                </div>
              </div>
                
              <div class="card__insight">
                <div class="insight__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.36058 0.970573C5.40224 1.17578 5.26965 1.3759 5.06444 1.41755C3.23287 1.78931 1.78925 3.23291 1.41746 5.06448C1.37581 5.26968 1.17569 5.40227 0.970478 5.36062C0.76527 5.31896 0.632684 5.11884 0.674339 4.91363C1.10671 2.78361 2.78358 1.10676 4.9136 0.674426C5.11881 0.632774 5.31893 0.765363 5.36058 0.970573Z" fill="#1C274C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.970559 6.63957C1.17577 6.59792 1.37589 6.7305 1.41754 6.93571C1.78933 8.76728 3.23295 10.2109 5.06452 10.5826C5.26973 10.6243 5.40232 10.8244 5.36066 11.0296C5.31901 11.2348 5.11889 11.3674 4.91368 11.3258C2.78366 10.8934 1.10679 9.21658 0.67442 7.08656C0.632765 6.88135 0.765351 6.68123 0.970559 6.63957Z" fill="#1C274C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.63946 0.970546C6.68111 0.765337 6.88123 0.632747 7.08644 0.674399C9.21646 1.10674 10.8933 2.78359 11.3257 4.9136C11.3674 5.11881 11.2348 5.31893 11.0296 5.36059C10.8244 5.40224 10.6242 5.26966 10.5826 5.06445C10.2108 3.23288 8.76717 1.78929 6.9356 1.41753C6.73039 1.37588 6.59781 1.17576 6.63946 0.970546Z" fill="#1C274C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0296 6.63957C11.2348 6.68123 11.3674 6.88135 11.3257 7.08656C10.8933 9.21658 9.21646 10.8934 7.08644 11.3258C6.88123 11.3674 6.68111 11.2348 6.63946 11.0296C6.59781 10.8244 6.73039 10.6243 6.9356 10.5826C8.76717 10.2109 10.2108 8.76728 10.5826 6.93571C10.6242 6.7305 10.8244 6.59792 11.0296 6.63957Z" fill="#1C274C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.99998 10.0443C8.23351 10.0443 10.0441 8.23363 10.0441 6.00009C10.0441 3.76656 8.23351 1.95593 5.99998 1.95593C3.76645 1.95593 1.95582 3.76656 1.95582 6.00009C1.95582 8.23363 3.76645 10.0443 5.99998 10.0443ZM4.3684 7.35408C4.49309 7.18586 4.73054 7.15057 4.89876 7.27526C5.21322 7.50834 5.59229 7.64304 5.99998 7.64304C6.40767 7.64304 6.78674 7.50834 7.1012 7.27526C7.26942 7.15057 7.50687 7.18586 7.63156 7.35408C7.75625 7.5223 7.72096 7.75975 7.55274 7.88444C7.1149 8.20898 6.57908 8.40132 5.99998 8.40132C5.42089 8.40132 4.88506 8.20898 4.44722 7.88444C4.279 7.75975 4.24371 7.5223 4.3684 7.35408ZM7.7693 5.14703C7.7693 5.51347 7.57126 5.81052 7.32697 5.81052C7.08268 5.81052 6.88464 5.51347 6.88464 5.14703C6.88464 4.78059 7.08268 4.48353 7.32697 4.48353C7.57126 4.48353 7.7693 4.78059 7.7693 5.14703ZM4.67299 5.81052C4.91728 5.81052 5.11532 5.51347 5.11532 5.14703C5.11532 4.78059 4.91728 4.48353 4.67299 4.48353C4.4287 4.48353 4.23066 4.78059 4.23066 5.14703C4.23066 5.51347 4.4287 5.81052 4.67299 5.81052Z" fill="#1C274C"/>
                  </svg>
                </div>
                <span class="insight__text">${sanitizeHTML(sentimentAnalysisQuickInsight)}</span>
              </div>
            </div>
            <div class="card-context-row">
                <p class="score-summary">${sanitizeHTML(sentimentAnalysisCardSummary)}</p>
            </div>
          </div>

          <div class="card__body">
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Punctuation Analysis</h4>
              <div class="analysis-overview">

                <div class="analysis-metric">
                  <div class="metric-label">Sentiment Score:</div>
                  <div class="metric-count">${sentimentScore.toFixed(2)}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Tone Balance:</div>
                  <div class="metric-count">${sentimentPercent}%</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Audience Appeal:</div>
                  <div class="metric-count">${getAudienceAppeal(tier)}</div>
                </div>

                <div class="analysis-metric">
                  <div class="metric-label">Platform</div>
                  <div class="metric-count">${platformName}</div>
                </div>

              </div>
            </div>

            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Score Interpretation</h4>
              <div class="margin-top-sm">

                <div class="analysis-metric">
                  <div class="sentiment-scale">

                    <div class="scale-item">
                      <div class="scale-header">
                        <div class="status-badge bg-danger"></div>
                        <h5 class="heading-style-h5 weight-500">Very Negative</h5>
                      </div>
                      <div class="scale-body">
                        <span class="scale-description">Strong negative emotions, criticism, frustration</span>
                        <div class="scale-border"></div>
                        <span class="scale-range">-1.0 to -0.3</span>
                      </div>
                    </div>

                    <div class="scale-item">
                      <div class="scale-header">
                        <div class="status-badge bg-light-danger"></div>
                        <h5 class="heading-style-h5 weight-500">Slightly Negative</h5>
                      </div>
                      <div class="scale-body">
                        <span class="scale-description">Mild criticism, reserved tone, cautious language</span>
                        <div class="scale-border"></div>
                        <span class="scale-range">-0.3 to 0.05</span>
                      </div>
                    </div>

                    <div class="scale-item">
                      <div class="scale-header">
                        <div class="status-badge bg-warning"></div>
                        <h5 class="heading-style-h5 weight-500">Balanced Positive</h5>
                      </div>
                      <div class="scale-body">
                        <span class="scale-description">Professional optimism, confident, engaging</span>
                        <div class="scale-border"></div>
                        <span class="scale-range">0.05 to 0.6</span>
                      </div>
                    </div>

                    <div class="scale-item">
                      <div class="scale-header">
                        <div class="status-badge bg-light-success"></div>
                        <h5 class="heading-style-h5 weight-500">Very Positive</h5>
                      </div>
                      <div class="scale-body">
                        <span class="scale-description">Enthusiastic, excited, highly optimistic</span>
                        <div class="scale-border"></div>
                        <span class="scale-range">0.6 to 0.8</span>
                      </div>
                    </div>

                    <div class="scale-item">
                      <div class="scale-header">
                        <div class="status-badge bg-success"></div>
                        <h5 class="heading-style-h5 weight-500">Extremely Positive</h5>
                      </div>
                      <div class="scale-body">
                        <span class="scale-description">Overwhelming positivity, may seem inauthentic</span>
                        <div class="scale-border"></div>
                        <span class="scale-range">0.8 to 1.0</span>
                      </div>
                    </div>

                  </div>
                </div>
                
              </div>
            </div>

             <!-- information -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Platform-Specific Guidelines</h4>
              <div class="card__platform-guidance margin-top-sm">
                <div class="analysis-metric">
                  <div class="platform-guidance__head">
                    <h5 class="heading-style-h5 weight-500">${platformName}</h5>
                    <p class="platform-rule">${getPlatformGuideline(platform)}</p>
                  </div>
                  <div class="platform-guidance__info">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clip-path="url(#clip0_8576_3928)">
                          <path d="M8 1.5C6.71442 1.5 5.45772 1.88122 4.3888 2.59545C3.31988 3.30968 2.48676 4.32484 1.99479 5.51256C1.50282 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49477 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73192 14.3751C7.99279 14.6259 9.29973 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM7.75 4.5C7.89834 4.5 8.04334 4.54399 8.16668 4.6264C8.29002 4.70881 8.38615 4.82594 8.44291 4.96299C8.49968 5.10003 8.51453 5.25083 8.48559 5.39632C8.45665 5.5418 8.38522 5.67544 8.28033 5.78033C8.17544 5.88522 8.04181 5.95665 7.89632 5.98559C7.75083 6.01453 7.60003 5.99968 7.46299 5.94291C7.32595 5.88614 7.20881 5.79001 7.1264 5.66668C7.04399 5.54334 7 5.39834 7 5.25C7 5.05109 7.07902 4.86032 7.21967 4.71967C7.36032 4.57902 7.55109 4.5 7.75 4.5ZM8.5 11.5C8.23479 11.5 7.98043 11.3946 7.7929 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24022 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24022 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39465 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85356 10.6464C8.94732 10.7402 9 10.8674 9 11C9 11.1326 8.94732 11.2598 8.85356 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5Z" fill="#3C3D3D"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_8576_3928">
                            <rect width="16" height="16" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div>
                      <h5 class="heading-style-h6">Emotional Tone Best Practices:</h5>
                      <ul class="platform-guidance__info-list">
                        <li>Aim for 0.2-0.6 range for professional content</li>
                        <li>Avoid extreme negativity (below -0.3) in public communications</li>
                        <li>Very positive (above 0.8) can seem promotional or inauthentic</li>
                        <li>Adjust tone based on your audience and platform norms</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- comparison -->
            <div class="card_detail-block">
              <h4 class="heading-style-h5 weight-500">Tone Optimization Examples</h4>
              <div class="card__comparison margin-top-sm">
                <div class="analysis-metric">
                  <div class="comparison__row">
                    <div class="comparison__item before">
                      <div>
                        <span class="comparison__label weight-700">Too Negative</span>
                        <span class="comparison__title">"This is terrible and completely useless"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Too Positive</span>
                        <span class="comparison__title">"AMAZING!!! ABSOLUTELY PERFECT!!! INCREDIBLE!!!"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Neutral</span>
                        <span class="comparison__title">"The report contains data and conclusions"</span>
                      </div>
                    </div>
                    <div class="comparison__item after">
                      <div>
                        <span class="comparison__label weight-700">Balanced</span>
                        <span class="example-text">"This has room for improvement and potential"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Balanced</span>
                        <span class="comparison__title">"This is excellent work with impressive results"</span>
                      </div>
                      <div>
                        <span class="comparison__label weight-700">Engaging</span>
                        <span class="comparison__title">"The report reveals valuable insights and actionable conclusions"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- Sentiment Analysis ends here -->
       
      </div>
    ` : ''}
    `;

    const summaryElement = document.querySelector('.score-summary');
    if (evaluation_summary && Array.isArray(evaluation_summary) && evaluation_summary.length > 0) {
        // Create an unordered list from the evaluation_summary array
        const observationsList = document.createElement('ul');
        observationsList.className = 'key-observations-list';

        evaluation_summary.forEach(observation => {
            const listItem = document.createElement('li');
            // Use innerHTML to preserve HTML formatting in observations
            listItem.innerHTML = observation;
            observationsList.appendChild(listItem);
        });

        summaryElement.appendChild(observationsList);
    } else {
        summaryElement.innerHTML = summary;
    }
}