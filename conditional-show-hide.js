// Conditional Show/Hide for "Other Income" Section
// Add this script after validation.js

(function() {
    'use strict';

    /**
     * Setup conditional visibility for "Other Income" section
     */
    function setupConditionalVisibility() {
        // Find the "other-income" radio buttons
        const otherIncomeRadios = document.querySelectorAll('input[name="other-income"]');
        
        if (otherIncomeRadios.length === 0) return;

        // Find the parent row
        const questionRow = otherIncomeRadios[0].closest('tr');
        if (!questionRow) return;

        // Find the rows to show/hide (next 3 rows after the question)
        const rowsToToggle = [];
        let currentRow = questionRow.nextElementSibling;
        
        // Get the next 3 rows (Capital Gains, Other Income, Total other income)
        for (let i = 0; i < 3; i++) {
            if (currentRow && currentRow.tagName === 'TR') {
                rowsToToggle.push(currentRow);
                currentRow = currentRow.nextElementSibling;
            }
        }

        /**
         * Toggle visibility of rows
         */
        function toggleRows(show) {
            rowsToToggle.forEach(row => {
                if (show) {
                    row.style.display = '';
                    // Enable inputs
                    const inputs = row.querySelectorAll('input');
                    inputs.forEach(input => {
                        if (!input.classList.contains('table-input') || 
                            !row.classList.contains('primary-row')) {
                            input.disabled = false;
                        }
                    });
                } else {
                    row.style.display = 'none';
                    // Disable inputs and clear values
                    const inputs = row.querySelectorAll('input');
                    inputs.forEach(input => {
                        input.disabled = true;
                        if (input.type !== 'radio' && !input.readOnly) {
                            input.value = '0.00';
                        }
                    });
                }
            });
        }

        /**
         * Handle radio button change
         */
        function handleRadioChange() {
            const yesRadio = Array.from(otherIncomeRadios).find(r => r.value === 'applicable');
            const noRadio = Array.from(otherIncomeRadios).find(r => r.value === 'not-applicable');

            if (yesRadio && yesRadio.checked) {
                // Show rows
                toggleRows(true);
            } else if (noRadio && noRadio.checked) {
                // Hide rows
                toggleRows(false);
            }
        }

        // Add event listeners
        otherIncomeRadios.forEach(radio => {
            radio.addEventListener('change', handleRadioChange);
        });

        // Initial state - hide by default or based on selection
        const anyChecked = Array.from(otherIncomeRadios).some(r => r.checked);
        if (!anyChecked) {
            // If no selection, hide rows
            toggleRows(false);
        } else {
            // Apply based on current selection
            handleRadioChange();
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupConditionalVisibility);
    } else {
        setupConditionalVisibility();
    }

    // Re-run when navigating to page 2
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.id === 'page-2' && 
                    target.classList.contains('wizard-page') && 
                    target.classList.contains('active')) {
                    setTimeout(setupConditionalVisibility, 100);
                }
            }
        });
    });

    const page2 = document.getElementById('page-2');
    if (page2) {
        observer.observe(page2, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    // Make it globally accessible
    window.setupConditionalVisibility = setupConditionalVisibility;
})();