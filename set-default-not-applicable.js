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
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setDefaultNotApplicable);
    } else {
        setDefaultNotApplicable();
    }

    // Also run when navigating between wizard pages
    // Listen for page changes
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

})();
