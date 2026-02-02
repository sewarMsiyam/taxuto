   let currentMainModal = null;
            let rowCounter = 1;

            document.addEventListener('DOMContentLoaded', function () {
                const modalMap = {
                    'insurance': 'modal-insurance',
                    'contracts': 'modal-contracts',
                    'subcon': 'modal-subcontractors',
                    'machinery': 'modal-machinery',
                    'provisions': 'modal-provisions',
                    'Royalties': 'modal-royalties',
                    'other-expenses': 'modal-other-expenses',
                    'zakat-adjustment': 'modal-zakat-adj',
                    'tax-adjustment': 'modal-tax-adj',
                    'repair-maintenance': 'modal-repair',
                    'depreciation': 'modal-depreciation',
                    'loan-charges': 'modal-loan',
                    'equity': 'modal-equity',
                    'liabilities': 'modal-liabilities',
                    'non-current-assets': 'modal-noncurrent',
                    'investments': 'modal-investments',
                    'real-estate-dev': 'modal-realestate',
                    'off-plan': 'modal-offplan',
                    'current-assets': 'modal-current',
                    'losses_up': 'modal-losses',
                    'Taxable_amount': 'modal-taxable'
                };

                // ✅ Radio buttons
                const allRadios = document.querySelectorAll('input[type="radio"]');
                allRadios.forEach(radio => {
                    radio.addEventListener('click', function () {
                        const radioName = this.name;
                        const radioValue = this.value;
                        const modalId = modalMap[radioName];

                        if (radioValue === 'applicable') {
                            if (modalId) {
                                openModalById(modalId);
                            }
                            enableButtonForRadio(radioName);
                        }
                        else if (radioValue === 'not-applicable') {
                            resetValue(radioName, this);
                            disableButtonForRadio(radioName);
                        }
                    });
                });

                // ✅ فتح الموديل من الأزرار
                document.addEventListener('click', function (e) {
                    const button = e.target.closest('[data-modal]');
                    if (button && !button.disabled) {
                        e.preventDefault();
                        const modalId = button.dataset.modal;
                        openModalById(modalId);
                    }
                });

                // ✅ X button
                document.addEventListener('click', function (e) {
                    if (e.target.classList.contains('modal-close')) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (currentMainModal) {
                            currentMainModal.classList.remove('show');
                        }
                    }
                });

                // ✅ Close button
                document.querySelectorAll('.button-close-modal').forEach(btn => {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (currentMainModal) {
                            currentMainModal.classList.remove('show');
                        }
                    });
                });

                // ✅ Save button
                document.querySelectorAll('.button-save-modal').forEach(btn => {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openConfirmModal();
                    });
                });

                // ✅ Event Delegation لأزرار الإضافة والحذف
                document.addEventListener('click', function (e) {
                    if (e.target.closest('.btn-add')) {
                        e.preventDefault();
                        const button = e.target.closest('.btn-add');
                        const row = button.closest('tr');
                        const tbody = row.closest('tbody');
                        addNewRow(tbody, row);
                    }

                    if (e.target.closest('.btn-remove')) {
                        e.preventDefault();
                        const button = e.target.closest('.btn-remove');
                        const row = button.closest('tr');
                        const tbody = row.closest('tbody');
                        removeRow(row, tbody);
                    }
                });

                // ✅ تهيئة الأزرار عند تحميل الصفحة
                initializeButtons();
            });

            // ✅ دالة فتح الموديل
            function openModalById(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    currentMainModal = modal;
                    modal.classList.add('show');

                    const tbody = modal.querySelector('.modal-table tbody');
                    if (tbody) {
                        rowCounter = tbody.querySelectorAll('tr').length;
                    }
                    console.log('✅ Modal opened:', modalId);
                } else {
                    console.warn('⚠️ Modal not found:', modalId);
                }
            }

            // ✅ تفعيل الزر المرتبط بـ radio
            function enableButtonForRadio(radioName) {
                const button = document.querySelector(`[data-radio-name="${radioName}"]`);
                if (button) {
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                }
            }

            // ✅ تعطيل الزر المرتبط بـ radio
            function disableButtonForRadio(radioName) {
                const button = document.querySelector(`[data-radio-name="${radioName}"]`);
                if (button) {
                    button.disabled = true;
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                }
            }

            // ✅ تهيئة حالة الأزرار عند التحميل
            function initializeButtons() {
                document.querySelectorAll('[data-radio-name]').forEach(button => {
                    const radioName = button.dataset.radioName;
                    const applicableRadio = document.querySelector(
                        `input[type="radio"][name="${radioName}"][value="applicable"]`
                    );

                    if (applicableRadio && applicableRadio.checked) {
                        enableButtonForRadio(radioName);
                    } else {
                        disableButtonForRadio(radioName);
                    }
                });
            }

            // ✅ دالة تصفير القيمة عند اختيار "not-applicable"
            function resetValue(fieldName, radioElement) {
                const row = radioElement.closest('tr');
                if (row) {
                    const valueInput = row.querySelector('.value-cell input, input.table-input, input[type="number"]');
                    if (valueInput) {
                        valueInput.value = '0.00';
                        console.log(`✅ Reset ${fieldName} to 0.00`);
                        return;
                    }
                }

                const input = document.querySelector(`input[name="${fieldName}-value"]`);
                if (input) {
                    input.value = '0.00';
                    console.log(`✅ Reset ${fieldName} to 0.00`);
                    return;
                }

                console.warn(`⚠️ Could not find input for: ${fieldName}`);
            }

            // ✅ إضافة صف جديد
            // ✅ إضافة صف جديد - النسخة النهائية
            function addNewRow(tbody, afterRow) {
                const firstRow = tbody.querySelector('tr');
                if (!firstRow) return;

                rowCounter++;
                const newRow = firstRow.cloneNode(true);

                // تنظيف كل cell
                newRow.querySelectorAll('td').forEach((cell, colIndex) => {
                    const input = cell.querySelector('input');
                    const select = cell.querySelector('select');
                    const textarea = cell.querySelector('textarea');

                    // تخطي الأزرار
                    if (colIndex === 0) return;

                    // Serial Number
                    if (colIndex === 1 && input) {
                        input.value = rowCounter;
                        return;
                    }

                    // Select
                    if (select) {
                        select.selectedIndex = 0;
                        return;
                    }

                    // Textarea
                    if (textarea) {
                        textarea.value = '';
                        return;
                    }

                    // Input
                    if (input) {
                        const originalValue = input.value;
                        const inputType = input.type;
                        const isReadonly = input.readOnly || input.hasAttribute('readonly');

                        if (isReadonly) {
                            // Readonly inputs
                            input.value = inputType === 'date' ? '' : '0.00';
                        } else {
                            // Editable inputs
                            switch (inputType) {
                                case 'date':
                                case 'datetime-local':
                                case 'time':
                                case 'month':
                                case 'week':
                                    input.value = '';
                                    break;

                                case 'number':
                                    input.value = '0.00';
                                    break;

                                case 'email':
                                case 'tel':
                                case 'url':
                                    input.value = '';
                                    break;

                                case 'checkbox':
                                case 'radio':
                                    input.checked = false;
                                    break;

                                case 'text':
                                default:
                                    // Auto-detect: رقم أو نص
                                    const cleaned = originalValue.replace(/[,\s]/g, '');
                                    if (/^-?[\d.]+$/.test(cleaned) || originalValue === '0.00') {
                                        input.value = '0.00';
                                    } else {
                                        input.value = '';
                                    }
                                    break;
                            }
                        }
                    }
                });

                afterRow.insertAdjacentElement('afterend', newRow);
                updateSerialNumbers(tbody);
            }

            // ✅ حذف صف
            function removeRow(row, tbody) {
                const allRows = tbody.querySelectorAll('tr');

                if (allRows.length <= 1) {
                    alert('يجب أن يحتوي الجدول على صف واحد على الأقل');
                    return;
                }

                row.remove();
                updateSerialNumbers(tbody);
            }

            // ✅ تحديث الأرقام التسلسلية
            function updateSerialNumbers(tbody) {
                const rows = tbody.querySelectorAll('tr');
                rows.forEach((row, index) => {
                    const serialInput = row.querySelector('td:nth-child(2) input');
                    if (serialInput) {
                        serialInput.value = index + 1;
                    }
                });
                rowCounter = rows.length;
            }

            // ✅ حساب المجاميع
            function calculateTotals() {
                const modal = currentMainModal;
                if (!modal) return;

                const tbody = modal.querySelector('.modal-table tbody');
                const tfoot = modal.querySelector('.modal-table tfoot');

                if (!tbody || !tfoot) return;

                const totals = [0, 0, 0, 0];

                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => {
                    for (let i = 0; i < 4; i++) {
                        const input = row.querySelector(`td:nth-child(${i + 4}) input`);
                        if (input && !input.readOnly) {
                            const value = parseFloat(input.value.replace(/,/g, '')) || 0;
                            totals[i] += value;
                        }
                    }
                });

                const totalInputs = tfoot.querySelectorAll('input');
                totals.forEach((total, index) => {
                    if (totalInputs[index]) {
                        totalInputs[index].value = formatNumber(total);
                    }
                });
            }

            // ✅ تنسيق الأرقام
            function formatNumber(num) {
                return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }

            // ✅ تنسيق الأرقام عند الخروج من الـ input
            document.addEventListener('blur', function (e) {
                const input = e.target;

                if (!input.classList.contains('model-table-input')) return;
                if (input.readOnly) return;
                if (input.type === 'date') return;
                if (input.tagName === 'SELECT') return;
                if (input.closest('.name-cell')) return;

                const cell = input.closest('td');
                const cellIndex = cell ? Array.from(cell.parentElement.children).indexOf(cell) : -1;

                // استثني الأعمدة النصية
                if (cellIndex === 3 || cellIndex === 4) return;

                const value = input.value.trim();
                if (value === '') return;

                const numValue = parseFloat(value.replace(/,/g, ''));
                if (!isNaN(numValue)) {
                    input.value = formatNumber(numValue);
                }
            }, true);

            // ✅ فتح موديل التأكيد
            function openConfirmModal() {
                const confirmModal = document.getElementById('modal-confirm-save');
                if (confirmModal) {
                    confirmModal.classList.add('show');
                }
            }

            // ✅ إغلاق موديل التأكيد
            function closeConfirmModal() {
                const confirmModal = document.getElementById('modal-confirm-save');
                if (confirmModal) {
                    confirmModal.classList.remove('show');
                }
            }

            // ✅ إغلاق بدون حفظ
            function closeWithoutSaving() {
                closeConfirmModal();
                if (currentMainModal) {
                    currentMainModal.classList.remove('show');
                }
                console.log('❌ Closed without saving');
            }

            // ✅ حفظ وإغلاق
            function saveAndClose() {
                console.log('✅ Data saved!');

                closeConfirmModal();
                if (currentMainModal) {
                    currentMainModal.classList.remove('show');
                }

                console.log('✅ Modal closed after saving');
            }



