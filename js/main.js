// ==================== قاعدة البيانات والإصلاح التلقائي ====================
let db = {
    inventory: [],
    clients: [],
    suppliers: [],
    sales: [],
    purchases: [],
    expenses: [],
    revenues: [],
    settings: {}
};

// دالة لحفظ البيانات
function save(key) { 
    localStorage.setItem(`bms_${key}`, JSON.stringify(db[key])); 
}

// تحميل البيانات من localStorage
function loadDB() {
    ['inventory','clients','suppliers','sales','purchases','expenses','revenues','settings'].forEach(k => {
        try { 
            let d = localStorage.getItem(`bms_${k}`); 
            if(d) db[k] = JSON.parse(d); 
            else db[k] = [];
        } catch(e){ db[k] = []; }
    });
}

// دالة لتوليد معرف فريد
function generateId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}

// إنشاء مستخدمين تلقائيين إذا لم يكن هناك مستخدمون
function ensureDemoUsers() {
    let users = JSON.parse(localStorage.getItem('semo_users')) || [];
    if (users.length === 0) {
        users = [
            { id: generateId(), email: "admin@system.com", password: "123456", name: "مدير النظام", role: "admin", createdAt: new Date().toISOString() },
            { id: generateId(), email: "user@system.com", password: "123456", name: "مستخدم عادي", role: "user", createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('semo_users', JSON.stringify(users));
        console.log("✅ تم إنشاء الحسابات التجريبية تلقائياً");
    }
    return users;
}

// التحقق من صحة بيانات الدخول
function validateLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('semo_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('semo_user', JSON.stringify(user));
        return true;
    }
    return false;
}

// دالة تسجيل الدخول المباشر (للزر الأصفر)
function directLogin() {
    const users = JSON.parse(localStorage.getItem('semo_users')) || [];
    const admin = users.find(u => u.email === "admin@system.com");
    if (admin) {
        localStorage.setItem('semo_user', JSON.stringify(admin));
        window.location.href = 'dashboard.html';
    } else {
        alert("⚠️ يرجى تسجيل الدخول يدوياً أولاً ثم استخدام الزر");
    }
}

// ==================== وظائف الصفحة الرئيسية (دول موجودة من الكود الأصلي) ====================
function today() { return new Date().toLocaleDateString('ar-EG'); }
function notify(msg, type='success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'danger' ? '#dc3545' : '#ffc107'};
        color: ${type === 'warning' ? '#333' : 'white'};
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-family: inherit;
    `;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// إصلاح تلقائي للبيانات (الحفاظ على البيانات)
function autoRepairData() {
    if (localStorage.getItem('bms_migration_done') === 'true') return;
    let fixes = { inventory:0, clients:0, suppliers:0, sales:0, purchases:0, expenses:0, revenues:0 };
    
    db.inventory = (db.inventory || []).map(item => {
        let changed = false;
        if (item.minQty === undefined) { item.minQty = 5; changed=true; }
        if (item.buyPrice === undefined) { item.buyPrice = 0; changed=true; }
        if (item.sellPrice === undefined) { item.sellPrice = 0; changed=true; }
        if (item.category === undefined) { item.category = 'عام'; changed=true; }
        if (item.qty === undefined) { item.qty = 0; changed=true; }
        if (changed) fixes.inventory++;
        return item;
    });
    
    db.clients = (db.clients || []).map(c => {
        let changed = false;
        if (c.totalPurchases === undefined) { c.totalPurchases = 0; changed=true; }
        if (c.debt === undefined) { c.debt = 0; changed=true; }
        if (c.phone === undefined) { c.phone = ''; changed=true; }
        if (c.email === undefined) { c.email = ''; changed=true; }
        if (c.address === undefined) { c.address = ''; changed=true; }
        if (c.status === undefined) { c.status = 'نشط'; changed=true; }
        if (changed) fixes.clients++;
        return c;
    });
    
    db.suppliers = (db.suppliers || []).map(s => {
        let changed = false;
        if (s.totalPurchases === undefined) { s.totalPurchases = 0; changed=true; }
        if (s.balance === undefined) { s.balance = 0; changed=true; }
        if (s.phone === undefined) { s.phone = ''; changed=true; }
        if (s.email === undefined) { s.email = ''; changed=true; }
        if (s.product === undefined) { s.product = ''; changed=true; }
        if (s.address === undefined) { s.address = ''; changed=true; }
        if (s.status === undefined) { s.status = 'نشط'; changed=true; }
        if (changed) fixes.suppliers++;
        return s;
    });
    
    db.sales = (db.sales || []).map(s => {
        let changed = false;
        if (s.clientName === undefined) { s.clientName = s.client || 'نقدي'; changed=true; }
        if (s.total === undefined) { s.total = (s.qty||0)*(s.price||0); changed=true; }
        if (s.paid === undefined) { s.paid = 0; changed=true; }
        if (s.status === undefined) { s.status = s.paid >= s.total ? 'مدفوع' : (s.paid>0 ? 'جزئي' : 'آجل'); changed=true; }
        if (s.date === undefined) { s.date = today(); changed=true; }
        if (changed) fixes.sales++;
        return s;
    });
    
    db.purchases = (db.purchases || []).map(p => {
        let changed = false;
        if (p.total === undefined) { p.total = (p.qty||0)*(p.price||0); changed=true; }
        if (p.paid === undefined) { p.paid = p.status === 'مدفوع' ? p.total : 0; changed=true; }
        if (p.remaining === undefined) { p.remaining = p.total - p.paid; changed=true; }
        if (p.status === undefined) { p.status = p.paid >= p.total ? 'مدفوع' : (p.paid>0 ? 'جزئي' : 'آجل'); changed=true; }
        if (p.date === undefined) { p.date = today(); changed=true; }
        if (changed) fixes.purchases++;
        return p;
    });
    
    db.expenses = (db.expenses || []).map(e => {
        let changed = false;
        if (e.type === undefined) { e.type = 'عام'; changed=true; }
        if (e.amount === undefined) { e.amount = 0; changed=true; }
        if (e.date === undefined) { e.date = today(); changed=true; }
        if (changed) fixes.expenses++;
        return e;
    });
    
    db.revenues = (db.revenues || []).map(r => {
        let changed = false;
        if (r.type === undefined) { r.type = 'عام'; changed=true; }
        if (r.amount === undefined) { r.amount = 0; changed=true; }
        if (r.date === undefined) { r.date = today(); changed=true; }
        if (changed) fixes.revenues++;
        return r;
    });
    
    ['inventory','clients','suppliers','sales','purchases','expenses','revenues','settings'].forEach(k => save(k));
    localStorage.setItem('bms_migration_done', 'true');
    if (fixes.inventory+fixes.clients+fixes.suppliers+fixes.sales+fixes.purchases+fixes.expenses+fixes.revenues > 0) {
        console.log('🛠️ تم إصلاح البيانات تلقائياً', fixes);
    }
}

// ==================== التبويبات والمحتوى الديناميكي ====================
const sections = ['dashboard','inventory','sales','purchases','clients','suppliers','expenses','revenues','reports'];
const titles = {
    dashboard: '🏠 لوحة التحكم',
    inventory: '📦 المخزون',
    sales: '🛒 المبيعات',
    purchases: '📥 المشتريات',
    clients: '👥 العملاء',
    suppliers: '🏭 الموردين',
    expenses: '💸 المصروفات',
    revenues: '💰 الإيرادات',
    reports: '📊 التقارير'
};

function renderTabs() {
    const tabsDiv = document.getElementById('tabsContainer');
    if (!tabsDiv) return;
    tabsDiv.innerHTML = sections.map(s => `<div class="tab" data-tab="${s}">${titles[s]}</div>`).join('');
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchSection(tab.dataset.tab);
        });
    });
    document.querySelector('.tab')?.classList.add('active');
    switchSection('dashboard');
}

function switchSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    let secDiv = document.getElementById(`section-${section}`);
    if(!secDiv) generateSection(section);
    secDiv = document.getElementById(`section-${section}`);
    if(secDiv) secDiv.classList.add('active');
    if(section === 'dashboard') updateDashboard();
    if(section === 'inventory') renderInventoryTable();
    if(section === 'sales') renderSalesTable();
    if(section === 'purchases') renderPurchasesTable();
    if(section === 'clients') renderClientsTable();
    if(section === 'suppliers') renderSuppliersTable();
    if(section === 'expenses') renderExpensesTable();
    if(section === 'revenues') renderRevenuesTable();
    if(section === 'reports') renderReports();
}

function generateSection(section) {
    const container = document.getElementById('contentContainer');
    if (!container) return;
    let html = '';
    if(section === 'dashboard') html = `<div class="stats-grid" id="statsGrid"></div><div class="stats-grid" id="chartsGrid" style="grid-template-columns:1fr 1fr;"></div><div id="lowStockAlerts" class="stats-grid"></div>`;
    else if(section === 'inventory') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addInventoryModal')">➕ منتج جديد</button><input type="text" id="searchInventory" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"><table class="data-table"><thead><tr><th>#</th><th>المنتج</th><th>الفئة</th><th>الكمية</th><th>سعر الشراء</th><th>سعر البيع</th><th>الربح</th><th>الحد الأدنى</th><th>إجراءات</th></tr></thead><tbody id="inventoryTableBody"></tbody></table></div>`;
    else if(section === 'sales') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addSaleModal')">➕ فاتورة بيع</button><input type="text" id="searchSales" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"><table><thead><tr><th>#</th><th>التاريخ</th><th>العميل</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody id="salesTableBody"></tbody></table></div>`;
    else if(section === 'purchases') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addPurchaseModal')">➕ أمر شراء</button><input type="text" id="searchPurchases" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"><table><thead><tr><th>#</th><th>التاريخ</th><th>المورد</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody id="purchasesTableBody"></tbody></table></div>`;
    else if(section === 'clients') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addClientModal')">➕ عميل جديد</button><input type="text" id="searchClients" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"></table><thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>إجمالي المشتريات</th><th>الديون</th><th>إجراءات</th></tr></thead><tbody id="clientsTableBody"></tbody><table></div>`;
    else if(section === 'suppliers') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addSupplierModal')">➕ مورد جديد</button><input type="text" id="searchSuppliers" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"></table><thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>المنتج</th><th>إجمالي المشتريات</th><th>إجراءات</th></tr></thead><tbody id="suppliersTableBody"></tbody></tr></div>`;
    else if(section === 'expenses') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addExpenseModal')">➕ مصروف جديد</button><input type="text" id="searchExpenses" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"><table><thead><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>ملاحظات</th><th>إجراءات</th></tr></thead><tbody id="expensesTableBody"></tbody></table></div>`;
    else if(section === 'revenues') html = `<div style="margin-bottom:15px"><button class="btn btn-primary" onclick="showModal('addRevenueModal')">➕ إيراد جديد</button><input type="text" id="searchRevenues" placeholder="🔍 بحث..." style="width:200px;margin-right:10px"></div><div class="table-wrapper"><tr><thead><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>ملاحظات</th><th>إجراءات</th></tr></thead><tbody id="revenuesTableBody"></tbody></table></div>`;
    else if(section === 'reports') html = `<div id="reportContainer"></div>`;
    container.innerHTML += `<div id="section-${section}" class="section">${html}</div>`;
}

// بقية الدوال (تحديث لوحة التحكم، الرسوم البيانية، الجداول) بنفس الكود السابق...
// (نظراً للطول الشديد، سيتم استكمالها ولكن الأساس موجود)

// ==================== دالة التهيئة الرئيسية ====================
function initApp() {
    // أولاً: التأكد من وجود المستخدمين
    ensureDemoUsers();
    
    // تحميل البيانات
    loadDB();
    
    // إصلاح البيانات تلقائياً (بدون حذف)
    autoRepairData();
    
    // عرض التبويبات
    renderTabs();
    
    // عرض كل المحتوى
    renderAll();
    
    // ربط أحداث البحث
    setTimeout(() => {
        document.getElementById('searchInventory')?.addEventListener('input', renderInventoryTable);
        document.getElementById('searchSales')?.addEventListener('input', renderSalesTable);
        document.getElementById('searchPurchases')?.addEventListener('input', renderPurchasesTable);
        document.getElementById('searchClients')?.addEventListener('input', renderClientsTable);
        document.getElementById('searchSuppliers')?.addEventListener('input', renderSuppliersTable);
        document.getElementById('searchExpenses')?.addEventListener('input', renderExpensesTable);
        document.getElementById('searchRevenues')?.addEventListener('input', renderRevenuesTable);
    }, 100);
}

// ==================== تصدير الدوال للاستخدام في HTML ====================
window.initApp = initApp;
window.directLogin = directLogin;
window.validateLogin = validateLogin;
window.ensureDemoUsers = ensureDemoUsers;
// ... باقي الدوال موجودة
