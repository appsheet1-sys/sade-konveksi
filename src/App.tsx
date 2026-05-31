import React, { useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_PORTFOLIO,
  DEFAULT_SETTINGS,
  INITIAL_ORDERS,
  INITIAL_MANUAL_SALES
} from './initialData';
import { Product, Order, OrderItem, PortfolioItem, AppSettings, ManualSale, OrderStatus } from './types';
import DirectChat from './components/DirectChat';
import CustomChart from './components/CustomChart';
import ManualSalesForm from './components/ManualSalesForm';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  ShoppingBag, 
  Trash2, 
  Search, 
  Filter, 
  Info, 
  Settings, 
  TrendingUp, 
  FileDown, 
  Upload, 
  Edit, 
  Plus, 
  UserPlus, 
  Check, 
  Clock, 
  Truck, 
  CheckCircle, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  ShoppingBasket, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  Smartphone, 
  Mail, 
  Printer, 
  CreditCard,
  Building,
  Sparkles,
  ShoppingBag as CartIcon,
  RotateCcw,
  Lock,
  LogOut
} from 'lucide-react';

export default function App() {
  // --- Persistent States (backed up to modern Cloud Firestore & local fallback) ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('konveksi_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('konveksi_portfolio');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('konveksi_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('konveksi_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [manualSales, setManualSales] = useState<ManualSale[]>(() => {
    const saved = localStorage.getItem('konveksi_manual_sales');
    return saved ? JSON.parse(saved) : INITIAL_MANUAL_SALES;
  });

  const [dbLoading, setDbLoading] = useState(true);

  // Firestore Synchronization Engine
  useEffect(() => {
    // 1. Sync Settings
    const settingsRef = doc(db, 'settings', 'global');
    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppSettings;
        setSettings(data);
        localStorage.setItem('konveksi_settings', JSON.stringify(data));
      } else {
        setDoc(settingsRef, DEFAULT_SETTINGS).catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/global'));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));

    // 2. Sync Products
    const productsColRef = collection(db, 'products');
    const unsubProducts = onSnapshot(productsColRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedProducts: Product[] = [];
        snapshot.forEach(doc => {
          loadedProducts.push(doc.data() as Product);
        });
        setProducts(loadedProducts);
        localStorage.setItem('konveksi_products', JSON.stringify(loadedProducts));
      } else {
        // Seed first-time products to Firestore database instance
        INITIAL_PRODUCTS.forEach(p => {
          setDoc(doc(db, 'products', p.id), p).catch(err => handleFirestoreError(err, OperationType.WRITE, `products/${p.id}`));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'products'));

    // 3. Sync Orders
    const ordersColRef = collection(db, 'orders');
    const unsubOrders = onSnapshot(ordersColRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedOrders: Order[] = [];
        snapshot.forEach(doc => {
          loadedOrders.push(doc.data() as Order);
        });
        loadedOrders.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(loadedOrders);
        localStorage.setItem('konveksi_orders', JSON.stringify(loadedOrders));
      } else {
        // Seed first-time orders to Firestore database instance
        INITIAL_ORDERS.forEach(o => {
          setDoc(doc(db, 'orders', o.id), o).catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${o.id}`));
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'orders'));

    // 4. Sync Manual Sales
    const manualSalesColRef = collection(db, 'manualSales');
    const unsubManualSales = onSnapshot(manualSalesColRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedSales: ManualSale[] = [];
        snapshot.forEach(doc => {
          loadedSales.push(doc.data() as ManualSale);
        });
        loadedSales.sort((a, b) => b.id.localeCompare(a.id));
        setManualSales(loadedSales);
        localStorage.setItem('konveksi_manual_sales', JSON.stringify(loadedSales));
      } else {
        // Seed first-time manual sales to Firestore database instance
        INITIAL_MANUAL_SALES.forEach(ms => {
          setDoc(doc(db, 'manualSales', ms.id), ms).catch(err => handleFirestoreError(err, OperationType.WRITE, `manualSales/${ms.id}`));
        });
      }
      setDbLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'manualSales');
      setDbLoading(false);
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubOrders();
      unsubManualSales();
    };
  }, []);

  // Sync static portfolio state to localStorage
  useEffect(() => {
    localStorage.setItem('konveksi_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // --- Applet Navigation ---
  // Tabs: 'shop' (Katalog), 'portfolio' (Galeri Karya), 'tracking' (Lacak Status), 'admin' (Dashboard Admin)
  const [activeTab, setActiveTab] = useState<'shop' | 'portfolio' | 'tracking' | 'admin'>('shop');

  // --- Shop States ---
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dialog flow states
  const [detailModalProduct, setDetailModalProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [sizeQuantities, setSizeQuantities] = useState<{ [size: string]: number }>({});
  
  // Shopping Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout form states
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutBank, setCheckoutBank] = useState(settings.paymentBanks[0]?.name || '');
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState<Order | null>(null);

  // Email & WA alert visual triggers
  const [waAlertText, setWaAlertText] = useState<string | null>(null);
  const [emailAlertText, setEmailAlertText] = useState<string | null>(null);

  // --- Tracking States ---
  const [trackInvoiceInput, setTrackInvoiceInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);

  // --- Admin States ---
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('is_admin_logged_in') === 'true';
  });
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'transactions' | 'products' | 'settings'>('dashboard');
  
  // Admin Editing Product Dialog
  const [adminProductEditing, setAdminProductEditing] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [productForm, setProductForm] = useState<{
    id: string;
    name: string;
    description: string;
    category: 'Baju' | 'Almamater' | 'Jaket' | 'Kaos' | 'Kemeja' | 'Lainnya';
    image: string;
    sizes: { size: string; price: number }[];
    colors: string; // comma-separated strings
    stock: number;
    basePrice: number;
  }>({
    id: '',
    name: '',
    description: '',
    category: 'Baju',
    image: '',
    sizes: [
      { size: 'S', price: 120000 },
      { size: 'M', price: 120050 },
      { size: 'L', price: 125000 },
      { size: 'XL', price: 130000 }
    ],
    colors: 'Hitam, Biru, Navy, Abu-abu',
    stock: 100,
    basePrice: 120000
  });

  // Admin Manual Sales Report Filters
  const [timeframeFilter, setTimeframeFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'admin2026') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('is_admin_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('Username atau kata sandi admin salah!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('is_admin_logged_in');
    setAdminUsername('');
    setAdminPassword('');
  };

  // --- Quick Reset helper ---
  const handleResetData = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke pengaturan awal pabrik? Semua pesanan baru akan terhapus.')) {
      try {
        localStorage.removeItem('konveksi_products');
        localStorage.removeItem('konveksi_portfolio');
        localStorage.removeItem('konveksi_settings');
        localStorage.removeItem('konveksi_orders');
        localStorage.removeItem('konveksi_manual_sales');

        // Delete settings
        await deleteDoc(doc(db, 'settings', 'global'));
        
        // Delete all products
        const prodSnap = await getDocs(collection(db, 'products'));
        const prodPromises = prodSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(prodPromises);

        // Delete all orders
        const ordSnap = await getDocs(collection(db, 'orders'));
        const ordPromises = ordSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(ordPromises);

        // Delete all manual sales
        const msSnap = await getDocs(collection(db, 'manualSales'));
        const msPromises = msSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(msPromises);

        alert('Data berhasil didefault-kan kembali! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'settings/global');
      }
    }
  };

  // --- Image referer guidelines ---
  // Ensure that dynamic image sources comply with <img referrerPolicy="no-referrer">

  // --- Open Product Detail Modal Setup ---
  const openProductDetail = (prod: Product) => {
    setDetailModalProduct(prod);
    setSelectedColor(prod.colors[0] || 'Utama');
    // Initialize size quantities to 0
    const initialQtys: { [size: string]: number } = {};
    prod.sizes.forEach(s => {
      initialQtys[s.size] = 0;
    });
    setSizeQuantities(initialQtys);
  };

  // --- Add Selected Multi-sizes item to Cart ---
  const handleAddToCart = () => {
    if (!detailModalProduct) return;

    // Calculate total quantity for this size assortment
    let totalQty = 0;
    Object.keys(sizeQuantities).forEach(sz => {
      totalQty += ((sizeQuantities[sz] as number) || 0);
    });

    // Validate minimum total order rule of 5
    if (totalQty < 5) {
      alert('Gagal menambahkan! Batas minimal pemesanan konveksi kami adalah 5 pcs per transaksi.');
      return;
    }

    // Build map of custom size prices configured for this product
    const sizePricesMap: { [size: string]: number } = {};
    detailModalProduct.sizes.forEach(s => {
      sizePricesMap[s.size] = s.price;
    });

    const newCartItem: OrderItem = {
      productId: detailModalProduct.id,
      productName: detailModalProduct.name,
      productCategory: detailModalProduct.category,
      productImage: detailModalProduct.image,
      qtyPerSize: { ...sizeQuantities },
      selectedColor: selectedColor,
      sizePrices: sizePricesMap
    };

    setCart(prev => [...prev, newCartItem]);
    setDetailModalProduct(null);
    setIsCartOpen(true);
  };

  // --- Calculate total amount in Cart ---
  const getCartSummary = () => {
    let totalItems = 0;
    let totalValue = 0;

    cart.forEach(item => {
      Object.entries(item.qtyPerSize).forEach(([size, qty]) => {
        const qtyNum = qty as number;
        if (qtyNum > 0) {
          totalItems += qtyNum;
          const price = (item.sizePrices[size] as number) || 100000;
          totalValue += price * qtyNum;
        }
      });
    });

    return { totalItems, totalValue };
  };

  // --- Delete item from Cart ---
  const handleRemoveCartItem = (indexToRemove: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- Checkout Processing ---
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const { totalItems, totalValue } = getCartSummary();

    // Re-verify global checkout rule: total items across all products in cart must be at least 5
    if (totalItems < 5) {
      alert('Maaf, akumulasi pesanan dalam keranjang Anda kurang dari minimal 5 pcs.');
      return;
    }

    const matchedBank = settings.paymentBanks.find(b => b.name === checkoutBank) || settings.paymentBanks[0];
    const destinationText = `${matchedBank?.name} - Rek ${matchedBank?.accountNumber} a/n ${matchedBank?.holder}`;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      invoiceNumber: `INV/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}/${Math.floor(Math.random() * 900 + 100)}`,
      customerName: checkoutName,
      customerPhone: checkoutPhone.startsWith('0') ? '62' + checkoutPhone.slice(1) : checkoutPhone,
      customerEmail: checkoutEmail,
      items: [...cart],
      totalAmount: totalValue,
      paymentMethod: `Transfer Bank (${checkoutBank})`,
      transferDestination: destinationText,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      waNotified: true,
      emailNotified: true
    };

    try {
      // 1. Save new Order to Firestore
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);

      // 2. Subtract inventory stock for product items in cart on Firestore
      for (const item of cart) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          let orderedQty = 0;
          Object.keys(item.qtyPerSize).forEach(sz => {
            orderedQty += ((item.qtyPerSize[sz] as number) || 0);
          });
          const updatedProd = { ...prod, stock: Math.max(0, prod.stock - orderedQty) };
          await setDoc(doc(db, 'products', prod.id), updatedProd);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`);
    }

    // Format WA and Email notifications text to showcase integrations
    const waText = `WhatsApp Otomatis Terkirim ke +${newOrder.customerPhone}:\n"Halo ${newOrder.customerName}, terima kasih atas pesanan konveksi Anda! Faktur ${newOrder.invoiceNumber} sebesar Rp ${newOrder.totalAmount.toLocaleString('id-ID')} telah direkam. Silakan transfer ke ${newOrder.transferDestination}."`;
    const emailText = `Notifikasi Email Terkirim ke Pemilik Toko (${settings.storeName}):\n"Pesanan masuk baru! Klien: ${newOrder.customerName} (${newOrder.customerEmail}) memesan sebanyak ${totalItems} pcs pakaian konveksi dengan total invoice Rp ${newOrder.totalAmount.toLocaleString('id-ID')}. Segera proses di Dashboard."`;
    
    setWaAlertText(waText);
    setEmailAlertText(emailText);

    // Reset shopping cart
    setCart([]);
    setIsCartOpen(false);
    setCheckoutName('');
    setCheckoutPhone('');
    setCheckoutEmail('');

    // Open Success Receipt Drawer
    setShowOrderSuccessModal(newOrder);

    // Hide notifications banners after 9 seconds
    setTimeout(() => {
      setWaAlertText(null);
      setEmailAlertText(null);
    }, 12000);
  };

  // --- Admin Add Manual offline Sale ---
  const handleAddManualSale = async (newSaleData: Omit<ManualSale, 'id'>) => {
    const sale: ManualSale = {
      id: 'ms-' + Date.now(),
      ...newSaleData
    };
    try {
      await setDoc(doc(db, 'manualSales', sale.id), sale);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `manualSales/${sale.id}`);
    }
  };

  // --- Admin Modify Store Settings ---
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Konfigurasi pengaturan utama toko dan gambar header kustom berhasil disimpan secara real-time!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    }
  };

  // --- Edit custom size prices and details in Admin Panel ---
  const openEditProduct = (prod: Product) => {
    setAdminProductEditing(prod);
    setIsAddingNewProduct(false);
    setProductForm({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      category: prod.category,
      image: prod.image,
      sizes: [...prod.sizes],
      colors: prod.colors.join(', '),
      stock: prod.stock,
      basePrice: prod.basePrice
    });
  };

  const openAddNewProduct = () => {
    setIsAddingNewProduct(true);
    setAdminProductEditing(null);
    setProductForm({
      id: 'prod-' + Date.now(),
      name: '',
      description: '',
      category: 'Baju',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
      sizes: [
        { size: 'M', price: 100000 },
        { size: 'L', price: 100000 },
        { size: 'XL', price: 105000 }
      ],
      colors: 'Hitam, Merah, Biru',
      stock: 50,
      basePrice: 100000
    });
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedColors = productForm.colors
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const targetProduct: Product = {
      id: productForm.id,
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      image: productForm.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
      sizes: productForm.sizes,
      colors: parsedColors,
      stock: productForm.stock,
      basePrice: productForm.sizes[0]?.price || productForm.basePrice
    };

    try {
      await setDoc(doc(db, 'products', targetProduct.id), targetProduct);
      if (isAddingNewProduct) {
        setIsAddingNewProduct(false);
      } else {
        setAdminProductEditing(null);
      }
      alert('Data produk konveksi dan kustom harga setiap ukuran berhasil disimpan!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${targetProduct.id}`);
    }
  };

  // --- Delete Product ---
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini dari katalog?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  // --- Admin update order status ---
  const handleChangeOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    let trackingPrompt: string | undefined = undefined;
    if (nextStatus === 'shipped') {
      const code = prompt('Masukkan Nomor Resi Pengiriman Paket:', `TRK-${new Date().getFullYear()}0001`);
      if (code) trackingPrompt = code;
    }

    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      const updatedOrder: Order = {
        ...ord,
        status: nextStatus,
        trackingNumber: trackingPrompt || ord.trackingNumber || ''
      };
      try {
        await setDoc(doc(db, 'orders', orderId), updatedOrder);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
      }
    }
  };

  // --- Download reports to CSV (Excel readable format) ---
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID Transaksi,Faktur,Klien,Tanggal,Metode Pembayaran,Total Nilai Pembayaran,Status\n';

    // Accumulate both orders and manual sales for exact accounting reports
    orders.forEach(o => {
      csvContent += `"${o.id}","${o.invoiceNumber}","${o.customerName}","${o.date}","${o.paymentMethod}",${o.totalAmount},"${o.status}"\n`;
    });

    manualSales.forEach(ms => {
      csvContent += `"${ms.id}","MANUAL-OFFLINE","${ms.description}","${ms.date}","Tunai / Kas",${ms.amount},"done"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_Konveksi_${timeframeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print friendly sales report layout trigger
  const handlePrintReport = () => {
    window.print();
  };

  // --- Sales Metrics aggregations ---
  // Calculates real-time total sales values (both online bank transfers and offline manual records)
  const getOverallSalesStats = () => {
    // Current year/month check
    const now = new Date();
    const currentYearStr = now.getFullYear().toString();
    const currentMonthPrefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];

    let totalOnlineIncome = 0;
    let totalOfflineIncome = 0;

    let dailyTotal = 0;
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    // Process online orders (only processing or done count as active sales)
    orders.forEach(o => {
      const amount = o.totalAmount;
      if (o.status !== 'pending') {
        totalOnlineIncome += amount;
        if (o.date === todayStr) dailyTotal += amount;
        if (o.date.startsWith(currentMonthPrefix)) monthlyTotal += amount;
        if (o.date.startsWith(currentYearStr)) yearlyTotal += amount;
      }
    });

    // Process manual sales (always counted as done)
    manualSales.forEach(ms => {
      const amount = ms.amount;
      totalOfflineIncome += amount;
      if (ms.date === todayStr) dailyTotal += amount;
      if (ms.date.startsWith(currentMonthPrefix)) monthlyTotal += amount;
      if (ms.date.startsWith(currentYearStr)) yearlyTotal += amount;
    });

    return {
      totalOnlineIncome,
      totalOfflineIncome,
      grandTotal: totalOnlineIncome + totalOfflineIncome,
      dailyTotal,
      monthlyTotal,
      yearlyTotal
    };
  };

  const salesStats = getOverallSalesStats();

  // --- Build data array for Custom Chart ---
  const getChartDataPoints = () => {
    if (timeframeFilter === 'daily') {
      // Map last 7 days including today
      const points = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        
        let sum = 0;
        orders.forEach(o => { if (o.date === dayStr && o.status !== 'pending') sum += o.totalAmount; });
        manualSales.forEach(ms => { if (ms.date === dayStr) sum += ms.amount; });

        points.push({
          label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          value: sum
        });
      }
      return points;
    } else if (timeframeFilter === 'monthly') {
      // Map months Jan to Dec of current year
      const year = new Date().getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return monthNames.map((m, idx) => {
        const prefix = `${year}-${(idx + 1).toString().padStart(2, '0')}`;
        let sum = 0;
        orders.forEach(o => { if (o.date.startsWith(prefix) && o.status !== 'pending') sum += o.totalAmount; });
        manualSales.forEach(ms => { if (ms.date.startsWith(prefix)) sum += ms.amount; });
        return { label: m, value: sum };
      });
    } else {
      // Yearly comparison 2024 to 2026
      const years = ['2024', '2025', '2026'];
      return years.map(y => {
        let sum = 0;
        orders.forEach(o => { if (o.date.startsWith(y) && o.status !== 'pending') sum += o.totalAmount; });
        manualSales.forEach(ms => { if (ms.date.startsWith(y)) sum += ms.amount; });
        return { label: `Tahun ${y}`, value: sum };
      });
    }
  };

  const chartData = getChartDataPoints();

  // Filtered Products for public display
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg font-semibold text-teal-400">Menghubungkan ke Database...</h2>
          <p className="text-xs text-slate-400 font-mono">Sinkronisasi data real-time via Cloud Firestore</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-teal-600 selection:text-white">

      {/* --- NOTIFICATION BANNERS FOR SIMULATING WA/EMAIL OUTCOMES --- */}
      {waAlertText && (
        <div className="fixed top-4 right-4 max-w-sm bg-emerald-600 text-white z-50 rounded-xl p-4 shadow-2xl border border-emerald-400/30 animate-bounce">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-5 h-5 shrink-0 animate-pulse mt-0.5" />
            <div>
              <p className="font-bold text-xs tracking-wider uppercase text-emerald-100">Integrasi WhatsApp Sukses</p>
              <p className="text-xs font-mono whitespace-pre-wrap mt-1 leading-relaxed">{waAlertText}</p>
            </div>
            <button onClick={() => setWaAlertText(null)} className="text-emerald-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {emailAlertText && (
        <div className="fixed top-28 right-4 max-w-sm bg-teal-950 text-slate-100 z-50 rounded-xl p-4 shadow-2xl border border-teal-500/30">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 shrink-0 text-teal-400 mt-0.5" />
            <div>
              <p className="font-bold text-xs tracking-wider uppercase text-teal-300">Integrasi Notifikasi Email</p>
              <p className="text-xs whitespace-pre-wrap mt-1 leading-relaxed">{emailAlertText}</p>
            </div>
            <button onClick={() => setEmailAlertText(null)} className="text-teal-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- GLOBAL APP BAR HEADER --- */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Store Editable Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShoppingBasket className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-teal-400 font-bold block">
                KONVEKSI PARTNER
              </span>
              <h1 className="text-sm font-bold text-white tracking-tight -mt-0.5 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {settings.storeName}
              </h1>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'shop', label: 'Katalog & Pesan' },
              { id: 'portfolio', label: 'Galeri Portofolio' },
              { id: 'tracking', label: 'Lacak Status Pesanan' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveTab(btn.id as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg tracking-wider transition-all duration-200 uppercase ${
                  activeTab === btn.id
                    ? 'bg-slate-850 text-teal-400 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </nav>

          {/* Quick Shortcuts */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 hover:text-teal-400 transition group focus:outline-none"
              title="Buka Keranjang"
            >
              <CartIcon className="w-5 h-5 text-slate-300 group-hover:scale-110 transition" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold font-mono animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Admin toggle icon */}
            <button
              onClick={() => {
                setActiveTab('admin');
                setAdminTab('dashboard');
              }}
              className={`p-2.5 rounded-xl border flex items-center space-x-1.5 text-xs font-bold font-mono transition ${
                activeTab === 'admin'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-amber-400'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Kelola Admin</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden bg-slate-900 border-t border-slate-800/80 grid grid-cols-3 divide-x divide-slate-800 text-center text-xs">
          <button
            onClick={() => setActiveTab('shop')}
            className={`py-2 px-1 font-semibold ${activeTab === 'shop' ? 'text-teal-400 bg-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Katalog
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-2 px-1 font-semibold ${activeTab === 'portfolio' ? 'text-teal-400 bg-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Portofolio
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-2 px-1 font-semibold ${activeTab === 'tracking' ? 'text-teal-400 bg-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Lacak
          </button>
        </div>
      </header>

      {/* --- GAUL HEADLINE / TRENDY HERO HEADER BANNER (ADMIN CHANGEABLE) --- */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800/50">
        
        {/* Dynamic header background configured by admin */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity overflow-hidden">
          <img
            src={settings.headerImage}
            alt="Convection Material Sewing Background"
            className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Ambient Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/30 to-transparent" />

        {/* Core Gaul Content container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 flex flex-col justify-end min-h-[300px]">
          <div className="max-w-2xl text-left">
            <span className="inline-flex items-center space-x-1.5 bg-teal-500/10 text-teal-300 font-bold text-[10px] tracking-widest uppercase border border-teal-500/20 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
              <span>YOUTH FABRIC & CREATIVE TAILORS</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
              GARMENT SEWING & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">CUSTOM DESIGN ELITE</span>
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Kami memproduksi jaket, jas almamater, kemeja PDH, dan kaos polo berkualitas tinggi untuk instansi pemda, swasta, dan komunitas mahasiswa. Desain kustom elegan, jaminan mutu jahitan presisi, <span className="text-white font-bold decoration-teal-400 underline">minimal order hanya 5 pcs!</span>
            </p>
            
            {/* Quick stats overlays */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
              <div className="bg-slate-900/80 border border-slate-800/80 px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>Mengerjakan Proyek BUMN & Pemda</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bebas Kombinasi Multi Ukuran</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN PAGE LAYOUT --- */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ======================================================== */}
        {/* TAB 1: SHOPPING PRODUCT CATALOG */}
        {/* ======================================================== */}
        {activeTab === 'shop' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Filter and Search header Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category buttons tabbed lists */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Kategori:
                </span>
                {['Semua', 'Almamater', 'Jaket', 'Kaos', 'Kemeja'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-250 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-teal-400 shadow'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search text box input */}
              <div className="relative max-w-sm w-full">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari almamater, jaket bomber..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>

            {/* Shop Product Grid cards with aspect ratio constraint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((p) => {
                const colorsCount = p.colors.length;
                return (
                  <div
                    key={p.id}
                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
                  >
                    {/* Visual Card Image thumbnail */}
                    <div className="aspect-video relative overflow-hidden bg-slate-100 cursor-pointer" onClick={() => openProductDetail(p)}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/90 text-teal-400 font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-widest">
                        {p.category}
                      </div>

                      {p.stock === 0 ? (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-rose-400 font-bold text-xs uppercase tracking-widest">
                          Stok Habis / Kontak Admin
                        </div>
                      ) : p.stock < 100 ? (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-mono text-[9px] uppercase font-black px-2 py-0.5 rounded-lg">
                          Stok Terbatas: {p.stock} Pcs
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-teal-600 text-white font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg">
                          Stok Siap: {p.stock} Pcs
                        </div>
                      )}
                    </div>

                    {/* Description Body */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Custom title */}
                        <h4
                          onClick={() => openProductDetail(p)}
                          className="font-bold text-slate-900 text-base hover:text-teal-600 cursor-pointer line-clamp-1 transition duration-200"
                        >
                          {p.name}
                        </h4>
                        
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Attribute color pills info */}
                        <div className="mt-4 flex flex-wrap gap-1">
                          {p.colors.slice(0, 3).map((col, cIdx) => (
                            <span key={cIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {col}
                            </span>
                          ))}
                          {colorsCount > 3 && (
                            <span className="text-[10px] text-teal-600 font-bold align-middle mt-0.5 ml-1">
                              +{colorsCount - 3} Warna Lain
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom prices row & action */}
                      <div className="mt-5 pt-4 border-t border-slate-150 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">
                            Estimasi Mulai
                          </span>
                          <span className="text-base font-extrabold text-teal-600 font-mono">
                            Rp {p.sizes[0]?.price ? p.sizes[0].price.toLocaleString('id-ID') : p.basePrice.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium"> / pcs</span>
                        </div>
                        
                        <button
                          onClick={() => openProductDetail(p)}
                          className="bg-teal-600 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center transition duration-200 space-x-1"
                        >
                          <span>Pesan Online</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full bg-white border border-slate-200 p-12 text-center rounded-2xl max-w-md mx-auto shadow-sm">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">Produk Tidak Ditemukan</p>
                  <p className="text-slate-500 text-xs mt-1">Coba gunakan kata kunci lainnya atau ubah filter kategori pencarian konveksi.</p>
                  <button
                    onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
                    className="mt-4 text-xs font-bold text-teal-650 hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PORTFOLIO GALLERY */}
        {/* ======================================================== */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                Hasil Karya Nyata Garment Kami
              </h3>
              <p className="text-xs text-slate-500">
                Dokumentasi produk yang sudah selesai diproduksi oleh konveksi kami, dipercayakan oleh berbagai institusi resmi pemerintah maupun perseroan swasta nasional.
              </p>
            </div>

            {/* Grid of Portfolios with Referrer Policy compliance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row"
                >
                  <div className="w-full md:w-5/12 h-48 md:h-auto relative bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 left-3 bg-teal-600 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full font-mono">
                      {item.year}
                    </span>
                  </div>

                  <div className="p-6 md:w-7/12 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase font-mono block mb-1">
                        {item.agency}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Jenis: <strong className="text-slate-600">{item.category}</strong></span>
                      <span className="text-emerald-500 flex items-center font-bold">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Selesai Produksi
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Gallery Call to Action banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center space-y-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-teal-400" />
              <div>
                <p className="font-bold text-sm tracking-wide text-teal-200">
                  INGIN HASIL KARYA INSTANSI ANDA TAMPIL DI SINI?
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Hubungi admin secara langsung melalui tombol chat melayang di pojok kanan bawah untuk berkoordinasi mengenai draf desain dan sampel bahan kain gratis!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CUSTOMER REAL-TIME TRACKING DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'tracking' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Tracking Search Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-teal-500 animate-pulse" />
                Sistem Pelacakan Status Pemesanan Konveksi Real-time
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Pantau proses pengerjaan jahitan pesanan almamater, baju, atau jaket komparatif secara transparan. Masukkan nama lengkap instansi/pemesan atau nomor tagihan invoice Anda di bawah ini:
              </p>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-600">INPUT DATA PELANGGAN</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={trackInvoiceInput}
                    onChange={(e) => setTrackInvoiceInput(e.target.value)}
                    placeholder="Contoh: Universitas Indonesia, CV Cahaya, atau INV/2026/0512/001"
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-teal-500 transition font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const match = orders.find(o => 
                        o.invoiceNumber.toLowerCase().includes(trackInvoiceInput.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(trackInvoiceInput.toLowerCase())
                      );
                      setSearchedOrder(match || null);
                      if (!match) alert('Maaf, pesanan yang Anda cocokkan belum terdaftar di sistem.');
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-teal-400 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Lacak Status
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Saran Pencarian Cepat:</span>
                  <button onClick={() => { setTrackInvoiceInput('Senat'); }} className="underline hover:text-teal-600">Senat</button>
                  <span>•</span>
                  <button onClick={() => { setTrackInvoiceInput('Cahaya'); }} className="underline hover:text-teal-600">Cahaya</button>
                </div>
              </div>
            </div>

            {/* Direct Track Status Output visual block */}
            {searchedOrder ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md animate-in slide-in-from-top-3 duration-200">
                {/* Header detail info */}
                <div className="bg-slate-950 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#2bdcc2] uppercase font-bold block">
                      ID TRANSAKSI DIPROSES
                    </span>
                    <h4 className="font-extrabold text-[#ffffff] text-lg font-mono tracking-tight mt-0.5">
                      {searchedOrder.invoiceNumber}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-medium">{searchedOrder.customerName}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-right">
                    <span className="block text-[9px] text-slate-400 font-mono font-bold uppercase">Tanggal Transaksi</span>
                    <span className="font-semibold text-xs font-mono">{searchedOrder.date}</span>
                  </div>
                </div>

                {/* Progress Tracking Map */}
                <div className="p-6">
                  <div className="relative">
                    {/* Horizontal Line background connector */}
                    <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 hidden md:block" />

                    {/* Progress tracking points */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                      
                      {/* Step 1: Pending */}
                      <div className="flex items-start md:flex-col md:items-center text-left md:text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0 ${
                          searchedOrder.status === 'pending' || searchedOrder.status === 'processing' || searchedOrder.status === 'shipped' || searchedOrder.status === 'done'
                            ? 'bg-emerald-500 text-slate-900 font-bold'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {searchedOrder.status !== 'pending' ? <Check className="w-5 h-5 font-bold" /> : '1'}
                        </div>
                        <div className="ml-4 md:ml-0 md:mt-3">
                          <p className="font-bold text-xs text-slate-800">Menunggu Pembayaran</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">DP atau Lunas</p>
                        </div>
                      </div>

                      {/* Step 2: Processing */}
                      <div className="flex items-start md:flex-col md:items-center text-left md:text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0 ${
                          searchedOrder.status === 'processing' || searchedOrder.status === 'shipped' || searchedOrder.status === 'done'
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-slate-150 text-slate-400'
                        }`}>
                          {searchedOrder.status === 'shipped' || searchedOrder.status === 'done' ? <Check className="w-5 h-5 font-bold" /> : '2'}
                        </div>
                        <div className="ml-4 md:ml-0 md:mt-3">
                          <p className="font-bold text-xs text-slate-800">Proses Produksi</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pemotongan & Bordir</p>
                        </div>
                      </div>

                      {/* Step 3: Shipped */}
                      <div className="flex items-start md:flex-col md:items-center text-left md:text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0 ${
                          searchedOrder.status === 'shipped' || searchedOrder.status === 'done'
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-slate-150 text-slate-400'
                        }`}>
                          {searchedOrder.status === 'done' ? <Check className="w-5 h-5 font-bold" /> : '3'}
                        </div>
                        <div className="ml-4 md:ml-0 md:mt-3">
                          <p className="font-bold text-xs text-slate-800">Pengiriman</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Diserahkan Kurir</p>
                        </div>
                      </div>

                      {/* Step 4: Done */}
                      <div className="flex items-start md:flex-col md:items-center text-left md:text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0 ${
                          searchedOrder.status === 'done'
                            ? 'bg-emerald-500 text-slate-900 font-bold'
                            : 'bg-slate-150 text-slate-400'
                        }`}>
                          4
                        </div>
                        <div className="ml-4 md:ml-0 md:mt-3">
                          <p className="font-bold text-xs text-slate-800">Selesai / Diterima</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Serah Terima Fisik</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Details section inside tracking paper */}
                  <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 rounded-xl p-5">
                    <h5 className="font-bold text-xs text-slate-700 uppercase tracking-widest mb-3 font-mono">Daftar Pakaian yang Dipesan</h5>
                    <div className="space-y-4">
                      {searchedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-3">
                            <img src={it.productImage} className="w-12 h-12 rounded object-cover border" alt={it.productName} referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-xs text-slate-800">{it.productName}</p>
                              <p className="text-[10px] text-slate-500">Warna Pilihan: <strong className="text-slate-700">{it.selectedColor}</strong></p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="block text-[10px] text-slate-400 font-mono">Keterangan Ukuran (Qty)</span>
                            <span className="text-xs text-slate-800 font-mono bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded font-black">
                              {Object.entries(it.qtyPerSize)
                                .filter(([_, q]) => (q as number) > 0)
                                .map(([s, q]) => `${s}: ${q as number} pcs`)
                                .join(', ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap justify-between items-center text-xs font-mono font-medium gap-3">
                      <div>
                        <span className="text-slate-400 mr-2">NOMOR RESI JNE/TIKI:</span>
                        <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-[11px] font-bold">
                          {searchedOrder.trackingNumber || 'BELUM BERSEDIA (MENUNGGU PRODUKSI)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-2">TOTAL BILL:</span>
                        <span className="text-teal-600 font-bold bg-teal-50 px-2.5 py-1 rounded text-[11px]">
                          Rp {searchedOrder.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border border-dashed border-slate-300 p-8 text-center rounded-2xl text-slate-500 text-xs">
                Masukkan informasi pendaftaran atau nama kelompok di bilah atas untuk memulai proses penjejakan secara transparan.
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ADVANCED BUSINESS CONTROL ADMIN DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'admin' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-12 animate-in slide-in-from-bottom duration-300">
                {/* Header aspect */}
                <div className="bg-slate-900 px-6 py-8 text-center relative border-b border-slate-800">
                  <div className="mx-auto w-12 h-12 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="font-sans font-black text-white text-base tracking-widest uppercase">OTENTIKASI ADMINISTRATOR</h4>
                  <p className="text-slate-400 text-xs mt-1 font-sans">Harap masuk untuk mengelola konveksi</p>
                </div>

                <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
                  {loginError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center space-x-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Username Admin</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan username admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Password Admin</label>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan kata sandi admin"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition duration-300 shadow-md hover:shadow-lg mt-2 cursor-pointer"
                  >
                    Masuk ke Dashboard
                  </button>

                  <div className="text-center pt-2 text-[10px] text-slate-400">
                    Sistem Keamanan Utama • 2026
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* Header / Config Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-teal-400 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 animate-bounce text-teal-400" />
                  Aplikasi Web Admin Panel
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Pengelolaan stok barang, kustom harga, otentikasi pesanan, pelaporan keuangan, dan pergantian header website.
                </p>
              </div>

              {/* Sub tabs in admin workspace */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'dashboard', label: 'Dashboard Penjualan' },
                  { id: 'transactions', label: 'Daftar Transaksi' },
                  { id: 'products', label: 'Kelola Produk & Ukuran' },
                  { id: 'settings', label: 'Pengaturan Utama' }
                ].map((adm) => (
                  <button
                    key={adm.id}
                    onClick={() => setAdminTab(adm.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold tracking-wider uppercase transition ${
                      adminTab === adm.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {adm.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-3 py-1.5 rounded-lg font-semibold tracking-wider uppercase transition bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center space-x-1 ml-auto cursor-pointer"
                  title="Logout dari Sesi Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>

            {/* --- ADMIN SUB-TAB 1: DYNAMIC CHARTS & REAL-TIME SUMMARY STATS --- */}
            {adminTab === 'dashboard' && (
              <div className="space-y-8">
                
                {/* 3 Large Value indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase block">KUMULATIF OMZET GLOBAL</span>
                    <h5 className="text-xl font-extrabold text-teal-600 mt-1 font-mono">
                      Rp {salesStats.grandTotal.toLocaleString('id-ID')}
                    </h5>
                    <div className="mt-2 text-[10px] text-slate-500">
                      <span>Online: <strong className="text-slate-700">Rp {salesStats.totalOnlineIncome.toLocaleString('id-ID')}</strong></span>
                      <span className="mx-1">•</span>
                      <span>Offline: <strong className="text-slate-700">Rp {salesStats.totalOfflineIncome.toLocaleString('id-ID')}</strong></span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase block">OMZET HARI INI</span>
                    <h5 className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">
                      Rp {salesStats.dailyTotal.toLocaleString('id-ID')}
                    </h5>
                    <span className="text-[10px] text-emerald-500 font-semibold block mt-1">↑ Real-time update live</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase block">OMZET BULAN INI</span>
                    <h5 className="text-xl font-extrabold text-slate-800 mt-1 font-mono">
                      Rp {salesStats.monthlyTotal.toLocaleString('id-ID')}
                    </h5>
                    <span className="text-[10px] text-slate-500 block mt-1">Mei {new Date().getFullYear()}</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase block">KPI TAHUNAN</span>
                    <h5 className="text-xl font-extrabold text-teal-600 mt-1 font-mono">
                      Rp {salesStats.yearlyTotal.toLocaleString('id-ID')}
                    </h5>
                    <span className="text-[10px] text-slate-500 block mt-1">Target tahunan konveksi</span>
                  </div>

                </div>

                {/* SVG Live sales chart with daily/monthly/yearly toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">
                      Kurva Analisis Transaksi Keuangan
                    </h4>
                    <div className="flex space-x-1.5 bg-slate-200 p-1 rounded-lg text-[10px] font-semibold">
                      {(['daily', 'monthly', 'yearly'] as const).map((filterOpt) => (
                        <button
                          key={filterOpt}
                          onClick={() => setTimeframeFilter(filterOpt)}
                          className={`px-3 py-1 rounded uppercase tracking-wider transition ${
                            timeframeFilter === filterOpt
                              ? 'bg-slate-900 text-teal-400 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {filterOpt === 'daily' ? '7 Hari Terakhir' : filterOpt === 'monthly' ? 'Bulanan' : 'Tahunan'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CustomChart data={chartData} title={`Laporan Transaksi Keuangan (${timeframeFilter.toUpperCase()})`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left component: Manual Entry book sales form */}
                  <div className="lg:col-span-2">
                    <ManualSalesForm onAddSale={handleAddManualSale} />
                  </div>

                  {/* Right side: Manual records history list */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest font-mono">
                        Riwayat Offline / Tunai
                      </h4>
                      <span className="text-[9px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded font-black font-mono">
                        {manualSales.length} Riwayat
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {manualSales.map((ms) => (
                        <div key={ms.id} className="bg-slate-50 p-3 rounded-lg border text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800">{ms.description}</span>
                            <span className="font-mono text-emerald-600 font-extrabold">
                              +Rp{ms.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                            <span>Kategori: <strong className="text-slate-600">{ms.category}</strong></span>
                            <span>{ms.date}</span>
                          </div>
                        </div>
                      ))}

                      {manualSales.length === 0 && (
                        <p className="text-slate-400 text-xs text-center py-6">Tidak ada penjualan manual offline yang diinput.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* --- ADMIN SUB-TAB 2: CLIENT ORDERS RECEIVED & EXPORT CAPABILITIES --- */}
            {adminTab === 'transactions' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Download PDF/Excel Toolbar */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest font-mono">
                      Data Log Antrean Pesanan Masuk
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Berisi rangkuman checkout pelanggan online secara detil.</p>
                  </div>

                  <div className="flex space-x-2.5">
                    <button
                      onClick={handleExportCSV}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center space-x-1.5 transition"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download Excel (CSV)</span>
                    </button>
                    <button
                      onClick={handlePrintReport}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center space-x-1.5 transition animate-pulse"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak PDF Laporan</span>
                    </button>
                  </div>
                </div>

                {/* Print area wrapper */}
                <div id="print-area-sales-report" className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Faktur / Klien</th>
                        <th className="px-6 py-4">Detail Pakaian & Warna</th>
                        <th className="px-6 py-4">Total Biaya</th>
                        <th className="px-6 py-4">Status & Pengiriman</th>
                        <th className="px-6 py-4 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          
                          {/* Invoice & Client contact */}
                          <td className="px-6 py-4 space-y-1">
                            <span className="font-mono font-bold text-teal-600 block">{ord.invoiceNumber}</span>
                            <span className="font-extrabold text-slate-800 text-sm block">{ord.customerName}</span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              <p>{ord.customerEmail}</p>
                              <p>+{ord.customerPhone}</p>
                            </div>
                          </td>

                          {/* Items and colors chose */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="text-slate-700">
                                  <strong className="text-slate-900 font-semibold">{it.productName}</strong>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    Warna: {it.selectedColor} | Assortment: {Object.entries(it.qtyPerSize)
                                      .filter(([_, q]) => (q as number) > 0)
                                      .map(([s, q]) => `${s}(${q as number}pcs)`)
                                      .join(', ')}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Cash amount */}
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 text-sm">
                            Rp {ord.totalAmount.toLocaleString('id-ID')}
                          </td>

                          {/* Order Status selector */}
                          <td className="px-6 py-4 space-y-2">
                            {/* Visual Status Indicator Badge */}
                            <div>
                              {ord.status === 'pending' && (
                                <span className="bg-amber-100/80 text-amber-800 font-bold px-2.5 py-1 rounded text-[10px] uppercase font-mono">
                                  Menunggu Bayar
                                </span>
                              )}
                              {ord.status === 'processing' && (
                                <span className="bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded text-[10px] uppercase font-mono">
                                  Sedang Diproduksi
                                </span>
                              )}
                              {ord.status === 'shipped' && (
                                <span className="bg-sky-100 text-sky-800 font-bold px-2.5 py-1 rounded text-[10px] uppercase font-mono">
                                  Sudah Dikirim
                                </span>
                              )}
                              {ord.status === 'done' && (
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded text-[10px] uppercase font-mono">
                                  Selesai
                                </span>
                              )}
                            </div>

                            {/* Tracking code info if exists */}
                            {ord.trackingNumber && (
                              <p className="text-[9px] font-mono text-slate-400">Resi: <strong className="text-slate-700">{ord.trackingNumber}</strong></p>
                            )}
                          </td>

                          {/* Trigger actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col space-y-1 items-end">
                              {ord.status === 'pending' && (
                                <button
                                  onClick={() => handleChangeOrderStatus(ord.id, 'processing')}
                                  className="text-[10px] bg-slate-900 hover:bg-teal-600 text-[#2bdcc2] hover:text-white px-2 py-1 rounded border border-slate-800 font-bold font-mono transition"
                                >
                                  Terima DP & Produksi
                                </button>
                              )}
                              {ord.status === 'processing' && (
                                <button
                                  onClick={() => handleChangeOrderStatus(ord.id, 'shipped')}
                                  className="text-[10px] bg-slate-900 hover:bg-teal-600 text-amber-400 hover:text-white px-2 py-1 rounded border border-slate-800 font-bold font-mono transition"
                                >
                                  Kirim / Input Resi
                                </button>
                              )}
                              {ord.status === 'shipped' && (
                                <button
                                  onClick={() => handleChangeOrderStatus(ord.id, 'done')}
                                  className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded font-bold font-mono transition"
                                >
                                  Tandai Selesai
                                </button>
                              )}
                              {ord.status === 'done' && (
                                <span className="text-[10px] text-emerald-600 font-bold block">✓ Done</span>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))}

                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">Belum ada pesanan terdaftar di sistem.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- ADMIN SUB-TAB 3: INTERACTIVE INVENTORY STOCKS & SIZES WRITER --- */}
            {adminTab === 'products' && (
              <div className="space-y-8">
                
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest font-mono">
                    Manajemen Katalog & Kustom Harga per Ukuran
                  </h4>
                  <button
                    onClick={openAddNewProduct}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk Baru</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <img src={p.image} className="w-14 h-14 rounded-lg object-cover border" alt={p.name} referrerPolicy="no-referrer" />
                          <div>
                            <span className="text-[9px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded uppercase font-mono">{p.category}</span>
                            <h5 className="font-bold text-slate-900 text-sm mt-0.5">{p.name}</h5>
                            <span className="text-xs text-slate-400 block font-mono">Sisa Unit: <strong className="text-slate-700 font-semibold">{p.stock} pcs</strong></span>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="bg-slate-100 hover:bg-teal-100 p-2 rounded text-slate-600 hover:text-teal-600 transition"
                            title="Edit Produk & Harga Ukuran"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="bg-slate-100 hover:bg-rose-100 p-2 rounded text-slate-650 hover:text-rose-600 transition"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Display of customizable sizing prices configured */}
                      <div className="p-3 bg-slate-50 rounded-lg text-xs">
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-2">
                          Kustom Harga Ukuran (Input Admin)
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {p.sizes.map((sField, sIdx) => (
                            <div key={sIdx} className="bg-white border p-1.5 rounded text-center">
                              <span className="font-extrabold text-[10px] text-slate-500 block">{sField.size}</span>
                              <span className="font-mono text-[10px] font-black text-teal-600">
                                Rp {sField.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider font-mono mt-3 mb-1">
                          Warna Yang Disediakan
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {p.colors.map((col, cIdx) => (
                            <span key={cIdx} className="bg-white border text-[10px] text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* --- ADMIN SUB-TAB 4: MAIN APP CONFIGS & EDIT STORES NAME --- */}
            {adminTab === 'settings' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="font-bold text-base text-slate-900 border-b pb-2">
                    Pengaturan Utama Konveksi
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Sesuaikan nama toko, no WhatsApp utama, link marketplace Shopee/Tokopedia, dan perbarui visual gambar header.</p>
                </div>

                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Store Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Toko Konveksi</label>
                      <input
                        type="text"
                        required
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>

                    {/* Header Image URL */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link Gambar Banner/Header Gaul (URL)</label>
                      <input
                        type="url"
                        required
                        value={settings.headerImage}
                        onChange={(e) => setSettings({ ...settings, headerImage: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Ubah link Unsplash ini untuk langsung mengganti spanduk utama halaman atas.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    {/* Tokopedia */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link Marketplace Tokopedia</label>
                      <input
                        type="url"
                        value={settings.tokopediaUrl}
                        onChange={(e) => setSettings({ ...settings, tokopediaUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                    </div>

                    {/* Shopee */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link Marketplace Shopee</label>
                      <input
                        type="url"
                        value={settings.shopeeUrl}
                        onChange={(e) => setSettings({ ...settings, shopeeUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                    </div>

                    {/* TikTok */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link Aplikasi TikTok Shop</label>
                      <input
                        type="url"
                        value={settings.tiktokUrl}
                        onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor Telepon WhatsApp Bisnis (Kirim Otomatis)</label>
                      <input
                        type="text"
                        required
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        placeholder="Contoh: 628123456789"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link Media Sosial Instagram</label>
                      <input
                        type="url"
                        value={settings.instagramUrl}
                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                    {/* Dev helper hardreset */}
                    <button
                      type="button"
                      onClick={handleResetData}
                      className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg font-bold flex items-center transition"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      <span>Kosongkan & Reset Seluruh Data</span>
                    </button>

                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Simpan Seluruh Pengaturan
                    </button>
                  </div>

                </form>
              </div>
            )}

              </>
            )}
          </div>
        )}

      </main>

      {/* --- SIDE OR OVERLAY DIALOG 1: PRODUCT ASSORTMENT DETAIL SELECTOR MODAL --- */}
      {detailModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row p-1.5">
            
            {/* Visual display Image */}
            <div className="w-full md:w-5/12 h-64 md:h-auto relative bg-slate-100 rounded-xl overflow-hidden self-stretch">
              <img
                src={detailModalProduct.image}
                alt={detailModalProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-900/90 text-teal-400 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                {detailModalProduct.category}
              </span>
            </div>

            {/* Customizer content */}
            <div className="w-full md:w-7/12 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    {detailModalProduct.name}
                  </h4>
                  <button
                    onClick={() => setDetailModalProduct(null)}
                    className="text-slate-400 hover:text-slate-900 p-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  {detailModalProduct.description}
                </p>

                {/* 1. Colors selection (Dynamically determined by Admin) */}
                <div className="mt-5 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    1. PILIH WARNA JAHITAN
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {detailModalProduct.colors.map((colorName) => (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className={`text-xs border px-3 py-1.5 rounded-lg font-semibold transition ${
                          selectedColor === colorName
                            ? 'bg-slate-900 text-teal-400 border-slate-900'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {colorName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Assortment Multi-sizes ordering quantities input with individual prices */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      2. MAINKAN UKURAN (MINIMAL 5 PCS)
                    </label>
                    <span className="text-[10px] bg-teal-50 text-teal-600 px-2.5 py-0.5 rounded font-black font-mono">
                      Bebas Campur Ukuran
                    </span>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {detailModalProduct.sizes.map((sField) => {
                      const currentVal = sizeQuantities[sField.size] || 0;
                      return (
                        <div key={sField.size} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-700 font-mono mr-2">{sField.size}</span>
                            <span className="text-slate-450 font-mono text-[10px]/none inline-block">
                              Rp {sField.price.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSizeQuantities(prev => ({
                                  ...prev,
                                  [sField.size]: Math.max(0, currentVal - 1)
                                }));
                              }}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 border text-center font-bold font-mono text-xs flex justify-center items-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-slate-850">
                              {currentVal}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSizeQuantities(prev => ({
                                  ...prev,
                                  [sField.size]: currentVal + 1
                                }));
                              }}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 border text-center font-bold font-mono text-xs flex justify-center items-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Total calculations of sizes chose */}
              <div className="mt-6 pt-4 border-t border-slate-150 flex items-center justify-between">
                <div>
                  {/* Calculate total quantities counter */}
                  {(() => {
                    let totalQty = 0;
                    Object.keys(sizeQuantities).forEach(sz => {
                      totalQty += ((sizeQuantities[sz] as number) || 0);
                    });
                    let sumCost = 0;
                    Object.entries(sizeQuantities).forEach(([sizeName, q]) => {
                      const qNum = q as number;
                      const detailSizePrice = detailModalProduct.sizes.find(s => s.size === sizeName)?.price || detailModalProduct.basePrice;
                      sumCost += (detailSizePrice * qNum);
                    });

                    return (
                      <>
                        <span className="block text-[10px] text-slate-400 font-mono font-bold">TOTAL KUANTITAS: <strong className="text-teal-600 font-bold">{totalQty} pcs</strong></span>
                        <span className="text-xl font-extrabold text-[#111111] font-mono">
                          Rp {sumCost.toLocaleString('id-ID')}
                        </span>
                        {totalQty < 5 && (
                          <span className="block text-[10px] text-rose-500 font-semibold mt-0.5">
                            * Minimal order 5 pcs
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="bg-teal-600 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tambahkan Ke Keranjang</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- SIDE DIALOG 2: SHOPPING CART SLIDE OVER BAR WITH BANK DETAILS --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Header toolbar */}
            <div className="bg-slate-950 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-teal-400" />
                <h4 className="font-extrabold text-sm tracking-widest uppercase font-mono">Keranjang Belanja</h4>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart list content scroll space */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {cart.map((item, idx) => {
                // Calculate item sum
                let subTotal = 0;
                let singleProdQty = 0;
                Object.entries(item.qtyPerSize).forEach(([sz, q]) => {
                  const qNum = q as number;
                  const price = (item.sizePrices[sz] as number) || 100000;
                  subTotal += price * qNum;
                  singleProdQty += qNum;
                });

                return (
                  <div key={idx} className="bg-slate-50 border p-4 rounded-xl space-y-3 relative">
                    
                    {/* Floating remove button */}
                    <button
                      onClick={() => handleRemoveCartItem(idx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
                      title="Hapus item"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="flex items-center space-x-3.5">
                      <img src={item.productImage} className="w-12 h-12 rounded-lg object-cover border" alt={item.productName} referrerPolicy="no-referrer" />
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded">{item.productCategory}</span>
                        <h5 className="font-bold text-slate-900 text-xs mt-1 truncate max-w-[200px]">{item.productName}</h5>
                        <p className="text-[10px] text-slate-400">Pilihan Warna: <strong className="text-slate-600">{item.selectedColor}</strong></p>
                      </div>
                    </div>

                    {/* Sizings counters display */}
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-mono">Spesifikasi Ukuran:</span>
                        <span className="font-bold text-slate-700 font-mono">
                          {Object.entries(item.qtyPerSize)
                            .filter(([_, qty]) => (qty as number) > 0)
                            .map(([sz, qty]) => `${sz}: ${qty as number} pcs`)
                            .join(', ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block font-mono">Nilai Item:</span>
                        <span className="font-extrabold text-[#111111] font-mono">
                          Rp {subTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}

              {cart.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500">Keranjang Anda masih kosong. Pilih almamater atau jaket terbaik di katalog kami!</p>
                </div>
              )}

              {/* Checkout Customer Data Info formulation */}
              {cart.length > 0 && (
                <form id="checkout-form-submit" onSubmit={handleCheckoutSubmit} className="pt-5 border-t border-slate-200 space-y-4">
                  <h5 className="font-bold text-xs text-slate-700 uppercase tracking-widest font-mono">Isi Form Pengiriman Konveksi</h5>
                  
                  {/* Nama lengkap */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap Pemesan / Instansi</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Indra / Universitas Airlangga"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>

                  {/* No Handphone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor WhatsApp Pelanggan (Untuk Konfirmasi)</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 08129837192"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                    />
                  </div>

                  {/* Alamat Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alamat Email Aktif</label>
                    <input
                      type="email"
                      required
                      placeholder="Contoh: emailklien@gmail.com"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>

                  {/* BANK PILIHAN TRANSFER METODE INDRA */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilihan Metode Transfer Bank</label>
                    <select
                      value={checkoutBank}
                      onChange={(e) => setCheckoutBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-teal-500 transition"
                    >
                      {settings.paymentBanks.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name} - Rek {b.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              )}

            </div>

            {/* Bottom aggregate billing panel & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 bg-slate-900 text-white border-t border-slate-800 space-y-4">
                
                {(() => {
                  const summary = getCartSummary();
                  return (
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span>Total ({summary.totalItems} Pcs):</span>
                      <strong className="text-teal-400 text-base">
                        Rp {summary.totalValue.toLocaleString('id-ID')}
                      </strong>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  form="checkout-form-submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-350 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Kirim & Konfirmasi Pesanan Online</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- SIDE OVERLAY DIALOG 3: CHECKOUT SUCCESS INVOICE RECEIPT MODAL --- */}
      {showOrderSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-150 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Check className="w-6 h-6 stroke-[3px]" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">PESANAN ANDA TELAH MASUK!</h4>
              <p className="text-xs text-slate-500">Sistem otomatis kami baru saja mengirimkan simulasi pesan konfirmasi WhatsApp & pelaporan internal pemilik via email.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3.5 border text-xs">
              
              <div className="flex justify-between font-mono font-bold text-slate-700">
                <span>FAKTUR INVOICE:</span>
                <span className="text-teal-600">{showOrderSuccessModal.invoiceNumber}</span>
              </div>

              <div className="flex justify-between font-mono text-[11px] text-slate-500">
                <span>Atas Nama Klien:</span>
                <strong className="text-slate-800">{showOrderSuccessModal.customerName}</strong>
              </div>

              <div className="flex justify-between font-mono text-[11px] text-slate-500">
                <span>Nomor Kontak:</span>
                <strong className="text-slate-800">+{showOrderSuccessModal.customerPhone}</strong>
              </div>

              <div className="pt-3 border-t border-dashed space-y-2 font-mono">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">SISTEM METODE TRANSFER BANK</p>
                <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
                  <p className="font-bold text-teal-400 text-[11px]">{showOrderSuccessModal.paymentMethod}</p>
                  <p className="text-xs text-slate-300 mt-1 hover:underline select-all">{showOrderSuccessModal.transferDestination}</p>
                </div>
              </div>

              <div className="flex justify-between font-mono font-extrabold text-[#111111] text-sm pt-3 border-t border-slate-200">
                <span>TOTAL PEMBAYARAN:</span>
                <span>Rp {showOrderSuccessModal.totalAmount.toLocaleString('id-ID')}</span>
              </div>

            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setTrackInvoiceInput(showOrderSuccessModal.invoiceNumber);
                  setSearchedOrder(showOrderSuccessModal);
                  setActiveTab('tracking');
                  setShowOrderSuccessModal(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Lacak Proses Produksi Jahitan
              </button>
              <button
                type="button"
                onClick={() => setShowOrderSuccessModal(null)}
                className="w-full text-slate-500 hover:text-slate-950 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Kembali Belanja
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- SIDE DIALOG 4: ADMIN MODIFY PRODUCT DETAILS AND SIZES PRICES DIALOG --- */}
      {(adminProductEditing || isAddingNewProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="text-base font-extrabold text-slate-900">
                {isAddingNewProduct ? 'Tambah Katalog Produk Baru' : `Pengaturan Produk: ${productForm.name}`}
              </h4>
              <button
                onClick={() => { setAdminProductEditing(null); setIsAddingNewProduct(false); }}
                className="text-slate-450 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Produk Pakaian</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Jaket Almamater Universitas Brawijaya"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="Baju">Baju</option>
                    <option value="Almamater">Almamater</option>
                    <option value="Jaket">Jaket</option>
                    <option value="Kaos">Kaos & Polo</option>
                    <option value="Kemeja">Kemeja PDL / PDH</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Stok Inventaris Pcs</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Link Foto Produk (URL Image)</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Daftar Pilihan Warna (pisahkan dengan koma)</label>
                <input
                  type="text"
                  required
                  value={productForm.colors}
                  onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  placeholder="Contoh: Merah, Hitam, Navy, Hijau Army"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Deskripsi & Spesifikasi Jahit</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Tuliskan spesifikasi kain furing dormeul, jahitan bordir komputer..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500 text-slate-800"
                />
              </div>

              {/* DYNAMIC SIZE AND PRICE CONFIGS INPUT ROW FROM USER_REQUEST */}
              <div className="space-y-2 border-t pt-3">
                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] font-mono">
                  Input Kustom Harga per Ukuran (M, L, XL, dll..)
                </label>
                
                <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border">
                  {productForm.sizes.map((sField, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center space-x-4">
                      <span className="font-mono font-bold text-xs text-slate-700 w-12 text-center bg-slate-200 p-1 rounded">Ukuran {sField.size}</span>
                      <div className="flex-grow relative">
                        <span className="absolute left-2.5 top-2 text-slate-400">Rp</span>
                        <input
                          type="number"
                          required
                          value={sField.price}
                          onChange={(e) => {
                            const newSizes = [...productForm.sizes];
                            newSizes[sIdx].price = Number(e.target.value);
                            setProductForm({ ...productForm, sizes: newSizes });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 pl-8 text-xs font-mono font-bold text-slate-800 text-right focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setAdminProductEditing(null); setIsAddingNewProduct(false); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Simpan Produk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- BUSINESS FOOTER --- */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Section 1: Intro info */}
          <div className="space-y-4 text-xs">
            <span className="text-[10px] font-mono tracking-widest text-[#2bdcc2] uppercase font-bold block">
              KONVEKSI PLATFORM
            </span>
            <p className="font-bold text-sm text-slate-100">
              {settings.storeName}
            </p>
            <p className="text-slate-400 leading-relaxed font-light">
              Mitra profesional pengerjaan jas almamater angkatan maba, jaket bomber organisasi swasta dan pemprov terkemuka dengan ketepatan waktu tinggi dan harga terjangkau.
            </p>
          </div>

          {/* Section 2: Marketplace external links requested by client */}
          <div className="space-y-3.5 text-xs">
            <p className="font-bold tracking-widest text-slate-300 font-mono text-[10px] uppercase">
              BELANJA DI MARKETPLACE
            </p>
            <ul className="space-y-2 font-medium">
              <li>
                <a href={settings.shopeeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 flex items-center space-x-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kunjungi Shopee Store Kami</span>
                </a>
              </li>
              <li>
                <a href={settings.tokopediaUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 flex items-center space-x-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kunjungi Tokopedia Store Kami</span>
                </a>
              </li>
              <li>
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 flex items-center space-x-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kunjungi TikTok Shop Kami</span>
                </a>
              </li>
              <li>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 flex items-center space-x-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Instagram Official</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3: Color and Size capabilities details */}
          <div className="space-y-3.5 text-xs text-slate-400">
            <p className="font-bold tracking-widest text-slate-300 font-mono text-[10px] uppercase">
              KETENTUAN KONVEKSI
            </p>
            <ul className="space-y-1 bg-slate-900/50 p-3 rounded-lg border border-slate-900 flex flex-col justify-center">
              <li>• Minimal Order: <strong className="text-white">5 pcs / satu desain</strong></li>
              <li>• Kombinasi ukuran bebas</li>
              <li>• Kustomisasi warna gratis</li>
              <li>• Jaminan garansi cacat ganti baru</li>
            </ul>
          </div>

          {/* Section 4: Bank methods supported logos */}
          <div className="space-y-3.5 text-xs">
            <p className="font-bold tracking-widest text-slate-300 font-mono text-[10px] uppercase">
              METODE TRANSFER BANK TERIMA
            </p>
            <div className="flex flex-wrap gap-2">
              {settings.paymentBanks.map((b, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-2 rounded text-left w-36">
                  <p className="font-bold text-[10px] text-teal-400 font-mono leading-none">{b.name}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono tracking-tight">{b.accountNumber}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Status Transfer langsung dikonfirmasi otomatis ke admin kami.</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 {settings.storeName}. All Rights Reserved. Creative Tailors & Fabric Hub.</p>
          <div className="flex space-x-4">
            <span className="text-[10px] font-mono text-emerald-400">⚡ LIVE SYNC ACTIVE</span>
            <span>•</span>
            <span className="text-[10px] font-mono text-slate-400">UTC CLOCK: 2026-05-31</span>
          </div>
        </div>
      </footer>

      {/* --- FLOATING CHAT COMPONENT DIRECT WHATSAPP / OWNER CHAT --- */}
      <DirectChat storeName={settings.storeName} />

    </div>
  );
}
