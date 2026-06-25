require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Store = require('./models/Store');
const Product = require('./models/Product');
const { generateEmbedding } = require('./utils/vision');

const IMAGES = {
  fashion1: 'https://images.unsplash.com/photo-1629936060187-181dd6e855ec?w=600',
  beauty1: 'https://images.unsplash.com/photo-1600417098578-1e858e93dc88?w=600',
  furniture1: 'https://images.unsplash.com/photo-1696778382637-21ec8b69a149?w=600',
  fashionDress: 'https://images.unsplash.com/photo-1777292296715-706dd0b73305?w=600',
  shoes: 'https://images.unsplash.com/photo-1576152017281-352986e671c4?w=600',
  kitchen: 'https://images.unsplash.com/photo-1584990348065-f4f7a2a3e90c?w=600',
  kids: 'https://images.unsplash.com/photo-1600933674923-831c368456fc?w=600',
  electronics: 'https://images.unsplash.com/photo-1591869754715-5f679687039c?w=600',
  homeDecor: 'https://images.unsplash.com/photo-1763478958715-c32e83c38b5b?w=600',
  handbag: 'https://images.unsplash.com/photo-1760624295064-2de890f64524?w=600',
  womenClothing: 'https://images.unsplash.com/photo-1761121317492-57feee4fc674?w=600',
  perfume: 'https://images.unsplash.com/photo-1648208567967-19e0b7b10066?w=600',
  market: 'https://images.unsplash.com/photo-1772411535291-aa5884035934?w=600',
  jeans: 'https://images.unsplash.com/photo-1631112213238-b1bafeaecff3?w=600',
  kidsClothing: 'https://images.unsplash.com/photo-1733924304841-7320116fbe69?w=600',
  trending: 'https://images.unsplash.com/photo-1629299342303-3f3622666c41?w=600',
};

const STORES_DATA = [
  {
    name: 'Jemal Darb Omar', handle: 'jemal_darb_omar',
    description: 'Top fashion wholesaler in Casablanca. Women & men clothing, latest trends.',
    avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', coverImages: [{ url: IMAGES.fashion1 }],
    categories: ['Fashion', 'Women Clothing', 'Men Clothing'],
    city: 'Casablanca', telegramHandle: 'jemal_darb_omar', telegramLink: 'https://t.me/jemal_darb_omar', whatsappNumber: '+212661234567', whatsappLink: 'https://wa.me/212661234567',
    isApproved: true, isActive: true
  },
  {
    name: 'Atlas Fashion House', handle: 'atlas_fashion',
    description: 'Premium women\'s clothing wholesale. Dresses, abayas, casual wear.',
    avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', coverImages: [{ url: IMAGES.womenClothing }],
    categories: ['Fashion', 'Women Clothing'],
    city: 'Casablanca', telegramHandle: 'atlas_fashion', telegramLink: 'https://t.me/atlas_fashion', whatsappNumber: '+212662345678', whatsappLink: 'https://wa.me/212662345678',
    isApproved: true, isActive: true
  },
  {
    name: 'Souk Beauty Maroc', handle: 'souk_beauty',
    description: 'Largest beauty wholesale in Morocco. Cosmetics, skincare, perfumes.',
    avatar: 'https://images.unsplash.com/photo-1600417098578-1e858e93dc88?w=200', coverImages: [{ url: IMAGES.beauty1 }],
    categories: ['Beauty', 'Cosmetics', 'Perfumes'],
    city: 'Rabat', telegramHandle: 'souk_beauty', telegramLink: 'https://t.me/souk_beauty', whatsappNumber: '+212663456789', whatsappLink: 'https://wa.me/212663456789',
    isApproved: true, isActive: true
  },
  {
    name: 'Marrakech Furniture', handle: 'marra_furniture',
    description: 'Premium furniture wholesale. Sofas, beds, living room, dining.',
    avatar: 'https://images.unsplash.com/photo-1696778382637-21ec8b69a149?w=200', coverImages: [{ url: IMAGES.furniture1 }],
    categories: ['Furniture', 'Home Decor'],
    city: 'Marrakech', telegramHandle: 'marra_furniture', telegramLink: 'https://t.me/marra_furniture', whatsappNumber: '+212664567890', whatsappLink: 'https://wa.me/212664567890',
    isApproved: true, isActive: true
  },
  {
    name: 'Kids World Morocco', handle: 'kids_world_ma',
    description: 'Children\'s clothing and toys wholesale. Best prices in Morocco.',
    avatar: 'https://images.unsplash.com/photo-1600933674923-831c368456fc?w=200', coverImages: [{ url: IMAGES.kidsClothing }],
    categories: ['Kids & Babies', 'Toys'],
    city: 'Fes', telegramHandle: 'kids_world_ma', telegramLink: 'https://t.me/kids_world_ma', whatsappNumber: '+212665678901', whatsappLink: 'https://wa.me/212665678901',
    isApproved: true, isActive: true
  },
  {
    name: 'TechZone Maroc', handle: 'techzone_ma',
    description: 'Electronics and gadgets wholesale. Phones, accessories, smart devices.',
    avatar: 'https://images.unsplash.com/photo-1591869754715-5f679687039c?w=200', coverImages: [{ url: IMAGES.electronics }],
    categories: ['Electronics', 'Accessories'],
    city: 'Casablanca', telegramHandle: 'techzone_ma', telegramLink: 'https://t.me/techzone_ma', whatsappNumber: '+212666789012', whatsappLink: 'https://wa.me/212666789012',
    isApproved: true, isActive: true
  },
  {
    name: 'Cuisine Pro Wholesale', handle: 'cuisine_pro',
    description: 'Kitchen & dining wholesale. Cookware, utensils, appliances.',
    avatar: 'https://images.unsplash.com/photo-1584990348065-f4f7a2a3e90c?w=200', coverImages: [{ url: IMAGES.kitchen }],
    categories: ['Kitchen & Dining', 'Home & Living'],
    city: 'Meknes', telegramHandle: 'cuisine_pro', telegramLink: 'https://t.me/cuisine_pro', whatsappNumber: '+212667890123', whatsappLink: 'https://wa.me/212667890123',
    isApproved: true, isActive: true
  },
  {
    name: 'Fes Artisan Decor', handle: 'fes_artisan',
    description: 'Authentic Moroccan home decor. Handcrafted items, rugs, lamps.',
    avatar: 'https://images.unsplash.com/photo-1763478958715-c32e83c38b5b?w=200', coverImages: [{ url: IMAGES.homeDecor }],
    categories: ['Home Decor', 'Home & Living'],
    city: 'Fes', telegramHandle: 'fes_artisan', telegramLink: 'https://t.me/fes_artisan', whatsappNumber: '+212668901234', whatsappLink: 'https://wa.me/212668901234',
    isApproved: true, isActive: true
  },
  {
    name: 'Shoe Capital MA', handle: 'shoe_capital',
    description: 'Footwear wholesale. Sneakers, heels, sandals, boots. All sizes.',
    avatar: 'https://images.unsplash.com/photo-1576152017281-352986e671c4?w=200', coverImages: [{ url: IMAGES.shoes }],
    categories: ['Fashion', 'Footwear'],
    city: 'Casablanca', telegramHandle: 'shoe_capital', telegramLink: 'https://t.me/shoe_capital', whatsappNumber: '+212669012345', whatsappLink: 'https://wa.me/212669012345',
    isApproved: true, isActive: true
  },
  {
    name: 'Handbag Palace', handle: 'handbag_palace',
    description: 'Designer-inspired handbags and accessories wholesale.',
    avatar: 'https://images.unsplash.com/photo-1760624295064-2de890f64524?w=200', coverImages: [{ url: IMAGES.handbag }],
    categories: ['Fashion', 'Accessories'],
    city: 'Tangier', telegramHandle: 'handbag_palace', telegramLink: 'https://t.me/handbag_palace', whatsappNumber: '+212670123456', whatsappLink: 'https://wa.me/212670123456',
    isApproved: true, isActive: true
  }
];

const PRODUCTS_DATA = [
  { storeHandle: 'jemal_darb_omar', imageUrl: IMAGES.fashion1, price: 45, category: 'Fashion', subcategory: 'Women Clothing', description: 'Floral print blouse' },
  { storeHandle: 'jemal_darb_omar', imageUrl: IMAGES.fashionDress, price: 120, category: 'Fashion', subcategory: 'Women Clothing', description: 'Elegant evening dress' },
  { storeHandle: 'atlas_fashion', imageUrl: IMAGES.womenClothing, price: 85, category: 'Fashion', subcategory: 'Women Clothing', description: 'Classic white blouse' },
  { storeHandle: 'atlas_fashion', imageUrl: IMAGES.jeans, price: 95, category: 'Fashion', subcategory: 'Men Clothing', description: 'Slim fit denim jeans' },
  { storeHandle: 'souk_beauty', imageUrl: IMAGES.beauty1, price: 35, category: 'Beauty', subcategory: 'Skincare', description: 'Moisturizing face cream set' },
  { storeHandle: 'souk_beauty', imageUrl: IMAGES.perfume, price: 150, category: 'Beauty', subcategory: 'Perfumes', description: 'Oriental perfume collection' },
  { storeHandle: 'marra_furniture', imageUrl: IMAGES.furniture1, price: 1200, category: 'Furniture', subcategory: 'Sofas', description: 'Modern 3-seat sofa' },
  { storeHandle: 'fes_artisan', imageUrl: IMAGES.homeDecor, price: 280, category: 'Home Decor', subcategory: 'Decorations', description: 'Moroccan lantern set' },
  { storeHandle: 'techzone_ma', imageUrl: IMAGES.electronics, price: 340, category: 'Electronics', subcategory: 'Gadgets', description: 'Wireless earbuds pro' },
  { storeHandle: 'cuisine_pro', imageUrl: IMAGES.kitchen, price: 180, category: 'Kitchen & Dining', subcategory: 'Cookware', description: 'Non-stick cookware set 8pcs' },
  { storeHandle: 'kids_world_ma', imageUrl: IMAGES.kidsClothing, price: 55, category: 'Kids & Babies', subcategory: 'Clothing', description: 'Cotton kids 3-piece set' },
  { storeHandle: 'kids_world_ma', imageUrl: IMAGES.kids, price: 75, category: 'Kids & Babies', subcategory: 'Toys', description: 'Educational toy set' },
  { storeHandle: 'shoe_capital', imageUrl: IMAGES.shoes, price: 110, category: 'Fashion', subcategory: 'Footwear', description: 'Sport sneakers collection' },
  { storeHandle: 'handbag_palace', imageUrl: IMAGES.handbag, price: 220, category: 'Fashion', subcategory: 'Accessories', description: 'Leather shoulder bag' },
  { storeHandle: 'jemal_darb_omar', imageUrl: IMAGES.market, price: null, category: 'Fashion', subcategory: 'Mixed', description: 'Wholesale fashion bundle' },
  { storeHandle: 'atlas_fashion', imageUrl: IMAGES.trending, price: 65, category: 'Fashion', subcategory: 'Women Clothing', description: 'Summer collection dress' },
  { storeHandle: 'souk_beauty', imageUrl: IMAGES.beauty1, price: 45, category: 'Beauty', subcategory: 'Makeup', description: 'Foundation & powder kit' },
  { storeHandle: 'fes_artisan', imageUrl: IMAGES.homeDecor, price: 450, category: 'Home Decor', subcategory: 'Rugs', description: 'Berber carpet medium' },
  { storeHandle: 'cuisine_pro', imageUrl: IMAGES.kitchen, price: 95, category: 'Kitchen & Dining', subcategory: 'Utensils', description: 'Stainless steel utensil set' },
  { storeHandle: 'techzone_ma', imageUrl: IMAGES.electronics, price: null, category: 'Electronics', subcategory: 'Phones', description: 'Smartphone accessories pack' }
];

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Clear existing products and stores
    console.log('Clearing old Products & Stores...');
    await Product.deleteMany({});
    await Store.deleteMany({});

    // 2. Find or create a supplier user
    let supplier = await User.findOne({ role: 'supplier' });
    if (!supplier) {
      console.log('Creating a supplier user...');
      supplier = await User.create({
        name: 'Demo Supplier',
        email: 'supplier@choufliya.com',
        password: 'Supplier@ChouFliya2026',
        role: 'supplier'
      });
      console.log('Supplier user created:', supplier.email);
    }

    // 3. Seed stores
    console.log('Seeding stores...');
    const createdStores = [];
    for (const storeData of STORES_DATA) {
      const store = await Store.create({
        ...storeData,
        owner: supplier._id
      });
      createdStores.push(store);
      console.log(`Created store: ${store.name} (${store.handle})`);
    }

    // 4. Seed products and generate vector embeddings
    console.log('Seeding products and generating vector embeddings...');
    for (const prodData of PRODUCTS_DATA) {
      const store = createdStores.find(s => s.handle === prodData.storeHandle);
      if (!store) continue;

      const title = prodData.description; // using description as title for simplicity
      const product = await Product.create({
        store: store._id,
        storeName: store.name,
        storeHandle: store.handle,
        title: title,
        description: prodData.description,
        imageUrl: prodData.imageUrl,
        price: prodData.price,
        category: prodData.category,
        subcategory: prodData.subcategory,
        isActive: true
      });

      console.log(`Created product: "${product.title}"`);

      // Generate embedding vector
      try {
        console.log(`  Generating embedding vector for: ${product.imageUrl}...`);
        const vector = await generateEmbedding(product.imageUrl);
        if (vector && vector.length > 0) {
          product.vector = vector;
          await product.save();
          console.log(`  ✅ Successfully saved vector (${vector.length} dimensions)`);
        } else {
          console.log(`  ❌ Failed to generate embedding vector`);
        }
      } catch (err) {
        console.error(`  ❌ Error generating embedding for product ${product._id}:`, err.message);
      }
    }

    // 5. Update store product counts
    console.log('Updating store product counts...');
    for (const store of createdStores) {
      await store.updateProductCount();
    }

    console.log('\n🎉 DB Seeding and Embedding Generation completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

main();
