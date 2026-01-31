-- Create orders table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  items JSONB NOT NULL DEFAULT '[]',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  delivery_address JSONB,
  payment_method TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  coupon_code TEXT,
  notes TEXT,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pix_charges table
CREATE TABLE public.pix_charges (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  charge_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  copy_paste_code TEXT,
  qr_code_base64 TEXT,
  qr_code_image_url TEXT,
  raw_response JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_orders_code ON public.orders(code);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_pix_charges_order_id ON public.pix_charges(order_id);
CREATE INDEX idx_pix_charges_charge_id ON public.pix_charges(charge_id);
CREATE INDEX idx_pix_charges_status ON public.pix_charges(status);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders (public read/insert for now since no auth)
CREATE POLICY "Anyone can view orders by id" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update orders" 
ON public.orders FOR UPDATE 
USING (true);

-- RLS Policies for pix_charges
CREATE POLICY "Anyone can view pix_charges" 
ON public.pix_charges FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create pix_charges" 
ON public.pix_charges FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update pix_charges" 
ON public.pix_charges FOR UPDATE 
USING (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pix_charges_updated_at
BEFORE UPDATE ON public.pix_charges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();