export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  supplier_cost: number | null;
  shipping_cost: number;
  material: string | null;
  fit: string | null;
  care_instructions: string | null;
  shipping_info: string | null;
  return_info: string | null;
  cj_product_id: string | null;
  status: 'draft' | 'testing' | 'active' | 'paused' | 'winner' | 'discontinued';
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  cj_variant_id: string | null;
  price_adjustment: number;
  stock_quantity: number;
  active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  color_variant: string | null;
  sort_order: number;
  created_at: string;
}

export interface SizeGuideImage {
  id: string;
  product_id: string | null;
  size_chart_url: string | null;
  fit_photo_url: string | null;
  is_global: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
  image_url: string;
  cj_product_id: string;
  cj_variant_id: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_zip: string;
  subtotal: number;
  shipping_total: number;
  total: number;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  payment_provider: string | null;
  payment_transaction_id: string | null;
  payment_reference: string | null;
  cj_order_id: string | null;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  fulfillment_error: string | null;
  fulfillment_attempts: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded' | 'chargeback';
export type FulfillmentStatus = 'awaiting_fulfillment' | 'sent_to_cj' | 'cj_processing' | 'shipped' | 'in_transit' | 'delivered' | 'fulfillment_error' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_id: string | null;
  color: string | null;
  size: string | null;
  sku: string | null;
  cj_product_id: string | null;
  cj_variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string | null;
  provider: string;
  transaction_id: string | null;
  reference: string | null;
  amount: number;
  currency: string;
  status: string;
  webhook_received: boolean;
  webhook_status: string | null;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Return {
  id: string;
  order_id: string | null;
  customer_email: string;
  reason: string;
  evidence_urls: string[] | null;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'refund_issued' | 'replacement_sent';
  cj_dispute_reference: string | null;
  refund_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TikTokContent {
  id: string;
  video_url: string | null;
  product_id: string | null;
  hook: string | null;
  post_date: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  link_clicks: number;
  orders_count: number;
  revenue: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  [key: string]: string;
}

export interface SiteContent {
  [section: string]: Record<string, string>;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  product_id: string | null;
  name: string;
  cj_product_id: string | null;
  product_url: string | null;
  cost: number | null;
  shipping_cost: number | null;
  processing_time: string | null;
  shipping_method: string | null;
  return_notes: string | null;
  backup_supplier: string | null;
  notes: string | null;
  last_verified: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  payment_provider: 'paystack' | 'flutterwave';
}

export interface FulfillmentRecord {
  id: string;
  order_id: string;
  cj_order_id: string | null;
  status: string;
  request_data: Record<string, unknown> | null;
  response_data: Record<string, unknown> | null;
  error_message: string | null;
  attempt_number: number;
  created_at: string;
  updated_at: string;
}
