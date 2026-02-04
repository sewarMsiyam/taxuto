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

        // ✅ تعطيل زر Edit
        const editBtn = row.querySelector('td:nth-child(4) button:first-child');
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.cursor = 'not-allowed';
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

        // ✅ تفعيل زر Edit
        const editBtn = row.querySelector('td:nth-child(4) button:first-child');
        const investmentInput = row.querySelector('td:nth-child(2) input');
        const companyName = investmentInput ? investmentInput.value.trim() : '';

        if (editBtn) {
            editBtn.disabled = false;
            editBtn.style.opacity = '1';
            editBtn.style.cursor = 'pointer';
            editBtn.setAttribute('data-company', companyName);
            editBtn.classList.add('edit-btn-active');
        }

        // ✅ فتح Tab في الخلفية (بدون الانتقال)
        openSubReturnInBackground(companyName);
    }
});

// ✅ Event listener لزر Edit
document.addEventListener('click', function(e) {
    const button = e.target.closest('td:nth-child(4) button:first-child');
    if (!button || button.disabled) return;

    const companyName = button.getAttribute('data-company');
    
    if (companyName && button.classList.contains('edit-btn-active')) {
        e.preventDefault();
        goToTab(companyName);
    }
});

// ✅ الانتقال إلى Tab موجود
function goToTab(companyName) {
    const existingTab = Array.from(document.querySelectorAll('.tab')).find(tab => 
        tab.getAttribute('data-company') === companyName
    );

    if (existingTab && existingTab.id !== 'main-tab') {
        switchTab(existingTab.id);
        showToast('Info', `Switched to ${companyName}`, 'info');
    } else {
        alert(`⚠️ Tab for ${companyName} not found!`);
    }
}

// ✅ فتح Tab في الخلفية (بدون الانتقال)
function openSubReturnInBackground(companyName, rowNumber = '') {
    if (!tabsInitialized) {
        initializeTabs();
        tabsInitialized = true;
    }

    const tabDisplayName = rowNumber ? `${rowNumber}. ${companyName}` : companyName;

    // ✅ تحقق إذا في tab مفتوح لنفس الشركة
    const existingTab = Array.from(document.querySelectorAll('.tab')).find(tab => 
        tab.getAttribute('data-company') === companyName
    );

    if (existingTab && existingTab.id !== 'main-tab') {
        // ✅ Tab موجود، ما نفتح واحد جديد
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

    // ✅ لا نفعّل الـ Tab (يبقى في الخلفية)
    console.log(`✅ Created tab in background: ${companyName}`);
}

// ================================
// ✅ Alert قابل للسحب (للاستخدام في all sub-returns فقط)
// ================================
function showDraggableAlert() {
    const existingAlert = document.querySelector('.custom-alert-draggable');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = 'custom-alert-draggable';
    alert.innerHTML = `
        <div class="custom-alert-content-draggable">
            <div class="custom-alert-header-draggable" id="alert-header">
                <div class="alert-drag-icon">
                    <i class="fa-solid fa-grip-vertical"></i>
                </div>
                <div class="alert-title">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    تنبيه هام
                </div>
                <button class="alert-close-btn" onclick="this.closest('.custom-alert-draggable').remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="custom-alert-body-draggable">
                <p style="font-size: 15px; line-height: 1.8; color: #374151;">
                    سيتم إنشاء إقرارات فرعية ويلزم تعبئتها بالكامل وحفظ لكل إقرار للانتقال للمرحلة التانية
                </p>
            </div>
            <div class="custom-alert-footer-draggable">
                <button class="alert-btn alert-btn-action" onclick="confirmAllSubReturns()">
                    <i class="fa-solid fa-check"></i>
                    متابعة
                </button>
                <button class="alert-btn alert-btn-cancel" onclick="this.closest('.custom-alert-draggable').remove()">
                    <i class="fa-solid fa-times"></i>
                    إلغاء
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

function confirmAllSubReturns() {
    const alert = document.querySelector('.custom-alert-draggable');
    if (alert) alert.remove();
    
    openAllSubReturnsDirectly();
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
                        <div style="width: 120px; height: 120px; margin: 0 auto 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);">
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

function openAllSubReturns() {
    showDraggableAlert();
}

function openAllSubReturnsDirectly() {
    const subReturnButtons = document.querySelectorAll('.modal-table tbody .btn-calculation[data-type="sub-return"]');
    
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
        
        button.style.background = '#10b981';
        button.style.color = '#fff';
        
        const manualBtn = row.querySelector('[data-type="manual"]');
        if (manualBtn) {
            manualBtn.style.background = '';
            manualBtn.style.color = '';
        }
        
        const zakatInput = row.querySelector('.zakat-amount');
        if (zakatInput) {
            zakatInput.readOnly = true;
            zakatInput.style.background = '';
            zakatInput.style.borderColor = '';
            
            if (zakatInput.value && zakatInput.value !== '0.00') {
                zakatInput.value = '0.00';
            }
        }

        // ✅ تفعيل زر Edit
        const editBtn = row.querySelector('td:nth-child(4) button:first-child');
        const investmentInput = row.querySelector('td:nth-child(2) input');
        const companyName = investmentInput ? investmentInput.value.trim() : '';

        if (editBtn && companyName) {
            editBtn.disabled = false;
            editBtn.style.opacity = '1';
            editBtn.style.cursor = 'pointer';
            editBtn.setAttribute('data-company', companyName);
            editBtn.classList.add('edit-btn-active');
        }
        
        const rowNumberInput = row.querySelector('td:nth-child(1) input');
        const rowNumber = rowNumberInput ? rowNumberInput.value.trim() : (index + 1);
        
        if (companyName && companyName !== '') {
            openSubReturnInBackground(companyName, rowNumber);
            openedCount++;
        }
    });

    setTimeout(() => {
        showToast('Success', `Opened ${openedCount} sub-returns!`, 'success');
    }, 300);
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

function formatNumber(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showToast(title, message, type = 'info') {
    const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6' };
    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; top: 80px; right: 20px; background: white; border-left: 4px solid ${colors[type]}; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 16px 20px; min-width: 300px; z-index: 10001;`;
    toast.innerHTML = `<div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${title}</div><div style="font-size: 14px; color: #6B7280;">${message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}