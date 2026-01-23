// Form Validation System for TAXUTO Tax Wizard - COMPLETE VERSION

(function() {
    'use strict';

    // Validation rules for each page
    const pageValidations = {
        1: validatePage1,  // Basic Information - DISABLED (commented out)
        2: validatePage2,
        3: validatePage3,
        4: validatePage4,
        5: validatePage5,
        6: validatePage6,
        7: validatePage7
    };

    // Global validation state
    window.validationErrors = [];

    /**
     * Main validation function called before page navigation
     */
    window.validateCurrentPage = function(pageNumber) {
        // Clear previous errors
        clearAllErrors();
        window.validationErrors = [];
        
        if (pageValidations[pageNumber]) {
            const isValid = pageValidations[pageNumber]();
            
            if (!isValid && window.validationErrors.length > 0) {
                showValidationSummary();
                scrollToFirstError();
                return false;
            }
        }
        
        return true;
    };

    /**
     * Clear all error messages and highlights
     */
    function clearAllErrors() {
        // Remove error highlights
        document.querySelectorAll('.validation-error').forEach(el => {
            el.classList.remove('validation-error');
        });
        
        // Remove error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
        
        // Remove summary
        const summary = document.querySelector('.validation-summary');
        if (summary) summary.remove();
    }

    /**
     * Page 1: Basic Information Validation - DISABLED
     * Uncomment the code below to enable validation for Basic Information
     */
    function validatePage1() {
        // VALIDATION DISABLED FOR BASIC INFORMATION PAGE
        // To enable, uncomment the code below:
        
        /*
        const page = document.getElementById('page-1');
        let isValid = true;

        // Return Type
        const returnType = page.querySelector('select.input-field');
        if (!returnType || !returnType.value) {
            addFieldError(returnType, 'Return Type is required');
            isValid = false;
        }

        // Period From Date
        const fromDate = page.querySelectorAll('input[type="date"]')[0];
        if (!fromDate || !fromDate.value) {
            addFieldError(fromDate, 'Period From Date is required');
            isValid = false;
        }

        // Period To Date
        const toDate = page.querySelectorAll('input[type="date"]')[1];
        if (!toDate || !toDate.value) {
            addFieldError(toDate, 'Period To Date is required');
            isValid = false;
        }

        // Validate date range
        if (fromDate && toDate && fromDate.value && toDate.value) {
            if (new Date(fromDate.value) >= new Date(toDate.value)) {
                addFieldError(toDate, 'Period To Date must be after From Date');
                isValid = false;
            }
        }

        // Taxpayer Details
        const taxpayerInputs = page.querySelectorAll('.input-group-basic input[type="number"]');
        const taxpayerLabels = ['Taxpayer', 'Electronic Mail', 'Mobile No.', 'Tin ID'];
        taxpayerInputs.forEach((input, index) => {
            if (index < 4 && (!input.value || input.value === '0.00')) {
                addFieldError(input, `${taxpayerLabels[index]} is required`);
                isValid = false;
            }
        });

        // Shareholder Percentages
        const saudiCapital = taxpayerInputs[4];
        const nonSaudiCapital = taxpayerInputs[5];
        const saudiProfit = taxpayerInputs[6];
        const nonSaudiProfit = taxpayerInputs[7];

        // Validate capital shares total 100%
        if (saudiCapital && nonSaudiCapital) {
            const capitalTotal = parseFloat(saudiCapital.value || 0) + parseFloat(nonSaudiCapital.value || 0);
            if (Math.abs(capitalTotal - 100) > 0.01) {
                addFieldError(saudiCapital, 'Total must equal 100%');
                addFieldError(nonSaudiCapital, 'Total must equal 100%');
                isValid = false;
            }
        }

        // Validate profit shares total 100%
        if (saudiProfit && nonSaudiProfit) {
            const profitTotal = parseFloat(saudiProfit.value || 0) + parseFloat(nonSaudiProfit.value || 0);
            if (Math.abs(profitTotal - 100) > 0.01) {
                addFieldError(saudiProfit, 'Total must equal 100%');
                addFieldError(nonSaudiProfit, 'Total must equal 100%');
                isValid = false;
            }
        }

        return isValid;
        */
        
        // Return true to skip validation
        return true;
    }

    /**
     * Page 2: Income Statement Validation
     */
    function validatePage2() {
        return validateRadioGroupsAndInputs(document.getElementById('page-2'));
    }

    /**
     * Page 3: Adjustments Validation
     */
    function validatePage3() {
        return validateRadioGroupsAndInputs(document.getElementById('page-3'));
    }

    /**
     * Page 4: Zakat Calculation Validation
     */
    function validatePage4() {
        return validateRadioGroupsAndInputs(document.getElementById('page-4'));
    }

    /**
     * Page 5: Zakat Base Validation
     */
    function validatePage5() {
        return validateRadioGroupsAndInputs(document.getElementById('page-5'));
    }

    /**
     * Page 6: Tax Base Validation
     */
    function validatePage6() {
        return validateRadioGroupsAndInputs(document.getElementById('page-6'));
    }

    /**
     * Page 7: Summary (No validation needed)
     */
    function validatePage7() {
        return true;
    }

    /**
     * Generic validation for pages with radio groups and inputs
     */
    function validateRadioGroupsAndInputs(page) {
        if (!page) return true;
        
        let isValid = true;
        const radioGroups = page.querySelectorAll('.radio-group-table');
        
        radioGroups.forEach((group) => {
            const row = group.closest('tr');
            const label = row.querySelector('.label-cell')?.textContent.trim();
            const radios = group.querySelectorAll('input[type="radio"]');
            const valueInput = row.querySelector('.value-cell input');
            
            const isSelected = Array.from(radios).some(radio => radio.checked);
            
            if (!isSelected) {
                addFieldError(group, 'Please select an option');
                window.validationErrors.push(`${label}: Please select`);
                isValid = false;
            } else {
                const notApplicableRadio = Array.from(radios).find(r => 
                    r.value === 'not-applicable' && r.checked
                );
                
                if (notApplicableRadio && valueInput) {
                    valueInput.value = '0.00';
                    valueInput.readOnly = true;
                }
                
                const applicableRadio = Array.from(radios).find(r => 
                    r.value === 'applicable' && r.checked
                );
                
                if (applicableRadio && valueInput) {
                    valueInput.readOnly = false;
                    if (!valueInput.value || valueInput.value === '0.00') {
                        addFieldError(valueInput, 'Please enter a value');
                        window.validationErrors.push(`${label}: Please enter value`);
                        isValid = false;
                    }
                }
            }
        });

        return isValid;
    }

    /**
     * Add error message below field
     */
    function addFieldError(element, message) {
        if (!element) return;
        
        element.classList.add('validation-error');
        
        let errorParent = element.parentElement;
        
        if (element.closest('td')) {
            errorParent = element.closest('td');
        }
        
        const existingError = errorParent?.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
        
        if (errorParent) {
            errorParent.appendChild(errorMsg);
        }
        
        window.validationErrors.push(message);
    }

    /**
     * Show validation summary at bottom of page
     */
    function showValidationSummary() {
        const existingSummary = document.querySelector('.validation-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        const summary = document.createElement('div');
        summary.className = 'validation-summary';
        summary.innerHTML = `
            <div class="validation-summary-content">
                <div class="validation-summary-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="validation-summary-text">
                    <strong>Please correct the errors before continuing</strong>
                    <span>Number of errors: ${window.validationErrors.length}</span>
                </div>
                <button class="validation-summary-close" onclick="this.closest('.validation-summary').remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(summary);
        
        setTimeout(() => {
            if (summary.parentElement) {
                summary.remove();
            }
        }, 8000);
    }

    /**
     * Scroll to first error
     */
    function scrollToFirstError() {
        const firstError = document.querySelector('.validation-error');
        if (firstError) {
            setTimeout(() => {
                firstError.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center'
                });
            }, 100);
        }
    }

    /**
     * Auto-handle radio button changes
     */
    function setupRadioHandlers() {
        document.querySelectorAll('.radio-group-table input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const row = this.closest('tr');
                const valueInput = row?.querySelector('.value-cell input.table-input');
                const radioGroup = this.closest('.radio-group-table');
                
                if (radioGroup) {
                    radioGroup.classList.remove('validation-error');
                    const errorMsg = radioGroup.closest('td')?.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                }
                
                if (!valueInput) return;
                
                if (this.value === 'not-applicable') {
                    valueInput.value = '0.00';
                    valueInput.readOnly = true;
                    valueInput.style.opacity = '0.6';
                    valueInput.style.cursor = 'not-allowed';
                    valueInput.classList.remove('validation-error');
                    const errorMsg = valueInput.closest('td')?.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                } else if (this.value === 'applicable') {
                    valueInput.readOnly = false;
                    valueInput.style.opacity = '1';
                    valueInput.style.cursor = 'text';
                    if (valueInput.value === '0.00') {
                        valueInput.value = '';
                        valueInput.focus();
                    }
                }
            });
        });
        
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('validation-error');
                const errorMsg = this.closest('td, .input-group-basic')?.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
            
            field.addEventListener('change', function() {
                this.classList.remove('validation-error');
                const errorMsg = this.closest('td, .input-group-basic')?.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupRadioHandlers);
    } else {
        setupRadioHandlers();
    }

})();

// ========================================
// SET DEFAULT "NOT APPLICABLE" FOR ALL RADIO BUTTONS
// ========================================

(function() {
    /**
     * Set all "Not Applicable" radio buttons as checked by default
     */
    function setDefaultNotApplicable() {
        const radioGroups = document.querySelectorAll('.radio-group-table');
        
        radioGroups.forEach(group => {
            const radios = group.querySelectorAll('input[type="radio"]');
            const notApplicableRadio = Array.from(radios).find(radio => 
                radio.value === 'not-applicable'
            );
            
            if (notApplicableRadio) {
                const anyChecked = Array.from(radios).some(r => r.checked);
                
                if (!anyChecked) {
                    notApplicableRadio.checked = true;
                    
                    const row = notApplicableRadio.closest('tr');
                    const valueInput = row?.querySelector('.value-cell input.table-input');
                    
                    if (valueInput) {
                        valueInput.value = '0.00';
                        valueInput.readOnly = true;
                        valueInput.style.opacity = '0.6';
                        valueInput.style.cursor = 'not-allowed';
                    }
                }
            }
        });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(setDefaultNotApplicable, 100);
        });
    } else {
        setTimeout(setDefaultNotApplicable, 100);
    }

    // Run when wizard pages change
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('wizard-page') && 
                    target.classList.contains('active')) {
                    setTimeout(setDefaultNotApplicable, 100);
                }
            }
        });
    });

    const wizardPages = document.querySelectorAll('.wizard-page');
    wizardPages.forEach(page => {
        observer.observe(page, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    });

    window.setDefaultNotApplicable = setDefaultNotApplicable;
})();
