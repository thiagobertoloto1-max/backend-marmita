// Order Service - Order management with database persistence

import { supabase } from '@/integrations/supabase/client';
import { Cart, CartItem } from './cartService';
import { Json } from '@/integrations/supabase/types';

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  items: CartItem[];
  customer: CustomerData;
  deliveryAddress?: DeliveryAddress;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'pix' | 'card' | 'cash';
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  pixChargeId?: string;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'payment_confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  payment_confirmed: 'Pagamento confirmado',
  preparing: 'Preparando',
  ready: 'Pronto para entrega',
  delivering: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

// Generate order code
const generateOrderCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}${random}`;
};

// Generate order ID
const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create new order - saves to database
export const createOrder = async (
  cart: Cart,
  customer: CustomerData,
  deliveryAddress: DeliveryAddress | undefined,
  deliveryMethod: 'delivery' | 'pickup',
  paymentMethod: 'pix' | 'card' | 'cash',
  notes?: string
): Promise<Order> => {
  const now = new Date();
  const estimatedMinutes = deliveryMethod === 'delivery' ? 45 : 30;
  
  const orderId = generateOrderId();
  const orderCode = generateOrderCode();
  
  const order: Order = {
    id: orderId,
    code: orderCode,
    status: paymentMethod === 'cash' ? 'payment_confirmed' : 'pending_payment',
    items: cart.items,
    customer,
    deliveryAddress,
    deliveryMethod,
    paymentMethod,
    subtotal: cart.subtotal,
    deliveryFee: deliveryMethod === 'delivery' ? cart.deliveryFee : 0,
    discount: cart.discount,
    total: cart.total,
    couponCode: cart.couponCode,
    notes,
    createdAt: now,
    updatedAt: now,
    estimatedDelivery: new Date(now.getTime() + estimatedMinutes * 60 * 1000)
  };

  // Save to database
  const { error } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      code: orderCode,
      status: order.status,
      items: cart.items as unknown as Json,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      delivery_method: deliveryMethod,
      delivery_address: deliveryAddress as unknown as Json,
      payment_method: paymentMethod,
      subtotal: cart.subtotal,
      delivery_fee: deliveryMethod === 'delivery' ? cart.deliveryFee : 0,
      discount: cart.discount,
      total: cart.total,
      coupon_code: cart.couponCode || null,
      notes: notes || null,
      estimated_delivery: order.estimatedDelivery?.toISOString(),
    });

  if (error) {
    console.error('Error saving order to database:', error);
    throw new Error('Failed to create order');
  }

  console.log('Order created:', orderId);
  return order;
};

// Get order by ID from database
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapDbOrderToOrder(data);
};

// Get order by code from database
export const getOrderByCode = async (code: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapDbOrderToOrder(data);
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapDbOrderToOrder(data);
};

// Map database record to Order type
function mapDbOrderToOrder(data: {
  id: string;
  code: string;
  status: string;
  items: Json;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  delivery_address: Json | null;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  estimated_delivery: string | null;
}): Order {
  return {
    id: data.id,
    code: data.code,
    status: data.status as OrderStatus,
    items: (Array.isArray(data.items) ? data.items : []) as unknown as CartItem[],
    customer: {
      name: data.customer_name,
      email: data.customer_email,
      phone: data.customer_phone,
    },
    deliveryAddress: data.delivery_address as unknown as DeliveryAddress | undefined,
    deliveryMethod: data.delivery_method as 'delivery' | 'pickup',
    paymentMethod: data.payment_method as 'pix' | 'card' | 'cash',
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    discount: Number(data.discount),
    total: Number(data.total),
    couponCode: data.coupon_code || undefined,
    notes: data.notes || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    estimatedDelivery: data.estimated_delivery ? new Date(data.estimated_delivery) : undefined,
  };
}

// Get user's order history
export const getOrderHistory = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching order history:', error);
    return [];
  }

  return (data || []).map(mapDbOrderToOrder);
};
