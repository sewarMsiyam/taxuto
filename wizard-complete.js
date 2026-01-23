/* ========================================
   TAXUTO TAX WIZARD - COMPLETE VERSION
   Features:
   - Auto calculations
   - First section open by default
   - Confirmation modal on submit
   - Fixed validation
   ======================================== */

(function () {
    let currentPage = 1;
    const totalPages = 7;
    let isSubmitted = false;

    const wizardPages = document.querySelectorAll('.wizard-page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const draftBtn = document.getElementById('draftBtn');
    const progressSteps = document.querySelectorAll('.progress-step');

    function showPage(pageNumber) {
        wizardPages.forEach(function (page) {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        var targetPage = wizardPages[pageNumber - 1];
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            
            // Open first section by default
            openFirstSection(targetPage);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Open first section in each page
    function openFirstSection(page) {
        const sections = page.querySelectorAll('.section');
        sections.forEach(function (section, index) {
            if (index === 0) {
                section.classList.remove('collapsed');
            } else {
                section.classList.add('collapsed');
            }
        });
    }

    function updateButtons() {
        if (!isSubmitted) {
            prevBtn.disabled = currentPage === 1;
            nextBtn.textContent = currentPage === totalPages ? 'SUBMIT' : 'NEXT >>';
        } else {
            prevBtn.disabled = currentPage === 1;
            prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
            prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
        }
    }

    function updateProgressBar() {
        if (isSubmitted) {
            progressSteps.forEach(function (step, index) {
                var stepNumber = index + 1;
                step.classList.remove('active', 'completed', 'notactive');
                step.classList.add('completed');

                if (stepNumber === currentPage) {
                    step.classList.add('active');
                }
            });
        } else {
            progressSteps.forEach(function (step, index) {
                var stepNumber = index + 1;
                step.classList.remove('active', 'completed', 'notactive');

                if (stepNumber < currentPage) {
                    step.classList.add('completed');
                } else if (stepNumber === currentPage) {
                    step.classList.add('active');
                } else {
                    step.classList.add('notactive');
                }
            });
        }
    }

    // Show confirmation modal
    function showConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-modal-content">
                <div class="confirmation-modal-header">
                    <i class="fa-solid fa-circle-question"></i>
                    <h3>Confirm Submission</h3>
                </div>
                <div class="confirmation-modal-body">
                    Are you sure you want to submit all the declaration data?<br>
                    Please review all information before confirming.
                </div>
                <div class="confirmation-modal-footer">
                    <a href="print-tax.html" class="confirmation-btn confirmation-btn-yes">
                        <i class="fa-solid fa-check"></i> Yes, Submit
                    </a>
                    <button class="confirmation-btn confirmation-btn-no" onclick="confirmSubmit(false)">
                        <i class="fa-solid fa-times"></i> No, Go Back
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Global function for confirmation
    window.confirmSubmit = function(confirmed) {
        const modal = document.querySelector('.confirmation-modal');
        if (modal) modal.remove();

        if (confirmed) {
            // Submit accepted - go to success page
            isSubmitted = true;
            
            nextBtn.textContent = 'EDIT';
            nextBtn.classList.remove('button-next');
            nextBtn.classList.add('button-edit');

            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';

            draftBtn.disabled = true;
            draftBtn.style.opacity = '0.5';
            draftBtn.style.cursor = 'not-allowed';

            document.querySelectorAll('input, select, textarea').forEach(function (element) {
                element.disabled = true;
                element.style.opacity = '0.6';
            });

            updateProgressBar();
            
            showToast('Success!', 'Declaration submitted successfully!', 'success');

            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('taxuto_draft');
            }

            // Here you can redirect to another page
            // window.location.href = '/success-page';
        } else {
            // Stay on current page
            showToast('Cancelled', 'You can continue editing the form', 'info');
        }
    };

    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
            updateButtons();
            updateProgressBar();
        }
    });

    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Edit mode
        if (isSubmitted) {
            isSubmitted = false;

            nextBtn.textContent = currentPage === totalPages ? 'SUBMIT' : 'NEXT >>';
            nextBtn.classList.remove('button-edit');
            nextBtn.classList.add('button-next');

            prevBtn.disabled = currentPage === 1;
            prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
            prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';

            draftBtn.disabled = false;
            draftBtn.style.opacity = '1';
            draftBtn.style.cursor = 'pointer';

            document.querySelectorAll('input, select, textarea').forEach(function (element) {
                element.disabled = false;
                element.style.opacity = '1';
            });

            updateProgressBar();
            updateButtons();

            showToast('Edit Mode', 'You can now edit the form', 'info');
            return;
        }

        // Navigate to next page
        if (currentPage < totalPages) {
            // Validate before moving
            if (typeof window.validateCurrentPage === 'function') {
                if (!window.validateCurrentPage(currentPage)) {
                    return;
                }
            }

            currentPage++;
            showPage(currentPage);
            updateButtons();
            updateProgressBar();
            return;
        }

        // Submit (on last page)
        if (currentPage === totalPages) {
            // Final validation
            if (typeof window.validateCurrentPage === 'function') {
                if (!window.validateCurrentPage(currentPage)) {
                    return;
                }
            }

            // Show confirmation modal
            showConfirmationModal();
        }
    });

    // Progress bar clicks
    progressSteps.forEach(function (step, index) {
        step.style.cursor = 'pointer';

        step.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetPage = index + 1;

            if (isSubmitted) {
                currentPage = targetPage;
                showPage(currentPage);
                updateButtons();
                updateProgressBar();
                return;
            }

            if (targetPage <= currentPage) {
                currentPage = targetPage;
                showPage(currentPage);
                updateButtons();
                updateProgressBar();
            } else {
                showToast('Navigation Restricted', 'Please complete the current page first', 'warning');
            }
        });
    });

    draftBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!isSubmitted) {
            saveDraft();
            showToast('Draft Saved', 'Your progress has been saved!', 'success');
        }
    });

    function saveDraft() {
        const formData = {};
        document.querySelectorAll('input, select, textarea').forEach(function(field) {
            if (field.name || field.id) {
                formData[field.name || field.id] = field.value;
            }
        });
        
        localStorage.setItem('taxuto_draft', JSON.stringify({
            data: formData,
            currentPage: currentPage,
            timestamp: new Date().toISOString()
        }));
    }

    // Toast notification
    function showToast(title, message, type = 'info') {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };

        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-circle-exclamation',
            info: 'fa-circle-info'
        };

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${colors[type]};
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 16px 20px;
            min-width: 300px;
            max-width: 400px;
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <i class="fa-solid ${icons[type]}" style="color: ${colors[type]}; font-size: 20px; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 14px; color: #6B7280;">${message}</div>
                </div>
                <button onclick="this.closest('.toast-notification').remove()" style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 18px; padding: 0; line-height: 1;">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    window.showToast = showToast;

    // Animations CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Section collapse/expand
    document.querySelectorAll('.section-header').forEach(function (header) {
        header.addEventListener('click', function (e) {
            e.preventDefault();

            var section = this.closest('.section');
            var isCollapsed = section.classList.contains('collapsed');

            document.querySelectorAll('.section').forEach(function (s) {
                s.classList.add('collapsed');
            });

            if (isCollapsed) {
                section.classList.remove('collapsed');

                setTimeout(function () {
                    section.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });

    // Auto-calculate totals
    setupAutoCalculations();

    // Initialize
    updateButtons();
    updateProgressBar();
    showPage(1);
})();

// Auto calculation system
function setupAutoCalculations() {
    // Listen to all input changes
    document.querySelectorAll('input.table-input').forEach(input => {
        if (!input.readOnly) {
            input.addEventListener('input', function() {
                calculateTotals();
            });
        }
    });
}

function calculateTotals() {
    // This is a placeholder - you need to add specific calculation logic
    // based on your form structure
    console.log('Calculating totals...');
    
    // Example: Calculate total for a section
    document.querySelectorAll('.section').forEach(section => {
        const inputs = section.querySelectorAll('input.table-input:not([readonly])');
        let total = 0;
        
        inputs.forEach(input => {
            const value = parseFloat(input.value || 0);
            if (!isNaN(value)) {
                total += value;
            }
        });
        
        // Update total field if exists
        const totalInput = section.querySelector('.total-row input.table-input[readonly]');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
        }
    });
}

function copyValue(btn) {
    const input = btn.previousElementSibling;
    input.select();
    document.execCommand('copy');

    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    }, 2000);
}





  function copyText() {
  const text = document.getElementById("grandTotal").innerText;
  navigator.clipboard.writeText(text);

  const icon = document.querySelector(".copy-icon-summary");
  icon.innerHTML = '<i class="fa-solid fa-check"></i>';

  setTimeout(() => {
    icon.innerHTML = '<i class="fa-regular fa-copy"></i>';
  }, 1000);
}
