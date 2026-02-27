# GIFTESS - Premium Customised Gift Hampers

Complete production-ready e-commerce system built with vanilla JavaScript, HTML5, CSS3, and Supabase.

## 🎯 Features

### Public Storefront
- ✅ Dynamic hero section with customizable content
- ✅ Category-based product filtering
- ✅ Featured products showcase
- ✅ Shopping cart with localStorage persistence
- ✅ Checkout with WhatsApp integration
- ✅ User authentication (Login/Register)
- ✅ Responsive mobile-first design
- ✅ Real-time cart updates
- ✅ Promo code support
- ✅ Free shipping logic
- ✅ Tax calculation

### Admin Panel
- ✅ Secure admin-only access
- ✅ Dashboard with statistics
- ✅ Category management (CRUD)
- ✅ Product management (CRUD)
- ✅ Order management with status updates
- ✅ Store settings configuration
- ✅ Hero section customization
- ✅ WhatsApp integration for customer contact
- ✅ Real-time data sync

### Technical Features
- ✅ Row Level Security (RLS) policies
- ✅ Normalized category matching
- ✅ Error handling on all queries
- ✅ Single Supabase client instance
- ✅ Clean architecture with separation of concerns
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states
- ✅ Image fallbacks

## 🚀 Quick Setup

### 1. Database Setup

1. Go to your Supabase project: https://odeoapnzrwdafemljqko.supabase.co
2. Open SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute

This will create:
- All required tables
- RLS policies
- Sample data
- Triggers and functions

### 2. Create Admin User

After running the SQL schema:

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add User" (or sign up via the storefront)
3. Note the user's UUID
4. Run this SQL to make them admin:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_UUID_HERE';
```

### 3. Deploy Files

Upload all files to your static hosting provider:

**Required Files:**
```
/index.html              (Storefront)
/admin.html              (Admin panel)
/admin-login.html        (Admin login)
/checkout.html           (Checkout page)
/css/style.css           (Store styles)
/css/admin.css           (Admin styles)
/js/config.js            (Supabase config)
/js/utils.js             (Helper functions)
/js/store.js             (Store logic)
/js/admin.js             (Admin logic)
```

### 4. Configuration

The Supabase credentials are already configured in `/js/config.js`:

```javascript
const SUPABASE_URL = 'https://odeoapnzrwdafemljqko.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...'; // Already set
```

### 5. Custom Domain (Optional)

If using a custom domain (e.g., giftess.in):

1. Configure DNS settings with your provider
2. Update hosting settings to point to custom domain
3. Enable SSL/HTTPS

## 📁 File Structure

```
/
├── index.html              # Main storefront
├── admin.html              # Admin panel
├── admin-login.html        # Admin authentication
├── checkout.html           # Checkout page
├── supabase-schema.sql     # Database schema
├── README.md               # This file
├── css/
│   ├── style.css           # Storefront styles
│   └── admin.css           # Admin panel styles
└── js/
    ├── config.js           # Supabase initialization
    ├── utils.js            # Helper functions
    ├── store.js            # Storefront logic
    └── admin.js            # Admin panel logic
```

## 🗄️ Database Schema

### Tables

**categories**
- id (uuid, primary key)
- name (text)
- slug (text, unique, lowercase)
- emoji (text, optional)
- photo (text, URL)
- status (active/inactive)
- display_order (int)

**products**
- id (uuid, primary key)
- name (text)
- description (text)
- category (text, matches categories.slug)
- price_sale (int)
- price_old (int, optional)
- photos (json array)
- featured (boolean)
- status (active/inactive)

**orders**
- id (uuid, primary key)
- order_id (text, unique)
- user_id (uuid, optional)
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- delivery_address (text)
- pincode (text)
- items (json)
- subtotal, shipping_fee, discount, tax_amount, total (int)
- status (pending/processing/shipped/delivered/cancelled)
- tracking_link (text, optional)
- created_at (timestamp)

**profiles**
- id (uuid, references auth.users)
- first_name, last_name, phone (text)
- role (admin/user)

**store_settings** (singleton, id=1)
- wa_number (text)
- shipping_fee (int)
- free_shipping_min (int)
- tax_enabled (boolean)
- tax_percent (int)
- promo_codes (json)

**hero_settings** (singleton, id=1)
- title, subtitle, btn1, btn2 (text)

## 🔐 Security (RLS Policies)

### Public Access (anon)
- SELECT active products
- SELECT active categories
- SELECT hero_settings
- SELECT store_settings

### Authenticated Users
- INSERT orders
- SELECT own orders
- INSERT/UPDATE own profile

### Admin Only
- Full CRUD on all tables
- View all orders
- Update store/hero settings

## 📱 Pages

### Storefront (`/index.html`)
- Hero section
- Categories grid
- Products grid with filtering
- Shopping cart modal
- Login/Register modal
- Responsive navigation

### Checkout (`/checkout.html`)
- Delivery information form
- Order summary
- Promo code application
- WhatsApp order confirmation
- Database order recording

### Admin Login (`/admin-login.html`)
- Secure authentication
- Admin role verification
- Auto-redirect if already logged in

### Admin Panel (`/admin.html`)
- Dashboard with statistics
- Category management
- Product management
- Order management
- Settings management

## 🎨 Design System

### Colors
- Primary: `#a8516e` (Pink)
- Secondary: `#2c2c2c` (Dark Gray)
- Success: `#4caf50`
- Error: `#f44336`
- Warning: `#ff9800`

### Typography
- Font: System fonts (-apple-system, Segoe UI, Roboto)
- Logo: Georgia (serif)

### Spacing
- Radius: 12px (cards), 8px (inputs)
- Padding: 1rem base unit
- Gap: 1.5rem for grids

## 📊 Admin Dashboard

Statistics shown:
- Total orders
- Total revenue
- Pending orders
- Total products

Recent orders displayed with:
- Order ID
- Customer name
- Status
- Total amount

## 🛒 Shopping Cart

Features:
- Add/remove items
- Update quantities
- Persistent in localStorage
- Real-time badge updates
- Subtotal calculation
- Shipping calculation
- Tax calculation
- Free shipping threshold

## 💳 Checkout Process

1. Customer fills delivery form
2. Optional promo code application
3. Order saved to Supabase
4. WhatsApp message formatted
5. Redirect to WhatsApp for confirmation
6. Cart cleared
7. Success notification

## 📞 WhatsApp Integration

Order message format:
```
*New Order from Giftess*

📦 *Order ID:* GFT123ABC
👤 *Customer:* John Doe
📧 *Email:* john@example.com
📞 *Phone:* 9876543210
📍 *Address:* 123 Main St, City
📮 *Pincode:* 123456

*Items:*
1. Product Name × 2 - ₹1,000

*Order Summary:*
Subtotal: ₹1,000
Shipping: ₹100
Total: ₹1,100

Please confirm this order. Thank you! 🎁
```

## 🔧 Customization

### Update Store Settings
1. Login to admin panel
2. Go to Settings
3. Update:
   - WhatsApp number
   - Shipping fee
   - Free shipping minimum
   - Tax settings

### Update Hero Section
1. Go to Settings > Hero Section
2. Modify:
   - Title
   - Subtitle
   - Button texts

### Add Categories
1. Go to Categories
2. Click "Add Category"
3. Fill:
   - Name
   - Slug (lowercase, no spaces)
   - Emoji (optional)
   - Photo URL
   - Display order
   - Status

### Add Products
1. Go to Products
2. Click "Add Product"
3. Fill:
   - Name
   - Description
   - Category (select from dropdown)
   - Sale price
   - Old price (optional, for discount badge)
   - Photo URLs (one per line)
   - Featured checkbox
   - Status

## 🚨 Troubleshooting

### Categories not showing products
- Ensure product category matches category slug EXACTLY (case-insensitive)
- Check that both product and category status are 'active'

### Admin access denied
- Verify user role is set to 'admin' in profiles table
- Check RLS policies are enabled
- Ensure user is authenticated

### Images not loading
- Verify image URLs are accessible
- Check for CORS issues
- Fallback image will show if URL fails

### Orders not saving
- Check Supabase connection
- Verify RLS policies allow authenticated users to insert orders
- Check browser console for errors

## 📈 Performance

- Minimal dependencies (only Supabase JS)
- Vanilla JavaScript (no framework overhead)
- Optimized CSS with CSS Grid and Flexbox
- Lazy loading considerations
- LocalStorage for cart persistence
- Debounced search functionality

## 🔒 Best Practices

✅ All queries handle errors
✅ Category slugs are normalized (lowercase)
✅ Single Supabase client instance
✅ No global variable leaks
✅ No silent failures
✅ Loading states on all async actions
✅ Toast notifications for user feedback
✅ Responsive design (mobile-first)
✅ Secure authentication
✅ RLS policies enforced

## 🌐 Deployment Options

### Netlify
1. Connect GitHub repo
2. Build command: (none)
3. Publish directory: /
4. Deploy

### Vercel
1. Import project
2. Framework preset: Other
3. Root directory: /
4. Deploy

### GitHub Pages
1. Push to GitHub
2. Settings > Pages
3. Source: main branch
4. Save

### Custom Server
Upload all files to web root directory.

## 📞 Support

For issues or questions:
- WhatsApp: +91 6002698296
- Instagram: @gif_tess

## 📄 License

Copyright © 2026 Giftess. All rights reserved.

---

**Built with ❤️ for premium gifting experiences**
