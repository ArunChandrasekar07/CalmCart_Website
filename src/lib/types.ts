export type Tag = "Frequently bought" | "Price drop" | "Seasonal" | "New";
export type Confidence = "High Confidence" | "Good Match" | "Try Something New";

export type Category = { slug: string; name: string; emoji: string; sort_order: number };

export type ProductVariant = { id: string; label: string; price: number; mrp: number | null };

export type Product = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  price: number;
  unit: string;
  rating: number;
  confidence: Confidence;
  description: string;
  tag: Tag | null;
  seasonal: boolean;
  sort_order: number;
  variants: ProductVariant[];
};

export type PromoCode = {
  code: string;
  title: string;
  description: string;
  kind: "percent" | "flat" | "free_delivery";
  value: number;
  min_subtotal: number;
  max_discount: number | null;
  first_order_only: boolean;
};

export type Catalog = { categories: Category[]; products: Product[]; promos: PromoCode[] };

export type CartLine = { productId: string; variantId: string | null; qty: number };

export type Quote = {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  autoDiscount: number;
  promoDiscount: number;
  promoCode: string | null;
  promoError: string | null;
  total: number;
};

export type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  recipient: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "upi_on_delivery" | "card_on_delivery";

export type OrderItem = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  name: string;
  emoji: string;
  variant_label: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_no: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  promo_code: string | null;
  total: number;
  payment_method: PaymentMethod;
  eta_minutes: number;
  address: Omit<Address, "id" | "is_default">;
  note: string | null;
  status_times: Partial<Record<OrderStatus, string>>;
  placed_at: string;
  delivered_at: string | null;
  cancelled_at: string | null;
  order_items: OrderItem[];
};

export type AppNotification = {
  id: string;
  title: string;
  body: string | null;
  kind: "price_drop" | "restock" | "order" | "summary" | "system";
  product_id: string | null;
  order_id: string | null;
  read: boolean;
  created_at: string;
};

export type Preferences = {
  theme: "system" | "light" | "dark";
  largeText: boolean;
  highContrast: boolean;
  haptics: boolean;
  push: boolean;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  preferences: Partial<Preferences>;
  onboarded: boolean;
};
