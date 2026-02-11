    // ================================
    // ✅ نظام تتبع حالة الصفوف
    // ================================
    const rowValidationStatus = {}; // {companyName: 'pending' | 'saved' | 'opened' | 'empty'}

    // ================================
    // ✅ Driver.js - Tutorial
    // ================================
    function startTutorial() {
        const driver = window.driver.js.driver({
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            steps: [
                {
                    element: '.modal-table tbody tr:first-child .btn-calculation[data-type="sub-return"]',
                    popover: {
                        title: 'Step 1: Choose Calculation Type',
                        description: 'Select <strong>Sub-return</strong> to create a sub-return, or <strong>Manual</strong> to enter the value manually',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: '.btn-open-all-tabs',
                    popover: {
                        title: 'Step 2: Click "Prepare sub-returns"',
                        description: 'After selecting <strong>Sub-return</strong> in the required rows, click this button to activate the edit icons',
                        side: "top",
                        align: 'start'
                    }
                },
                {
                    element: '.modal-table tbody tr:first-child td:nth-child(4) button:first-child',
                    popover: {
                        title: 'Step 3: Click the Pen Icon',
                        description: 'After activating the icons, click the <strong>pen icon</strong> to open the sub-return form',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    popover: {
                        title: '🎉 Done!',
                        description: 'Now you can fill in the sub-returns and save them. Repeat the steps for each company.',
                    }
                }
            ],
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            doneBtnText: 'Finish',
            progressText: '{{current}} of {{total}}'
        });

        driver.drive();
    }

    // ✅ تشغيل التوضيح عند فتح Modal
    function openModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            currentMainModal = modal;
            modal.classList.add('show');

            const tbody = modal.querySelector('.modal-table tbody');
            if (tbody) {
                rowCounter = tbody.querySelectorAll('tr').length;
            }

            if (modalId === 'modal-Zakat-Entities') {
                const hasSeenTutorial = localStorage.getItem('zakatEntitiesTutorialSeen');
                
                if (!hasSeenTutorial) {
                    setTimeout(() => {
                        startTutorial();
                        localStorage.setItem('zakatEntitiesTutorialSeen', 'true');
                    }, 800);
                }
            }

            // ✅ تحقق من حالة الزر عند فتح الموديل
            setTimeout(() => {
                checkAllRowsCompleted();
            }, 200);

            console.log('✅ Modal opened:', modalId);
        }
    }

    // ================================
    // ✅ تحديث Border على الزر حسب الحالة
    // ================================
    function updateButtonBorder(row, status) {
        const editBtn = row.querySelector('td:nth-child(4) button:first-child');
        
        if (!editBtn) {
            console.error('❌ Edit button NOT found');
            return;
        }

        console.log('🔍 updateButtonBorder:', status);

        // إزالة Classes القديمة
        editBtn.classList.remove('edit-btn-saved', 'edit-btn-opened', 'edit-btn-pending');
        
        // إزالة Attributes القديمة
        editBtn.removeAttribute('data-status');

        if (status === 'saved') {
            editBtn.style.cssText = `
                border: 2px solid #10b981 !important;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
                opacity: 1 !important;
                cursor: pointer !important;
            `;
            editBtn.classList.add('edit-btn-saved');
            editBtn.setAttribute('data-status', 'saved');
            console.log('✅ GREEN applied');
            
        } else if (status === 'opened') {
            editBtn.style.cssText = `
                border: 2px solid #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
                opacity: 1 !important;
                cursor: pointer !important;
            `;
            editBtn.classList.add('edit-btn-opened');
            editBtn.setAttribute('data-status', 'opened');
            console.log('🔴 RED applied');
            
        } else if (status === 'pending') {
            editBtn.style.cssText = `
                border: 2px solid #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
                opacity: 1 !important;
                cursor: pointer !important;
            `;
            editBtn.classList.add('edit-btn-pending');
            editBtn.setAttribute('data-status', 'pending');
            console.log('🔵 BLUE applied');
        }
    }

    // ================================
    // ✅ Event listener لأزرار Calculation
    // ================================
    document.addEventListener('click', function (e) {
        const button = e.target.closest('.btn-calculation');
        if (!button) return;

        const type = button.dataset.type;
        const row = button.closest('tr');
        const zakatInput = row.querySelector('.zakat-amount');
        const investmentInput = row.querySelector('td:nth-child(2) input');
        const companyName = investmentInput ? investmentInput.value.trim() : '';

        if (type === 'manual') {
            zakatInput.readOnly = false;
            zakatInput.focus();
            zakatInput.select();
            zakatInput.style.background = '#fff3cd';
            zakatInput.style.borderColor = '#ffc107';

            button.style.background = '#10b981';
            button.style.color = '#fff';

            const otherBtn = row.querySelector('[data-type="sub-return"]');
            if (otherBtn) {
                otherBtn.style.background = '';
                otherBtn.style.color = '';
            }

            const editBtn = row.querySelector('td:nth-child(4) button:first-child');
            if (editBtn) {
                editBtn.disabled = true;
                editBtn.style.opacity = '0.5';
                editBtn.style.cursor = 'not-allowed';
                editBtn.classList.remove('edit-btn-active');
            }
            
            if (companyName) {
                closeTabByCompanyName(companyName);
                
                const currentValue = parseFloat(zakatInput.value.replace(/,/g, '')) || 0;
                
                if (currentValue > 0) {
                    rowValidationStatus[companyName] = 'saved';
                    updateButtonBorder(row, 'saved');
                    console.log(`✅ Manual: ${companyName} → SAVED (value: ${currentValue})`);
                } else {
                    rowValidationStatus[companyName] = 'pending';
                    updateButtonBorder(row, 'pending');
                    console.log(`🔵 Manual: ${companyName} → PENDING (value: ${currentValue})`);
                }
                
                const newInput = zakatInput.cloneNode(true);
                zakatInput.parentNode.replaceChild(newInput, zakatInput);
                
                newInput.addEventListener('input', function() {
                    const val = parseFloat(this.value.replace(/,/g, '')) || 0;
                    
                    if (val > 0) {
                        rowValidationStatus[companyName] = 'saved';
                        updateButtonBorder(row, 'saved');
                        console.log(`✅ Manual input: ${companyName} → SAVED (${val})`);
                    } else {
                        rowValidationStatus[companyName] = 'pending';
                        updateButtonBorder(row, 'pending');
                        console.log(`🔵 Manual input: ${companyName} → PENDING (${val})`);
                    }
                    
                    // ✅ تحقق من جاهزية الصفوف
                    checkAllRowsCompleted();
                });
                
                newInput.addEventListener('blur', function() {
                    const val = parseFloat(this.value.replace(/,/g, '')) || 0;
                    
                    if (val > 0) {
                        rowValidationStatus[companyName] = 'saved';
                        updateButtonBorder(row, 'saved');
                    } else {
                        rowValidationStatus[companyName] = 'pending';
                        updateButtonBorder(row, 'pending');
                    }
                    
                    // ✅ تحقق من جاهزية الصفوف
                    checkAllRowsCompleted();
                });
            }
        }
        else if (type === 'sub-return') {
            if (zakatInput.value && zakatInput.value !== '0.00') {
                zakatInput.value = '0.00';
            }

            zakatInput.readOnly = true;
            zakatInput.style.background = '';
            zakatInput.style.borderColor = '';

            button.style.background = '#10b981';
            button.style.color = '#fff';

            const otherBtn = row.querySelector('[data-type="manual"]');
            if (otherBtn) {
                otherBtn.style.background = '';
                otherBtn.style.color = '';
            }

            if (companyName) {
                rowValidationStatus[companyName] = 'pending';
                updateButtonBorder(row, 'pending');
                
                // ✅ تحقق من جاهزية الصفوف
                checkAllRowsCompleted();
            }

            console.log(`✅ Sub-return selected for ${companyName}`);
        }
    });

    // ✅ Event listener لزر القلم
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const td = button.closest('td');
        if (!td) return;

        const tdIndex = Array.from(td.parentElement.children).indexOf(td);
        if (tdIndex !== 3) return;

        const buttons = td.querySelectorAll('button');
        if (buttons[0] !== button) return;

        if (button.disabled || !button.classList.contains('edit-btn-active')) {
            return;
        }

        const companyName = button.getAttribute('data-company');
        
        if (companyName) {
            e.preventDefault();
            e.stopPropagation();
            
            if (rowValidationStatus[companyName] === 'pending') {
                rowValidationStatus[companyName] = 'opened';
            }
            
            openSubReturnFromEdit(companyName);
        }
    });

    function openSubReturnFromEdit(companyName) {
        const existingTab = Array.from(document.querySelectorAll('.tab')).find(tab => 
            tab.getAttribute('data-company') === companyName
        );

        if (existingTab && existingTab.id !== 'main-tab') {
            switchTab(existingTab.id);
            showToast('Info', `Switched to ${companyName}`, 'info');
        } else {
            openSubReturn(companyName);
        }
    }

    // ================================
    // ✅ Alert في وسط الشاشة
    // ================================
    function showPrepareAlert() {
        const existingAlert = document.querySelector('.prepare-alert-overlay');
        if (existingAlert) existingAlert.remove();

        const overlay = document.createElement('div');
        overlay.className = 'prepare-alert-overlay';
        overlay.innerHTML = `
            <div class="prepare-alert-modal">
                <div class="prepare-alert-header">
                    <i class="fa-solid fa-info-circle" style="font-size: 50px; color: #10b981; margin-bottom: 20px;"></i>
                    <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 10px;">Important Notice</h2>
                </div>
                <div class="prepare-alert-body">
                    <p style="font-size: 18px; line-height: 1.8; color: #374151; text-align: center; margin-bottom: 20px;">
                        Sub-returns will be created and must be fully completed and saved for each return to proceed to the next stage
                    </p>
                    <p style="font-size: 16px; color: #6b7280; text-align: center; margin-bottom: 30px;">
                        <i class="fa-solid fa-hand-pointer"></i> Click the pen icon <i class="fa-solid fa-pen"></i> to open each return
                    </p>
                </div>
                <div class="prepare-alert-footer">
                    <button class="prepare-alert-btn" onclick="confirmPrepare()">
                        <i class="fa-solid fa-check"></i>
                        OK
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    function confirmPrepare() {
        const overlay = document.querySelector('.prepare-alert-overlay');
        if (overlay) overlay.remove();

        activateAllEditButtons();

        showToast('Success', 'Edit icons activated for sub-returns', 'success');
    }

    function activateAllEditButtons() {
        const rows = document.querySelectorAll('.modal-table tbody tr');
        let activatedCount = 0;

        rows.forEach(row => {
            const subReturnBtn = row.querySelector('[data-type="sub-return"]');
            const editBtn = row.querySelector('td:nth-child(4) button:first-child');
            const investmentInput = row.querySelector('td:nth-child(2) input');
            const companyName = investmentInput ? investmentInput.value.trim() : '';
            const zakatInput = row.querySelector('.zakat-amount');

            const isSubReturnActive = subReturnBtn && 
                (subReturnBtn.style.background === 'rgb(16, 185, 129)' || 
                 subReturnBtn.style.background === '#10b981' ||
                 subReturnBtn.style.backgroundColor === 'rgb(16, 185, 129)' ||
                 subReturnBtn.style.backgroundColor === '#10b981');

            if (isSubReturnActive) {
                if (zakatInput) {
                    zakatInput.readOnly = true;
                    zakatInput.style.background = '';
                    zakatInput.style.borderColor = '';
                    if (zakatInput.value && zakatInput.value !== '0.00') {
                        zakatInput.value = '0.00';
                    }
                }

                if (editBtn && companyName) {
                    editBtn.disabled = false;
                    editBtn.style.opacity = '1';
                    editBtn.style.cursor = 'pointer';
                    editBtn.setAttribute('data-company', companyName);
                    editBtn.classList.add('edit-btn-active');
                    activatedCount++;
                    
                    if (!rowValidationStatus[companyName] || rowValidationStatus[companyName] === 'empty') {
                        rowValidationStatus[companyName] = 'pending';
                        updateButtonBorder(row, 'pending');
                    }
                }
            }
        });

        console.log(`✅ Activated ${activatedCount} edit buttons`);
        
        // ✅ تحقق من جاهزية الصفوف
        checkAllRowsCompleted();
    }

    function openAllSubReturns() {
        showPrepareAlert();
    }

    // ================================
    // ✅ نظام Tabs
    // ================================
    let tabCounter = 0;
    let activeTabId = 'main-tab';
    let tabsInitialized = false;

    function openSubReturn(companyName, rowNumber = '') {
        if (!tabsInitialized) {
            initializeTabs();
            tabsInitialized = true;
        }

        const tabDisplayName = rowNumber ? `${rowNumber}. ${companyName}` : companyName;

        const existingTab = Array.from(document.querySelectorAll('.tab')).find(tab => 
            tab.getAttribute('data-company') === companyName
        );

        if (existingTab && existingTab.id !== 'main-tab') {
            switchTab(existingTab.id);
            return;
        }

        const tabId = `tab-${++tabCounter}`;

        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.id = tabId;
        tab.setAttribute('data-company', companyName);
        tab.innerHTML = `
            <i class="fa-solid fa-building tab-icon"></i>
            <span class="tab-title">${tabDisplayName}</span>
            <button class="tab-close" onclick="closeTab('${tabId}', event)">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        tab.onclick = () => switchTab(tabId);

        document.getElementById('tabsList').appendChild(tab);

        const panel = document.createElement('div');
        panel.className = 'tab-panel';
        panel.id = `panel-${tabId}`;
        panel.innerHTML = getSubReturnContent(companyName, tabId);

        document.getElementById('dynamicPanels').appendChild(panel);

        switchTab(tabId);
    }

    function initializeTabs() {
        const tabsBar = document.getElementById('tabsBar');
        tabsBar.classList.add('show');

        const mainTab = document.createElement('div');
        mainTab.className = 'tab main-tab active';
        mainTab.id = 'main-tab';
        mainTab.innerHTML = `
            <i class="fa-solid fa-table tab-icon"></i>
            <span class="tab-title">Main Table</span>
            <button class="tab-close"></button>
        `;
        mainTab.onclick = () => switchTab('main-tab');

        document.getElementById('tabsList').appendChild(mainTab);

        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.paddingTop = '60px';
        }
    }

    function getSubReturnContent(companyName, tabId) {
        return `
            <div class="container-main">
                <div class="container-content">
                    <div style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="width: 120px; height: 120px; margin: 0 auto 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);">
                                <i class="fa-solid fa-file-invoice" style="font-size: 60px; color: white;"></i>
                            </div>
                            
                            <h1 style="font-size: 48px; font-weight: 800; color: #1f2937; margin-bottom: 16px;">
                                Welcome to New Return
                            </h1>
                            
                            <p style="font-size: 20px; color: #6b7280; margin-bottom: 8px;">
                                ${companyName}
                            </p>
                            
                            <p style="font-size: 16px; color: #9ca3af;">
                                Please fill in the required data below
                            </p>
                        </div>

                        <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <div style="display: flex; gap: 15px; justify-content: center;">
                                <button onclick="closeTab('${tabId}')" style="padding: 14px 28px; background: white; border: 2px solid #e5e7eb; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
                                    Cancel
                                </button>
                                <button onclick="submitSubReturnData('${companyName}', '${tabId}')" style="padding: 14px 28px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
                                    Submit
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    function submitSubReturnData(companyName, tabId) {
        const zakatValue = '100.00';

        console.log('🔍 Submitting data for:', companyName);

        const rows = document.querySelectorAll('.modal-table tbody tr');
        let applied = false;
        let targetRow = null;
        let targetButton = null;

        rows.forEach(row => {
            const investmentInput = row.querySelector('td:nth-child(2) input');
            const currentCompany = investmentInput ? investmentInput.value.trim() : '';
            
            if (currentCompany === companyName.trim()) {
                console.log('✅ Found matching row for:', companyName);
                
                const zakatInput = row.querySelector('.zakat-amount');
                if (zakatInput) {
                    zakatInput.value = zakatValue;
                    zakatInput.style.background = '#d1fae5';
                    zakatInput.style.borderColor = '#10b981';

                    setTimeout(() => {
                        zakatInput.style.background = '';
                    }, 2000);

                    applied = true;
                    targetRow = row;
                    targetButton = row.querySelector('td:nth-child(4) button:first-child');
                }
            }
        });

        if (applied && targetRow && targetButton) {
            rowValidationStatus[companyName] = 'saved';
            console.log('✅ Status updated to SAVED for:', companyName);
            
            targetButton.style.cssText = `
                border: 2px solid #10b981 !important;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
                opacity: 1 !important;
                cursor: pointer !important;
                background: transparent !important;
            `;
            
            targetButton.classList.add('edit-btn-saved');
            targetButton.classList.remove('edit-btn-opened', 'edit-btn-pending');
            targetButton.setAttribute('data-status', 'saved');
        }

        setTimeout(() => {
            const tab = document.getElementById(tabId);
            const panel = document.getElementById(`panel-${tabId}`);
            
            if (tab) tab.remove();
            if (panel) panel.remove();

            switchTab('main-tab');
            checkAndHideTabsBar();

            if (applied) {
                showToast('Success', `Data from ${companyName} saved successfully!`, 'success');
            }
            
            setTimeout(() => {
                const rows2 = document.querySelectorAll('.modal-table tbody tr');
                rows2.forEach(row => {
                    const investmentInput = row.querySelector('td:nth-child(2) input');
                    if (investmentInput && investmentInput.value.trim() === companyName.trim()) {
                        const btn = row.querySelector('td:nth-child(4) button:first-child');
                        if (btn) {
                            btn.style.cssText = `
                                border: 2px solid #10b981 !important;
                                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
                                opacity: 1 !important;
                                cursor: pointer !important;
                            `;
                            btn.classList.add('edit-btn-saved');
                            btn.setAttribute('data-status', 'saved');
                        }
                    }
                });
                
                // ✅ تحقق من جاهزية جميع الصفوف
                checkAllRowsCompleted();
                
            }, 100);
            
        }, 50);
    }

    function switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        const tab = document.getElementById(tabId);
        const panel = document.getElementById(`panel-${tabId}`);

        if (tab) {
            tab.classList.add('active');
            activeTabId = tabId;
        }

        if (panel) {
            panel.classList.add('active');
        }
    }

    function closeTab(tabId, event) {
        if (event) event.stopPropagation();
        if (tabId === 'main-tab') return;

        const tab = document.getElementById(tabId);
        const companyName = tab ? tab.getAttribute('data-company') : null;
        const panel = document.getElementById(`panel-${tabId}`);

        const wasActive = tab && tab.classList.contains('active');

        if (tab) tab.remove();
        if (panel) panel.remove();

        if (companyName && rowValidationStatus[companyName] === 'opened') {
            const rows = document.querySelectorAll('.modal-table tbody tr');
            rows.forEach(row => {
                const investmentInput = row.querySelector('td:nth-child(2) input');
                if (investmentInput && investmentInput.value.trim() === companyName) {
                    updateButtonBorder(row, 'opened');
                }
            });
        }

        if (wasActive) switchTab('main-tab');

        checkAndHideTabsBar();
        
        // ✅ تحقق من جاهزية الصفوف
        checkAllRowsCompleted();
    }

    function closeTabByCompanyName(companyName) {
        const tabs = document.querySelectorAll('.tab');
        
        tabs.forEach(tab => {
            const tabCompanyName = tab.getAttribute('data-company');
            
            if (tabCompanyName === companyName && tab.id !== 'main-tab') {
                const tabId = tab.id;
                const panel = document.getElementById(`panel-${tabId}`);
                
                const wasActive = tab.classList.contains('active');
                
                tab.remove();
                if (panel) panel.remove();
                
                if (wasActive) {
                    switchTab('main-tab');
                }
            }
        });

        checkAndHideTabsBar();
    }

    function checkAndHideTabsBar() {
        const remainingTabs = document.querySelectorAll('.tab:not(.main-tab)');
        
        if (remainingTabs.length === 0) {
            const tabsBar = document.getElementById('tabsBar');
            if (tabsBar) {
                tabsBar.classList.remove('show');
            }
            
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.paddingTop = '';
            }
            
            const mainTab = document.getElementById('main-tab');
            if (mainTab) mainTab.remove();
            
            tabsInitialized = false;
            tabCounter = 0;
            activeTabId = 'main-tab';
        }
    }

    // ================================
    // ✅ التحقق من جاهزية جميع الصفوف
    // ================================
    function checkAllRowsCompleted() {
        const rows = document.querySelectorAll('.modal-table tbody tr');
        let allCompleted = true;
        let totalRows = 0;
        let completedRows = 0;

        rows.forEach(row => {
            const subReturnBtn = row.querySelector('[data-type="sub-return"]');
            const manualBtn = row.querySelector('[data-type="manual"]');
            const investmentInput = row.querySelector('td:nth-child(2) input');
            const companyName = investmentInput ? investmentInput.value.trim() : '';

            const isSubReturnActive = subReturnBtn && 
                (subReturnBtn.style.background === 'rgb(16, 185, 129)' || 
                 subReturnBtn.style.background === '#10b981');

            const isManualActive = manualBtn && 
                (manualBtn.style.background === 'rgb(16, 185, 129)' || 
                 manualBtn.style.background === '#10b981');

            // ✅ تحقق من Sub-return
            if (isSubReturnActive && companyName) {
                totalRows++;
                if (rowValidationStatus[companyName] === 'saved') {
                    completedRows++;
                } else {
                    allCompleted = false;
                }
            }

            // ✅ تحقق من Manual
            if (isManualActive) {
                totalRows++;
                const zakatInput = row.querySelector('.zakat-amount');
                const value = parseFloat(zakatInput.value.replace(/,/g, '')) || 0;
                if (value > 0) {
                    completedRows++;
                } else {
                    allCompleted = false;
                }
            }
        });

        console.log(`📊 Rows status: ${completedRows}/${totalRows} completed`);

        // ✅ تحديث زر Confirm & apply
        updateConfirmButton(allCompleted && totalRows > 0);

        return allCompleted && totalRows > 0;
    }

    // ================================
    // ✅ تحديث زر Confirm & apply
    // ================================
    function updateConfirmButton(isEnabled) {
        const confirmBtn = document.querySelector('.button-saves-modal');
        
        if (!confirmBtn) return;

        if (isEnabled) {
            // ✅ تفعيل الزر - أخضر
            confirmBtn.disabled = false;
            confirmBtn.style.cssText = `
                background: #10b981 !important;
                color: white !important;
                opacity: 1 !important;
                cursor: pointer !important;
                border: none !important;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
            `;
            confirmBtn.classList.add('btn-enabled');
            confirmBtn.classList.remove('btn-disabled');
            
            console.log('✅ Confirm button ENABLED');
        } else {
            // ✅ تعطيل الزر - رمادي
            confirmBtn.disabled = true;
            confirmBtn.style.cssText = `
                background: #9ca3af !important;
                color: #d1d5db !important;
                opacity: 0.6 !important;
                cursor: not-allowed !important;
                border: none !important;
            `;
            confirmBtn.classList.add('btn-disabled');
            confirmBtn.classList.remove('btn-enabled');
            
            console.log('🔒 Confirm button DISABLED');
        }
    }

    // ================================
    // ✅ Validation قبل الحفظ
    // ================================
    function validateModalData() {
        const rows = document.querySelectorAll('.modal-table tbody tr');
        const invalidRows = [];

        rows.forEach(row => {
            const subReturnBtn = row.querySelector('[data-type="sub-return"]');
            const manualBtn = row.querySelector('[data-type="manual"]');
            const investmentInput = row.querySelector('td:nth-child(2) input');
            const companyName = investmentInput ? investmentInput.value.trim() : '';

            const isSubReturnActive = subReturnBtn && 
                (subReturnBtn.style.background === 'rgb(16, 185, 129)' || 
                 subReturnBtn.style.background === '#10b981');

            const isManualActive = manualBtn && 
                (manualBtn.style.background === 'rgb(16, 185, 129)' || 
                 manualBtn.style.background === '#10b981');

            if (isSubReturnActive && companyName) {
                if (rowValidationStatus[companyName] !== 'saved') {
                    invalidRows.push(companyName);
                    if (rowValidationStatus[companyName] === 'pending') {
                        updateButtonBorder(row, 'pending');
                    } else {
                        updateButtonBorder(row, 'opened');
                    }
                }
            }

            if (isManualActive) {
                const zakatInput = row.querySelector('.zakat-amount');
                const value = parseFloat(zakatInput.value.replace(/,/g, '')) || 0;
                if (value <= 0) {
                    invalidRows.push(companyName + ' (Manual)');
                    updateButtonBorder(row, 'pending');
                }
            }
        });

        if (invalidRows.length > 0) {
            showToast('Validation Error', `Please complete data for: ${invalidRows.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    // ================================
    // ✅ حفظ وإغلاق
    // ================================
    function saveAndCloseZacat() {
        console.log('💾 Attempting to save...');
        
        // ✅ تحقق من جاهزية جميع الصفوف
        if (!checkAllRowsCompleted()) {
            console.error('❌ Not all rows completed');
            showToast('Error', 'Please complete all required fields', 'error');
            return;
        }
        
        // ✅ Validation إضافية
        if (typeof validateModalData === 'function') {
            if (!validateModalData()) {
                return;
            }
        }
        
        console.log('✅ All validations passed, saving...');
        
        closeConfirmModal();
        
        if (currentMainModal) {
            currentMainModal.classList.remove('show');
            currentMainModal.style.display = 'none';
        }

        cleanupTabs();

        if (typeof showToast === 'function') {
            showToast('Success', 'Data saved successfully!', 'success');
        }
        
        // ✅ تأكد من إظهار المحتوى الرئيسي
        setTimeout(() => {
            const mainContainer = document.querySelector('.container-main');
            if (mainContainer) {
                mainContainer.style.display = 'block';
                mainContainer.style.visibility = 'visible';
                mainContainer.style.opacity = '1';
            }
            
            document.body.style.display = 'block';
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }, 100);
        
        console.log('✅ Save completed');
    }

    function showToast(title, message, type = 'info') {
        const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6' };
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: white; border-left: 4px solid ${colors[type]}; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 16px 20px; min-width: 300px; z-index: 10001;`;
        toast.innerHTML = `<div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${title}</div><div style="font-size: 14px; color: #6B7280;">${message}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    // ================================
    // ✅ Cleanup Functions
    // ================================
    function openConfirmModal() {
        const confirmModal = document.getElementById('modal-confirm-save');
        if (confirmModal) {
            confirmModal.classList.add('show');
            console.log('✅ Confirm modal opened');
        }
    }

    function closeConfirmModal() {
        const confirmModal = document.getElementById('modal-confirm-save');
        if (confirmModal) {
            confirmModal.classList.remove('show');
            console.log('✅ Confirm modal closed');
        }
    }

    function cleanupTabs() {
        const tabsBar = document.getElementById('tabsBar');
        if (tabsBar) {
            tabsBar.classList.remove('show');
            tabsBar.style.display = 'none';
        }
        
        const modalContent = currentMainModal?.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.paddingTop = '';
        }
        
        document.querySelectorAll('#tabsList .tab').forEach(tab => tab.remove());
        document.querySelectorAll('#dynamicPanels .tab-panel').forEach(panel => panel.remove());
        
        tabsInitialized = false;
        tabCounter = 0;
        activeTabId = 'main-tab';
    }