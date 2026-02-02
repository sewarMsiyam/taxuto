/* ========================================
   TAXUTO TAX WIZARD - COMPLETE FINAL
   بعد Submit:
   - أزرار التحميل تظهر في Page 7
   - يقدر يشوف كل الـ Steps (1-7)
   - ما يقدر يعدل إلا إذا ضغط Edit
   - لا يوجد Page 8
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

    /**
     * عرض الصفحة
     */
    function showPage(pageNumber) {
        wizardPages.forEach(function (page) {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        var targetPage = wizardPages[pageNumber - 1];
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            openFirstSection(targetPage);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * فتح أول قسم
     */
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

    /**
     * تحديث الأزرار
     */
    function updateButtons() {
        if (isSubmitted) {
            // بعد Submit
            prevBtn.disabled = currentPage === 1;
            
            nextBtn.textContent = 'EDIT';
            nextBtn.classList.remove('button-next');
            nextBtn.classList.add('button-edit');
            
            draftBtn.style.display = 'none';
        } else {
            // قبل Submit
            prevBtn.disabled = currentPage === 1;
            
            nextBtn.textContent = currentPage === totalPages ? 'SUBMIT' : 'NEXT >>';
            nextBtn.classList.remove('button-edit');
            nextBtn.classList.add('button-next');
            
            draftBtn.style.display = 'inline-block';
        }
    }

    /**
     * تحديث شريط التقدم
     */
    function updateProgressBar() {
        if (isSubmitted) {
            progressSteps.forEach(function (step, index) {
                step.classList.remove('active', 'completed', 'notactive');
                step.classList.add('completed');

                if (index + 1 === currentPage) {
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

    /**
     * إظهار/إخفاء أزرار التحميل
     */
    function toggleDownloadButtons(show) {
        const downloadContainer = document.querySelector('.footer-summary-container');
        if (downloadContainer) {
            downloadContainer.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * تعطيل جميع الحقول (Read-only)
     */
    function disableAllInputs() {
        document.querySelectorAll('input, select, textarea').forEach(function (element) {
            element.disabled = true;
            element.style.opacity = '0.7';
            element.style.cursor = 'not-allowed';
        });

        document.querySelectorAll('input[type="radio"]').forEach(function (radio) {
            radio.disabled = true;
        });
    }

    /**
     * تفعيل جميع الحقول
     */
    function enableAllInputs() {
        document.querySelectorAll('input, select, textarea').forEach(function (element) {
            element.disabled = false;
            element.style.opacity = '1';
            element.style.cursor = 'auto';
        });

        document.querySelectorAll('input[type="radio"]').forEach(function (radio) {
            radio.disabled = false;
        });
    }

    /**
     * عرض نافذة التأكيد
     */
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
                    <button class="confirmation-btn confirmation-btn-yes" onclick="confirmSubmit(true)">
                        <i class="fa-solid fa-check"></i> Yes, Submit
                    </button>
                    <button class="confirmation-btn confirmation-btn-no" onclick="confirmSubmit(false)">
                        <i class="fa-solid fa-times"></i> No, Go Back
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * التأكيد على Submit
     */
    window.confirmSubmit = function(confirmed) {
        const modal = document.querySelector('.confirmation-modal');
        if (modal) modal.remove();

        if (confirmed) {
            // تحديث الحالة
            isSubmitted = true;

            // تعطيل جميع الحقول
            disableAllInputs();

            // إظهار أزرار التحميل
            toggleDownloadButtons(true);

            // تحديث الأزرار و Progress Bar
            updateButtons();
            updateProgressBar();

            showToast('Success!', 'Declaration submitted successfully!', 'success');
            
            // حذف المسودة
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('taxuto_draft');
            }
        } else {
            showToast('Cancelled', 'You can continue editing the form', 'info');
        }
    };

    /**
     * زر Previous
     */
    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
            updateButtons();
            updateProgressBar();
        }
    });

    /**
     * زر Next/Submit/Edit
     */
    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // إذا ضغط Edit
        if (isSubmitted) {
            isSubmitted = false;
            
            // تفعيل الحقول
            enableAllInputs();
            
            // إخفاء أزرار التحميل
            toggleDownloadButtons(false);
            
            nextBtn.textContent = currentPage === totalPages ? 'SUBMIT' : 'NEXT >>';
            nextBtn.classList.remove('button-edit');
            nextBtn.classList.add('button-next');
            
            draftBtn.style.display = 'inline-block';
            
            updateButtons();
            updateProgressBar();
            
            showToast('Edit Mode', 'You can now edit the form', 'info');
            return;
        }

        // التنقل للصفحة التالية
        if (currentPage < totalPages) {
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

        // Submit في Page 7
        if (currentPage === totalPages) {
            if (typeof window.validateCurrentPage === 'function') {
                if (!window.validateCurrentPage(currentPage)) {
                    return;
                }
            }

            showConfirmationModal();
        }
    });

    /**
     * النقر على Progress Steps
     */
progressSteps.forEach(function (step, index) {
    step.style.cursor = 'pointer';

    step.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetPage = index + 1;

        // ✅ تنقل حر بين جميع الصفحات
        currentPage = targetPage;
        showPage(currentPage);
        updateButtons();
        updateProgressBar();
    });
});

    /**
     * حفظ مسودة
     */
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

    /**
     * Toast إشعار
     */
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

    // Animations
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

    /**
     * Section collapse/expand
     */
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

    /**
     * ربط أزرار التحميل
     */
    function setupDownloadButtons() {
        const excelBtn = document.querySelector('.btn-summary-excel');
        const pdfBtn = document.querySelector('.btn-summary-pdf');
        
        if (excelBtn) {
            excelBtn.addEventListener('click', downloadExcel);
        }
        
        if (pdfBtn) {
            pdfBtn.addEventListener('click', downloadPDF);
        }
    }

    // Initialize
    setupAutoCalculations();
    setupDownloadButtons();
    setupNumberFormatting();
    toggleDownloadButtons(false); // إخفاء الأزرار في البداية
    updateButtons();
    updateProgressBar();
    showPage(1);
})();

/**
 * تنسيق الأرقام: 123,456,789.00
 */
function formatNumberWithCommas(value) {
    if (!value || value === '') return '0.00';
    let num = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(num)) return '0.00';
    let formatted = num.toFixed(2);
    let parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function setupNumberFormatting() {
    const inputs = document.querySelectorAll('.table-input, .input-field[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && this.value !== '' && !this.readOnly) {
                this.value = formatNumberWithCommas(this.value);
            }
        });
        input.addEventListener('focus', function() {
            if (!this.readOnly) {
                this.value = this.value.replace(/,/g, '');
            }
        });
        if (input.value && input.value !== '') {
            input.value = formatNumberWithCommas(input.value);
        }
    });
}
/**
 * وظائف التحميل
 */
function downloadExcel() {
    showToast('Downloading', 'Preparing Excel file...', 'info');
    
    setTimeout(() => {
        const csvContent = `TAXUTO Tax Return Summary

Company Name,Alkhoraif for water and power technologies
Filing Period,01/10/2025 – 31/12/2025
Total Zakat Payable,24500.00 SAR
Total Income Tax Payable,12750.50 SAR
Grand Total,37250.50 SAR`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'TAXUTO_Tax_Return_' + new Date().getTime() + '.csv';
        link.click();
        
        showToast('Success', 'Excel file downloaded!', 'success');
    }, 1000);
}

function downloadPDF() {
    showToast('Downloading', 'Preparing PDF file...', 'info');
    
    setTimeout(() => {
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>TAXUTO Tax Return</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #667eea; }
        .section { margin: 20px 0; border-bottom: 1px solid #eee; padding: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { margin-left: 20px; color: #666; }
    </style>
</head>
<body>
    <h1>TAXUTO Tax Return Summary</h1>
    <div class="section">
        <div class="label">Company Name:</div>
        <div class="value">Alkhoraif for water and power technologies</div>
    </div>
    <div class="section">
        <div class="label">Filing Period:</div>
        <div class="value">01/10/2025 – 31/12/2025</div>
    </div>
    <div class="section">
        <div class="label">Total Zakat Payable:</div>
        <div class="value">24,500.00 SAR</div>
    </div>
    <div class="section">
        <div class="label">Total Income Tax Payable:</div>
        <div class="value">12,750.50 SAR</div>
    </div>
    <div class="section">
        <div class="label">Grand Total:</div>
        <div class="value" style="font-size: 18px; font-weight: bold;">37,250.50 SAR</div>
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'TAXUTO_Tax_Return_' + new Date().getTime() + '.html';
        link.click();
        
        showToast('Success', 'PDF file downloaded!', 'success');
    }, 1000);
}

/**
 * Auto calculation system
 */
function setupAutoCalculations() {
    document.querySelectorAll('input.table-input').forEach(input => {
        if (!input.readOnly) {
            input.addEventListener('input', function() {
                calculateTotals();
            });
        }
    });
}

function calculateTotals() {
    document.querySelectorAll('.section').forEach(section => {
        const inputs = section.querySelectorAll('input.table-input:not([readonly])');
        let total = 0;
        
        inputs.forEach(input => {
            // إزالة الفواصل قبل الحساب
            const value = parseFloat(input.value.replace(/,/g, '') || 0);
            if (!isNaN(value)) {
                total += value;
            }
        });
        
        const totalInput = section.querySelector('.total-row input.table-input[readonly]');
        if (totalInput) {
            // تنسيق الناتج
            totalInput.value = formatNumberWithCommas(total);
        }
    });
}

/**
 * Copy text function
 */
function copyText() {
    const text = document.getElementById("grandTotal").innerText;
    navigator.clipboard.writeText(text);

    const icon = document.querySelector(".copy-btn");
    if (icon) {
        icon.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
            icon.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 1000);
    }
}

function copyValue(button) {
    const input = button.parentElement.querySelector('input');
    const value = input.value;
    
    // نسخ القيمة
    navigator.clipboard.writeText(value).then(() => {
        // تغيير الأيقونة مؤقتاً
        button.classList.add('copied');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // إرجاع الأيقونة الأصلية بعد ثانية
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.33333 10H2.66667C2.31304 10 1.97391 9.85952 1.72386 9.60947C1.47381 9.35943 1.33333 9.02029 1.33333 8.66667V2.66667C1.33333 2.31304 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31304 1.33333 2.66667 1.33333H8.66667C9.02029 1.33333 9.35943 1.47381 9.60947 1.72386C9.85952 1.97391 10 2.31304 10 2.66667V3.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }, 1000);
        
        console.log('✅ Copied:', value);
    }).catch(err => {
        console.error('❌ Copy failed:', err);
        alert('فشل النسخ');
    });
}