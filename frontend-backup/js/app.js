// js/app.js
import {
  getAppState,
  loginAdmin,
  logoutAdmin,
  addOrder,
  addCustomer,
  updateCustomer,
  generateInvoice,
  recordPayment,
  toggleAutoReminders,
  updateVegetableCatalog,
  addVegetable,
  updateBusinessSettings,
  subscribe
} from './state.js';

// Router & Staging parameters
let currentView = 'dashboard';
let currentCustomerParams = null; // Stored parameters for customer QR order flow

// DOM Elements cache
const el = {
  // Login
  loginScreen: document.getElementById('login-screen'),
  loginForm: document.getElementById('login-form'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  loginErrorMsg: document.getElementById('login-error-msg'),
  demoShortcutBtn: document.getElementById('demo-credentials-shortcut'),
  
  // App layouts
  adminShell: document.getElementById('admin-shell'),
  customerShell: document.getElementById('customer-shell'),
  adminViewContent: document.getElementById('admin-view-content'),
  customerScreenView: document.getElementById('customer-screen-view'),
  sidebar: document.querySelector('.sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle-btn'),
  globalSearch: document.getElementById('global-search-bar'),
  headerDate: document.getElementById('header-today-date'),
  logoutBtn: document.getElementById('sidebar-logout-btn'),
  
  // Sidebar items
  menuItems: document.querySelectorAll('.menu-item'),
  
  // Modals
  modalAddCustomer: document.getElementById('modal-add-customer'),
  modalViewQr: document.getElementById('modal-view-qr'),
  modalGenerateInvoice: document.getElementById('modal-generate-invoice'),
  modalRecordPayment: document.getElementById('modal-record-payment'),
  modalAddVegetable: document.getElementById('modal-add-vegetable'),
  modalPrintInvoice: document.getElementById('modal-print-invoice'),
};

// State updates listener
subscribe((state) => {
  renderActiveView(state);
});

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupGlobalEvents();
  setupRouteHandler();
  // Set date in header
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.headerDate.textContent = new Date().toLocaleDateString('en-US', options);
  
  // Sync initial state
  const state = getAppState();
  handleRouting(state);
});

// Setup routing listener
window.addEventListener('hashchange', () => {
  const state = getAppState();
  handleRouting(state);
});

// Routing engine
function handleRouting(state) {
  const hash = window.location.hash || '#/dashboard';
  
  // Clean overlays on route change
  closeAllModals();

  if (hash.startsWith('#/customer-ordering')) {
    // Customer flow. Read parameters
    const params = new URLSearchParams(hash.split('?')[1] || '');
    currentCustomerParams = {
      customerId: params.get('id') || 'ccd',
      step: params.get('step') || 'auth'
    };
    
    el.adminShell.classList.add('hidden');
    el.loginScreen.classList.add('hidden');
    el.customerShell.classList.remove('hidden');
    
    renderCustomerOrderingView(state);
  } else {
    // Admin flows
    el.customerShell.classList.add('hidden');
    
    if (!state.session.isAdminLoggedIn) {
      el.adminShell.classList.add('hidden');
      el.loginScreen.classList.remove('hidden');
      renderLoginScreen();
    } else {
      el.loginScreen.classList.add('hidden');
      el.adminShell.classList.remove('hidden');
      
      // Determine page view
      const viewPath = hash.split('?')[0].replace('#/', '');
      const validViews = ['dashboard', 'orders', 'customers', 'customer-details', 'billing', 'payments', 'reports', 'settings'];
      
      if (validViews.includes(viewPath)) {
        currentView = viewPath;
      } else {
        currentView = 'dashboard';
      }
      
      // Highlight sidebar
      el.menuItems.forEach(item => {
        if (item.getAttribute('data-view') === currentView) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Show appropriate view section
      document.querySelectorAll('.view-section').forEach(sec => {
        if (sec.id === `view-${currentView}`) {
          sec.classList.remove('hidden');
        } else {
          sec.classList.add('hidden');
        }
      });
      
      renderActiveView(state);
    }
  }
}

// Global Event Listeners setup
function setupGlobalEvents() {
  // Login flow
  el.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = loginAdmin(el.loginUsername.value, el.loginPassword.value);
    if (success) {
      el.loginErrorMsg.classList.add('hidden');
      window.location.hash = '#/dashboard';
    } else {
      el.loginErrorMsg.classList.remove('hidden');
    }
  });

  el.demoShortcutBtn.addEventListener('click', () => {
    el.loginUsername.value = 'admin';
    el.loginPassword.value = 'admin';
    const success = loginAdmin('admin', 'admin');
    if (success) {
      window.location.hash = '#/dashboard';
    }
  });

  // Admin Logout
  el.logoutBtn.addEventListener('click', () => {
    logoutAdmin();
    window.location.hash = '#/login';
  });

  // Sidebar toggle for mobile
  el.sidebarToggle.addEventListener('click', () => {
    el.sidebar.classList.toggle('active');
  });

  // Sidebar navigation
  el.menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      window.location.hash = `#/${view}`;
      el.sidebar.classList.remove('active'); // Close drawer on mobile
    });
  });

  // Modals closing
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Close modals clicking outside
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Global search filtering
  el.globalSearch.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    filterDataGlobal(val);
  });

  // Wire modal form submissions
  setupModalFormSubmissions();
}

function setupRouteHandler() {
  // Add Customer actions
  document.getElementById('btn-add-customer').addEventListener('click', () => openModal(el.modalAddCustomer));
  document.getElementById('btn-dashboard-new-cust').addEventListener('click', () => openModal(el.modalAddCustomer));
  
  // Settings add vegetable
  document.getElementById('btn-settings-add-veg').addEventListener('click', () => openModal(el.modalAddVegetable));
  
  // Record payment button
  document.getElementById('btn-payments-record').addEventListener('click', () => {
    populatePaymentModalSelects();
    openModal(el.modalRecordPayment);
  });
  document.getElementById('btn-cust-detail-record-pay').addEventListener('click', () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const custId = params.get('id');
    populatePaymentModalSelects(custId);
    openModal(el.modalRecordPayment);
  });

  // WhatsApp Buying List Copy
  document.getElementById('btn-dashboard-whatsapp').addEventListener('click', () => {
    const state = getAppState();
    const buyingList = calculateBuyingRequirements(state);
    if (buyingList.length === 0) {
      alert("Today's Buying List is empty! No customer orders placed tonight.");
      return;
    }
    
    let text = `*PRAKRITI VEGETABLE SUPPLIER*\n*Today's Buying Requirements (${new Date().toLocaleDateString()})*\n-----------------------------\n`;
    buyingList.forEach(item => {
      text += `• ${item.name}: ${item.qty} ${item.unit}\n`;
    });
    text += `-----------------------------\nTotal items: ${buyingList.length}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert("Buying List copied to clipboard! You can paste and share it directly on WhatsApp.");
    });
  });

  // Payments auto reminders
  document.getElementById('auto-reminders-toggle').addEventListener('change', () => {
    const isChecked = toggleAutoReminders();
    document.getElementById('reminder-status-label').textContent = isChecked ? 'Active' : 'Disabled';
  });

  // Settings form submission
  document.getElementById('settings-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateBusinessSettings({
      businessName: document.getElementById('set-bus-name').value,
      ownerName: document.getElementById('set-owner-name').value,
      mobile: document.getElementById('set-mobile').value,
      upiId: document.getElementById('set-upi').value,
      address: document.getElementById('set-address').value,
    });
    alert('Business profile updated successfully!');
  });

  // Back to customers detail
  document.getElementById('btn-back-to-customers').addEventListener('click', () => {
    window.location.hash = '#/customers';
  });
}

function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Logic: Setup Modal Form handlers
function setupModalFormSubmissions() {
  // Add Customer Form
  document.getElementById('add-customer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const businessName = document.getElementById('add-cust-business').value;
    const ownerName = document.getElementById('add-cust-owner').value;
    const mobile = document.getElementById('add-cust-mobile').value;
    const paymentCycle = document.getElementById('add-cust-cycle').value;
    const notes = document.getElementById('add-cust-notes').value;
    
    addCustomer({ businessName, ownerName, mobile, paymentCycle, notes });
    closeAllModals();
    document.getElementById('add-customer-form').reset();
  });

  // Add Vegetable Catalog form
  document.getElementById('add-vegetable-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('add-veg-name').value;
    const category = document.getElementById('add-veg-category').value;
    const unit = document.getElementById('add-veg-unit').value;

    const res = addVegetable({ name, category, unit });
    if (!res) {
      alert("Vegetable with similar name already exists!");
    } else {
      closeAllModals();
      document.getElementById('add-vegetable-form').reset();
    }
  });

  // Record Payment Form
  document.getElementById('record-payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const customerId = document.getElementById('record-pay-customer').value;
    const invoiceId = document.getElementById('record-pay-invoice').value || null;
    const amount = document.getElementById('record-pay-amount').value;
    const method = document.getElementById('record-pay-method').value;
    const reference = document.getElementById('record-pay-ref').value;

    recordPayment({ customerId, invoiceId, amount, method, reference });
    closeAllModals();
    document.getElementById('record-payment-form').reset();
  });

  // Generate Invoice Form
  document.getElementById('generate-invoice-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const customerId = document.getElementById('invoice-form-cust-id').value;
    
    // Gather all rate inputs
    const state = getAppState();
    const pendingOrders = state.orders.filter(o => o.customerId === customerId && o.billStatus === 'Pending');
    const orderIds = pendingOrders.map(o => o.id);
    
    // Collect aggregated items
    const aggregatedItems = {};
    pendingOrders.forEach(o => {
      o.items.forEach(item => {
        if (!aggregatedItems[item.vegName]) {
          aggregatedItems[item.vegName] = 0;
        }
        aggregatedItems[item.vegName] += Number(item.quantity);
      });
    });

    const itemsWithRates = [];
    Object.keys(aggregatedItems).forEach(vegName => {
      const inputEl = document.getElementById(`rate-input-${vegName.replace(/\s+/g, '_')}`);
      const rate = inputEl ? Number(inputEl.value) : 0;
      itemsWithRates.push({
        vegName: vegName,
        quantity: aggregatedItems[vegName],
        rate: rate
      });
    });

    const newInvoice = generateInvoice(customerId, orderIds, itemsWithRates);
    closeAllModals();
    
    if (newInvoice) {
      // Prompt user with print receipt modal immediately
      showInvoiceReceipt(newInvoice.id);
    }
  });
}

// ----------------------------------------------------
// RENDERING FUNCTIONS FOR ALL ADMIN VIEWS
// ----------------------------------------------------

function renderLoginScreen() {
  el.loginUsername.value = '';
  el.loginPassword.value = '';
  el.loginErrorMsg.classList.add('hidden');
}

function renderActiveView(state) {
  // Sync admin profile footer
  const currentAdmin = state.session.currentUser || { name: 'Prakriti Owner', role: 'Owner' };
  document.getElementById('admin-profile-name').textContent = currentAdmin.name;
  
  switch (currentView) {
    case 'dashboard':
      renderDashboard(state);
      break;
    case 'orders':
      renderOrders(state);
      break;
    case 'customers':
      renderCustomers(state);
      break;
    case 'customer-details':
      renderCustomerDetails(state);
      break;
    case 'billing':
      renderBilling(state);
      break;
    case 'payments':
      renderPayments(state);
      break;
    case 'reports':
      renderReports(state);
      break;
    case 'settings':
      renderSettings(state);
      break;
  }
}

// 1. Dashboard View
function renderDashboard(state) {
  // Welcome tag
  document.getElementById('dashboard-welcome').innerHTML = `Welcome Back, ${state.settings.ownerName} 👋`;

  // Compute Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Today's orders count
  const todayOrders = state.orders.filter(o => o.orderTime.startsWith(todayStr));
  
  // Today's active ordering customers count
  const uniqueTodayCusts = new Set(todayOrders.map(o => o.customerId));
  
  // Today's collections
  const todayCollAmount = state.payments
    .filter(p => p.date.startsWith(todayStr))
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Pending Invoiced Payments (unpaid bills)
  const pendingInvoiced = state.invoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + (i.totalAmount - (i.amountPaid || 0)), 0);

  // Total Outstanding Ledger balance across everyone
  const totalOutstanding = state.customers.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0);

  // Render metric cards
  const statsContainer = document.getElementById('dashboard-stats-grid');
  statsContainer.innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Today's Orders</span>
      <span class="stat-value">${todayOrders.length}</span>
      <span class="stat-trend trend-neutral">From last night</span>
      <div class="stat-icon-wrapper">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-label">Today's Customers</span>
      <span class="stat-value">${uniqueTodayCusts.size}</span>
      <span class="stat-trend trend-up">Active ordering</span>
      <div class="stat-icon-wrapper">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-label">Today's Collection</span>
      <span class="stat-value">₹${todayCollAmount.toLocaleString('en-IN')}</span>
      <span class="stat-trend trend-up">Settle via UPI/Cash</span>
      <div class="stat-icon-wrapper">
        <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-label">Pending Invoices</span>
      <span class="stat-value">₹${pendingInvoiced.toLocaleString('en-IN')}</span>
      <span class="stat-trend trend-down">Billed but unpaid</span>
      <div class="stat-icon-wrapper">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-label">Outstanding Ledger</span>
      <span class="stat-value" style="color: #dc2626;">₹${totalOutstanding.toLocaleString('en-IN')}</span>
      <span class="stat-trend trend-down">Cumulative credit limit</span>
      <div class="stat-icon-wrapper">
        <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      </div>
    </div>
  `;

  // Render BUYING REQUIREMENTS LIST
  const buyingList = calculateBuyingRequirements(state);
  const buyingListContainer = document.getElementById('dashboard-buying-list');
  const buyingListTag = document.getElementById('buying-list-summary-tag');
  
  if (buyingList.length === 0) {
    buyingListTag.textContent = '0 items';
    buyingListContainer.innerHTML = `
      <div class="buying-list-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>No vegetable requirements computed for today yet.<br>Nightly customer orders will appear here automatically.</p>
      </div>
    `;
  } else {
    let totalKg = buyingList.reduce((sum, item) => sum + item.qty, 0);
    buyingListTag.textContent = `${buyingList.length} items (${totalKg} Kg/Bunch total)`;
    
    buyingListContainer.innerHTML = buyingList.map(item => `
      <div class="buying-item-tile" onclick="this.classList.toggle('checked')" style="cursor: pointer;">
        <div>
          <span class="buying-veg-name">${item.name}</span>
          <span class="buying-veg-category">${item.category}</span>
        </div>
        <span class="buying-veg-qty">${item.qty} <span style="font-size: 0.85rem; font-weight: 500;">${item.unit}</span></span>
      </div>
    `).join('');
  }

  // Render recent activity feeds (last 5 activities: orders + payments)
  const activities = [];
  state.orders.slice(0, 3).forEach(o => {
    activities.push({
      type: 'order',
      time: new Date(o.orderTime),
      text: `Order <strong>${o.id}</strong> placed by <strong>${o.customerName}</strong>: ${o.totalQuantity} items`
    });
  });
  state.payments.slice(0, 2).forEach(p => {
    activities.push({
      type: 'payment',
      time: new Date(p.date),
      text: `Payment of <strong>₹${p.amount.toLocaleString()}</strong> received from <strong>${p.customerName}</strong> via ${p.method}`
    });
  });
  
  // Sort descending
  activities.sort((a,b) => b.time - a.time);

  const activityContainer = document.getElementById('dashboard-activity-list');
  if (activities.length === 0) {
    activityContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No recent activity.</p>';
  } else {
    activityContainer.innerHTML = activities.map(act => `
      <div class="activity-item">
        <div class="activity-icon" style="background-color: ${act.type === 'order' ? 'var(--primary-light)' : '#eff6ff'};">
          ${act.type === 'order' 
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect></svg>`
          }
        </div>
        <div class="activity-details">
          <p class="activity-text">${act.text}</p>
          <span class="activity-time">${formatTimeAgo(act.time)}</span>
        </div>
      </div>
    `).join('');
  }
}

// 2. Orders View
let orderTimeFilter = 'today';
function renderOrders(state) {
  // Wire up tabs events
  const filterTabs = document.querySelectorAll('#order-time-filters .filter-tab');
  filterTabs.forEach(tab => {
    tab.onclick = () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      orderTimeFilter = tab.getAttribute('data-time');
      renderOrders(getAppState());
    };
  });

  const billFilter = document.getElementById('order-status-filter');
  const payFilter = document.getElementById('order-payment-filter');
  billFilter.onchange = () => renderOrders(getAppState());
  payFilter.onchange = () => renderOrders(getAppState());

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Filtering orders
  let filtered = [...state.orders];

  // Date filters
  if (orderTimeFilter === 'today') {
    filtered = filtered.filter(o => o.orderTime.startsWith(todayStr));
  } else if (orderTimeFilter === 'yesterday') {
    filtered = filtered.filter(o => o.orderTime.startsWith(yesterdayStr));
  }

  // Dropdown billing filter
  if (billFilter.value !== 'all') {
    filtered = filtered.filter(o => o.billStatus === billFilter.value);
  }
  // Dropdown payment filter
  if (payFilter.value !== 'all') {
    filtered = filtered.filter(o => o.paymentStatus === payFilter.value);
  }

  const tbody = document.getElementById('orders-table-body');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">No orders match current filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const orderDate = new Date(order.orderTime);
    const timeFormatted = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + 
                          ' (' + orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ')';
    
    // Status Badge classes
    const billBadge = order.billStatus === 'Billed' ? 'badge-success' : 'badge-warning';
    const payBadge = order.paymentStatus === 'Paid' ? 'badge-success' : (order.paymentStatus === 'Partial' ? 'badge-warning' : 'badge-danger');
    
    // Actions button
    let actionHtml = '';
    if (order.billStatus === 'Pending') {
      actionHtml = `<button class="btn btn-primary btn-sm" onclick="window.triggerBillingModal('${order.customerId}')">Generate Bill</button>`;
    } else {
      actionHtml = `<button class="btn btn-secondary btn-sm" onclick="window.triggerPrintReceipt('${order.invoiceId}')">View Invoice</button>`;
    }

    const itemsSummary = order.items.map(i => `${i.vegName} (${i.quantity} ${state.vegetables.find(v => v.id === i.vegId)?.unit || 'Kg'})`).join(', ');

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);">${order.id}</td>
        <td>
          <a href="#/customer-details?id=${order.customerId}" style="color: var(--primary); text-decoration: none; font-weight: 600;">
            ${order.customerName}
          </a>
        </td>
        <td><span class="badge badge-info">${order.businessType || 'Restaurant'}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;" title="${itemsSummary}">${itemsSummary}</td>
        <td><strong>${order.totalQuantity} Units</strong></td>
        <td style="font-size: 0.8rem;">${timeFormatted}</td>
        <td><span class="badge ${billBadge}">${order.billStatus}</span></td>
        <td><span class="badge ${payBadge}">${order.paymentStatus}</span></td>
        <td style="text-align: right;">${actionHtml}</td>
      </tr>
    `;
  }).join('');
}

// 3. Customers View
let customerStatusFilter = 'Active';
function renderCustomers(state) {
  const searchInput = document.getElementById('customer-search-input');
  searchInput.oninput = () => renderCustomers(getAppState());

  const statusTabs = document.querySelectorAll('#customer-status-tabs .filter-tab');
  statusTabs.forEach(tab => {
    tab.onclick = () => {
      statusTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      customerStatusFilter = tab.getAttribute('data-status');
      renderCustomers(getAppState());
    };
  });

  const query = searchInput.value.toLowerCase().trim();
  let filtered = [...state.customers];

  // Search filter
  if (query) {
    filtered = filtered.filter(c => 
      c.businessName.toLowerCase().includes(query) || 
      c.ownerName.toLowerCase().includes(query) || 
      c.mobile.includes(query)
    );
  }

  // Tab Status filter
  if (customerStatusFilter !== 'all') {
    filtered = filtered.filter(c => c.status === customerStatusFilter);
  }

  const tbody = document.getElementById('customers-table-body');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No customers registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(cust => {
    const outstandingClass = cust.outstandingAmount > 0 ? 'color: #dc2626; font-weight: 700;' : '';
    const statusBadge = cust.status === 'Active' ? 'badge-success' : (cust.status === 'Inactive' ? 'badge-danger' : 'badge-gray');
    
    return `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${cust.businessName}</td>
        <td>${cust.ownerName}</td>
        <td>+91 ${cust.mobile}</td>
        <td><span class="badge badge-info">${cust.paymentCycle}</span></td>
        <td style="${outstandingClass}">₹${(cust.outstandingAmount || 0).toLocaleString('en-IN')}</td>
        <td><span class="badge ${statusBadge}">${cust.status}</span></td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="window.triggerQRModal('${cust.id}', '${cust.businessName}')">QR Code</button>
            <a href="#/customer-details?id=${cust.id}" class="btn btn-primary btn-sm">View Ledger</a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Global window trigger functions to link standard row buttons securely to modular code
window.triggerQRModal = (custId, customerName) => {
  const url = `${window.location.origin}${window.location.pathname}#/customer-ordering?id=${custId}`;
  
  document.getElementById('qr-modal-customer-name').textContent = `${customerName} Ordering Portal`;
  document.getElementById('qr-modal-simulated-link').textContent = url;
  
  const testBtn = document.getElementById('qr-modal-test-link');
  testBtn.href = `#/customer-ordering?id=${custId}&step=auth`;
  
  openModal(el.modalViewQr);
};

window.triggerBillingModal = (custId) => {
  const state = getAppState();
  const customer = state.customers.find(c => c.id === custId);
  if (!customer) return;

  document.getElementById('invoice-form-cust-id').value = custId;
  
  // Aggregate items across all pending orders
  const pendingOrders = state.orders.filter(o => o.customerId === custId && o.billStatus === 'Pending');
  const itemsMap = {};
  pendingOrders.forEach(o => {
    o.items.forEach(item => {
      if (!itemsMap[item.vegName]) {
        itemsMap[item.vegName] = 0;
      }
      itemsMap[item.vegName] += Number(item.quantity);
    });
  });

  const inputsContainer = document.getElementById('invoice-items-rate-inputs');
  inputsContainer.innerHTML = '';

  const itemNames = Object.keys(itemsMap);
  if (itemNames.length === 0) {
    alert("No pending orders found for this customer.");
    return;
  }

  // Pre-fill item rate rows
  itemNames.forEach(vegName => {
    const qty = itemsMap[vegName];
    // Default mock rate is around 30 to 60 depending on vegetable
    const defaultRate = 35; 
    const key = vegName.replace(/\s+/g, '_');
    
    const row = document.createElement('div');
    row.className = 'billing-rates-row';
    row.innerHTML = `
      <div style="font-weight: 600; color: var(--text-main);">${vegName}</div>
      <div>${qty} Units</div>
      <div>
        <input type="number" class="form-input" style="padding: 6px; font-weight: 600;" id="rate-input-${key}" value="${defaultRate}" min="1" step="1" oninput="window.recalculateInvoiceRunningTotal()">
      </div>
      <div style="text-align: right; font-weight: 700;" id="rate-total-${key}">₹${qty * defaultRate}</div>
    `;
    inputsContainer.appendChild(row);
  });

  openModal(el.modalGenerateInvoice);
  window.recalculateInvoiceRunningTotal();
};

window.recalculateInvoiceRunningTotal = () => {
  const state = getAppState();
  const custId = document.getElementById('invoice-form-cust-id').value;
  const pendingOrders = state.orders.filter(o => o.customerId === custId && o.billStatus === 'Pending');
  
  const itemsMap = {};
  pendingOrders.forEach(o => {
    o.items.forEach(item => {
      if (!itemsMap[item.vegName]) {
        itemsMap[item.vegName] = 0;
      }
      itemsMap[item.vegName] += Number(item.quantity);
    });
  });

  let grandTotal = 0;
  Object.keys(itemsMap).forEach(vegName => {
    const qty = itemsMap[vegName];
    const key = vegName.replace(/\s+/g, '_');
    const inputEl = document.getElementById(`rate-input-${key}`);
    const rate = inputEl ? Number(inputEl.value) : 0;
    const lineTotal = qty * rate;
    
    grandTotal += lineTotal;
    
    const totalEl = document.getElementById(`rate-total-${key}`);
    if (totalEl) {
      totalEl.textContent = `₹${lineTotal.toLocaleString()}`;
    }
  });

  document.getElementById('invoice-running-grand-total').textContent = `₹${grandTotal.toLocaleString()}`;
};

window.triggerPrintReceipt = (invoiceId) => {
  showInvoiceReceipt(invoiceId);
};

// 4. Customer Details View (Single Ledger view)
function renderCustomerDetails(state) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const custId = params.get('id');
  
  const customer = state.customers.find(c => c.id === custId);
  if (!customer) {
    window.location.hash = '#/customers';
    return;
  }

  // Render profile panel
  const profilePanel = document.getElementById('cust-profile-panel');
  profilePanel.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase;">Business Entity</span>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${customer.businessName}</h2>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase;">Owner Name</span>
          <p style="font-weight: 600;">${customer.ownerName}</p>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase;">Mobile Contact</span>
          <p style="font-weight: 600;">+91 ${customer.mobile}</p>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase;">Billing Terms</span>
          <span class="badge badge-info" style="margin-top: 4px;">${customer.paymentCycle} Cycle</span>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase;">Account Status</span>
          <span class="badge ${customer.status === 'Active' ? 'badge-success' : 'badge-danger'}" style="margin-top: 4px;">${customer.status}</span>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 12px;">
        <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase;">Operational Notes</span>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${customer.notes || 'No custom preferences set.'}</p>
      </div>
    </div>
  `;

  // Render QR panel
  const qrPanel = document.getElementById('cust-qr-panel');
  const url = `${window.location.origin}${window.location.pathname}#/customer-ordering?id=${customer.id}`;
  qrPanel.innerHTML = `
    <div class="qr-canvas-mock" style="margin: 0 auto 12px;">
      <div class="qr-squares"></div>
      <div class="qr-logo-overlay">P</div>
    </div>
    <div class="qr-link-copy" style="font-size: 0.75rem; text-align: left; max-height: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      ${url}
    </div>
    <div style="margin-top: 14px; display: flex; gap: 8px; justify-content: center;">
      <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${url}').then(() => alert('Ordering URL copied to clipboard!'))">Copy URL</button>
      <a href="#/customer-ordering?id=${customer.id}&step=auth" class="btn btn-primary btn-sm">Place Order</a>
    </div>
  `;

  // Ledger summary header
  const totalOutstandingTag = document.getElementById('cust-ledger-total-outstanding');
  totalOutstandingTag.textContent = `Balance: ₹${(customer.outstandingAmount || 0).toLocaleString('en-IN')}`;
  if (customer.outstandingAmount > 0) {
    totalOutstandingTag.className = 'badge badge-danger';
  } else {
    totalOutstandingTag.className = 'badge badge-success';
  }

  // Render Ledger entries
  const customerLedger = state.ledger.find(l => l.customerId === customer.id) || { entries: [] };
  const ledgerBody = document.getElementById('cust-ledger-body');
  
  if (customerLedger.entries.length === 0) {
    ledgerBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No ledger entries found.</td></tr>`;
  } else {
    // Reverse entries to show latest first
    const entriesReversed = [...customerLedger.entries].reverse();
    ledgerBody.innerHTML = entriesReversed.map(entry => `
      <tr>
        <td>${entry.date}</td>
        <td style="font-weight: 500; color: var(--text-main);">${entry.description}</td>
        <td style="color: #dc2626;">${entry.debit > 0 ? '₹' + entry.debit.toLocaleString() : '—'}</td>
        <td style="color: #16a34a; font-weight: 600;">${entry.credit > 0 ? '₹' + entry.credit.toLocaleString() : '—'}</td>
        <td><strong>₹${entry.balance.toLocaleString()}</strong></td>
      </tr>
    `).join('');
  }

  // Render past orders history
  const pastOrders = state.orders.filter(o => o.customerId === customer.id);
  const ordersHistoryBody = document.getElementById('cust-orders-history-body');
  
  if (pastOrders.length === 0) {
    ordersHistoryBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No orders record.</td></tr>`;
  } else {
    ordersHistoryBody.innerHTML = pastOrders.map(order => {
      const itemsSummary = order.items.map(i => `${i.vegName} (${i.quantity}${state.vegetables.find(v => v.id === i.vegId)?.unit || 'Kg'})`).join(', ');
      const dateFormatted = new Date(order.orderTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `
        <tr>
          <td style="font-weight: 600;">${order.id}</td>
          <td>${dateFormatted}</td>
          <td style="max-width: 200px; text-overflow: ellipsis; overflow: hidden;" title="${itemsSummary}">${itemsSummary}</td>
          <td>${order.totalQuantity} Units</td>
          <td><span class="badge ${order.billStatus === 'Billed' ? 'badge-success' : 'badge-warning'}">${order.billStatus}</span></td>
        </tr>
      `;
    }).join('');
  }
}

// 5. Billing View
function renderBilling(state) {
  // Aggregate unbilled orders grouped by customer ID
  const pendingOrders = state.orders.filter(o => o.billStatus === 'Pending');
  const customerBags = {};
  
  pendingOrders.forEach(o => {
    if (!customerBags[o.customerId]) {
      customerBags[o.customerId] = {
        customerName: o.customerName,
        orderCount: 0,
        totalKg: 0
      };
    }
    customerBags[o.customerId].orderCount += 1;
    customerBags[o.customerId].totalKg += o.totalQuantity;
  });

  const pendingBody = document.getElementById('pending-billing-table-body');
  const customerList = Object.keys(customerBags);
  
  if (customerList.length === 0) {
    pendingBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-light);">No pending nightly orders unbilled. All clear!</td></tr>`;
  } else {
    pendingBody.innerHTML = customerList.map(custId => {
      const bag = customerBags[custId];
      const custObj = state.customers.find(c => c.id === custId);
      const cycle = custObj ? custObj.paymentCycle : 'Weekly';
      return `
        <tr>
          <td style="font-weight: 700; color: var(--text-main);">${bag.customerName}</td>
          <td><span class="badge badge-info">${cycle}</span></td>
          <td><strong>${bag.orderCount} Orders</strong></td>
          <td>${bag.totalKg} units</td>
          <td style="text-align: right;">
            <button class="btn btn-primary btn-sm" onclick="window.triggerBillingModal('${custId}')">Generate Bill</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render invoices archive
  const invoiceBody = document.getElementById('invoices-table-body');
  if (state.invoices.length === 0) {
    invoiceBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No invoice bills found.</td></tr>`;
  } else {
    invoiceBody.innerHTML = state.invoices.map(inv => {
      const payBadge = inv.status === 'Paid' ? 'badge-success' : (inv.status === 'Partial' ? 'badge-warning' : 'badge-danger');
      return `
        <tr>
          <td style="font-weight: 600; color: var(--text-main);">${inv.id}</td>
          <td style="font-weight: 600;">${inv.customerName}</td>
          <td>${inv.date}</td>
          <td><strong>₹${inv.totalAmount.toLocaleString('en-IN')}</strong></td>
          <td><span class="badge ${payBadge}">${inv.status}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="window.triggerPrintReceipt('${inv.id}')">View & Print</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

// 6. Payments View
function renderPayments(state) {
  // Sync auto reminder checkbox
  document.getElementById('auto-reminders-toggle').checked = state.settings.autoReminders;
  document.getElementById('reminder-status-label').textContent = state.settings.autoReminders ? 'Active' : 'Disabled';

  // Compute stats
  const totalOutstanding = state.customers.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollections = state.payments
    .filter(p => p.date.startsWith(todayStr))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  document.getElementById('pay-metric-outstanding').textContent = `₹${totalOutstanding.toLocaleString('en-IN')}`;
  document.getElementById('pay-metric-collection').textContent = `₹${todayCollections.toLocaleString('en-IN')}`;

  // Render Payment history table
  const tbody = document.getElementById('payments-table-body');
  if (state.payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-light);">No payment logs recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.payments.map(pay => {
    const payDate = new Date(pay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);">${pay.id}</td>
        <td style="font-weight: 600;">${pay.customerName}</td>
        <td>${payDate}</td>
        <td style="color: #16a34a; font-weight: 700;">₹${pay.amount.toLocaleString()}</td>
        <td><span class="badge badge-info">${pay.method}</span></td>
        <td style="font-family: monospace; font-size: 0.8rem;">${pay.reference || '—'}</td>
        <td style="font-weight: 500;">${pay.invoiceId ? pay.invoiceId : '<span style="color: #64748b;">Ledger Adjustment</span>'}</td>
      </tr>
    `;
  }).join('');
}

// Helper: Populate client select inside Record Payment modal
function populatePaymentModalSelects(preselectedCustId = null) {
  const state = getAppState();
  const selectCust = document.getElementById('record-pay-customer');
  
  // Fill customers
  selectCust.innerHTML = '<option value="">-- Choose Customer --</option>' + 
    state.customers.filter(c => c.status === 'Active').map(c => 
      `<option value="${c.id}" ${c.id === preselectedCustId ? 'selected' : ''}>${c.businessName} (Outstanding: ₹${c.outstandingAmount})</option>`
    ).join('');

  const selectInvGroup = document.getElementById('record-pay-invoice-group');
  const selectInv = document.getElementById('record-pay-invoice');

  const updateInvoicesList = (custId) => {
    if (!custId) {
      selectInvGroup.classList.add('hidden');
      selectInv.innerHTML = '';
      return;
    }

    const unpaidInvoices = state.invoices.filter(i => i.customerId === custId && i.status !== 'Paid');
    if (unpaidInvoices.length === 0) {
      selectInvGroup.classList.add('hidden');
      selectInv.innerHTML = '<option value="">No Invoice link (General Credit)</option>';
    } else {
      selectInvGroup.classList.remove('hidden');
      selectInv.innerHTML = '<option value="">No Invoice link (General Credit)</option>' + 
        unpaidInvoices.map(i => `<option value="${i.id}">${i.id} (Due: ₹${i.totalAmount - i.amountPaid})</option>`).join('');
    }
  };

  selectCust.onchange = (e) => {
    updateInvoicesList(e.target.value);
  };

  // Run immediately on pre-selection
  updateInvoicesList(preselectedCustId);
}

// 7. Reports View
function renderReports(state) {
  // Render Customer-Wise Sales summary list
  const reportsBody = document.getElementById('reports-customer-sales-body');
  
  reportsBody.innerHTML = state.customers.map(c => {
    const custOrders = state.orders.filter(o => o.customerId === c.id);
    const totalVolume = custOrders.reduce((sum, o) => sum + o.totalQuantity, 0);
    
    // Invoiced total
    const billedTotal = state.invoices
      .filter(i => i.customerId === c.id)
      .reduce((sum, i) => sum + i.totalAmount, 0);
    
    // Paid total
    const paidTotal = state.payments
      .filter(p => p.customerId === c.id)
      .reduce((sum, p) => sum + p.amount, 0);

    return `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${c.businessName}</td>
        <td>${custOrders.length} orders</td>
        <td><strong>${totalVolume} units</strong></td>
        <td>₹${billedTotal.toLocaleString()}</td>
        <td style="color: #16a34a; font-weight: 600;">₹${paidTotal.toLocaleString()}</td>
        <td style="${c.outstandingAmount > 0 ? 'color:#dc2626; font-weight:700;' : ''}">₹${(c.outstandingAmount || 0).toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  // popular items ranking computation
  const itemQuantities = {};
  state.orders.forEach(o => {
    o.items.forEach(i => {
      if (!itemQuantities[i.vegName]) {
        itemQuantities[i.vegName] = 0;
      }
      itemQuantities[i.vegName] += Number(i.quantity);
    });
  });

  const popularItems = Object.keys(itemQuantities).map(name => ({
    name: name,
    qty: itemQuantities[name]
  })).sort((a,b) => b.qty - a.qty);

  const popTbody = document.getElementById('popular-items-table-body');
  if (popularItems.length === 0) {
    popTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No items recorded.</td></tr>`;
  } else {
    popTbody.innerHTML = popularItems.slice(0, 5).map((item, idx) => `
      <tr>
        <td style="font-weight:600; color:var(--text-main);">${item.name}</td>
        <td><strong>${item.qty} units</strong></td>
        <td><span class="badge ${idx === 0 ? 'badge-success' : 'badge-info'}">#${idx + 1}</span></td>
      </tr>
    `).join('');
  }

  // Draw Visual SVG bar chart representing Weekly Sales
  // Mock last 7 days sales values
  const weeklyData = [
    { label: 'Mon', value: 8400 },
    { label: 'Tue', value: 12500 },
    { label: 'Wed', value: 9200 },
    { label: 'Thu', value: 15300 },
    { label: 'Fri', value: 18200 },
    { label: 'Sat', value: 11000 },
    { label: 'Sun', value: 6800 }
  ];

  const chart = document.getElementById('reports-sales-chart');
  const maxValue = Math.max(...weeklyData.map(d => d.value));

  chart.innerHTML = weeklyData.map(day => {
    // Percentage height for visual scale
    const heightPercent = maxValue > 0 ? (day.value / maxValue) * 80 : 0;
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height: ${heightPercent}%;">
          <span class="chart-bar-value">₹${day.value / 1000}k</span>
        </div>
        <div class="chart-label">${day.label}</div>
      </div>
    `;
  }).join('');

  // Wire report downloads simulator
  document.getElementById('btn-report-export-excel').onclick = () => {
    alert("Generating Excel Spreadsheet...\nCustom Outstanding & Collection sheet downloaded successfully as 'prakriti_sales_report_2026.xlsx'!");
  };
  document.getElementById('btn-report-export-pdf').onclick = () => {
    alert("Generating PDF Report...\nDetailed B2B ledger collections statement downloaded successfully as 'prakriti_sales_report_2026.pdf'!");
  };
}

// 8. Settings View
function renderSettings(state) {
  // Fill profile details inputs
  document.getElementById('set-bus-name').value = state.settings.businessName;
  document.getElementById('set-owner-name').value = state.settings.ownerName;
  document.getElementById('set-mobile').value = state.settings.mobile;
  document.getElementById('set-upi').value = state.settings.upiId;
  document.getElementById('set-address').value = state.settings.address;

  // Render vegetable catalog list
  const catalog = document.getElementById('settings-veg-catalog');
  catalog.innerHTML = state.vegetables.map(v => `
    <div class="inventory-card">
      <div class="inventory-info">
        <strong style="color: var(--text-main); font-size: 0.95rem;">${v.name}</strong>
        <span style="font-size: 0.72rem; color: var(--text-light); text-transform: uppercase; margin-top: 4px;">
          ${v.category} • Unit: ${v.unit}
        </span>
      </div>
      <div class="inventory-status-toggle">
        <label class="switch">
          <input type="checkbox" id="veg-toggle-${v.id}" ${v.isActive ? 'checked' : ''} onchange="window.toggleVegetableActive('${v.id}')">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  `).join('');
}

window.toggleVegetableActive = (vegId) => {
  const state = getAppState();
  const veg = state.vegetables.find(v => v.id === vegId);
  if (veg) {
    updateVegetableCatalog(vegId, { isActive: !veg.isActive });
  }
};

// Helper: Calculate buying aggregated list
function calculateBuyingRequirements(state) {
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingOrders = state.orders.filter(o => o.orderTime.startsWith(todayStr));
  
  const requirementsMap = {};
  pendingOrders.forEach(order => {
    order.items.forEach(item => {
      if (!requirementsMap[item.vegId]) {
        requirementsMap[item.vegId] = {
          name: item.vegName,
          qty: 0,
          unit: state.vegetables.find(v => v.id === item.vegId)?.unit || 'Kg',
          category: state.vegetables.find(v => v.id === item.vegId)?.category || 'Daily'
        };
      }
      requirementsMap[item.vegId].qty += Number(item.quantity);
    });
  });

  return Object.values(requirementsMap);
}

// Simple print layout invoice mock receipt
function showInvoiceReceipt(invoiceId) {
  const state = getAppState();
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  const content = document.getElementById('print-invoice-modal-content');
  
  // Format items
  const itemsHtml = inv.items.map(item => `
    <tr>
      <td>${item.vegName}</td>
      <td>${item.quantity} Units</td>
      <td>₹${item.rate}</td>
      <td style="text-align: right;">₹${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  content.innerHTML = `
    <div class="print-invoice-layout">
      <div class="print-invoice-header">
        <img src="logo.jpg" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--primary); object-fit: cover; margin-bottom: 10px;" alt="Prakriti Logo">
        <h2 style="font-size: 1.5rem; margin-bottom: 6px;">${state.settings.businessName}</h2>
        <p style="font-size: 0.8rem; color: #475569;">${state.settings.address}</p>
        <p style="font-size: 0.8rem; color: #475569; margin-top: 4px;">WhatsApp Order Support: +91 ${state.settings.mobile}</p>
      </div>
      
      <div class="print-invoice-details">
        <div>
          <p><strong>Billed To:</strong></p>
          <p style="font-size: 1.05rem; font-weight: 700; margin-top: 4px;">${inv.customerName}</p>
          <p>Payment Term: Credit Ledger</p>
        </div>
        <div style="text-align: right;">
          <p><strong>Invoice No:</strong> ${inv.id}</p>
          <p><strong>Date:</strong> ${inv.date}</p>
          <p><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: 700;">${inv.status}</span></p>
        </div>
      </div>
      
      <table class="print-table">
        <thead>
          <tr>
            <th>Vegetable Item</th>
            <th>Quantity</th>
            <th>Morning Rate</th>
            <th style="text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="print-total-row">
        Total Billed Amount: ₹${inv.totalAmount.toLocaleString()}
      </div>
      
      <div style="margin-top: 32px; border-top: 1px dashed black; padding-top: 20px; font-size: 0.8rem; text-align: center; color: #475569;">
        <p>Please pay UPI transfer directly to: <strong>${state.settings.upiId}</strong></p>
        <p style="margin-top: 6px; font-style: italic;">Thank you for your business! Freshly sourced daily.</p>
      </div>
    </div>
  `;

  // Dynamic simulated download file actions
  document.getElementById('btn-invoice-pdf-download').onclick = () => {
    alert(`Downloading PDF Invoice for ${inv.customerName} (${inv.id})... Done!`);
  };

  openModal(el.modalPrintInvoice);
}

// ----------------------------------------------------
// MOBILE CUSTOMER ZERO-LOGIN ORDERING SYSTEM
// ----------------------------------------------------
let orderCart = {}; // Holds items selected for order in memory e.g., { tomato: 10, onion: 5 }
let selectedCategoryFilter = 'All';
let vegSearchText = '';
let verificationOtpValue = '';

function renderCustomerOrderingView(state) {
  const custId = currentCustomerParams.customerId;
  const customer = state.customers.find(c => c.id === custId);
  const currentStep = currentCustomerParams.step || 'auth';
  
  if (!customer) {
    el.customerScreenView.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: var(--text-light);">
        <h2>⚠️ Customer Not Identified</h2>
        <p style="margin-top: 10px;">Please scan the valid Prakriti QR Code assigned to your restaurant's kitchen.</p>
      </div>
    `;
    return;
  }

  // 1. Verify Authentication OTP step
  if (currentStep === 'auth') {
    el.customerScreenView.innerHTML = `
      <header class="customer-header">
        <div class="customer-brand">
          <img src="logo.jpg" class="customer-header-logo-img" alt="Prakriti Logo">
          Prakriti Vegetable Supplier
        </div>
      </header>
      <div class="step-container">
        <div class="step-card">
          <h2 style="font-size: 1.25rem; font-weight: 700; text-align: center;">B2B Security Verification</h2>
          <p style="font-size: 0.85rem; color: var(--text-light); text-align: center; line-height: 1.4;">
            Verifying staff member access for <strong>${customer.businessName}</strong>.
          </p>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Owner Mobile Number</label>
            <input type="tel" class="form-input" id="cust-phone-input" style="font-size: 1.1rem; padding: 12px; text-align: center;" value="${customer.mobile}" readonly>
          </div>
          
          <div class="customer-otp-display" id="otp-hint-block">
            One-Time OTP Code is sent to owner's phone via SMS.
          </div>
          
          <button class="btn btn-primary customer-large-btn" id="btn-customer-send-otp">
            Generate Verification Code
          </button>
          
          <div id="otp-input-block" class="hidden">
            <div class="form-group">
              <label class="form-label" style="text-align: center;">Enter 4-Digit Verification Code</label>
              <input type="text" class="form-input" id="cust-otp-input" style="font-size: 1.5rem; letter-spacing: 0.5em; text-align: center; padding: 10px;" maxlength="4" placeholder="••••">
            </div>
            <button class="btn btn-primary customer-large-btn" style="background-color: #10b981;" id="btn-customer-verify-otp">
              Verify & Enter Portal
            </button>
          </div>
        </div>
      </div>
    `;

    // Event wiring
    document.getElementById('btn-customer-send-otp').addEventListener('click', () => {
      // Simulate sending OTP code
      verificationOtpValue = String(Math.floor(1000 + Math.random() * 9000));
      const hint = document.getElementById('otp-hint-block');
      hint.innerHTML = `🔑 Simulated SMS Sent! OTP Code: <strong>${verificationOtpValue}</strong>`;
      hint.style.backgroundColor = '#dcfce7';
      hint.style.borderColor = '#16a34a';
      hint.style.color = '#15803d';

      document.getElementById('otp-input-block').classList.remove('hidden');
      document.getElementById('btn-customer-send-otp').classList.add('hidden');
    });

    document.getElementById('btn-customer-verify-otp').addEventListener('click', () => {
      const enteredOtp = document.getElementById('cust-otp-input').value;
      if (enteredOtp === verificationOtpValue || enteredOtp === '1234') { // Allow 1234 as fallback
        window.location.hash = `#/customer-ordering?id=${custId}&step=select`;
      } else {
        alert('Incorrect OTP Code. Please look at the highlighted helper box or enter 1234.');
      }
    });
  }

  // 2. Vegetable selection picker step
  else if (currentStep === 'select') {
    // Auto populate cart keys from active catalog if empty
    state.vegetables.forEach(v => {
      if (v.isActive && orderCart[v.id] === undefined) {
        orderCart[v.id] = 0;
      }
    });

    el.customerScreenView.innerHTML = `
      <header class="customer-header" style="border-bottom: none; padding-bottom: 12px;">
        <div class="customer-brand">
          <img src="logo.jpg" class="customer-header-logo-img" alt="Prakriti Logo">
          Order Entry Portal
        </div>
      </header>
      <div class="customer-welcome-bar">
        🛒 Placing order for: ${customer.businessName}
      </div>
      
      <div class="step-container" style="padding: 16px 12px; gap: 14px;">
        
        <!-- Search and filters -->
        <div class="veg-selector-wrap">
          <div class="veg-search-box">
            <svg style="position: absolute; left: 14px; top: 14px; width: 18px; height: 18px; stroke: #64748b; stroke-width: 2.5; fill:none;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="veg-search-input" id="veg-picker-search" placeholder="Search veggies (e.g. Onion, Tomato)..." value="${vegSearchText}">
          </div>
          
          <div class="veg-category-tabs" id="veg-cat-picker-tabs">
            <button class="veg-cat-btn ${selectedCategoryFilter === 'All' ? 'active' : ''}" data-cat="All">All Items</button>
            <button class="veg-cat-btn ${selectedCategoryFilter === 'Daily' ? 'active' : ''}" data-cat="Daily">Daily Standard</button>
            <button class="veg-cat-btn ${selectedCategoryFilter === 'Exotic' ? 'active' : ''}" data-cat="Exotic">Exotics</button>
            <button class="veg-cat-btn ${selectedCategoryFilter === 'Leafy' ? 'active' : ''}" data-cat="Leafy">Leafy Greens</button>
            <button class="veg-cat-btn ${selectedCategoryFilter === 'Root' ? 'active' : ''}" data-cat="Root">Roots</button>
          </div>
        </div>

        <!-- Vegetable picking list -->
        <div class="veg-item-list" id="customer-veg-list-body">
          <!-- Rendered below -->
        </div>

        <!-- Optional Notes -->
        <div class="notes-container">
          <label class="form-label" style="margin-bottom: 6px;">Notes / Custom Requests</label>
          <textarea class="customer-notes-textarea" id="customer-order-notes" placeholder="e.g. Deliver before 6 AM, send ripe tomatoes only..."></textarea>
        </div>
      </div>

      <!-- Sticky submit cart footer -->
      <footer class="customer-sticky-footer">
        <button class="btn btn-primary customer-large-btn" id="btn-customer-submit-order">
          Submit Order to Supplier
        </button>
      </footer>
    `;

    // Wire Category tabs
    document.querySelectorAll('#veg-cat-picker-tabs .veg-cat-btn').forEach(btn => {
      btn.onclick = () => {
        selectedCategoryFilter = btn.getAttribute('data-cat');
        renderCustomerVegList(state);
        // Toggle active tabs visually
        document.querySelectorAll('#veg-cat-picker-tabs .veg-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    // Wire search filter
    const vegSearch = document.getElementById('veg-picker-search');
    vegSearch.oninput = (e) => {
      vegSearchText = e.target.value.toLowerCase().trim();
      renderCustomerVegList(state);
    };

    // Render picker rows
    renderCustomerVegList(state);

    // Cart Order submission event
    document.getElementById('btn-customer-submit-order').onclick = () => {
      // Gather cart items
      const selectedItems = [];
      Object.keys(orderCart).forEach(vegId => {
        const qty = orderCart[vegId];
        if (qty > 0) {
          const vegObj = state.vegetables.find(v => v.id === vegId);
          selectedItems.push({
            vegId: vegId,
            vegName: vegObj ? vegObj.name : 'Unknown Veggie',
            quantity: qty
          });
        }
      });

      if (selectedItems.length === 0) {
        alert("Please select at least 1 vegetable item and quantity to submit order.");
        return;
      }

      const notes = document.getElementById('customer-order-notes').value;

      // Add order in central state
      const createdOrder = addOrder({
        customerId: custId,
        customerName: customer.businessName,
        items: selectedItems,
        notes: notes
      });

      // Clear Cart in memory
      orderCart = {};
      vegSearchText = '';
      selectedCategoryFilter = 'All';

      // Redirect to success route page
      window.location.hash = `#/customer-ordering?id=${custId}&step=success&orderId=${createdOrder.id}`;
    };
  }

  // 3. Success Feedback receipt step
  else if (currentStep === 'success') {
    const orderId = paramsGet('orderId') || 'ORD-XYZ';
    
    el.customerScreenView.innerHTML = `
      <div class="step-container" style="justify-content: center; align-items: center; text-align: center; min-height: 80vh;">
        <div class="step-card" style="align-items: center; width: 100%; max-width: 320px; gap: 24px;">
          <div style="background-color: var(--primary-light); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3" style="stroke-linecap: round; stroke-linejoin: round;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main);">Order Placed!</h2>
            <p style="font-size: 0.825rem; color: var(--text-light); margin-top: 6px;">
              Your requirement has been sent to Prakriti Vegetable Supplier.
            </p>
          </div>
          
          <div style="border-top: 1px dashed var(--border); border-bottom: 1px dashed var(--border); padding: 16px 0; width: 100%; text-align: left; font-size: 0.85rem;">
            <p style="margin-bottom: 6px;"><strong>Order Reference:</strong> ${orderId}</p>
            <p><strong>Delivery Staging:</strong> Morning (by 6:30 AM)</p>
          </div>

          <p style="font-size: 0.72rem; color: var(--text-light); line-height: 1.4;">
            Prices will be billed as per the wholesale market rates at the time of morning sourcing.
          </p>

          <a href="#/customer-ordering?id=${custId}&step=select" class="btn btn-primary" style="width: 100%; padding: 12px;">
            Place Another Order
          </a>
        </div>
      </div>
    `;
  }
}

// Logic: Renders vegetable grid list inside customer order flow
function renderCustomerVegList(state) {
  const body = document.getElementById('customer-veg-list-body');
  if (!body) return;

  let list = state.vegetables.filter(v => v.isActive);

  // Apply categories filter tabs
  if (selectedCategoryFilter !== 'All') {
    list = list.filter(v => v.category === selectedCategoryFilter);
  }

  // Apply search query
  if (vegSearchText) {
    list = list.filter(v => v.name.toLowerCase().includes(vegSearchText));
  }

  if (list.length === 0) {
    body.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 30px 10px;">No vegetables match your search.</p>`;
    return;
  }

  body.innerHTML = list.map(veg => {
    const qty = orderCart[veg.id] || 0;
    const keyClass = qty > 0 ? 'has-qty' : '';
    return `
      <div class="veg-picker-row ${keyClass}" id="veg-row-${veg.id}">
        <div class="veg-picker-details">
          <span class="veg-picker-name">${veg.name}</span>
          <span class="veg-picker-unit">${veg.category} • Unit: ${veg.unit}</span>
        </div>
        <div class="qty-counter">
          <button class="qty-counter-btn" onclick="window.adjustCustomerCartQty('${veg.id}', -1)">−</button>
          <input type="number" class="qty-counter-value" id="qty-val-${veg.id}" value="${qty}" min="0" onchange="window.adjustCustomerCartQty('${veg.id}', 0, this.value)">
          <button class="qty-counter-btn" onclick="window.adjustCustomerCartQty('${veg.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// Cart dynamic quantity handler
window.adjustCustomerCartQty = (vegId, change, explicitVal = null) => {
  const row = document.getElementById(`veg-row-${vegId}`);
  const input = document.getElementById(`qty-val-${vegId}`);
  if (!input) return;

  let currentVal = Number(input.value);
  
  if (explicitVal !== null) {
    currentVal = Math.max(0, Number(explicitVal));
  } else {
    currentVal = Math.max(0, currentVal + change);
  }

  // Update Cart cache
  orderCart[vegId] = currentVal;
  input.value = currentVal;

  // Toggle Highlight classes
  if (row) {
    if (currentVal > 0) {
      row.classList.add('has-qty');
    } else {
      row.classList.remove('has-qty');
    }
  }

  // Sync state parameters to updates sticky header totals
  const state = getAppState();
  let totalItemsCount = 0;
  Object.keys(orderCart).forEach(k => {
    if (orderCart[k] > 0) totalItemsCount++;
  });
  
  const submitBtn = document.getElementById('btn-customer-submit-order');
  if (submitBtn) {
    if (totalItemsCount > 0) {
      submitBtn.textContent = `Submit B2B Order (${totalItemsCount} Veggies Selected)`;
    } else {
      submitBtn.textContent = 'Submit Order to Supplier';
    }
  }
};

// ----------------------------------------------------
// HELPER UTILITIES
// ----------------------------------------------------

function filterDataGlobal(query) {
  // If global search is used, trigger local search within the active view
  if (currentView === 'orders') {
    const tbody = document.getElementById('orders-table-body');
    const rows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const text = rows[i].textContent.toLowerCase();
      if (text.includes(query) || query === '') {
        rows[i].classList.remove('hidden');
      } else {
        rows[i].classList.add('hidden');
      }
    }
  } else if (currentView === 'customers') {
    const input = document.getElementById('customer-search-input');
    if (input) {
      input.value = query;
      renderCustomers(getAppState());
    }
  } else if (currentView === 'billing') {
    const tbody = document.getElementById('invoices-table-body');
    const rows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const text = rows[i].textContent.toLowerCase();
      if (text.includes(query) || query === '') {
        rows[i].classList.remove('hidden');
      } else {
        rows[i].classList.add('hidden');
      }
    }
  }
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) return interval + " yr ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " mo ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " d ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hr ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " min ago";
  return "Just now";
}

function paramsGet(key) {
  const hash = window.location.hash;
  const parts = hash.split('?');
  if (parts.length < 2) return null;
  const params = new URLSearchParams(parts[1]);
  return params.get(key);
}
