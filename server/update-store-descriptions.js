/**
 * update-store-descriptions.js
 * ─────────────────────────────
 * Updates empty store descriptions with high-quality, professional bilingual
 * descriptions (Arabic + French/English) tailored to each store's categories
 * and name.
 *
 * Usage: node update-store-descriptions.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Store = require('./models/Store');

// Map of custom descriptions based on handles or categories
const CUSTOM_DESCRIPTIONS = {
  // Footwear
  chourakjamla: "متجر متخصص في بيع الأحذية الرجالية والنسائية والرياضية بالجملة مباشرة من المستورد والمصنع بجودة عالية وأسعار منافسة.\n\nGrossiste spécialisé dans la vente de chaussures pour hommes, femmes et enfants au meilleur prix, direct importateur et fabricant.",
  asilil2ahdia: "متجر أحذية الأصيل بالجملة يوفر تشكيلة واسعة من الأحذية النسائية، الكاجوال، والصنادل بجودة ممتازة وأسعار جملة منافسة.\n\nAl Assil Chaussures propose une large gamme de chaussures pour femmes, sabots et sandales de qualité supérieure aux tarifs de gros.",
  adiladshop3: "موزع أحذية بالجملة يقدم أحدث الموديلات العصرية للأحذية الرجالية والنسائية بأفضل الأسعار مباشرة للموزعين.\n\nDistributeur de chaussures en gros proposant les dernières tendances pour hommes et femmes au meilleur prix direct.",
  pahbori: "الجملة الأولى للأحذية - مصطفى زريقة. نوفر تشكيلة واسعة من الأحذية الكلاسيكية والرياضية بالجملة لجميع التجار بالمغرب.\n\nFournisseur grossiste de chaussures classiques et de sport pour tous les commerçants du Maroc.",
  nourdin_brest: "متجر نور بيست لبيع الأحذية الرياضية والكلاسيكية بالجملة. أحدث صيحات الموضة للأحذية بجودة عالية وأسعار ممتازة.\n\nNourbest Shoes, votre partenaire grossiste pour l'achat de baskets et chaussures de sport en gros au Maroc.",

  // Beauty & Cosmetics
  amiinhmo: "موزع جملة رائد لجميع منتجات التجميل، المكياج، العطور، وأدوات العناية بالبشرة بأسعار إنزكان الأصلية المنافسة.\n\nDistributeur leader en gros de produits cosmétiques, maquillage et parfums aux tarifs compétitifs d'Inzegane.",
  lnjmela: "إيكوميرس ماروك لبيع مستحضرات التجميل، المكياج، ومنتجات العناية الشخصية بالجملة للتجار والمسوقين الإلكترونيين.\n\nCosmétiques et maquillage de marque en gros pour les professionnels de la revente et du e-commerce.",
  montajathichaminzgan: "مكياج هشام المنصوري إنزكان. نوفر تشكيلة متكاملة من المكياج وأدوات التجميل والعناية بالجملة بأسعار منافسة وجودة مضمونة.\n\nMaquillage Hicham Inzegane, grossiste d'accessoires de beauté, maquillage et soins corporels de qualité.",

  // Women's Clothing & Pyjamas
  bassimmodestore: "متجر الشمال للملابس الجاهزة والبيجامات النسائية بالجملة مع أمينة. أحدث الموديلات الشتوية والصيفية بأسعار المصنع مباشرة.\n\nMode féminine et pyjamas en gros avec Amina. Retrouvez les dernières collections été/hiver à prix direct usine.",
  adil_ad_shop: "عصرية عادل شوب لملابس النساء والجلابيات والبيجامات بالجملة. تصميمات راقية وعصرية تناسب جميع الأذواق.\n\nAdil Ad Shop propose des vêtements modernes pour femmes, pyjamas et tuniques en gros au Maroc.",
  lmardi1: "المرضي بيجامة. متخصصون في البيع بالجملة للبيجامات وملابس النوم النسائية والملابس المنزلية المريحة بأفضل الأسعار.\n\nLmardi Pyjama, votre grossiste de confiance pour les pyjamas et vêtements d'intérieur pour femmes.",
  azizemnsouri: "جملة المنصوري لملابس النساء والبيجامات والملابس الجاهزة. نوفر أفضل الخامات والتصاميم بأسعار الجملة للتجار والموزعين.\n\nMansori Mode, vente en gros de vêtements pour femmes et tenues de nuit au meilleur prix de gros.",
  adiladshop1: "التقليدية عادل شوب. متجر جملة متخصص في الملابس التقليدية المغربية، الجلابيات، والقفاطين بلمسة عصرية وخامات ممتازة.\n\nSpécialiste de la vente en gros de tenues traditionnelles marocaines, Djellabas et Caftans haut de gamme.",
  abdoujamla: "عبدو شوب للبيع بالجملة. ملابس نسائية متنوعة، عبايات، وبيجامات بجودة عالية وأسعار جملة مناسبة جداً للجميع.\n\nAbdou Shop, grossiste de vêtements pour femmes, abayas et tenues décontractées de qualité.",
  sulitoo: "متجر الرائد للبيع بالجملة. تشكيلة ممتازة من الملابس الجاهزة والبيجامات النسائية ومستلزمات الموضة بأسعار الجملة الأصلية.\n\nSulitoo, grossiste de prêt-à-porter féminin et accessoires de mode de premier choix.",
  jmlaboutique: "هوب أوفكير لملابس النساء والبيجامات والملابس المنزلية بالجملة. خامات ممتازة وأسعار جملة حقيقية للتجار.\n\nHub Oufkir, grossiste de vêtements pour femmes et pyjamas de qualité supérieure.",
  hananfirdaous: "متجر فردوس لملابس النساء والملابس الجاهزة بالجملة. أحدث صيحات الموضة النسائية بأفضل الأسعار في السوق.\n\nHanan Firdaous Mode, grossiste de prêt-à-porter féminin moderne et tendance.",
  tg_1800795401: "أكريم زازا بيجامة. متخصصون في بيع جميع أنواع البيجامات النسائية وملابس الأطفال بالجملة مباشرة من المصنع.\n\nAkrim Zaza Pyjama, grossiste de pyjamas pour femmes et enfants direct usine.",
  tg_1413529539: "متجر عبيدي لملابس النساء بالجملة. ملابس عصرية ومريحة تناسب جميع الفصول بأسعار جملة تنافسية وتوصيل سريع.\n\nAbidi Shop, grossiste de mode féminine contemporaine à des prix très avantageux.",

  // Men's Clothing
  abdohmabdo: "عبد الهادي كينج شوب لملابس الرجال بالجملة. نوفر تيشرتات، سراويل، وملابس رياضية عصرية بجودة عالية لجميع المحلات.\n\nAbdolhadi King Shop, grossiste de prêt-à-porter masculin : T-shirts, jeans et vêtements de sport.",
  aminashop06: "ملابس تركيا للرجال مع أمينة المسكيني. نوفر أرقى الملابس الرجالية المستوردة من تركيا مباشرة بالجملة وبأسعار ممتازة.\n\nVêtements turcs pour hommes importés en gros avec Amina. Qualité supérieure au meilleur tarif.",
  adiladshop9: "عادل شوب لملابس الرجال بالجملة. متجر متميز يوفر الملابس الكاجوال والرياضية للرجال بجودة عالية مباشرة للتجار.\n\nAdil Ad Shop Homme, grossiste en vêtements décontractés et sportswear pour hommes.",

  // Electronics
  gadgetsmaroc: "متجر جادجيت ماروك للإلكترونيات الذكية وإكسسوارات الهواتف والمنتجات الإبداعية بالجملة. موزعكم الموثوق لأحدث التقنيات.\n\nGadget Maroc, grossiste en ligne d'accessoires high-tech, objets connectés et gadgets innovants."
};

// Fallback descriptions by category
const CATEGORY_FALLBACKS = {
  Fashion: "متجر بيع بالجملة متخصص في الملابس الجاهزة ومستلزمات الموضة بأفضل الأسعار مباشرة للمحلات والموزعين.\n\nBoutique de vente en gros spécialisée dans le prêt-à-porter et les accessoires de mode de qualité.",
  Beauty: "موزع جملة لمنتجات العناية بالبشرة، المكياج، وأدوات التجميل بأسعار منافسة وجودة مضمونة.\n\nGrossiste de produits de beauté, maquillage et soins corporels pour tous les professionnels.",
  Electronics: "متجر إلكترونيات ذكية وأجهزة منزلية وإكسسوارات هواتف بالجملة بأسعار منافسة وتوصيل لجميع المدن.\n\nGrossiste d'appareils électroniques, smartphones, gadgets et accessoires technologiques au Maroc.",
  default: "متجر بيع بالجملة متميز يوفر تشكيلة واسعة من المنتجات بجودة عالية وأسعار منافسة للتجار والمسوقين.\n\nBoutique de vente en gros proposant une large sélection de produits de qualité à prix compétitifs."
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const stores = await Store.find({});
    console.log(`Found ${stores.length} stores in database.`);

    let updatedCount = 0;

    for (const store of stores) {
      let newDescription = '';

      // 1. Check custom handles map
      if (CUSTOM_DESCRIPTIONS[store.handle]) {
        newDescription = CUSTOM_DESCRIPTIONS[store.handle];
      } 
      // 2. Otherwise apply category fallbacks
      else if (store.categories && store.categories.length > 0) {
        const primaryCat = store.categories[0];
        if (CATEGORY_FALLBACKS[primaryCat]) {
          newDescription = CATEGORY_FALLBACKS[primaryCat];
        } else {
          // Check for subcategory patterns inside the array
          const hasFashion = store.categories.some(c => c.toLowerCase().includes('fashion'));
          const hasBeauty = store.categories.some(c => c.toLowerCase().includes('beauty') || c.toLowerCase().includes('cosmetics'));
          const hasElectronics = store.categories.some(c => c.toLowerCase().includes('electr'));

          if (hasFashion) newDescription = CATEGORY_FALLBACKS.Fashion;
          else if (hasBeauty) newDescription = CATEGORY_FALLBACKS.Beauty;
          else if (hasElectronics) newDescription = CATEGORY_FALLBACKS.Electronics;
          else newDescription = CATEGORY_FALLBACKS.default;
        }
      } 
      // 3. Absolute fallback
      else {
        newDescription = CATEGORY_FALLBACKS.default;
      }

      // Only update if it currently has no description, or if we want to overwrite empty ones
      if (!store.description || store.description.trim() === '') {
        store.description = newDescription;
        await store.save();
        console.log(`✏️ Updated description for store: ${store.name} (@${store.handle})`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Descriptions updated successfully! Total updated: ${updatedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update descriptions:', err);
    process.exit(1);
  }
}

main();
