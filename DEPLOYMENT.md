# GIFTESS - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Supabase project is active and accessible
- [ ] Database schema has been executed
- [ ] At least one admin user has been created
- [ ] All files are ready for upload
- [ ] Domain name is ready (if using custom domain)

---

## 🗄️ Step 1: Database Setup

### Execute SQL Schema

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Navigate to your project: `odeoapnzrwdafemljqko`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy Schema**
   - Open `supabase-schema.sql`
   - Copy ALL contents (entire file)

4. **Execute**
   - Paste into SQL Editor
   - Click "Run" or press Ctrl/Cmd + Enter
   - Wait for "Success" message

5. **Verify Tables**
   - Go to "Table Editor"
   - Confirm these tables exist:
     - categories
     - products
     - orders
     - profiles
     - store_settings
     - hero_settings

### Create Admin User

**Option A: Via Supabase Dashboard**
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"
5. Copy the user's UUID
6. Go to SQL Editor and run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'PASTE_UUID_HERE';
```

**Option B: Via Storefront**
1. Deploy the site first (follow steps below)
2. Go to your site
3. Click "Register"
4. Create an account
5. Get your user UUID from Supabase Dashboard
6. Update role to 'admin' using SQL above

---

## 🌐 Step 2: Choose Deployment Method

### Option 1: Netlify (Recommended)

**Why Netlify?**
- Free tier available
- Automatic HTTPS
- CDN included
- Easy custom domain setup
- Instant deployments

**Steps:**

1. **Prepare Files**
   - Ensure all files are in a GitHub repository OR
   - Have all files in a local folder

2. **Deploy via Netlify Dashboard**
   - Go to https://netlify.com
   - Click "Add new site" > "Deploy manually"
   - Drag and drop your entire project folder
   - Wait for deployment

3. **Or Deploy via Git**
   - Click "Add new site" > "Import from Git"
   - Connect GitHub/GitLab/Bitbucket
   - Select repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `/`
   - Click "Deploy"

4. **Get Your URL**
   - Netlify will provide: `random-name.netlify.app`
   - Test your site

5. **Add Custom Domain (Optional)**
   - Go to Site Settings > Domain Management
   - Click "Add custom domain"
   - Enter: `giftess.in`
   - Follow DNS configuration instructions
   - Wait for DNS propagation (up to 48 hours)

---

### Option 2: Vercel

**Steps:**

1. **Install Vercel CLI (Optional)**
```bash
npm install -g vercel
```

2. **Deploy**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import from Git OR drag files
   - Framework Preset: "Other"
   - Root Directory: `/`
   - Click "Deploy"

3. **Custom Domain**
   - Project Settings > Domains
   - Add `giftess.in`
   - Configure DNS

---

### Option 3: GitHub Pages

**Steps:**

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Name: `giftess`
   - Public or Private
   - Click "Create repository"

2. **Upload Files**
   - Clone repo locally
   - Copy all project files into repo
   - Commit and push:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages"
   - Source: `main` branch
   - Folder: `/ (root)`
   - Click "Save"

4. **Access Site**
   - URL: `https://yourusername.github.io/giftess`

5. **Custom Domain**
   - Add file `CNAME` to root with content: `giftess.in`
   - Configure DNS to point to GitHub Pages

---

### Option 4: Traditional Web Hosting (cPanel)

**Steps:**

1. **Access cPanel/FTP**
   - Login to your hosting control panel
   - Or use FTP client (FileZilla)

2. **Upload Files**
   - Navigate to `public_html` or `www` folder
   - Upload all files:
     ```
     /index.html
     /admin.html
     /admin-login.html
     /checkout.html
     /css/style.css
     /css/admin.css
     /js/config.js
     /js/utils.js
     /js/store.js
     /js/admin.js
     ```

3. **Set Permissions**
   - Files: 644
   - Folders: 755

4. **Configure Domain**
   - Point domain to hosting
   - Enable SSL (Let's Encrypt)

---

## 🔧 Step 3: Post-Deployment Configuration

### Test Checklist

- [ ] Homepage loads correctly
- [ ] Categories display
- [ ] Products display
- [ ] Cart functionality works
- [ ] Checkout form submits
- [ ] WhatsApp redirect works
- [ ] Admin login page loads
- [ ] Admin panel loads (after login)
- [ ] Can create categories
- [ ] Can create products
- [ ] Can view orders
- [ ] Settings can be updated

### Update Store Settings

1. Login to admin panel: `yourdomain.com/admin-login.html`
2. Use admin credentials
3. Go to Settings
4. Update:
   - WhatsApp Number: `916002698296`
   - Shipping Fee: `100` (₹100)
   - Free Shipping Min: `999` (₹999)
   - Tax: Enable if needed

### Update Hero Section

1. Still in Settings
2. Scroll to Hero Settings
3. Customize:
   - Title: "Premium Gifts for Your Loved Ones"
   - Subtitle: "Discover Unique Jewelry & Beautiful Gifts"
   - Button texts

### Add Sample Data

**Categories to Add:**
1. Birthday Hampers (slug: birthday)
2. Anniversary Gifts (slug: anniversary)
3. Valentine Specials (slug: valentine)
4. Gifts for Her (slug: her)
5. Gifts for Him (slug: him)
6. Custom Hamper (slug: custom)

**Products to Add:**
Use sample product data or create your own.

---

## 🎯 Step 4: Custom Domain Setup

### DNS Configuration for `giftess.in`

**For Netlify/Vercel:**
1. Add A record:
   - Name: `@`
   - Value: (provided by hosting)
   
2. Add CNAME record:
   - Name: `www`
   - Value: (provided by hosting)

**For Traditional Hosting:**
1. Add A record:
   - Name: `@`
   - Value: Your server IP
   
2. Add CNAME record:
   - Name: `www`
   - Value: `giftess.in`

**DNS Propagation:**
- Can take 1-48 hours
- Check status: https://www.whatsmydns.net

---

## 🔐 Step 5: Security Best Practices

### Enable HTTPS
- Netlify/Vercel: Automatic
- Traditional hosting: Use Let's Encrypt

### Supabase Security
1. Never expose service role key
2. Only use anon key in frontend
3. Rely on RLS policies

### Admin Access
1. Use strong passwords
2. Don't share admin credentials
3. Create separate admin accounts if needed

---

## 📊 Step 6: Testing Production

### Public Storefront Tests

1. **Homepage**
   - Hero section displays
   - Categories load
   - Products load
   - Images display

2. **Navigation**
   - All links work
   - Mobile menu works
   - Cart badge updates

3. **Shopping Flow**
   - Add to cart works
   - Cart modal opens
   - Quantities update
   - Remove items works

4. **Checkout**
   - Form validation works
   - Order submits to database
   - WhatsApp redirect works
   - Cart clears after order

### Admin Panel Tests

1. **Login**
   - Admin can login
   - Non-admin blocked
   - Redirects work

2. **Dashboard**
   - Stats display correctly
   - Recent orders show

3. **Categories**
   - Can add category
   - Can edit category
   - Can delete category
   - Slug normalizes correctly

4. **Products**
   - Can add product
   - Category dropdown populates
   - Can edit product
   - Can delete product
   - Featured toggle works

5. **Orders**
   - All orders display
   - Status updates work
   - Order details show
   - WhatsApp link works

6. **Settings**
   - Store settings save
   - Hero settings save
   - Changes reflect on storefront

---

## 🐛 Troubleshooting

### Issue: "Failed to load data"
**Solution:**
- Check browser console for errors
- Verify Supabase credentials in config.js
- Check RLS policies are enabled
- Ensure internet connection

### Issue: Products not showing in category
**Solution:**
- Verify product category matches category slug
- Check both are 'active' status
- Slug must be lowercase and exact match

### Issue: Admin login fails
**Solution:**
- Verify user exists in Supabase
- Check profile role is 'admin'
- Try clearing browser cache
- Check RLS policies

### Issue: WhatsApp redirect not working
**Solution:**
- Verify WhatsApp number format: `916002698296`
- Include country code without +
- Check store settings

### Issue: Images not loading
**Solution:**
- Verify image URLs are public
- Check for HTTPS (not HTTP)
- Ensure URLs are valid
- Fallback images will display if URL fails

---

## 📈 Going Live Checklist

- [ ] Database is populated with real data
- [ ] All test orders removed
- [ ] Store settings configured
- [ ] Hero section customized
- [ ] Custom domain configured
- [ ] SSL/HTTPS enabled
- [ ] All links tested
- [ ] Mobile responsiveness verified
- [ ] Admin panel secured
- [ ] Backup admin user created
- [ ] WhatsApp number verified
- [ ] Social media handles updated

---

## 📞 Support Contacts

- WhatsApp: +91 6002698296
- Instagram: @gif_tess
- Email: admin@giftess.in (setup email forwarding)

---

## 🚀 Launch!

Once all checks pass:

1. Announce on social media
2. Share website link
3. Test with real orders
4. Monitor admin panel
5. Respond to customer inquiries via WhatsApp

**Congratulations! Your Giftess store is now LIVE! 🎉**

---

## 📅 Maintenance

### Daily
- Check new orders
- Respond to customer inquiries
- Update order statuses

### Weekly
- Review inventory
- Add new products
- Update featured products

### Monthly
- Backup database
- Review analytics
- Update promotions

---

**Built with ❤️ for premium gifting experiences**
