import type { Catalog, Category, Product, PromoCode, ProductVariant } from "@/lib/types";

/**
 * Bundled copy of the CalmCart catalog. It mirrors the rows seeded into the
 * Supabase project (see supabase/migrations) and is only used as a fallback —
 * for the very first paint and whenever the live fetch is unavailable — so the
 * storefront never renders empty. Live data always wins once it loads.
 */

const categories: Category[] = [
  { slug: "Fruits", name: "Fruits", emoji: "🍎", sort_order: 1 },
  { slug: "Vegetables", name: "Vegetables", emoji: "🥦", sort_order: 2 },
  { slug: "Dairy", name: "Dairy", emoji: "🥛", sort_order: 3 },
  { slug: "Bakery", name: "Bakery", emoji: "🍞", sort_order: 4 },
  { slug: "Snacks", name: "Snacks", emoji: "🍿", sort_order: 5 },
  { slug: "Beverages", name: "Beverages", emoji: "🧃", sort_order: 6 },
  { slug: "Frozen", name: "Frozen", emoji: "🍦", sort_order: 7 },
  { slug: "Pantry", name: "Pantry", emoji: "🍚", sort_order: 8 },
];

type Conf = "High Confidence" | "Good Match" | "Try Something New";
const H: Conf = "High Confidence";
const G: Conf = "Good Match";
const T: Conf = "Try Something New";

// [id, name, category, emoji, price, unit, rating, confidence, tag, seasonal, description]
type Row = [string, string, string, string, number, string, number, Conf, Product["tag"], boolean, string];

const rows: Row[] = [
  ["oat-milk", "Oat Milk", "Dairy", "🥛", 120, "/litre", 4.6, H, "Frequently bought", false, "Fresh, creamy oat milk made from 100% whole oats. No added sugar, naturally dairy-free. Rich in fibre and calcium — perfect for your morning coffee or cereal."],
  ["apples", "Apples", "Fruits", "🍎", 40, "/kg", 4.4, G, null, true, "Crisp, hand-picked apples sourced from local orchards. A sweet-tart snack packed with fibre and vitamin C."],
  ["bananas", "Bananas", "Fruits", "🍌", 30, "/dozen", 4.5, H, "Price drop", false, "Naturally ripened bananas — a quick source of potassium and energy. Great for smoothies, baking, or a quick snack."],
  ["bread", "Bread", "Bakery", "🍞", 35, "/loaf", 4.2, G, null, false, "Soft, freshly baked whole-wheat bread, baked daily with no preservatives. Stays fresh for up to 4 days when refrigerated."],
  ["eggs", "Eggs", "Dairy", "🥚", 80, "/dozen", 4.7, H, null, false, "Farm-fresh eggs from free-range hens. A versatile protein source for breakfast, baking, or dinner."],
  ["cheese", "Cheese", "Dairy", "🧀", 150, "/200g", 4.3, G, null, false, "Rich, creamy cheddar cheese block — sliced or grated, it melts beautifully for sandwiches, pasta, and snacks."],
  ["butter", "Butter", "Dairy", "🧈", 90, "/500g", 4.5, G, null, false, "Smooth, churned butter made from fresh cream. Ideal for baking, toast, or cooking."],
  ["yogurt", "Yogurt", "Dairy", "🥣", 45, "/400g", 4.4, T, null, false, "Thick, probiotic-rich yogurt made the traditional way. Great on its own or with fruit and honey."],
  ["chips", "Potato Chips", "Snacks", "🥔", 20, "/pack", 4.1, T, null, false, "Crispy, lightly salted potato chips — the classic snack-time favourite."],
  ["cookies", "Cookies", "Snacks", "🍪", 60, "/pack", 4.3, G, null, false, "Buttery, crumbly cookies baked with real chocolate chips."],
  ["orange-juice", "Orange Juice", "Beverages", "🧃", 70, "/litre", 4.2, G, null, false, "100% cold-pressed orange juice with no added sugar — a daily dose of vitamin C."],
  ["ice-cream", "Vanilla Ice Cream", "Frozen", "🍦", 110, "/500ml", 4.6, H, null, false, "Classic, creamy vanilla ice cream made with real Madagascar vanilla."],
  ["mangoes", "Mangoes", "Fruits", "🥭", 120, "/kg", 4.8, H, "Seasonal", true, "Sun-ripened, juicy mangoes with a honey-sweet flavour. The taste of summer, delivered fresh."],
  ["grapes", "Grapes", "Fruits", "🍇", 70, "/500g", 4.3, G, null, false, "Plump, seedless grapes — sweet, crisp and washed, ready to snack on."],
  ["watermelon", "Watermelon", "Fruits", "🍉", 60, "/piece", 4.4, T, "Seasonal", true, "Cool, hydrating watermelon with deep red flesh. A refreshing pick for hot days."],
  ["strawberries", "Strawberries", "Fruits", "🍓", 90, "/250g", 4.5, G, "New", false, "Fragrant, ruby-red strawberries. Wonderful with cream, in smoothies or straight from the box."],
  ["kiwi", "Kiwi", "Fruits", "🥝", 85, "/pack of 3", 4.2, T, null, false, "Tangy-sweet kiwis loaded with vitamin C. Scoop with a spoon or slice into salads."],
  ["pineapple", "Pineapple", "Fruits", "🍍", 55, "/piece", 4.1, T, null, false, "Golden, juicy pineapple with a bright tropical tang."],
  ["tomatoes", "Tomatoes", "Vegetables", "🍅", 30, "/kg", 4.3, H, "Frequently bought", false, "Firm, vine-ripened tomatoes for curries, salads and sauces."],
  ["potatoes", "Potatoes", "Vegetables", "🥔", 28, "/kg", 4.2, G, null, false, "All-purpose potatoes — fluffy when mashed, crisp when roasted."],
  ["onions", "Onions", "Vegetables", "🧅", 35, "/kg", 4.2, G, null, false, "Pungent, long-lasting onions — the base of almost every great meal."],
  ["carrots", "Carrots", "Vegetables", "🥕", 28, "/500g", 4.4, G, null, false, "Sweet, crunchy carrots for salads, soups and snacking."],
  ["broccoli", "Broccoli", "Vegetables", "🥦", 55, "/piece", 4.3, T, null, false, "Tender green florets packed with fibre and vitamin K. Steam, stir-fry or roast."],
  ["spinach", "Spinach", "Vegetables", "🥬", 20, "/bunch", 4.2, G, null, false, "Fresh, tender spinach leaves, rich in iron. Perfect for sautés, smoothies and salads."],
  ["capsicum", "Capsicum", "Vegetables", "🫑", 45, "/500g", 4.1, G, null, false, "Crisp green capsicum with a mild, fresh bite."],
  ["cucumber", "Cucumber", "Vegetables", "🥒", 25, "/500g", 4.2, G, null, false, "Cool, crunchy cucumbers for salads, raita and sandwiches."],
  ["sweet-corn", "Sweet Corn", "Vegetables", "🌽", 30, "/2 pcs", 4.4, G, "Seasonal", true, "Sweet, juicy corn on the cob. Boil, grill or roast."],
  ["garlic", "Garlic", "Vegetables", "🧄", 40, "/250g", 4.3, G, null, false, "Aromatic garlic bulbs with a bold, savoury flavour."],
  ["milk", "Full Cream Milk", "Dairy", "🥛", 68, "/litre", 4.6, H, "Frequently bought", false, "Fresh, pasteurised full cream milk. Rich, creamy and perfect for tea, coffee or cereal."],
  ["croissants", "Butter Croissants", "Bakery", "🥐", 90, "/pack of 2", 4.5, H, null, false, "Flaky, golden croissants baked with real butter. Best enjoyed warm."],
  ["baguette", "Baguette", "Bakery", "🥖", 60, "/piece", 4.2, T, null, false, "Crusty on the outside, soft on the inside — baked fresh every morning."],
  ["cupcakes", "Cupcakes", "Bakery", "🧁", 120, "/pack of 4", 4.4, T, null, false, "Soft vanilla cupcakes topped with silky buttercream."],
  ["bagels", "Bagels", "Bakery", "🥯", 80, "/pack of 4", 4.1, T, null, false, "Chewy, golden bagels — toast them and add your favourite spread."],
  ["popcorn", "Popcorn", "Snacks", "🍿", 40, "/pack", 4.2, G, null, false, "Light, crunchy popcorn lightly salted for movie nights."],
  ["mixed-nuts", "Mixed Nuts", "Snacks", "🥜", 180, "/200g", 4.6, H, null, false, "Roasted almonds, cashews and pistachios — a protein-rich, crunchy snack."],
  ["dark-chocolate", "Dark Chocolate", "Snacks", "🍫", 50, "/bar", 4.5, H, "Price drop", false, "Rich 70% dark chocolate with a smooth, slightly bittersweet finish."],
  ["pretzels", "Pretzels", "Snacks", "🥨", 45, "/pack", 4.1, T, null, false, "Crunchy baked pretzel twists with a sprinkle of salt."],
  ["green-tea", "Green Tea", "Beverages", "🍵", 140, "/25 bags", 4.4, G, null, false, "Light, antioxidant-rich green tea bags with a clean, fresh taste."],
  ["coffee", "Filter Coffee", "Beverages", "☕", 320, "/200g", 4.7, H, null, false, "Freshly roasted and ground South Indian filter coffee with a deep, aromatic body."],
  ["coconut-water", "Coconut Water", "Beverages", "🥥", 40, "/200ml", 4.3, G, "Seasonal", true, "Naturally hydrating tender coconut water — nothing added."],
  ["lemonade", "Lemonade", "Beverages", "🍋", 45, "/500ml", 4.2, G, null, false, "Zesty, freshly squeezed-style lemonade, lightly sweetened."],
  ["green-peas", "Green Peas", "Frozen", "🌱", 85, "/500g", 4.3, G, null, false, "Garden peas frozen at peak freshness. Sweet, tender and ready to cook."],
  ["french-fries", "French Fries", "Frozen", "🍟", 140, "/500g", 4.4, T, null, false, "Crinkle-cut fries that bake or fry up golden and crisp."],
  ["dumplings", "Veg Dumplings", "Frozen", "🥟", 160, "/300g", 4.5, G, "New", false, "Hand-folded vegetable dumplings. Steam or pan-fry in minutes."],
  ["basmati-rice", "Basmati Rice", "Pantry", "🍚", 95, "/kg", 4.6, H, null, false, "Long-grain, aged basmati rice that cooks up fluffy and fragrant."],
  ["atta", "Whole Wheat Atta", "Pantry", "🌾", 55, "/kg", 4.5, H, null, false, "Stone-ground whole wheat flour for soft rotis and parathas."],
  ["toor-dal", "Toor Dal", "Pantry", "🫘", 75, "/500g", 4.3, G, null, false, "Protein-rich split pigeon peas — the heart of everyday dal."],
  ["olive-oil", "Olive Oil", "Pantry", "🫒", 450, "/500ml", 4.4, G, null, false, "Cold-pressed extra virgin olive oil for dressings, sautés and dipping."],
  ["honey", "Honey", "Pantry", "🍯", 210, "/250g", 4.6, H, null, false, "Pure, unprocessed honey with a naturally floral sweetness."],
  ["penne-pasta", "Penne Pasta", "Pantry", "🍝", 85, "/500g", 4.2, G, null, false, "Durum wheat penne that holds sauce beautifully."],
];

// product id -> [id, label, price, mrp?][]
const v = (id: string, label: string, price: number, mrp?: number): ProductVariant => ({ id, label, price, mrp: mrp ?? null });

const variants: Record<string, ProductVariant[]> = {
  "oat-milk": [v("500ml", "500 ml", 65, 70), v("1l", "1 L", 120), v("2l", "2 L", 220, 240)],
  apples: [v("500g", "500 g", 22, 25), v("1kg", "1 kg", 40), v("2kg", "2 kg", 75, 80)],
  cheese: [v("100g", "100 g", 80, 85), v("200g", "200 g", 150), v("400g", "400 g", 280, 300)],
  butter: [v("100g", "100 g", 20, 22), v("500g", "500 g", 90), v("1kg", "1 kg", 170, 180)],
  yogurt: [v("200g", "200 g", 25, 28), v("400g", "400 g", 45), v("900g", "900 g", 95, 105)],
  "orange-juice": [v("500ml", "500 ml", 38, 40), v("1l", "1 L", 70), v("2l", "2 L", 130, 140)],
  "ice-cream": [v("500ml", "500 ml", 110), v("1l", "1 L", 200, 220)],
  mangoes: [v("500g", "500 g", 65, 70), v("1kg", "1 kg", 120), v("2kg", "2 kg", 230, 240)],
  grapes: [v("250g", "250 g", 38, 40), v("500g", "500 g", 70), v("1kg", "1 kg", 130, 140)],
  strawberries: [v("250g", "250 g", 90), v("500g", "500 g", 170, 180)],
  tomatoes: [v("500g", "500 g", 16, 18), v("1kg", "1 kg", 30), v("2kg", "2 kg", 56, 60)],
  potatoes: [v("1kg", "1 kg", 28), v("2kg", "2 kg", 52, 56), v("5kg", "5 kg", 125, 140)],
  onions: [v("1kg", "1 kg", 35), v("2kg", "2 kg", 66, 70), v("5kg", "5 kg", 160, 175)],
  carrots: [v("250g", "250 g", 16, 18), v("500g", "500 g", 28), v("1kg", "1 kg", 52, 56)],
  milk: [v("500ml", "500 ml", 35, 36), v("1l", "1 L", 68), v("2l", "2 L", 130, 136)],
  "mixed-nuts": [v("100g", "100 g", 95, 100), v("200g", "200 g", 180), v("500g", "500 g", 430, 450)],
  coffee: [v("100g", "100 g", 170, 180), v("200g", "200 g", 320), v("500g", "500 g", 760, 800)],
  "green-peas": [v("250g", "250 g", 48, 50), v("500g", "500 g", 85), v("1kg", "1 kg", 160, 170)],
  "basmati-rice": [v("1kg", "1 kg", 95), v("5kg", "5 kg", 450, 475), v("10kg", "10 kg", 880, 930)],
  atta: [v("1kg", "1 kg", 55), v("5kg", "5 kg", 255, 275), v("10kg", "10 kg", 490, 520)],
  "toor-dal": [v("500g", "500 g", 75), v("1kg", "1 kg", 145, 150)],
  "olive-oil": [v("250ml", "250 ml", 240, 255), v("500ml", "500 ml", 450), v("1l", "1 L", 860, 900)],
  honey: [v("250g", "250 g", 210), v("500g", "500 g", 400, 420)],
};

const products: Product[] = rows.map(
  ([id, name, category, emoji, price, unit, rating, confidence, tag, seasonal, description], i) => ({
    id,
    name,
    category,
    emoji,
    price,
    unit,
    rating,
    confidence,
    description,
    tag,
    seasonal,
    sort_order: i + 1,
    variants: variants[id] ?? [],
  })
);

const promos: PromoCode[] = [
  { code: "WELCOME30", title: "Welcome gift", description: "₹30 off your first order (min. ₹99)", kind: "flat", value: 30, min_subtotal: 99, max_discount: null, first_order_only: true },
  { code: "CALM10", title: "Calm 10", description: "10% off up to ₹50 on orders above ₹199", kind: "percent", value: 10, min_subtotal: 199, max_discount: 50, first_order_only: false },
  { code: "FRESH50", title: "Fresh ₹50", description: "Flat ₹50 off on orders above ₹399", kind: "flat", value: 50, min_subtotal: 399, max_discount: null, first_order_only: false },
  { code: "FREEDEL", title: "Free delivery", description: "Delivery on us for orders above ₹149", kind: "free_delivery", value: 0, min_subtotal: 149, max_discount: null, first_order_only: false },
];

export const SEED_CATALOG: Catalog = { categories, products, promos };
