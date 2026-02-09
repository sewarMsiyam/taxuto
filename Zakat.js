   // ================================
    // modal-Zakat-Entities
    // ================================
    function startTutorial() {
        const driver = window.driver.js.driver({
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            steps: [
                {
                    element: '.modal-table tbody tr:first-child .btn-calculation[data-type="sub-return"]',
                    popover: {
                        title: 'الخطوة 1: اختر نوع الحساب',
                        description: 'اختر <strong>Sub-return</strong> لإنشاء إقرار فرعي، أو <strong>Manual</strong> لإدخال القيمة يدوياً',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: '.btn-open-all-tabs',
                    popover: {
                        title: 'الخطوة 2: اضغط على "Prepare sub-returns"',
                        description: 'بعد اختيار <strong>Sub-return</strong> في الصفوف المطلوبة، اضغط على هذا الزر لتفعيل أيقونات التعديل',
                        side: "top",
                        align: 'start'
                    }
                },
                {
                    element: '.modal-table tbody tr:first-child td:nth-child(4) button:first-child',
                    popover: {
                        title: 'الخطوة 3: اضغط على أيقونة القلم',
                        description: 'بعد تفعيل الأيقونات، اضغط على <strong>أيقونة القلم</strong> لفتح نموذج تعبئة الإقرار الفرعي',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    popover: {
                        title: '🎉 تم!',
                        description: 'الآن يمكنك تعبئة الإقرارات الفرعية وحفظها. كرر الخطوات لكل شركة.',
                    }
                }
            ],
            nextBtnText: 'التالي',
            prevBtnText: 'السابق',
            doneBtnText: 'إنهاء',
            progressText: '{{current}} من {{total}}'
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

        // ✅ تشغيل التوضيح فقط لـ modal-Zakat-Entities وفي أول مرة
        if (modalId === 'modal-Zakat-Entities') {
            const hasSeenTutorial = localStorage.getItem('zakatEntitiesTutorialSeen');
            
            if (!hasSeenTutorial) {
                setTimeout(() => {
                    startTutorial();
                    // ✅ تسجيل أنه شاف التوضيح
                    localStorage.setItem('zakatEntitiesTutorialSeen', 'true');
                }, 800);
            } else {
                console.log('ℹ️ Tutorial already seen - skipping');
            }
        }

        console.log('✅ Modal opened:', modalId);
    } else {
        console.warn('⚠️ Modal not found:', modalId);
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

            const investmentInput = row.querySelector('td:nth-child(2) input');
            const companyName = investmentInput ? investmentInput.value.trim() : '';
            
            if (companyName) {
                closeTabByCompanyName(companyName);
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

            console.log(`✅ Sub-return selected`);
        }
    });

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
                    <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 10px;">تنبيه هام</h2>
                </div>
                <div class="prepare-alert-body">
                    <p style="font-size: 18px; line-height: 1.8; color: #374151; text-align: center; margin-bottom: 20px;">
                        سيتم إنشاء إقرارات فرعية ويلزم تعبئتها بالكامل وحفظ لكل إقرار للانتقال للمرحلة التانية
                    </p>
                    <p style="font-size: 16px; color: #6b7280; text-align: center; margin-bottom: 30px;">
                        <i class="fa-solid fa-hand-pointer"></i> اضغط على أيقونة القلم <i class="fa-solid fa-pen"></i> لفتح كل إقرار
                    </p>
                </div>
                <div class="prepare-alert-footer">
                    <button class="prepare-alert-btn" onclick="confirmPrepare()">
                        <i class="fa-solid fa-check"></i>
                        موافق
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

        showToast('Success', 'تم تفعيل أيقونات القلم للإقرارات الفرعية', 'success');
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
                }
            }
        });

        console.log(`✅ Activated ${activatedCount} edit buttons`);
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
                                مرحباً في الإقرار الجديد
                            </h1>
                            
                            <p style="font-size: 20px; color: #6b7280; margin-bottom: 8px;">
                                ${companyName}
                            </p>
                            
                            <p style="font-size: 16px; color: #9ca3af;">
                                يرجى ملء البيانات المطلوبة أدناه
                            </p>
                        </div>

                        <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <div style="display: flex; gap: 15px; justify-content: center;">
                                <button onclick="closeTab('${tabId}')" style="padding: 14px 28px; background: white; border: 2px solid #e5e7eb; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
                                    إلغاء
                                </button>
                                <button onclick="submitSubReturnData('${companyName}', '${tabId}')" style="padding: 14px 28px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
                                    إرسال
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    function submitSubReturnData(companyName, tabId) {
        const zakatValue = '0.00';

        const rows = document.querySelectorAll('.modal-table tbody tr');
        let applied = false;

        rows.forEach(row => {
            const investmentInput = row.querySelector('td:nth-child(2) input');
            if (investmentInput && investmentInput.value.trim() === companyName.trim()) {
                const zakatInput = row.querySelector('.zakat-amount');
                if (zakatInput) {
                    zakatInput.value = zakatValue;
                    zakatInput.style.background = '#d1fae5';
                    zakatInput.style.borderColor = '#10b981';

                    setTimeout(() => {
                        zakatInput.style.background = '';
                        zakatInput.style.borderColor = '';
                    }, 2000);

                    applied = true;
                }
            }
        });

        switchTab('main-tab');

        if (applied) {
            showToast('Success', `Data from ${companyName} saved successfully!`, 'success');
        }
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
        const panel = document.getElementById(`panel-${tabId}`);

        const wasActive = tab && tab.classList.contains('active');

        if (tab) tab.remove();
        if (panel) panel.remove();

        if (wasActive) switchTab('main-tab');

        checkAndHideTabsBar();
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

    document.addEventListener('click', function(e) {
        const closeBtn = e.target.closest('.modal-close, .button-close-modal');
        
        if (closeBtn) {
            const tabsBar = document.getElementById('tabsBar');
            if (tabsBar) {
                tabsBar.classList.remove('show');
            }
            
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.paddingTop = '';
            }
            
            document.querySelectorAll('.tab').forEach(tab => tab.remove());
            document.querySelectorAll('.tab-panel').forEach(panel => panel.remove());
            
            tabsInitialized = false;
            tabCounter = 0;
            activeTabId = 'main-tab';
        }
    });

    function showToast(title, message, type = 'info') {
        const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6' };
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: white; border-left: 4px solid ${colors[type]}; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 16px 20px; min-width: 300px; z-index: 10001;`;
        toast.innerHTML = `<div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${title}</div><div style="font-size: 14px; color: #6B7280;">${message}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }