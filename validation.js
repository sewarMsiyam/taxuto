// Form Validation System for TAXUTO Tax Wizard - COMPLETE VERSION

(function() {
    'use strict';

    // Validation rules for each page
    const pageValidations = {
        1: validatePage1,
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
        document.querySelectorAll('.validation-error').forEach(el => {
            el.classList.remove('validation-error');
        });
        
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
        
        const summary = document.querySelector('.validation-summary');
        if (summary) summary.remove();
    }

    /**
     * Page 1: Basic Information Validation - DISABLED
     */
    function validatePage1() {
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
     * ✅ REVERSED: applicable opens modal, not-applicable sets to 0.00
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
                // ✅ REVERSED: "not-applicable" → صفّر القيمة
                const notApplicableRadio = Array.from(radios).find(r => 
                    r.value === 'not-applicable' && r.checked
                );
                
                if (notApplicableRadio && valueInput) {
                    valueInput.value = '0.00';
                    valueInput.readOnly = true;
                }
                
                // ✅ REVERSED: "applicable" → يفتح الموديل (لا validation هنا)
                const applicableRadio = Array.from(radios).find(r => 
                    r.value === 'applicable' && r.checked
                );
                
                if (applicableRadio && valueInput) {
                    valueInput.readOnly = false;
                    // ما نطلب validation - الموديل رح يفتح
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
     * ✅ REVERSED: applicable → modal opens, not-applicable → 0.00
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
                
                // ✅ REVERSED: "not-applicable" → صفّر القيمة
                if (this.value === 'not-applicable') {
                    valueInput.value = '0.00';
                    valueInput.readOnly = true;
                    valueInput.style.opacity = '0.6';
                    valueInput.style.cursor = 'not-allowed';
                    valueInput.classList.remove('validation-error');
                    const errorMsg = valueInput.closest('td')?.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                } 
                // ✅ REVERSED: "applicable" → الموديل يفتح (من modal script)
                else if (this.value === 'applicable') {
                    valueInput.readOnly = false;
                    valueInput.style.opacity = '1';
                    valueInput.style.cursor = 'text';
                    // ما نحط قيمة - الموديل رح يفتح
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
// ✅ KEEP THIS: Default still "not-applicable" (sets to 0.00)
// ========================================

(function() {
    /**
     * Set all "Not Applicable" radio buttons as checked by default
     * ✅ REVERSED BEHAVIOR: not-applicable sets value to 0.00
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