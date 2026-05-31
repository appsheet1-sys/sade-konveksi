import { Product, PortfolioItem, AppSettings, Order, ManualSale } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Almamater Premium Blazer',
    description: 'Jas almamater premium bahan Drill High Twist dengan furing dormeuil england full body. Dilengkapi dengan peding bahu, kancing emboss instansi/kampus, saku rahasia di bagian dalam, serta jaminan jahitan presisi standar butik.',
    category: 'Almamater',
    basePrice: 135000,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    sizes: [
      { size: 'S', price: 135000 },
      { size: 'M', price: 135000 },
      { size: 'L', price: 135000 },
      { size: 'XL', price: 140000 },
      { size: 'XXL', price: 145000 },
      { size: 'XXXL', price: 155000 }
    ],
    colors: ['Biru Navy', 'Celadon Green', 'Merah Maroon', 'Hitam Jetblack', 'Abu Charcoal'],
    stock: 250
  },
  {
    id: 'prod-2',
    name: 'Jaket Bomber Taslan Waterproof',
    description: 'Jaket Bomber dengan bahan parasut Taslan balon import waterproof 90% (tahan air) dan furing dacron quilting bermotif orange cerah atau hitam. Jahitan benang nilon kuat dan risleting metal YKK awet.',
    category: 'Jaket',
    basePrice: 145000,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    sizes: [
      { size: 'S', price: 145000 },
      { size: 'M', price: 145000 },
      { size: 'L', price: 145000 },
      { size: 'XL', price: 150000 },
      { size: 'XXL', price: 155000 }
    ],
    colors: ['Hijau Army', 'Hitam', 'Biru Navy', 'Abu Tua'],
    stock: 180
  },
  {
    id: 'prod-3',
    name: 'Kemeja PDL Canvas Tactical',
    description: 'Kemeja seragam PDL bahan Baby Canvas atau Ripstop Tornado premium yang sangat kuat untuk aktivitas indoor maupun outdoor. Dilengkapi lubang sirkulasi udara di punggung dan saku fungsional bertingkat.',
    category: 'Kemeja',
    basePrice: 115000,
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=600',
    sizes: [
      { size: 'S', price: 115000 },
      { size: 'M', price: 115000 },
      { size: 'L', price: 115000 },
      { size: 'XL', price: 120000 },
      { size: 'XXL', price: 125000 }
    ],
    colors: ['Khaki Beige', 'Hitam', 'Biru Navy', 'Hijau Olive', 'Abu Semen'],
    stock: 300
  },
  {
    id: 'prod-4',
    name: 'Kaos Polo Cotton Pique Premium',
    description: 'Kaos polo wangki dengan bahan Cotton Pique premium berpori halus, tidak gerah, menyerap keringat maksimal dengan kerah rajut kokoh. Sangat elegan untuk acara kasual perusahaan dan seragam semi-formal.',
    category: 'Kaos',
    basePrice: 65000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    sizes: [
      { size: 'S', price: 65000 },
      { size: 'M', price: 65000 },
      { size: 'L', price: 68000 },
      { size: 'XL', price: 72000 },
      { size: 'XXL', price: 75000 }
    ],
    colors: ['Hitam', 'Putih', 'Biru Navy', 'Merah Cabe', 'Hijau Botol'],
    stock: 450
  },
  {
    id: 'prod-5',
    name: 'Jaket Parka Outdoor Canvas',
    description: 'Jaket Parka semi-casual dengan kupluk yang bisa dilepas, dibuat dari katun kanvas baby bertekstur lembut namun tangguh, dengan furing katun kaos bermotif kotak-kotak hangat.',
    category: 'Jaket',
    basePrice: 160000,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600',
    sizes: [
      { size: 'S', price: 160000 },
      { size: 'M', price: 160000 },
      { size: 'L', price: 160000 },
      { size: 'XL', price: 165000 },
      { size: 'XXL', price: 175000 }
    ],
    colors: ['Khaki', 'Hitam', 'Cokelat Kayu', 'Biru Navy'],
    stock: 120
  }
];

export const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Seragam PDL Basarnas Daerah',
    agency: 'Instansi Pemerintah',
    category: 'Kemeja PDL',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600',
    description: 'Produksi 450 stel seragam PDL taktis komplit dengan bordir komputer emblem daerah, terbuat dari bahan Ripstop dilapisi teflon pelindung air.',
    year: '2025'
  },
  {
    id: 'port-2',
    title: 'Jas Almamater Senat Universitas Utama',
    agency: 'Akademik / Pendidikan',
    category: 'Almamater',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
    description: 'Jas almamater custom dengan kancing kuningan cor gravir logogram senat universitas denga furing adem furing saten sutera berkualitas.',
    year: '2025'
  },
  {
    id: 'port-3',
    title: 'Polo Shirt Karyawan Go-Tech Startup',
    agency: 'Perusahaan Swasta',
    category: 'Polo Shirt',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    description: 'Pembuatan 1200 pcs Kaos Polo Pique Premium untuk seragam kantor startup teknologi, desain minimalis modern bernuansa abu & teal.',
    year: '2026'
  },
  {
    id: 'port-4',
    title: 'Jaket Bomber Crew BUMN Energi',
    agency: 'Instansi Pemerintah / BUMN',
    category: 'Jaket',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    description: 'Distribusi 750 Jaket bomber taktis tahan hembusan angin (windproof) bagi kru lapangan dan operator pelabuhan kontainer.',
    year: '2025'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Kresna Garment & Konveksi Mandiri',
  headerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
  shopeeUrl: 'https://shopee.co.id',
  tiktokUrl: 'https://tiktok.com',
  tokopediaUrl: 'https://tokopedia.com',
  instagramUrl: 'https://instagram.com',
  whatsappNumber: '6281234567890',
  paymentBanks: [
    { name: 'Bank BCA', accountNumber: '8839012389', holder: 'PT Kresna Garment Mandiri' },
    { name: 'Bank Mandiri', accountNumber: '1370020192831', holder: 'Indra Kresna Mandiri' },
    { name: 'Bank BRI', accountNumber: '002301982736152', holder: 'PT Kresna Garment Mandiri' }
  ]
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1002',
    invoiceNumber: 'INV/2026/0512/001',
    customerName: 'Universitas Indonesia Senat',
    customerPhone: '628129876543',
    customerEmail: 'senat.ui@gmail.com',
    items: [
      {
        productId: 'prod-1',
        productName: 'Almamater Premium Blazer',
        productCategory: 'Almamater',
        productImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
        qtyPerSize: { 'M': 15, 'L': 20, 'XL': 10 },
        selectedColor: 'Biru Navy',
        sizePrices: { 'M': 135000, 'L': 135000, 'XL': 140000 }
      }
    ],
    totalAmount: ((15 * 135000) + (20 * 135000) + (10 * 140000)), // 6,125,000
    paymentMethod: 'Transfer Bank (Bank BCA)',
    transferDestination: 'Bank BCA - 8839012389 a/n PT Kresna Garment Mandiri',
    status: 'processing',
    date: '2026-05-12',
    waNotified: true,
    emailNotified: true,
    trackingNumber: 'TRK-20260512-AB12'
  },
  {
    id: 'ord-1001',
    invoiceNumber: 'INV/2026/0510/003',
    customerName: 'CV Cahaya Mulia Swasta',
    customerPhone: '628781234567',
    customerEmail: 'cahayamulia@office.com',
    items: [
      {
        productId: 'prod-4',
        productName: 'Kaos Polo Cotton Pique Premium',
        productCategory: 'Kaos',
        productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
        qtyPerSize: { 'S': 10, 'M': 30, 'L': 40, 'XL': 20 },
        selectedColor: 'Hitam',
        sizePrices: { 'S': 65000, 'M': 65000, 'L': 68000, 'XL': 72000 }
      }
    ],
    totalAmount: ((10 * 65000) + (30 * 65000) + (40 * 68000) + (20 * 72000)), // 6,760,000
    paymentMethod: 'Transfer Bank (Bank Mandiri)',
    transferDestination: 'Bank Mandiri - 1370020192831 a/n Indra Kresna Mandiri',
    status: 'done',
    date: '2026-05-10',
    waNotified: true,
    emailNotified: true,
    trackingNumber: 'TRK-24129381-DONE'
  }
];

export const INITIAL_MANUAL_SALES: ManualSale[] = [
  {
    id: 'ms-1',
    date: '2026-05-01',
    category: 'Kaos',
    amount: 1950000,
    qty: 30,
    description: 'Pesanan Kaos Reuni Angkatan offline lunas tunai'
  },
  {
    id: 'ms-2',
    date: '2026-05-15',
    category: 'Kemeja',
    amount: 3450000,
    qty: 30,
    description: 'Kemeja Kerja Bengkel Mandiri Motor DP Cash'
  },
  {
    id: 'ms-3',
    date: '2026-04-20',
    category: 'Jaket',
    amount: 4350000,
    qty: 30,
    description: 'Jaket Komunitas Motor Trail Bandung off-line'
  }
];
