/* ========================================
   TAXUTO TAX WIZARD - INTEGRATED VALIDATION
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

    console.log('Total pages:', wizardPages.length);
    console.log('Total steps:', progressSteps.length);

    function showPage(pageNumber) {
        console.log('Switching to page:', pageNumber);

        wizardPages.forEach(function (page) {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        var targetPage = wizardPages[pageNumber - 1];
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            console.log('✅ Page', pageNumber, 'is now visible');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    function updateAllEditIcons() {
        document.querySelectorAll('.edit-icon').forEach(function (icon) {
            if (isSubmitted) {
                icon.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                icon.style.color = '#F59E0B';
            } else {
                icon.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                icon.style.color = '';
            }
        });
    }

    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Previous clicked. Current page:', currentPage);
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
            updateButtons();
            updateProgressBar();
        }
    });

    // Next/Submit/Edit button with VALIDATION
    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Priority 1: If already submitted, enable edit mode
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

            document.querySelectorAll('.edit-icon').forEach(function (icon) {
                icon.style.pointerEvents = 'auto';
                icon.style.opacity = '1';
            });

            document.querySelectorAll('.section-header').forEach(function (header) {
                header.style.pointerEvents = 'auto';
                header.style.opacity = '1';
            });

            updateProgressBar();
            updateAllEditIcons();
            updateButtons();

            showToast('Edit Mode', 'You can now edit the form', 'info');
            return;
        }

        // Priority 2: Validate current page before navigation
        if (currentPage < totalPages) {
            // ⭐ VALIDATION CHECK
            if (typeof window.validateCurrentPage === 'function') {
                if (!window.validateCurrentPage(currentPage)) {
                    console.log('❌ Validation failed for page:', currentPage);
                    return; // Stop navigation if validation fails
                }
                console.log('✅ Validation passed for page:', currentPage);
            }

            currentPage++;
            showPage(currentPage);
            updateButtons();
            updateProgressBar();
            return;
        }

        // Priority 3: Submit form (on last page) - also validate
        if (currentPage === totalPages) {
            // ⭐ FINAL VALIDATION CHECK
            if (typeof window.validateCurrentPage === 'function') {
                if (!window.validateCurrentPage(currentPage)) {
                    console.log('❌ Final validation failed');
                    return; // Stop submission if validation fails
                }
            }

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

            document.querySelectorAll('.edit-icon').forEach(function (icon) {
                icon.style.pointerEvents = 'none';
                icon.style.opacity = '0.6';
            });

            document.querySelectorAll('.section-header').forEach(function (header) {
                header.style.pointerEvents = 'auto';
                header.style.opacity = '1';
                header.style.cursor = 'pointer';
            });

            progressSteps.forEach(function (step) {
                step.style.cursor = 'pointer';
            });

            updateProgressBar();
            updateAllEditIcons();

            showToast('Success!', 'Form submitted successfully. You can navigate to review all pages.', 'success');

            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('taxuto_draft');
            }
            if (typeof hasUnsavedChanges !== 'undefined') {
                hasUnsavedChanges = false;
            }
        }
    });

    // Progress bar clicks - ALLOW NAVIGATION ONLY TO COMPLETED/CURRENT PAGES
    progressSteps.forEach(function (step, index) {
        step.style.cursor = 'pointer';

        step.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetPage = index + 1;
            console.log('Progress step clicked:', targetPage);

            // If submitted, allow free navigation
            if (isSubmitted) {
                currentPage = targetPage;
                showPage(currentPage);
                updateButtons();
                updateProgressBar();
                return;
            }

            // If not submitted, only allow navigation to current or previous pages
            if (targetPage <= currentPage) {
                currentPage = targetPage;
                showPage(currentPage);
                updateButtons();
                updateProgressBar();
            } else {
                showToast('Navigation Restricted', 'Please complete the current page before proceeding.', 'warning');
            }
        });
    });

    draftBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!isSubmitted) {
            saveDraft();
            showToast('Draft Saved', 'Your progress has been saved successfully!', 'success');
        }
    });

    // Auto-save draft every 2 minutes
    setInterval(function() {
        if (!isSubmitted) {
            saveDraft();
            console.log('Auto-saved draft');
        }
    }, 120000); // 2 minutes

    function saveDraft() {
        // Collect all form data
        const formData = {};
        document.querySelectorAll('input, select, textarea').forEach(function(field) {
            if (field.name || field.id) {
                formData[field.name || field.id] = field.value;
            }
        });
        
        // Save to localStorage
        localStorage.setItem('taxuto_draft', JSON.stringify({
            data: formData,
            currentPage: currentPage,
            timestamp: new Date().toISOString()
        }));
    }

    function loadDraft() {
        const draft = localStorage.getItem('taxuto_draft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                
                // Ask user if they want to load the draft
                if (confirm('A saved draft was found. Would you like to continue from where you left off?')) {
                    // Load form data
                    Object.keys(draftData.data).forEach(function(key) {
                        const field = document.querySelector(`[name="${key}"], #${key}`);
                        if (field) {
                            field.value = draftData.data[key];
                        }
                    });
                    
                    // Navigate to saved page
                    if (draftData.currentPage) {
                        currentPage = draftData.currentPage;
                        showPage(currentPage);
                        updateButtons();
                        updateProgressBar();
                    }
                    
                    showToast('Draft Loaded', 'Your previous progress has been restored.', 'success');
                } else {
                    localStorage.removeItem('taxuto_draft');
                }
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    // Toast notification function
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

    // Add required CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', function () {
        var progressBar = document.querySelector('.progress-bar-container');
        if (window.scrollY > 20) {
            progressBar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.15)';
        } else {
            progressBar.style.boxShadow = 'none';
        }
    });

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
                    var targetElement = section.previousElementSibling;
                    if (!targetElement) {
                        targetElement = section;
                    }
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });

    // Initialize sections
    wizardPages.forEach(function (page) {
        var sections = page.querySelectorAll('.section');
        sections.forEach(function (section, index) {
            if (index > 0) {
                section.classList.add('collapsed');
            }
        });
    });

    // Initialize
    updateButtons();
    updateProgressBar();
    showPage(1);

    // Load draft on page load
    setTimeout(loadDraft, 500);

    console.log('✅ Wizard initialized on page:', currentPage);

    // Make showToast available globally
    window.showToast = showToast;
})();

function copyValue(btn) {
    const input = btn.previousElementSibling;
    input.select();
    document.execCommand('copy');

    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    }, 2000);
}
