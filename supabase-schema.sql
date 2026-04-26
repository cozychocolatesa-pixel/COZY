-- Cozy Chocolate Database Schema
-- Run this in Supabase SQL Editor

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('occasions', 'boxes')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Allow all operations for authenticated (anon key with service role for admin)
CREATE POLICY "Allow all for anon"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to product images
CREATE POLICY "Public access to product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Allow upload for anyone (admin auth handled at API level)
CREATE POLICY "Allow upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

-- Allow delete product images
CREATE POLICY "Allow delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');

-- Insert sample data
INSERT INTO products (name, name_ar, price, category, sort_order) VALUES
  ('Wedding Collection', 'مجموعة الأعراس', 350, 'occasions', 1),
  ('Eid Special', 'تشكيلة العيد', 200, 'occasions', 2),
  ('Graduation Gift', 'هدية التخرج', 180, 'occasions', 3),
  ('Baby Shower', 'استقبال مولود', 250, 'occasions', 4),
  ('Classic Box', 'بوكس كلاسيك', 120, 'boxes', 1),
  ('Premium Box', 'بوكس بريميوم', 200, 'boxes', 2),
  ('Mini Box', 'بوكس ميني', 75, 'boxes', 3),
  ('Luxury Box', 'بوكس فاخر', 300, 'boxes', 4);
