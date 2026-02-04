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

            button.style.background = '#3CB58B';
            button.style.color = '#fff';

            const otherBtn = row.querySelector('[data-type="sub-return"]');
            if (otherBtn) {
                otherBtn.style.background = '';
                otherBtn.style.color = '';
            }

            // ✅ حذف الـ Tab المفتوحة
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

            showDraggableAlert(row);

            zakatInput.readOnly = true;
            zakatInput.style.background = '';
            zakatInput.style.borderColor = '';

            button.style.background = '#3CB58B';
            button.style.color = '#fff';

            const otherBtn = row.querySelector('[data-type="manual"]');
            if (otherBtn) {
                otherBtn.style.background = '';
                otherBtn.style.color = '';
            }
        }
    });

    // ================================
    // ✅ Alert قابل للسحب
    // ================================
    function showDraggableAlert(row) {
        const existingAlert = document.querySelector('.custom-alert-draggable');
        if (existingAlert) existingAlert.remove();

        const investmentInput = row.querySelector('td:nth-child(2) input');
        const companyName = investmentInput ? investmentInput.value : 'Company';

        const alert = document.createElement('div');
        alert.className = 'custom-alert-draggable';
        alert.setAttribute('data-company', companyName);
        alert.innerHTML = `
            <div class="custom-alert-content-draggable">
                <div class="custom-alert-header-draggable" id="alert-header">
                    <div class="alert-drag-icon">
                        <i class="fa-solid fa-grip-vertical"></i>
                    </div>
                    <div class="alert-title">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        Sub-return Required
                    </div>
                    <button class="alert-close-btn" onclick="this.closest('.custom-alert-draggable').remove()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="custom-alert-body-draggable">
                    <p>This calculation requires sub-return data from <strong>${companyName}</strong>.</p>
                    <p>Please ensure all subsidiary returns are filed before proceeding.</p>
                </div>
                <div class="custom-alert-footer-draggable">
                    <button class="alert-btn alert-btn-action" onclick="handleSubReturnAction(this)">
                        <i class="fa-solid fa-file-import"></i>
                        Import Sub-return
                    </button>
                    <button class="alert-btn alert-btn-cancel" onclick="this.closest('.custom-alert-draggable').remove()">
                        <i class="fa-solid fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(alert);
        makeDraggable(alert);
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('#alert-header');

        if (header) {
            header.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.right = 'auto';
            element.style.transform = 'none';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function handleSubReturnAction(button) {
        const alert = button.closest('.custom-alert-draggable');
        const companyName = alert.getAttribute('data-company') || 'Company';
        
        if (alert) alert.remove();

        openSubReturn(companyName);
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

        // ✅ اسم الـ Tab
        const tabDisplayName = rowNumber ? `${rowNumber}. ${companyName}` : companyName;

        // ✅ تحقق إذا في tab مفتوح لنفس الشركة
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
                            <div style="width: 120px; height: 120px; margin: 0 auto 30px; background: linear-gradient(135deg, #3CB58B 0%, #2a9d7a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(60, 181, 139, 0.3);">
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
                                <button onclick="submitSubReturnData('${companyName}', '${tabId}')" style="padding: 14px 28px; background: #3CB58B; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px;">
                                    إرسال
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    function calculateSubReturnTotal(tabId) {
        const revenueInput = document.getElementById(`revenue-${tabId}`);
        const expensesInput = document.getElementById(`expenses-${tabId}`);
        const netProfitInput = document.getElementById(`netprofit-${tabId}`);
        const zakatInput = document.getElementById(`zakat-${tabId}`);

        if (revenueInput && expensesInput && netProfitInput && zakatInput) {
            const revenue = parseFloat(revenueInput.value.replace(/,/g, '')) || 0;
            const expenses = parseFloat(expensesInput.value.replace(/,/g, '')) || 0;
            const netProfit = revenue - expenses;
            const zakat = netProfit * 0.025;

            netProfitInput.value = formatNumber(netProfit);
            zakatInput.value = formatNumber(zakat);
        }
    }

    function submitSubReturnData(companyName, tabId) {
        const crNumber = document.getElementById(`cr-number-${tabId}`).value;
        const taxId = document.getElementById(`tax-id-${tabId}`).value;
        const revenue = document.getElementById(`revenue-${tabId}`).value;
        const expenses = document.getElementById(`expenses-${tabId}`).value;

        if (!crNumber || !taxId || !revenue || !expenses) {
            alert('⚠️ Please fill all required fields (*)');
            return;
        }

        const zakatValue = document.getElementById(`zakat-${tabId}`).value;

        const rows = document.querySelectorAll('.modal-table tbody tr');
        let applied = false;

        rows.forEach(row => {
            const investmentInput = row.querySelector('td:nth-child(2) input');
            if (investmentInput && investmentInput.value.trim() === companyName.trim()) {
                const zakatInput = row.querySelector('.zakat-amount');
                if (zakatInput) {
                    zakatInput.value = zakatValue;
                    zakatInput.style.background = '#ecf9f4';
                    zakatInput.style.borderColor = '#3CB58B';

                    setTimeout(() => {
                        zakatInput.style.background = '';
                        zakatInput.style.borderColor = '';
                    }, 2000);

                    applied = true;
                }
            }
        });

        closeTab(tabId);
        switchTab('main-tab');

        if (applied) {
            showToast('Success', `Data from ${companyName} applied successfully!`, 'success');
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

    // ✅ إغلاق Tab
    function closeTab(tabId, event) {
        if (event) event.stopPropagation();
        if (tabId === 'main-tab') return;

        const tab = document.getElementById(tabId);
        const panel = document.getElementById(`panel-${tabId}`);

        const wasActive = tab && tab.classList.contains('active');

        if (tab) tab.remove();
        if (panel) panel.remove();

        if (wasActive) switchTab('main-tab');

        // ✅ تحقق وإخفاء الشريط
        checkAndHideTabsBar();
    }

    // ✅ إغلاق Tab حسب اسم الشركة
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
                
                console.log(`🗑️ Deleted tab: ${companyName}`);
            }
        });

        // ✅ تحقق وإخفاء الشريط
        checkAndHideTabsBar();
    }

    // ✅ تحقق وإخفاء الشريط إذا ما بقي tabs
    function checkAndHideTabsBar() {
        const remainingTabs = document.querySelectorAll('.tab:not(.main-tab)');
        
        console.log('🔍 Tabs remaining:', remainingTabs.length);
        
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
            
            console.log('✅ Tabs bar hidden - all tabs closed');
        }
    }

    // ✅ فتح كل الصفوف كـ Tabs
function openAllSubReturns() {
    const subReturnButtons = document.querySelectorAll('.modal-table tbody .btn-calculation[data-type="sub-return"]');
    
    console.log('🔍 عدد أزرار Sub-return:', subReturnButtons.length);
    
    if (subReturnButtons.length === 0) {
        alert('⚠️ No sub-return buttons found!');
        return;
    }

    if (!tabsInitialized) {
        initializeTabs();
        tabsInitialized = true;
    }

    let openedCount = 0;

    subReturnButtons.forEach((button, index) => {
        const row = button.closest('tr');
        
        if (!row) return;
        
        // ✅ تفعيل زر Sub-return
        button.style.background = '#3CB58B';
        button.style.color = '#fff';
        
        // ✅ إلغاء تفعيل زر Manual
        const manualBtn = row.querySelector('[data-type="manual"]');
        if (manualBtn) {
            manualBtn.style.background = '';
            manualBtn.style.color = '';
        }
        
        // ✅ تعطيل input الزكاة
        const zakatInput = row.querySelector('.zakat-amount');
        if (zakatInput) {
            zakatInput.readOnly = true;
            zakatInput.style.background = '';
            zakatInput.style.borderColor = '';
            
            if (zakatInput.value && zakatInput.value !== '0.00') {
                zakatInput.value = '0.00';
            }
        }
        
        const rowNumberInput = row.querySelector('td:nth-child(1) input');
        const rowNumber = rowNumberInput ? rowNumberInput.value.trim() : (index + 1);
        
        const investmentInput = row.querySelector('td:nth-child(2) input');
        const companyName = investmentInput ? investmentInput.value.trim() : '';
        
        console.log(`📌 صف ${index + 1}: رقم=${rowNumber}, شركة=${companyName}`);
        
        if (companyName && companyName !== '') {
            openSubReturn(companyName, rowNumber);
            openedCount++;
        }
    });

    setTimeout(() => {
        showToast('Success', `Opened ${openedCount} sub-returns!`, 'success');
    }, 300);
}
    // ✅ إخفاء الشريط عند إغلاق Modal
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
            
            console.log('✅ Modal closed - tabs reset');
        }
    });

    // ✅ Utilities
    function formatNumber(num) {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function showToast(title, message, type = 'info') {
        const colors = { success: '#3CB58B', error: '#EF4444', info: '#3B82F6' };
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: white; border-left: 4px solid ${colors[type]}; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 16px 20px; min-width: 300px; z-index: 10001;`;
        toast.innerHTML = `<div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${title}</div><div style="font-size: 14px; color: #6B7280;">${message}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }