export interface SizePrice {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Baju' | 'Almamater' | 'Jaket' | 'Kaos' | 'Kemeja' | 'Lainnya';
  basePrice: number; // fallback or default
  image: string;
  sizes: SizePrice[];
  colors: string[]; // e.g. ['Hitam', 'Biru Navy', 'Merah Maroon']
  stock: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCategory: string;
  productImage: string;
  qtyPerSize: { [size: string]: number }; // e.g., { 'M': 5, 'XL': 5 }
  selectedColor: string;
  sizePrices: { [size: string]: number }; // snapshot of prices at the time of order
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'done';

export interface Order {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  transferDestination: string;
  status: OrderStatus;
  date: string; // YYYY-MM-DD
  waNotified: boolean;
  emailNotified: boolean;
  trackingNumber?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  agency: string; // e.g. 'Instansi Pemerintah', 'Perusahaan Swasta'
  category: string;
  image: string;
  description: string;
  year: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  time: string;
}

export interface AppSettings {
  storeName: string;
  headerImage: string;
  shopeeUrl: string;
  tiktokUrl: string;
  tokopediaUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
  paymentBanks: { name: string; accountNumber: string; holder: string }[];
}

export interface ManualSale {
  id: string;
  date: string; // YYYY-MM-DD
  category: string; // e.g., 'Kaos', 'Jaket', 'Lainnya'
  amount: number;
  qty: number;
  description: string;
}
