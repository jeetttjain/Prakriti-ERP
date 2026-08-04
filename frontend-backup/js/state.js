// js/state.js
import {
  initialVegetables,
  initialCustomers,
  initialOrders,
  initialInvoices,
  initialPayments,
  initialLedger
} from './data.js';

const STORAGE_KEY = 'prakriti_erp_state';

// State definition and defaults
const defaultState = {
  vegetables: initialVegetables,
  customers: initialCustomers,
  orders: initialOrders,
  invoices: initialInvoices,
  payments: initialPayments,
  ledger: initialLedger,
  session: {
    isAdminLoggedIn: false,
    currentUser: null
  },
  settings: {
    businessName: 'Prakriti Vegetable Supplier',
    ownerName: 'Prakriti Owner',
    mobile: '9876543210',
    upiId: 'prakritiveg@okaxis',
    address: 'Wholesale Veg Market, Gate 3, Sector 4, New Delhi',
    autoReminders: true
  }
};

let listeners = [];

export function getAppState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    saveAppState(defaultState);
    return JSON.parse(JSON.stringify(defaultState));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing local storage state, resetting to defaults.', e);
    saveAppState(defaultState);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notifyListeners();
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notifyListeners() {
  const currentState = getAppState();
  listeners.forEach(listener => {
    try {
      listener(currentState);
    } catch (e) {
      console.error('Error in state subscriber', e);
    }
  });
}

// API Mutations
export function loginAdmin(username, password) {
  const state = getAppState();
  if (username.trim().toLowerCase() === 'admin' && password === 'admin') {
    state.session.isAdminLoggedIn = true;
    state.session.currentUser = { name: 'Prakriti Admin', role: 'Owner' };
    saveAppState(state);
    return true;
  }
  return false;
}

export function logoutAdmin() {
  const state = getAppState();
  state.session.isAdminLoggedIn = false;
  state.session.currentUser = null;
  saveAppState(state);
}

export function addOrder(orderData) {
  const state = getAppState();
  const nextId = `ORD-${String(state.orders.length + 1).padStart(3, '0')}`;
  
  const customer = state.customers.find(c => c.id === orderData.customerId);
  const businessType = customer ? (customer.businessType || 'Restaurant') : 'Restaurant'; // Default if missing

  const newOrder = {
    id: nextId,
    customerId: orderData.customerId,
    customerName: orderData.customerName || (customer ? customer.businessName : 'Unknown B2B Customer'),
    businessType: businessType,
    items: orderData.items,
    totalQuantity: orderData.items.reduce((sum, item) => sum + Number(item.quantity), 0),
    orderTime: new Date().toISOString(),
    billStatus: 'Pending',
    paymentStatus: 'Unpaid',
    notes: orderData.notes || 'None'
  };

  state.orders.unshift(newOrder); // Add to the top
  saveAppState(state);
  return newOrder;
}

export function addCustomer(customerData) {
  const state = getAppState();
  const nextId = customerData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_') || `cust_${state.customers.length + 1}`;
  
  const newCustomer = {
    id: nextId,
    businessName: customerData.businessName,
    ownerName: customerData.ownerName,
    mobile: customerData.mobile,
    paymentCycle: customerData.paymentCycle || 'Weekly',
    notes: customerData.notes || '',
    status: 'Active',
    outstandingAmount: 0
  };

  state.customers.push(newCustomer);
  
  // Initialize ledger
  state.ledger.push({
    customerId: nextId,
    entries: [
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Customer Account Created',
        debit: 0,
        credit: 0,
        balance: 0
      }
    ]
  });

  saveAppState(state);
  return newCustomer;
}

export function updateCustomer(customerId, updatedFields) {
  const state = getAppState();
  state.customers = state.customers.map(c => {
    if (c.id === customerId) {
      return { ...c, ...updatedFields };
    }
    return c;
  });
  saveAppState(state);
}

export function generateInvoice(customerId, orderIds, itemsWithRates) {
  const state = getAppState();
  const nextInvoiceNum = `INV-2026-${String(state.invoices.length + 1).padStart(3, '0')}`;
  
  const customer = state.customers.find(c => c.id === customerId);
  if (!customer) return null;

  // Calculate items, prices, and total
  let totalAmount = 0;
  const invoiceItems = itemsWithRates.map(item => {
    const itemTotal = Number(item.quantity) * Number(item.rate);
    totalAmount += itemTotal;
    return {
      vegName: item.vegName,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      total: itemTotal
    };
  });

  // Create Invoice
  const newInvoice = {
    id: nextInvoiceNum,
    customerId: customerId,
    customerName: customer.businessName,
    date: new Date().toISOString().split('T')[0],
    items: invoiceItems,
    totalAmount: totalAmount,
    status: 'Unpaid',
    amountPaid: 0
  };

  state.invoices.unshift(newInvoice);

  // Update order statuses
  state.orders = state.orders.map(order => {
    if (orderIds.includes(order.id)) {
      return {
        ...order,
        billStatus: 'Billed',
        invoiceId: nextInvoiceNum
      };
    }
    return order;
  });

  // Update customer outstanding amount
  customer.outstandingAmount = (customer.outstandingAmount || 0) + totalAmount;
  state.customers = state.customers.map(c => (c.id === customerId ? customer : c));

  // Add ledger entry
  const customerLedger = state.ledger.find(l => l.customerId === customerId);
  if (customerLedger) {
    const currentBalance = customerLedger.entries.length > 0 
      ? customerLedger.entries[customerLedger.entries.length - 1].balance 
      : 0;
    
    customerLedger.entries.push({
      date: new Date().toISOString().split('T')[0],
      description: `Invoice ${nextInvoiceNum}`,
      debit: totalAmount,
      credit: 0,
      balance: currentBalance + totalAmount
    });
  }

  saveAppState(state);
  return newInvoice;
}

export function recordPayment(paymentData) {
  const state = getAppState();
  const nextPaymentNum = `PAY-${String(state.payments.length + 1).padStart(3, '0')}`;
  
  const customer = state.customers.find(c => c.id === paymentData.customerId);
  if (!customer) return null;

  const paymentAmount = Number(paymentData.amount);

  const newPayment = {
    id: nextPaymentNum,
    invoiceId: paymentData.invoiceId || '',
    customerId: paymentData.customerId,
    customerName: customer.businessName,
    amount: paymentAmount,
    date: new Date().toISOString(),
    method: paymentData.method || 'UPI',
    reference: paymentData.reference || `REF-${Math.floor(Math.random() * 1000000)}`
  };

  state.payments.unshift(newPayment);

  // Update customer outstanding
  customer.outstandingAmount = Math.max(0, (customer.outstandingAmount || 0) - paymentAmount);
  state.customers = state.customers.map(c => (c.id === paymentData.customerId ? customer : c));

  // Update corresponding Invoice if any
  if (paymentData.invoiceId) {
    state.invoices = state.invoices.map(inv => {
      if (inv.id === paymentData.invoiceId) {
        const newPaid = (inv.amountPaid || 0) + paymentAmount;
        let newStatus = 'Partial';
        if (newPaid >= inv.totalAmount) {
          newStatus = 'Paid';
        }
        return {
          ...inv,
          amountPaid: newPaid,
          status: newStatus
        };
      }
      return inv;
    });

    // Also update order status associated with this invoice
    state.orders = state.orders.map(ord => {
      if (ord.invoiceId === paymentData.invoiceId) {
        const inv = state.invoices.find(i => i.id === paymentData.invoiceId);
        return {
          ...ord,
          paymentStatus: inv ? inv.status : ord.paymentStatus
        };
      }
      return ord;
    });
  }

  // Add ledger entry
  const customerLedger = state.ledger.find(l => l.customerId === paymentData.customerId);
  if (customerLedger) {
    const currentBalance = customerLedger.entries.length > 0 
      ? customerLedger.entries[customerLedger.entries.length - 1].balance 
      : 0;

    customerLedger.entries.push({
      date: new Date().toISOString().split('T')[0],
      description: `Payment ${nextPaymentNum} [${newPayment.method}]` + (paymentData.invoiceId ? ` for ${paymentData.invoiceId}` : ''),
      debit: 0,
      credit: paymentAmount,
      balance: Math.max(0, currentBalance - paymentAmount)
    });
  }

  saveAppState(state);
  return newPayment;
}

export function toggleAutoReminders() {
  const state = getAppState();
  state.settings.autoReminders = !state.settings.autoReminders;
  saveAppState(state);
  return state.settings.autoReminders;
}

export function updateVegetableCatalog(vegId, fields) {
  const state = getAppState();
  state.vegetables = state.vegetables.map(v => {
    if (v.id === vegId) {
      return { ...v, ...fields };
    }
    return v;
  });
  saveAppState(state);
}

export function addVegetable(vegData) {
  const state = getAppState();
  const nextId = vegData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  if (state.vegetables.some(v => v.id === nextId)) {
    return null; // Already exists
  }

  const newVeg = {
    id: nextId,
    name: vegData.name,
    category: vegData.category || 'Daily',
    unit: vegData.unit || 'Kg',
    isActive: true
  };

  state.vegetables.push(newVeg);
  saveAppState(state);
  return newVeg;
}

export function updateBusinessSettings(fields) {
  const state = getAppState();
  state.settings = { ...state.settings, ...fields };
  saveAppState(state);
}
