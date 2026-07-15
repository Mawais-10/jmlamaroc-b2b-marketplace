/**
 * seed-choufliya-stores.js
 * ─────────────────────────
 * Parses the scraped choufliya.ma groups data and inserts them into
 * the DB as Store documents.
 *
 * Images (avatars + cover/sample images) are downloaded from the CDN
 * and re-uploaded to our Cloudinary account so we own the assets.
 *
 * Usage:  node seed-choufliya-stores.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Store = require('./models/Store');
const Product = require('./models/Product');
const User = require('./models/User');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ──────────────────────────────────────────────
// Helper: upload a remote URL to Cloudinary
// ──────────────────────────────────────────────
async function uploadToCloudinary(url, folder, publicIdHint) {
  try {
    if (!url || url === 'c') return { url: '', publicId: '' }; // broken link guard
    const result = await cloudinary.uploader.upload(url, {
      folder,
      public_id: publicIdHint,
      overwrite: true,
      resource_type: 'image',
      transformation: folder.includes('avatar')
        ? [{ width: 400, height: 400, crop: 'fill', quality: 'auto:good' }]
        : [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    console.error(`  ⚠ Upload failed for ${url}: ${err.message}`);
    return { url, publicId: '' }; // fallback: keep original URL
  }
}

// ──────────────────────────────────────────────
// The 25 stores parsed from the markdown export
// ──────────────────────────────────────────────
const STORES_RAW = [
  {
    name: 'الجملة الأولى الملابس الشمال مع امينة 👠🛍️🛒',
    handle: 'bassimmodestore',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/bassimmodestore.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/550372/thumb',
      'https://cdn.choufliya.ma/api/v1/img/550374/thumb',
      'https://cdn.choufliya.ma/api/v1/img/550373/thumb',
    ],
    productCount: 142, followerCount: 1392,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'أحذية CHOURAK بالجملة 👠👞',
    handle: 'chourakjamla',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/chourakjamla.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1759872/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759873/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759874/thumb',
    ],
    productCount: 115, followerCount: 3194,
    categories: ['Fashion', 'Footwear'],
  },
  {
    name: 'جملة مكياج امين إنزكان 💄💄',
    handle: 'amiinhmo',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/amiinhmo.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1759374/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759367/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759369/thumb',
    ],
    productCount: 84, followerCount: 73810,
    categories: ['Beauty', 'Cosmetics'],
  },
  {
    name: '🏯💥👟أحدية الأصيل بالجملة🥿💥🏯',
    handle: 'asilil2ahdia',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/asilil2ahdia.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1759434/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759431/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759432/thumb',
    ],
    productCount: 82, followerCount: 4667,
    categories: ['Fashion', 'Footwear'],
  },
  {
    name: 'عصرية🛒ADIL AD SHOP',
    handle: 'adil_ad_shop',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/adil_ad_shop.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1583694/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1583695/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1583696/thumb',
    ],
    productCount: 55, followerCount: 85755,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'Lmardii pijama❤️💁‍♀',
    handle: 'lmardi1',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/lmardi1.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1760570/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760571/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760572/thumb',
    ],
    productCount: 47, followerCount: 8778,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: "E'COMMERCES MOROCO💄💄",
    handle: 'lnjmela',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/lnjmela.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1760673/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760674/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760675/thumb',
    ],
    productCount: 46, followerCount: 4514,
    categories: ['Beauty', 'Cosmetics'],
  },
  {
    name: 'Abdolhadi KING CHOP',
    handle: 'abdohmabdo',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/abdohmabdo.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1758046/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758047/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758048/thumb',
    ],
    productCount: 42, followerCount: 7512,
    categories: ['Fashion', 'Men Clothing'],
  },
  {
    name: 'جملة المنصوري Mansori',
    handle: 'azizemnsouri',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/azizemnsouri.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1761750/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761751/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761753/thumb',
    ],
    productCount: 41, followerCount: 84810,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'التقليدية 🛒ADIL AD SHOP',
    handle: 'adiladshop1',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/adiladshop1.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1583818/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1583819/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1583817/thumb',
    ],
    productCount: 39, followerCount: 14251,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'ABDOU SHOP 🤑 الجملة الأولى مرحبا بالجميع',
    handle: 'abdoujamla',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/abdoujamla.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1758946/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758947/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758945/thumb',
    ],
    productCount: 26, followerCount: 8967,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'متجر الرائد للبيع بالجملة 🛒📦',
    handle: 'sulitoo',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/sulitoo.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1758880/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758872/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758873/thumb',
    ],
    productCount: 24, followerCount: 9849,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'ملابس تركيا للرجال🥳 مرحبا بكم عند امينة المسكيني 🦋',
    handle: 'aminashop06',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/aminashop06.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1761815/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761816/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761817/thumb',
    ],
    productCount: 24, followerCount: 9764,
    categories: ['Fashion', 'Men Clothing'],
  },
  {
    name: 'HUB Oufkir🛍️📦بالجملة',
    handle: 'jmlaboutique',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/jmlaboutique.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1758530/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758531/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758532/thumb',
    ],
    productCount: 23, followerCount: 6706,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'MEKEUP HICHAM💄المنصوري',
    handle: 'montajathichaminzgan',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/montajathichaminzgan.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1761249/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761241/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761242/thumb',
    ],
    productCount: 21, followerCount: 7752,
    categories: ['Beauty', 'Cosmetics'],
  },
  {
    name: 'الأحذية🛒ADIL AD SHOP',
    handle: 'adiladshop3',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/adiladshop3.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1583808/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1583810/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1583811/thumb',
    ],
    productCount: 21, followerCount: 28139,
    categories: ['Fashion', 'Footwear'],
  },
  {
    name: 'Allali shop',
    handle: 'adlbfun',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/adlbfun.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1755438/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1755439/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1755440/thumb',
    ],
    productCount: 21, followerCount: 2474,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: '💃🕺 فردوس 0695079392',
    handle: 'hananfirdaous',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/hananfirdaous.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1760136/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760137/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760138/thumb',
    ],
    productCount: 20, followerCount: 6355,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'GADGET MAROC🔬',
    handle: 'gadgetsmaroc',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/gadgetsmaroc.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1760068/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1760067/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1758511/thumb',
    ],
    productCount: 20, followerCount: 6028,
    categories: ['Electronics', 'Accessories'],
  },
  {
    name: '✨ الجملة الأولى للأحذية (1) Mostafa Zri9a 👟🥾👠',
    handle: 'pahbori',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/pahbori.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1684349/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1684350/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1684351/thumb',
    ],
    productCount: 20, followerCount: 3676,
    categories: ['Fashion', 'Footwear'],
  },
  {
    name: 'Akrim zaza pyjama',
    handle: 'tg_1800795401',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/tg_1800795401.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1759086/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759087/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1759088/thumb',
    ],
    productCount: 19, followerCount: 5075,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'abidishop',
    handle: 'tg_1413529539',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/tg_1413529539.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1761651/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761642/thumb',
    ],
    productCount: 18, followerCount: 4917,
    categories: ['Fashion', 'Women Clothing'],
  },
  {
    name: 'للرجال 🛒 ADIL AD SHOP',
    handle: 'adiladshop9',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/adiladshop9.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1750645/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1750646/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1750647/thumb',
    ],
    productCount: 18, followerCount: 10252,
    categories: ['Fashion', 'Men Clothing'],
  },
  {
    name: '👟بيع الأحدية بالجملة// nourbest 👟',
    handle: 'nourdin_brest',
    avatar: 'https://cdn.choufliya.ma/images/_avatars/nourdin_brest.jpg',
    coverImages: [
      'https://cdn.choufliya.ma/api/v1/img/1761303/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761304/thumb',
      'https://cdn.choufliya.ma/api/v1/img/1761305/thumb',
    ],
    productCount: 17, followerCount: 71012,
    categories: ['Fashion', 'Footwear'],
  },
];

// ──────────────────────────────────────────────
// Main seed function
// ──────────────────────────────────────────────
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find or create a supplier user (same pattern as seed-all.js)
    let supplier = await User.findOne({ role: 'supplier' });
    if (!supplier) {
      console.log('Creating a supplier user...');
      supplier = await User.create({
        name: 'Demo Supplier',
        email: 'supplier@choufliya.com',
        password: 'Supplier@ChouFliya2026',
        role: 'supplier',
      });
    }
    console.log(`Using supplier: ${supplier.email}`);

    let inserted = 0;
    let skipped = 0;

    for (const raw of STORES_RAW) {
      // Skip if handle already exists
      const existing = await Store.findOne({ handle: raw.handle });
      if (existing) {
        console.log(`⏭ Store "${raw.handle}" already exists — skipping.`);
        skipped++;
        continue;
      }

      console.log(`\n📦 Processing: ${raw.name} (@${raw.handle})`);

      // Upload avatar to Cloudinary
      console.log('  ↑ Uploading avatar...');
      const avatarResult = await uploadToCloudinary(
        raw.avatar,
        'choufliya/avatars',
        `avatar_${raw.handle}`
      );

      // Upload cover/preview images to Cloudinary
      const coverImagesResult = [];
      for (let i = 0; i < raw.coverImages.length; i++) {
        console.log(`  ↑ Uploading cover image ${i + 1}/${raw.coverImages.length}...`);
        const result = await uploadToCloudinary(
          raw.coverImages[i],
          'choufliya/covers',
          `cover_${raw.handle}_${i}`
        );
        if (result.url) {
          coverImagesResult.push({ url: result.url, publicId: result.publicId });
        }
      }

      // Create the Store document matching the existing schema exactly
      const store = await Store.create({
        name: raw.name,
        handle: raw.handle,
        description: '',
        avatar: avatarResult.url,
        avatarPublicId: avatarResult.publicId,
        coverImages: coverImagesResult,
        categories: raw.categories,
        city: '',
        country: 'Morocco',
        telegramHandle: raw.handle,
        telegramLink: `https://t.me/${raw.handle}`,
        whatsappNumber: '',
        whatsappLink: '',
        owner: supplier._id,
        isApproved: true,
        isActive: true,
        followerCount: raw.followerCount,
        productCount: raw.productCount,
      });

      console.log(`  ✅ Inserted store: ${store.name} (${store.handle})`);
      inserted++;
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🎉 Done! Inserted: ${inserted} | Skipped: ${skipped}`);
    console.log(`Total stores in DB: ${await Store.countDocuments()}`);
    console.log(`${'═'.repeat(50)}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
