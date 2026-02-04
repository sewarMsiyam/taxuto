// Script to set "Not Applicable" as default for all radio buttons
// Add this to the end of validation.js or as a separate script

(function() {
    'use strict';

    /**
     * Set all "Not Applicable" radio buttons as checked by default
     * and set corresponding inputs to 0.00 and readonly
     */
    function setDefaultNotApplicable() {
        // Find all radio groups
        const radioGroups = document.querySelectorAll('.radio-group-table');
        
        radioGroups.forEach(group => {
            const radios = group.querySelectorAll('input[type="radio"]');
            
            // Find the "Not Applicable" radio button
            const notApplicableRadio = Array.from(radios).find(radio => 
                radio.value === 'not-applicable'
            );
            
            if (notApplicableRadio && !notApplicableRadio.checked) {
                // Check if any radio is already selected
                const anyChecked = Array.from(radios).some(r => r.checked);
                
                // If no radio is selected, select "Not Applicable"
                if (!anyChecked) {
                    notApplicableRadio.checked = true;
                    
                    // Find the corresponding input field
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

        // ✅ تأكد من أن كل الـ inputs تبقى readonly
        makeAllInputsReadonly();
    }

    /**
     * ✅ جعل كل الـ inputs في الجدول readonly
     */
    function makeAllInputsReadonly() {
        const allInputs = document.querySelectorAll('.value-cell input.table-input');
        
        allInputs.forEach(input => {
            input.readOnly = true;
            input.style.cursor = 'not-allowed';
            
            // ✅ إذا القيمة فاضية، حط 0.00
            if (!input.value || input.value.trim() === '') {
                input.value = '0.00';
                input.style.opacity = '0.6';
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setDefaultNotApplicable);
    } else {
        setDefaultNotApplicable();
    }

    // Also run when navigating between wizard pages
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('wizard-page') && 
                    target.classList.contains('active')) {
                    // A page became active, set defaults
                    setTimeout(setDefaultNotApplicable, 100);
                }
            }
        });
    });

    // Start observing wizard pages
    const wizardPages = document.querySelectorAll('.wizard-page');
    wizardPages.forEach(page => {
        observer.observe(page, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    });

    // ✅ Event listener لتغيير Radio Buttons
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
            const row = e.target.closest('tr');
            const valueInput = row?.querySelector('.value-cell input.table-input');
            
            if (valueInput) {
                // ✅ دائماً readonly
                valueInput.readOnly = true;
                valueInput.style.cursor = 'not-allowed';
                
                if (e.target.value === 'not-applicable') {
                    // Not Applicable - تصفير القيمة
                    valueInput.value = '0.00';
                    valueInput.style.opacity = '0.6';
                } else if (e.target.value === 'applicable') {
                    // Applicable - السماح بالقيمة الموجودة أو الافتراضية
                    valueInput.style.opacity = '1';
                    if (!valueInput.value || valueInput.value === '0.00') {
                        valueInput.value = '0.00';
                    }
                }
            }
        }
    });

})();