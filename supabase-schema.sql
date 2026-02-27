-- ============================================
-- GIFTESS E-COMMERCE DATABASE SCHEMA
-- Complete Supabase SQL Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for clean setup)
-- ============================================
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS hero_settings CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    emoji TEXT,
    photo TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price_sale INTEGER NOT NULL,
    price_old INTEGER,
    photos JSON DEFAULT '[]'::json,
    featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: hero_settings (singleton)
-- ============================================
CREATE TABLE hero_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    title TEXT NOT NULL DEFAULT 'Premium Gifts for Your Loved Ones',
    subtitle TEXT NOT NULL DEFAULT 'Discover Unique Jewelry & Beautiful Gifts',
    btn1 TEXT NOT NULL DEFAULT 'Shop Now',
    btn2 TEXT NOT NULL DEFAULT 'Explore',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero settings
INSERT INTO hero_settings (id, title, subtitle, btn1, btn2) 
VALUES (1, 'Premium Gifts for Your Loved Ones', 'Discover Unique Jewelry & Beautiful Gifts', 'Shop Now', 'Explore')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: store_settings (singleton)
-- ============================================
CREATE TABLE store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    wa_number TEXT NOT NULL DEFAULT '916002698296',
    shipping_fee INTEGER NOT NULL DEFAULT 100,
    free_shipping_min INTEGER NOT NULL DEFAULT 999,
    tax_enabled BOOLEAN DEFAULT false,
    tax_percent INTEGER DEFAULT 0,
    promo_codes JSON DEFAULT '[]'::json,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store settings
INSERT INTO store_settings (id, wa_number, shipping_fee, free_shipping_min, tax_enabled, tax_percent, promo_codes)
VALUES (1, '916002698296', 100, 999, false, 0, '[]'::json)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: profiles
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pincode TEXT NOT NULL,
    items JSON NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping_fee INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Public can view active categories
CREATE POLICY "Public can view active categories"
ON categories FOR SELECT
TO anon
USING (status = 'active');

-- Authenticated users can view active categories
CREATE POLICY "Authenticated users can view active categories"
ON categories FOR SELECT
TO authenticated
USING (status = 'active');

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
ON categories FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can insert categories
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can update categories
CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Public can view active products
CREATE POLICY "Public can view active products"
ON products FOR SELECT
TO anon
USING (status = 'active');

-- Authenticated users can view active products
CREATE POLICY "Authenticated users can view active products"
ON products FOR SELECT
TO authenticated
USING (status = 'active');

-- Admins can view all products
CREATE POLICY "Admins can view all products"
ON products FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can insert products
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can update products
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can delete products
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- HERO_SETTINGS POLICIES
-- ============================================

-- Public can view hero settings
CREATE POLICY "Public can view hero settings"
ON hero_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can update hero settings
CREATE POLICY "Admins can update hero settings"
ON hero_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- STORE_SETTINGS POLICIES
-- ============================================

-- Public can view store settings
CREATE POLICY "Public can view store settings"
ON store_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can update store settings
CREATE POLICY "Admins can update store settings"
ON store_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
);

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Authenticated users can insert orders
CREATE POLICY "Users can insert orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can update orders
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can delete orders
CREATE POLICY "Admins can delete orders"
ON orders FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_settings_updated_at BEFORE UPDATE ON hero_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample categories
INSERT INTO categories (name, slug, emoji, photo, status, display_order) VALUES
('Birthday Hampers', 'birthday', '🎂', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400', 'active', 1),
('Anniversary Gifts', 'anniversary', '💑', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400', 'active', 2),
('Valentine Specials', 'valentine', '💝', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400', 'active', 3),
('Gifts for Her', 'her', '💄', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400', 'active', 4),
('Gifts for Him', 'him', '🎩', 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=400', 'active', 5),
('Custom Hamper', 'custom', '✨', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400', 'active', 6);

-- Insert sample products
INSERT INTO products (name, description, category, price_sale, price_old, photos, featured, status) VALUES
('Eternal Love Ring', 'Beautiful diamond ring with elegant design. Perfect for engagements and anniversaries.', 'anniversary', 1999, 2999, '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600"]', true, 'active'),
('Rose Gold Necklace', 'Stunning rose gold necklace with heart pendant. Exquisite craftsmanship.', 'valentine', 2299, 3299, '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600"]', true, 'active'),
('Heart Earrings', 'Delicate heart-shaped earrings in rose gold. Sale finishes soon!', 'her', 899, 1299, '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"]', true, 'active'),
('Luxury Watch', 'Premium timepiece with leather strap. Perfect gift for special occasions.', 'him', 9999, 14999, '["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600"]', true, 'active'),
('Love Bracelet', 'Elegant bracelet with intricate design. Limited edition.', 'valentine', 1999, 2499, '["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600"]', true, 'active'),
('Birthday Gift Box', 'Curated gift hamper with chocolates, flowers and jewelry. Perfect for birthdays!', 'birthday', 2999, NULL, '["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600"]', true, 'active'),
('Pearl Necklace Set', 'Classic pearl necklace with matching earrings. Timeless elegance.', 'her', 3499, 4999, '["https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600"]', false, 'active'),
('Personalized Photo Frame', 'Customizable metal photo frame. Add your special moments.', 'custom', 599, NULL, '["https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600"]', false, 'active');

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- Then create an admin user manually or via the Auth panel
