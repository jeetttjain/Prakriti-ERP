// js/data.js

export const initialVegetables = [
  { id: 'tomato', name: 'Tomato', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'onion', name: 'Onion', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'potato', name: 'Potato', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'capsicum', name: 'Capsicum', category: 'Exotic', unit: 'Kg', isActive: true },
  { id: 'cauliflower', name: 'Cauliflower', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'broccoli', name: 'Broccoli', category: 'Exotic', unit: 'Kg', isActive: true },
  { id: 'spinach', name: 'Spinach (Palak)', category: 'Leafy', unit: 'Bunch', isActive: true },
  { id: 'coriander', name: 'Coriander (Dhania)', category: 'Leafy', unit: 'Bunch', isActive: true },
  { id: 'ginger', name: 'Ginger (Adrak)', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'garlic', name: 'Garlic (Lahsun)', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'lemon', name: 'Lemon', category: 'Daily', unit: 'Kg', isActive: true },
  { id: 'mushroom', name: 'Button Mushroom', category: 'Exotic', unit: 'Pack', isActive: true },
  { id: 'zucchini', name: 'Zucchini', category: 'Exotic', unit: 'Kg', isActive: true }
];

export const initialCustomers = [
  {
    id: 'ccd',
    businessName: 'CCD Cafe (City Center)',
    ownerName: 'Ramesh Kumar',
    mobile: '9876543210',
    paymentCycle: 'Daily',
    notes: 'Requires delivery strictly by 6:00 AM. Prefers medium-sized tomatoes.',
    status: 'Active',
    outstandingAmount: 2450
  },
  {
    id: 'gourmet',
    businessName: 'Gourmet Bites Restaurant',
    ownerName: 'Priya Nair',
    mobile: '9812345678',
    paymentCycle: 'Weekly',
    notes: 'Always orders high-quality exotics. Settle bills every Monday.',
    status: 'Active',
    outstandingAmount: 12800
  },
  {
    id: 'taj_palace',
    businessName: 'Taj Palace Hotel',
    ownerName: 'Anil Mehta',
    mobile: '9988776655',
    paymentCycle: 'Monthly',
    notes: '5-star compliance, needs duplicate physical copy of invoice.',
    status: 'Active',
    outstandingAmount: 48750
  },
  {
    id: 'skyline',
    businessName: 'Skyline Catering Services',
    ownerName: 'Vikram Singh',
    mobile: '9765432109',
    paymentCycle: 'Ledger',
    notes: 'Bulk purchase customer. Flexible payment schedule based on events.',
    status: 'Active',
    outstandingAmount: 8300
  },
  {
    id: 'healthy_greens',
    businessName: 'Healthy Greens Salad Bar',
    ownerName: 'Sonia Sen',
    mobile: '9543210987',
    paymentCycle: 'Weekly',
    notes: 'High demand for leafy greens and mushrooms.',
    status: 'Active',
    outstandingAmount: 0
  },
  {
    id: 'royal_caterers',
    businessName: 'Royal Caterers',
    ownerName: 'Harish Gupta',
    mobile: '9123456789',
    paymentCycle: 'Ledger',
    notes: 'Deliver directly to banquet warehouse.',
    status: 'Inactive',
    outstandingAmount: 0
  }
];

export const initialOrders = [
  {
    id: 'ORD-001',
    customerId: 'ccd',
    customerName: 'CCD Cafe (City Center)',
    businessType: 'Cafe',
    items: [
      { vegId: 'tomato', vegName: 'Tomato', quantity: 15 },
      { vegId: 'onion', vegName: 'Onion', quantity: 10 },
      { vegId: 'potato', vegName: 'Potato', quantity: 20 }
    ],
    totalQuantity: 45,
    orderTime: '2026-07-02T22:34:00Z',
    billStatus: 'Billed',
    paymentStatus: 'Paid',
    invoiceId: 'INV-2026-001',
    notes: 'Deliver in plastic crates'
  },
  {
    id: 'ORD-002',
    customerId: 'gourmet',
    customerName: 'Gourmet Bites Restaurant',
    businessType: 'Restaurant',
    items: [
      { vegId: 'capsicum', vegName: 'Capsicum', quantity: 8 },
      { vegId: 'broccoli', vegName: 'Broccoli', quantity: 5 },
      { vegId: 'mushroom', vegName: 'Button Mushroom', quantity: 12 },
      { vegId: 'onion', vegName: 'Onion', quantity: 15 }
    ],
    totalQuantity: 40,
    orderTime: '2026-07-02T23:12:00Z',
    billStatus: 'Billed',
    paymentStatus: 'Partial',
    invoiceId: 'INV-2026-002',
    notes: 'Need fresh green broccoli'
  },
  {
    id: 'ORD-003',
    customerId: 'taj_palace',
    customerName: 'Taj Palace Hotel',
    businessType: 'Hotel',
    items: [
      { vegId: 'tomato', vegName: 'Tomato', quantity: 50 },
      { vegId: 'potato', vegName: 'Potato', quantity: 80 },
      { vegId: 'spinach', vegName: 'Spinach (Palak)', quantity: 25 },
      { vegId: 'lemon', vegName: 'Lemon', quantity: 10 }
    ],
    totalQuantity: 165,
    orderTime: '2026-07-02T23:45:00Z',
    billStatus: 'Billed',
    paymentStatus: 'Unpaid',
    invoiceId: 'INV-2026-003',
    notes: 'Urgent early morning delivery required'
  },
  {
    id: 'ORD-004',
    customerId: 'skyline',
    customerName: 'Skyline Catering Services',
    businessType: 'Caterer',
    items: [
      { vegId: 'onion', vegName: 'Onion', quantity: 30 },
      { vegId: 'potato', vegName: 'Potato', quantity: 50 },
      { vegId: 'cauliflower', vegName: 'Cauliflower', quantity: 15 }
    ],
    totalQuantity: 95,
    orderTime: '2026-07-03T21:10:00Z', // Today's order placed tonight
    billStatus: 'Pending',
    paymentStatus: 'Unpaid',
    notes: 'For corporate lunch event'
  },
  {
    id: 'ORD-005',
    customerId: 'ccd',
    customerName: 'CCD Cafe (City Center)',
    businessType: 'Cafe',
    items: [
      { vegId: 'tomato', vegName: 'Tomato', quantity: 18 },
      { vegId: 'onion', vegName: 'Onion', quantity: 12 },
      { vegId: 'coriander', vegName: 'Coriander (Dhania)', quantity: 8 }
    ],
    totalQuantity: 38,
    orderTime: '2026-07-03T22:05:00Z', // Today's order placed tonight
    billStatus: 'Pending',
    paymentStatus: 'Unpaid',
    notes: 'None'
  }
];

export const initialInvoices = [
  {
    id: 'INV-2026-001',
    customerId: 'ccd',
    customerName: 'CCD Cafe (City Center)',
    date: '2026-07-03',
    items: [
      { vegName: 'Tomato', quantity: 15, rate: 30, total: 450 },
      { vegName: 'Onion', quantity: 10, rate: 40, total: 400 },
      { vegName: 'Potato', quantity: 20, rate: 25, total: 500 }
    ],
    totalAmount: 1350,
    status: 'Paid',
    amountPaid: 1350
  },
  {
    id: 'INV-2026-002',
    customerId: 'gourmet',
    customerName: 'Gourmet Bites Restaurant',
    date: '2026-07-03',
    items: [
      { vegName: 'Capsicum', quantity: 8, rate: 80, total: 640 },
      { vegName: 'Broccoli', quantity: 5, rate: 120, total: 600 },
      { vegName: 'Button Mushroom', quantity: 12, rate: 60, total: 720 },
      { vegName: 'Onion', quantity: 15, rate: 40, total: 600 }
    ],
    totalAmount: 2560,
    status: 'Partial',
    amountPaid: 1500
  },
  {
    id: 'INV-2026-003',
    customerId: 'taj_palace',
    date: '2026-07-03',
    customerName: 'Taj Palace Hotel',
    items: [
      { vegName: 'Tomato', quantity: 50, rate: 28, total: 1400 },
      { vegName: 'Potato', quantity: 80, rate: 24, total: 1920 },
      { vegName: 'Spinach (Palak)', quantity: 25, rate: 15, total: 375 },
      { vegName: 'Lemon', quantity: 10, rate: 60, total: 600 }
    ],
    totalAmount: 4295,
    status: 'Unpaid',
    amountPaid: 0
  }
];

export const initialPayments = [
  {
    id: 'PAY-001',
    invoiceId: 'INV-2026-001',
    customerId: 'ccd',
    customerName: 'CCD Cafe (City Center)',
    amount: 1350,
    date: '2026-07-03T07:30:00Z',
    method: 'UPI',
    reference: 'UPI889271827'
  },
  {
    id: 'PAY-002',
    invoiceId: 'INV-2026-002',
    customerId: 'gourmet',
    customerName: 'Gourmet Bites Restaurant',
    amount: 1500,
    date: '2026-07-03T09:15:00Z',
    method: 'Bank Transfer',
    reference: 'TXN99281726'
  }
];

export const initialLedger = [
  {
    customerId: 'ccd',
    entries: [
      { date: '2026-07-01', description: 'Opening Balance', debit: 2450, credit: 0, balance: 2450 },
      { date: '2026-07-03', description: 'Invoice INV-2026-001', debit: 1350, credit: 0, balance: 3800 },
      { date: '2026-07-03', description: 'Payment PAY-001 [UPI]', debit: 0, credit: 1350, balance: 2450 }
    ]
  },
  {
    customerId: 'gourmet',
    entries: [
      { date: '2026-07-01', description: 'Opening Balance', debit: 11740, credit: 0, balance: 11740 },
      { date: '2026-07-03', description: 'Invoice INV-2026-002', debit: 2560, credit: 0, balance: 14300 },
      { date: '2026-07-03', description: 'Payment PAY-002 [Bank Transfer]', debit: 0, credit: 1500, balance: 12800 }
    ]
  },
  {
    customerId: 'taj_palace',
    entries: [
      { date: '2026-07-01', description: 'Opening Balance', debit: 44455, credit: 0, balance: 44455 },
      { date: '2026-07-03', description: 'Invoice INV-2026-003', debit: 4295, credit: 0, balance: 48750 }
    ]
  },
  {
    customerId: 'skyline',
    entries: [
      { date: '2026-07-01', description: 'Opening Balance', debit: 8300, credit: 0, balance: 8300 }
    ]
  },
  {
    customerId: 'healthy_greens',
    entries: [
      { date: '2026-07-01', description: 'Opening Balance', debit: 0, credit: 0, balance: 0 }
    ]
  }
];
