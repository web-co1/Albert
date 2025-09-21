/**
 * StatusMapper Utility (Stage Version)
 * Purpose: Provide tier-based labels, context messages, and icons
 * Structure: Implemented as a class for clarity and difference from production
 */

class StatusMapper {
    static LABELS = {
        quality: {
            good: 'Excellent',
            fair: 'Needs Improvement',
            poor: 'Poor Quality'
        },
        risk: {
            good: 'Low Risk',
            fair: 'Medium Risk',
            poor: 'High Risk'
        },
        performance: {
            good: 'Optimal',
            fair: 'Acceptable',
            poor: 'Needs Attention'
        },
        analysis: {
            good: 'Clean',
            fair: 'Caution',
            poor: 'Warning'
        },
        readability: {
            good: 'Easy to Read',
            fair: 'Moderately Complex',
            poor: 'Difficult to Read'
        },
        professionalism: {
            good: 'Professional',
            fair: 'Casual',
            poor: 'Unprofessional'
        }
    };

    static CONTEXTS = {
        quality: {
            good: 'High-quality content',
            fair: 'Some improvement needed',
            poor: 'Significant issues found'
        },
        risk: {
            good: 'Content appears safe',
            fair: 'Some risk factors detected',
            poor: 'Multiple risk factors found'
        },
        performance: {
            good: 'Performing well',
            fair: 'Acceptable performance',
            poor: 'Performance issues detected'
        },
        analysis: {
            good: 'No issues detected',
            fair: 'Minor concerns found',
            poor: 'Multiple issues identified'
        }
    };

    static ICONS = {
        good: '✅',
        fair: '⚠️',
        poor: '🚫'
    };

    /**
     * Get label for given metric + tier
     */
    static getLabel(metricType, tier) {
        return this.LABELS[metricType]?.[tier] || tier;
    }

    /**
     * Get context for given metric + tier
     */
    static getContext(metricType, tier) {
        return this.CONTEXTS[metricType]?.[tier] || `${tier} status`;
    }

    /**
     * Get icon for given tier
     */
    static getIcon(tier) {
        return this.ICONS[tier] || '❔';
    }
}

// Expose globally
window.StatusMapper = StatusMapper;