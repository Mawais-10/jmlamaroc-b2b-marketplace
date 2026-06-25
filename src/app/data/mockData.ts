// JML Maroc Mock Data

export const IMAGES = {
  fashion1: 'https://images.unsplash.com/photo-1629936060187-181dd6e855ec?w=400&q=80',
  beauty1: 'https://images.unsplash.com/photo-1600417098578-1e858e93dc88?w=400&q=80',
  furniture1: 'https://images.unsplash.com/photo-1696778382637-21ec8b69a149?w=400&q=80',
  fashionDress: 'https://images.unsplash.com/photo-1777292296715-706dd0b73305?w=400&q=80',
  shoes: 'https://images.unsplash.com/photo-1576152017281-352986e671c4?w=400&q=80',
  kitchen: 'https://images.unsplash.com/photo-1584990348065-f4f7a2a3e90c?w=400&q=80',
  kids: 'https://images.unsplash.com/photo-1600933674923-831c368456fc?w=400&q=80',
  electronics: 'https://images.unsplash.com/photo-1591869754715-5f679687039c?w=400&q=80',
  homeDecor: 'https://images.unsplash.com/photo-1763478958715-c32e83c38b5b?w=400&q=80',
  handbag: 'https://images.unsplash.com/photo-1760624295064-2de890f64524?w=400&q=80',
  womenClothing: 'https://images.unsplash.com/photo-1761121317492-57feee4fc674?w=400&q=80',
  perfume: 'https://images.unsplash.com/photo-1648208567967-19e0b7b10066?w=400&q=80',
  market: 'https://images.unsplash.com/photo-1772411535291-aa5884035934?w=400&q=80',
  jeans: 'https://images.unsplash.com/photo-1631112213238-b1bafeaecff3?w=400&q=80',
  kidsClothing: 'https://images.unsplash.com/photo-1733924304841-7320116fbe69?w=400&q=80',
  trending: 'https://images.unsplash.com/photo-1629299342303-3f3622666c41?w=400&q=80',
};

export interface Category {
  id: string;
  name: string;
  count: number;
  subcategories?: Category[];
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', count: 1346406 },
  {
    id: 'furniture', name: 'Furniture', count: 45957,
    subcategories: [
      { id: 'sofas', name: 'Sofas', count: 1512 },
      { id: 'tables', name: 'Tables', count: 5083 },
      { id: 'chairs', name: 'Chairs', count: 6355 },
      { id: 'beds', name: 'Beds', count: 1897 },
      { id: 'wardrobes', name: 'Wardrobes', count: 12799 },
      { id: 'shelves', name: 'Shelves & Storage', count: 18311 },
    ]
  },
  { id: 'fashion', name: 'Fashion', count: 819095 },
  { id: 'home-decor', name: 'Home Decor', count: 31647 },
  { id: 'kitchen', name: 'Kitchen & Dining', count: 78950 },
  { id: 'electronics', name: 'Electronics', count: 32572 },
  { id: 'beauty', name: 'Beauty', count: 150272 },
  { id: 'kids', name: 'Kids & Babies', count: 47943 },
  { id: 'home-living', name: 'Home & Living', count: 49254 },
];

export interface Store {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  coverImages: string[];
  categories: string[];
  city: string;
  telegramLink: string;
  whatsappLink: string;
  productCount: number;
  followerCount: number;
  isApproved: boolean;
  createdAt: string;
}

export const STORES: Store[] = [
  {
    id: 's1', name: 'Jemal Darb Omar', handle: 'jemal_darb_omar',
    description: 'Top fashion wholesaler in Casablanca. Women & men clothing, latest trends.',
    avatar: 'JD', coverImages: [IMAGES.fashion1, IMAGES.fashionDress, IMAGES.jeans, IMAGES.womenClothing],
    categories: ['Fashion', 'Women Clothing', 'Men Clothing'],
    city: 'Casablanca', telegramLink: 'https://t.me/jemal_darb_omar', whatsappLink: 'https://wa.me/212661234567',
    productCount: 142139, followerCount: 2042, isApproved: true, createdAt: '2023-01-15'
  },
  {
    id: 's2', name: 'Atlas Fashion House', handle: 'atlas_fashion',
    description: 'Premium women\'s clothing wholesale. Dresses, abayas, casual wear.',
    avatar: 'AF', coverImages: [IMAGES.womenClothing, IMAGES.fashionDress, IMAGES.fashion1, IMAGES.handbag],
    categories: ['Fashion', 'Women Clothing'],
    city: 'Casablanca', telegramLink: 'https://t.me/atlas_fashion', whatsappLink: 'https://wa.me/212662345678',
    productCount: 87432, followerCount: 3521, isApproved: true, createdAt: '2022-11-10'
  },
  {
    id: 's3', name: 'Souk Beauty Maroc', handle: 'souk_beauty',
    description: 'Largest beauty wholesale in Morocco. Cosmetics, skincare, perfumes.',
    avatar: 'SB', coverImages: [IMAGES.beauty1, IMAGES.perfume, IMAGES.beauty1, IMAGES.perfume],
    categories: ['Beauty', 'Cosmetics', 'Perfumes'],
    city: 'Rabat', telegramLink: 'https://t.me/souk_beauty', whatsappLink: 'https://wa.me/212663456789',
    productCount: 54210, followerCount: 1876, isApproved: true, createdAt: '2023-03-05'
  },
  {
    id: 's4', name: 'Marrakech Furniture', handle: 'marra_furniture',
    description: 'Premium furniture wholesale. Sofas, beds, living room, dining.',
    avatar: 'MF', coverImages: [IMAGES.furniture1, IMAGES.homeDecor, IMAGES.furniture1, IMAGES.homeDecor],
    categories: ['Furniture', 'Home Decor'],
    city: 'Marrakech', telegramLink: 'https://t.me/marra_furniture', whatsappLink: 'https://wa.me/212664567890',
    productCount: 23456, followerCount: 987, isApproved: true, createdAt: '2022-09-20'
  },
  {
    id: 's5', name: 'Kids World Morocco', handle: 'kids_world_ma',
    description: 'Children\'s clothing and toys wholesale. Best prices in Morocco.',
    avatar: 'KW', coverImages: [IMAGES.kidsClothing, IMAGES.kids, IMAGES.kidsClothing, IMAGES.kids],
    categories: ['Kids & Babies', 'Toys'],
    city: 'Fes', telegramLink: 'https://t.me/kids_world_ma', whatsappLink: 'https://wa.me/212665678901',
    productCount: 31087, followerCount: 1543, isApproved: true, createdAt: '2023-06-12'
  },
  {
    id: 's6', name: 'TechZone Maroc', handle: 'techzone_ma',
    description: 'Electronics and gadgets wholesale. Phones, accessories, smart devices.',
    avatar: 'TZ', coverImages: [IMAGES.electronics, IMAGES.electronics, IMAGES.electronics, IMAGES.electronics],
    categories: ['Electronics', 'Accessories'],
    city: 'Casablanca', telegramLink: 'https://t.me/techzone_ma', whatsappLink: 'https://wa.me/212666789012',
    productCount: 18932, followerCount: 2891, isApproved: true, createdAt: '2022-12-01'
  },
  {
    id: 's7', name: 'Cuisine Pro Wholesale', handle: 'cuisine_pro',
    description: 'Kitchen & dining wholesale. Cookware, utensils, appliances.',
    avatar: 'CP', coverImages: [IMAGES.kitchen, IMAGES.kitchen, IMAGES.homeDecor, IMAGES.kitchen],
    categories: ['Kitchen & Dining', 'Home & Living'],
    city: 'Meknes', telegramLink: 'https://t.me/cuisine_pro', whatsappLink: 'https://wa.me/212667890123',
    productCount: 44231, followerCount: 765, isApproved: true, createdAt: '2023-04-18'
  },
  {
    id: 's8', name: 'Fes Artisan Decor', handle: 'fes_artisan',
    description: 'Authentic Moroccan home decor. Handcrafted items, rugs, lamps.',
    avatar: 'FA', coverImages: [IMAGES.homeDecor, IMAGES.furniture1, IMAGES.homeDecor, IMAGES.market],
    categories: ['Home Decor', 'Home & Living'],
    city: 'Fes', telegramLink: 'https://t.me/fes_artisan', whatsappLink: 'https://wa.me/212668901234',
    productCount: 12654, followerCount: 2134, isApproved: true, createdAt: '2022-07-30'
  },
  {
    id: 's9', name: 'Shoe Capital MA', handle: 'shoe_capital',
    description: 'Footwear wholesale. Sneakers, heels, sandals, boots. All sizes.',
    avatar: 'SC', coverImages: [IMAGES.shoes, IMAGES.shoes, IMAGES.fashion1, IMAGES.shoes],
    categories: ['Fashion', 'Footwear'],
    city: 'Casablanca', telegramLink: 'https://t.me/shoe_capital', whatsappLink: 'https://wa.me/212669012345',
    productCount: 28765, followerCount: 1987, isApproved: true, createdAt: '2023-02-28'
  },
  {
    id: 's10', name: 'Handbag Palace', handle: 'handbag_palace',
    description: 'Designer-inspired handbags and accessories wholesale.',
    avatar: 'HP', coverImages: [IMAGES.handbag, IMAGES.handbag, IMAGES.fashionDress, IMAGES.handbag],
    categories: ['Fashion', 'Accessories'],
    city: 'Tangier', telegramLink: 'https://t.me/handbag_palace', whatsappLink: 'https://wa.me/212670123456',
    productCount: 9876, followerCount: 4201, isApproved: true, createdAt: '2023-07-05'
  },
];

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  storeHandle: string;
  imageUrl: string;
  price: number | null;
  currency: string;
  category: string;
  subcategory: string;
  description: string;
  datePosted: string;
  isActive: boolean;
}

export const PRODUCTS: Product[] = [
  { id: 'p1', storeId: 's1', storeName: 'Jemal Darb Omar', storeHandle: 'jemal_darb_omar', imageUrl: IMAGES.fashion1, price: 45, currency: 'MAD', category: 'Fashion', subcategory: 'Women Clothing', description: 'Floral print blouse', datePosted: '2026-04-29', isActive: true },
  { id: 'p2', storeId: 's1', storeName: 'Jemal Darb Omar', storeHandle: 'jemal_darb_omar', imageUrl: IMAGES.fashionDress, price: 120, currency: 'MAD', category: 'Fashion', subcategory: 'Women Clothing', description: 'Elegant evening dress', datePosted: '2026-04-28', isActive: true },
  { id: 'p3', storeId: 's2', storeName: 'Atlas Fashion House', storeHandle: 'atlas_fashion', imageUrl: IMAGES.womenClothing, price: 85, currency: 'MAD', category: 'Fashion', subcategory: 'Women Clothing', description: 'Classic white blouse', datePosted: '2026-04-27', isActive: true },
  { id: 'p4', storeId: 's2', storeName: 'Atlas Fashion House', storeHandle: 'atlas_fashion', imageUrl: IMAGES.jeans, price: 95, currency: 'MAD', category: 'Fashion', subcategory: 'Men Clothing', description: 'Slim fit denim jeans', datePosted: '2026-04-26', isActive: true },
  { id: 'p5', storeId: 's3', storeName: 'Souk Beauty Maroc', storeHandle: 'souk_beauty', imageUrl: IMAGES.beauty1, price: 35, currency: 'MAD', category: 'Beauty', subcategory: 'Skincare', description: 'Moisturizing face cream set', datePosted: '2026-04-25', isActive: true },
  { id: 'p6', storeId: 's3', storeName: 'Souk Beauty Maroc', storeHandle: 'souk_beauty', imageUrl: IMAGES.perfume, price: 150, currency: 'MAD', category: 'Beauty', subcategory: 'Perfumes', description: 'Oriental perfume collection', datePosted: '2026-04-24', isActive: true },
  { id: 'p7', storeId: 's4', storeName: 'Marrakech Furniture', storeHandle: 'marra_furniture', imageUrl: IMAGES.furniture1, price: 1200, currency: 'MAD', category: 'Furniture', subcategory: 'Sofas', description: 'Modern 3-seat sofa', datePosted: '2026-04-23', isActive: true },
  { id: 'p8', storeId: 's8', storeName: 'Fes Artisan Decor', storeHandle: 'fes_artisan', imageUrl: IMAGES.homeDecor, price: 280, currency: 'MAD', category: 'Home Decor', subcategory: 'Decorations', description: 'Moroccan lantern set', datePosted: '2026-04-22', isActive: true },
  { id: 'p9', storeId: 's6', storeName: 'TechZone Maroc', storeHandle: 'techzone_ma', imageUrl: IMAGES.electronics, price: 340, currency: 'MAD', category: 'Electronics', subcategory: 'Gadgets', description: 'Wireless earbuds pro', datePosted: '2026-04-21', isActive: true },
  { id: 'p10', storeId: 's7', storeName: 'Cuisine Pro Wholesale', storeHandle: 'cuisine_pro', imageUrl: IMAGES.kitchen, price: 180, currency: 'MAD', category: 'Kitchen & Dining', subcategory: 'Cookware', description: 'Non-stick cookware set 8pcs', datePosted: '2026-04-20', isActive: true },
  { id: 'p11', storeId: 's5', storeName: 'Kids World Morocco', storeHandle: 'kids_world_ma', imageUrl: IMAGES.kidsClothing, price: 55, currency: 'MAD', category: 'Kids & Babies', subcategory: 'Clothing', description: 'Cotton kids 3-piece set', datePosted: '2026-04-19', isActive: true },
  { id: 'p12', storeId: 's5', storeName: 'Kids World Morocco', storeHandle: 'kids_world_ma', imageUrl: IMAGES.kids, price: 75, currency: 'MAD', category: 'Kids & Babies', subcategory: 'Toys', description: 'Educational toy set', datePosted: '2026-04-18', isActive: true },
  { id: 'p13', storeId: 's9', storeName: 'Shoe Capital MA', storeHandle: 'shoe_capital', imageUrl: IMAGES.shoes, price: 110, currency: 'MAD', category: 'Fashion', subcategory: 'Footwear', description: 'Sport sneakers collection', datePosted: '2026-04-17', isActive: true },
  { id: 'p14', storeId: 's10', storeName: 'Handbag Palace', storeHandle: 'handbag_palace', imageUrl: IMAGES.handbag, price: 220, currency: 'MAD', category: 'Fashion', subcategory: 'Accessories', description: 'Leather shoulder bag', datePosted: '2026-04-16', isActive: true },
  { id: 'p15', storeId: 's1', storeName: 'Jemal Darb Omar', storeHandle: 'jemal_darb_omar', imageUrl: IMAGES.market, price: null, currency: 'MAD', category: 'Fashion', subcategory: 'Mixed', description: 'Wholesale fashion bundle', datePosted: '2026-04-15', isActive: true },
  { id: 'p16', storeId: 's2', storeName: 'Atlas Fashion House', storeHandle: 'atlas_fashion', imageUrl: IMAGES.trending, price: 65, currency: 'MAD', category: 'Fashion', subcategory: 'Women Clothing', description: 'Summer collection dress', datePosted: '2026-04-14', isActive: true },
  { id: 'p17', storeId: 's3', storeName: 'Souk Beauty Maroc', storeHandle: 'souk_beauty', imageUrl: IMAGES.beauty1, price: 45, currency: 'MAD', category: 'Beauty', subcategory: 'Makeup', description: 'Foundation & powder kit', datePosted: '2026-04-13', isActive: true },
  { id: 'p18', storeId: 's8', storeName: 'Fes Artisan Decor', storeHandle: 'fes_artisan', imageUrl: IMAGES.homeDecor, price: 450, currency: 'MAD', category: 'Home Decor', subcategory: 'Rugs', description: 'Berber carpet medium', datePosted: '2026-04-12', isActive: true },
  { id: 'p19', storeId: 's7', storeName: 'Cuisine Pro Wholesale', storeHandle: 'cuisine_pro', imageUrl: IMAGES.kitchen, price: 95, currency: 'MAD', category: 'Kitchen & Dining', subcategory: 'Utensils', description: 'Stainless steel utensil set', datePosted: '2026-04-11', isActive: true },
  { id: 'p20', storeId: 's6', storeName: 'TechZone Maroc', storeHandle: 'techzone_ma', imageUrl: IMAGES.electronics, price: null, currency: 'MAD', category: 'Electronics', subcategory: 'Phones', description: 'Smartphone accessories pack', datePosted: '2026-04-10', isActive: true },
];

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  items: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  replies: { author: string; message: string; timestamp: string }[];
}

export const WHATSAPP_BECOME_SUPPLIER_URL = `https://api.whatsapp.com/send?phone=212779137560&text=${encodeURIComponent('مرحباً، أريد إضافة متجر الجملة الخاص بي في منصة jmlamaroc.com.\n\nاسم المتجر: \nقناة التيليجرام: \nالمدينة: \nالفئة: ')}`;

export const DEMO_SEARCH_RESULTS = [
  { storeId: 's1', storeName: 'Jemal Darb Omar', matchScore: 100, price: 40, similarProducts: 15, imageUrl: IMAGES.fashion1 },
  { storeId: 's2', storeName: 'Atlas Fashion House', matchScore: 95, price: 35, similarProducts: 11, imageUrl: IMAGES.womenClothing },
  { storeId: 's9', storeName: 'Shoe Capital MA', matchScore: 88, price: 55, similarProducts: 7, imageUrl: IMAGES.shoes },
];

export const TRENDING_PRODUCTS = [
  { id: 't1', title: 'Summer Dresses 2026', category: 'Women Clothing', change: '+24%', imageUrl: IMAGES.fashionDress, storeCount: 28 },
  { id: 't2', title: 'Korean Skincare Sets', category: 'Beauty', change: '+18%', imageUrl: IMAGES.beauty1, storeCount: 15 },
  { id: 't3', title: 'Wireless Earbuds', category: 'Electronics', change: '+31%', imageUrl: IMAGES.electronics, storeCount: 12 },
  { id: 't4', title: 'Linen Sets Home', category: 'Home & Living', change: '+12%', imageUrl: IMAGES.homeDecor, storeCount: 9 },
  { id: 't5', title: 'Sports Sneakers', category: 'Footwear', change: '+22%', imageUrl: IMAGES.shoes, storeCount: 19 },
  { id: 't6', title: 'Leather Handbags', category: 'Accessories', change: '+15%', imageUrl: IMAGES.handbag, storeCount: 23 },
  { id: 't7', title: 'Kids Cotton Sets', category: 'Kids & Babies', change: '+9%', imageUrl: IMAGES.kidsClothing, storeCount: 11 },
  { id: 't8', title: 'Non-stick Cookware', category: 'Kitchen & Dining', change: '+7%', imageUrl: IMAGES.kitchen, storeCount: 8 },
];
