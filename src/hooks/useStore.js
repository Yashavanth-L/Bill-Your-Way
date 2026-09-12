import { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

const DEFAULT_MENU = [
  { 
    id: '1', 
    name: 'Cosmic Truffle Burger', 
    price: 14.99, 
    category: 'Mains', 
    prepTime: 12, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    description: 'Angus beef patty with truffle aioli, aged cheddar & caramelized onions on a brioche bun.',
    isVeg: false,
    isSpicy: false,
    isGF: false,
    inStock: true
  },
  { 
    id: '2', 
    name: 'Nebula Loaded Fries', 
    price: 6.99, 
    category: 'Sides', 
    prepTime: 8, 
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy seasoned fries smothered in melted jack cheese, jalapeños & house avocado drizzle.',
    isVeg: true,
    isSpicy: true,
    isGF: true,
    inStock: true
  },
  { 
    id: '3', 
    name: 'Galactic Berry Shake', 
    price: 5.99, 
    category: 'Drinks', 
    prepTime: 5, 
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75bb8ef?auto=format&fit=crop&w=600&q=80',
    description: 'Creamy artisan vanilla gelato blended with wild berries & topped with galaxy sprinkles.',
    isVeg: true,
    isSpicy: false,
    isGF: true,
    inStock: true
  },
  {
    id: '4',
    name: 'Starlight Artisan Pizza',
    price: 16.50,
    category: 'Mains',
    prepTime: 15,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    description: 'Wood-fired sourdough base with San Marzano tomatoes, fresh mozzarella, and basil oil.',
    isVeg: true,
    isSpicy: false,
    isGF: false,
    inStock: true
  },
  {
    id: '5',
    name: 'Firebird Spicy Wings',
    price: 10.99,
    category: 'Starters',
    prepTime: 10,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy jumbo wings tossed in smoked habanero glaze with blue cheese dipping sauce.',
    isVeg: false,
    isSpicy: true,
    isGF: false,
    inStock: true
  },
  {
    id: '6',
    name: 'Supernova Lava Cake',
    price: 7.99,
    category: 'Desserts',
    prepTime: 7,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    description: 'Warm Belgian dark chocolate lava cake served with espresso gelato.',
    isVeg: true,
    isSpicy: false,
    isGF: false,
    inStock: true
  }
];

// Initialize default data if empty or outdated
if (!localStorage.getItem('restaurant_menu')) {
  localStorage.setItem('restaurant_menu', JSON.stringify(DEFAULT_MENU));
} else {
  // Ensure fields exist for existing storage
  const existing = JSON.parse(localStorage.getItem('restaurant_menu'));
  const updated = existing.map(item => ({
    description: 'Delicious chef recommendation prepared with premium ingredients.',
    isVeg: item.category === 'Drinks' || item.category === 'Desserts' || item.category === 'Sides',
    isSpicy: false,
    isGF: false,
    inStock: item.inStock ?? true,
    ...item
  }));
  localStorage.setItem('restaurant_menu', JSON.stringify(updated));
}

if (!localStorage.getItem('restaurant_orders')) {
  localStorage.setItem('restaurant_orders', JSON.stringify([]));
}

if (!localStorage.getItem('restaurant_payment_details')) {
  localStorage.setItem('restaurant_payment_details', JSON.stringify({
    name: 'Aura Dining & Lounge',
    paymentUrl: 'upi://pay?pa=auradining@upi&pn=AuraDining',
    qrImageUrl: ''
  }));
}

if (!localStorage.getItem('restaurant_tables')) {
  localStorage.setItem('restaurant_tables', JSON.stringify([
    { id: '1', number: 1, capacity: 4, token: 'table01secret' },
    { id: '2', number: 2, capacity: 2, token: 'table02secret' },
    { id: '3', number: 3, capacity: 6, token: 'table03secret' },
    { id: '4', number: 4, capacity: 4, token: 'table04secret' },
  ]));
} else {
  // Ensure existing tables have capacity field
  try {
    const existingTables = JSON.parse(localStorage.getItem('restaurant_tables'));
    const updatedTables = existingTables.map(t => ({
      capacity: 4,
      ...t
    }));
    localStorage.setItem('restaurant_tables', JSON.stringify(updatedTables));
  } catch (e) {
    // ignore parse error
  }
}

export function useMenu() {
  const [menu, setMenu] = useState(() => JSON.parse(localStorage.getItem('restaurant_menu')));

  useEffect(() => {
    const handleStorage = () => setMenu(JSON.parse(localStorage.getItem('restaurant_menu')));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('menu_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('menu_updated', handleStorage);
    };
  }, []);

  const addMenuItem = (item) => {
    const newMenu = [...menu, { ...item, id: Date.now().toString(), inStock: true }];
    localStorage.setItem('restaurant_menu', JSON.stringify(newMenu));
    window.dispatchEvent(new Event('menu_updated'));
  };

  const removeMenuItem = (id) => {
    const newMenu = menu.filter(item => item.id !== id);
    localStorage.setItem('restaurant_menu', JSON.stringify(newMenu));
    window.dispatchEvent(new Event('menu_updated'));
  };

  const updateMenuItem = (updatedItem) => {
    const newMenu = menu.map(item => item.id === updatedItem.id ? updatedItem : item);
    localStorage.setItem('restaurant_menu', JSON.stringify(newMenu));
    window.dispatchEvent(new Event('menu_updated'));
  };

  const toggleStockStatus = (id) => {
    const newMenu = menu.map(item => item.id === id ? { ...item, inStock: !item.inStock } : item);
    localStorage.setItem('restaurant_menu', JSON.stringify(newMenu));
    window.dispatchEvent(new Event('menu_updated'));
  };

  return { menu, addMenuItem, removeMenuItem, updateMenuItem, toggleStockStatus };
}

export function useOrders() {
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('restaurant_orders')));

  useEffect(() => {
    const handleStorage = () => setOrders(JSON.parse(localStorage.getItem('restaurant_orders')));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('orders_updated', handleStorage);
    
    const interval = setInterval(handleStorage, 1500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('orders_updated', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const placeOrder = (tableNo, items, note = '') => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalPrepTime = items.reduce((max, item) => Math.max(max, item.prepTime || 10), 0);
    
    const newOrder = {
      id: Date.now().toString(),
      tableNo,
      items,
      total,
      totalPrepTime,
      note,
      status: 'pending', // pending -> preparing -> ready -> delivered
      timestamp: new Date().toISOString()
    };

    const newOrders = [newOrder, ...orders];
    localStorage.setItem('restaurant_orders', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('orders_updated'));
    sound.playOrderPlaced();
    sound.playKitchenAlert();
  };

  const updateOrderStatus = (orderId, status) => {
    const newOrders = orders.map(o => {
      if (o.id === orderId) {
        const updates = { status };
        if (status === 'preparing' && o.status !== 'preparing') {
          updates.prepStartTime = Date.now();
        }
        return { ...o, ...updates };
      }
      return o;
    });
    localStorage.setItem('restaurant_orders', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('orders_updated'));
    sound.playTap();
  };

  const clearTable = (tableNo) => {
    const newOrders = orders.map(o => o.tableNo === tableNo ? { ...o, paid: true } : o);
    localStorage.setItem('restaurant_orders', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('orders_updated'));
  };

  return { orders, placeOrder, updateOrderStatus, clearTable };
}

export function useTables() {
  const [tables, setTables] = useState(() => JSON.parse(localStorage.getItem('restaurant_tables')));

  useEffect(() => {
    const handleStorage = () => setTables(JSON.parse(localStorage.getItem('restaurant_tables')));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('tables_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('tables_updated', handleStorage);
    };
  }, []);

  const addTable = (number, capacity = 4) => {
    if (tables.find(t => t.number === number)) return;
    const newTables = [
      ...tables, 
      { 
        id: Date.now().toString(), 
        number, 
        capacity: Math.max(1, parseInt(capacity, 10) || 4),
        token: Math.random().toString(36).substring(2, 15) 
      }
    ];
    localStorage.setItem('restaurant_tables', JSON.stringify(newTables));
    window.dispatchEvent(new Event('tables_updated'));
  };

  const updateTable = (id, updates) => {
    const newTables = tables.map(t => t.id === id ? { ...t, ...updates } : t);
    localStorage.setItem('restaurant_tables', JSON.stringify(newTables));
    window.dispatchEvent(new Event('tables_updated'));
  };

  const removeTable = (id) => {
    const newTables = tables.filter(t => t.id !== id);
    localStorage.setItem('restaurant_tables', JSON.stringify(newTables));
    window.dispatchEvent(new Event('tables_updated'));
  };

  const regenerateTableToken = (number) => {
    const newTables = tables.map(t => t.number.toString() === number.toString() ? { ...t, token: Math.random().toString(36).substring(2, 15) } : t);
    localStorage.setItem('restaurant_tables', JSON.stringify(newTables));
    window.dispatchEvent(new Event('tables_updated'));
  };

  return { tables, addTable, updateTable, removeTable, regenerateTableToken };
}

export function usePaymentDetails() {
  const [paymentDetails, setPaymentDetails] = useState(() => JSON.parse(localStorage.getItem('restaurant_payment_details')));

  useEffect(() => {
    const handleStorage = () => setPaymentDetails(JSON.parse(localStorage.getItem('restaurant_payment_details')));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('payment_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('payment_updated', handleStorage);
    };
  }, []);

  const updatePaymentDetails = (details) => {
    localStorage.setItem('restaurant_payment_details', JSON.stringify(details));
    setPaymentDetails(details);
    window.dispatchEvent(new Event('payment_updated'));
  };

  return { paymentDetails, updatePaymentDetails };
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => localStorage.getItem('restaurant_currency') || '₹');

  useEffect(() => {
    const handleStorage = () => setCurrencyState(localStorage.getItem('restaurant_currency') || '₹');
    window.addEventListener('storage', handleStorage);
    window.addEventListener('currency_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('currency_updated', handleStorage);
    };
  }, []);

  const setCurrency = (symbol) => {
    localStorage.setItem('restaurant_currency', symbol);
    setCurrencyState(symbol);
    window.dispatchEvent(new Event('currency_updated'));
  };

  const formatPrice = (amount) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `${currency}${num.toFixed(2)}`;
  };

  return { currency, setCurrency, formatPrice };
}

