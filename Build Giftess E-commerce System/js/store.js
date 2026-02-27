/**
 * GIFTESS - Storefront JavaScript
 * Main logic for public store
 */

// State
const state = {
    categories: [],
    products: [],
    filteredProducts: [],
    selectedCategory: 'all',
    heroSettings: null,
    storeSettings: null,
    currentUser: null
};

// Initialize app
async function initStore() {
    console.log('Initializing store...');
    
    // Check authentication
    await checkAuth();
    
    // Load data
    await Promise.all([
        loadHeroSettings(),
        loadCategories(),
        loadProducts(),
        loadStoreSettings()
    ]);
    
    // Render UI
    renderHero();
    renderCategories();
    renderProducts();
    
    // Update cart badge
    Cart.updateBadge();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Store initialized');
}

// Check authentication
async function checkAuth() {
    state.currentUser = await getCurrentUser();
    updateAuthUI();
}

// Update auth UI
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (!authButtons || !userMenu) return;
    
    if (state.currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = state.currentUser.email?.split('@')[0] || 'User';
        }
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

// Load hero settings
async function loadHeroSettings() {
    try {
        const { data, error } = await supabase
            .from('hero_settings')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (error) throw error;
        state.heroSettings = data;
    } catch (error) {
        console.error('Error loading hero settings:', error);
        // Use defaults
        state.heroSettings = {
            title: 'Premium Gifts for Your Loved Ones',
            subtitle: 'Discover Unique Jewelry & Beautiful Gifts',
            btn1: 'Shop Now',
            btn2: 'Explore'
        };
    }
}

// Load categories
async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('status', 'active')
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        state.categories = data || [];
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
        state.categories = [];
    }
}

// Load products
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        state.products = data || [];
        state.filteredProducts = data || [];
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
        state.products = [];
        state.filteredProducts = [];
    }
}

// Load store settings
async function loadStoreSettings() {
    try {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (error) throw error;
        state.storeSettings = data;
    } catch (error) {
        console.error('Error loading store settings:', error);
        state.storeSettings = {
            wa_number: '916002698296',
            shipping_fee: 100,
            free_shipping_min: 999,
            tax_enabled: false,
            tax_percent: 0
        };
    }
}

// Render hero section
function renderHero() {
    const hero = document.getElementById('hero');
    if (!hero || !state.heroSettings) return;
    
    const titleEl = hero.querySelector('.hero-title');
    const subtitleEl = hero.querySelector('.hero-subtitle');
    const btn1El = hero.querySelector('.hero-btn-primary');
    const btn2El = hero.querySelector('.hero-btn-secondary');
    
    if (titleEl) titleEl.textContent = state.heroSettings.title;
    if (subtitleEl) subtitleEl.textContent = state.heroSettings.subtitle;
    if (btn1El) btn1El.textContent = state.heroSettings.btn1;
    if (btn2El) btn2El.textContent = state.heroSettings.btn2;
}

// Render categories
function renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    
    if (state.categories.length === 0) {
        container.innerHTML = '<p class="empty-state">No categories available</p>';
        return;
    }
    
    container.innerHTML = state.categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.slug}')">
            <div class="category-image">
                <img src="${cat.photo || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400'}" 
                     alt="${cat.name}"
                     onerror="handleImageError(this)">
                ${cat.emoji ? `<span class="category-emoji">${cat.emoji}</span>` : ''}
            </div>
            <h3 class="category-name">${cat.name}</h3>
        </div>
    `).join('');
}

// Render products
function renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (state.filteredProducts.length === 0) {
        container.innerHTML = '<p class="empty-state">No products found</p>';
        return;
    }
    
    container.innerHTML = state.filteredProducts.map(product => {
        const discount = calculateDiscountPercent(product.price_sale, product.price_old);
        const photo = product.photos?.[0] || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600';
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${discount > 0 ? `<span class="product-badge sale">-${discount}%</span>` : ''}
                ${product.featured ? '<span class="product-badge featured">Featured</span>' : ''}
                
                <div class="product-image">
                    <img src="${photo}" alt="${product.name}" onerror="handleImageError(this)">
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.price_sale)}</span>
                        ${product.price_old ? `<span class="price-old">${formatPrice(product.price_old)}</span>` : ''}
                    </div>
                    
                    <button class="btn btn-primary btn-add-cart" onclick="addToCart('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter products by category
window.filterByCategory = function(slug) {
    state.selectedCategory = normalizeSlug(slug);
    
    if (state.selectedCategory === 'all') {
        state.filteredProducts = state.products;
    } else {
        state.filteredProducts = state.products.filter(p => 
            normalizeSlug(p.category) === state.selectedCategory
        );
    }
    
    renderProducts();
    
    // Update active category
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === state.selectedCategory);
    });
    
    // Scroll to products
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
};

// Add to cart
window.addToCart = function(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    Cart.add(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
};

// Show cart modal
window.showCart = function() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    
    renderCartItems();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Hide cart modal
window.hideCart = function() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

// Render cart items
function renderCartItems() {
    const container = document.getElementById('cart-items');
    const emptyState = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    
    if (!container) return;
    
    const cart = Cart.get();
    
    if (cart.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.photo || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=100'}" 
                 alt="${item.name}"
                 onerror="handleImageError(this)">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="btn-remove" onclick="removeFromCart('${item.id}')">×</button>
        </div>
    `).join('');
    
    updateCartSummary();
}

// Update cart quantity
window.updateCartQuantity = function(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    Cart.updateQuantity(productId, newQuantity);
    renderCartItems();
};

// Remove from cart
window.removeFromCart = function(productId) {
    Cart.remove(productId);
    renderCartItems();
    showToast('Item removed from cart', 'info');
};

// Update cart summary
function updateCartSummary() {
    const subtotal = Cart.getTotal();
    const shipping = subtotal >= state.storeSettings.free_shipping_min ? 0 : state.storeSettings.shipping_fee;
    const tax = state.storeSettings.tax_enabled ? Math.round(subtotal * state.storeSettings.tax_percent / 100) : 0;
    const total = subtotal + shipping + tax;
    
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('cart-shipping');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// Proceed to checkout
window.proceedToCheckout = function() {
    hideCart();
    window.location.href = '/checkout.html';
};

// Show login modal
window.showLogin = function() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Hide login modal
window.hideLogin = function() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Handle login
window.handleLogin = async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    showLoading(btn);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        state.currentUser = data.user;
        updateAuthUI();
        hideLogin();
        showToast('Welcome back!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed', 'error');
    } finally {
        hideLoading(btn);
    }
};

// Handle register
window.handleRegister = async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    const confirmPassword = document.getElementById('register-confirm-password')?.value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    if (!email || !password || !confirmPassword) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    showLoading(btn);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        showToast('Account created! Please check your email to verify.', 'success');
        hideLogin();
    } catch (error) {
        console.error('Register error:', error);
        showToast(error.message || 'Registration failed', 'error');
    } finally {
        hideLoading(btn);
    }
};

// Handle logout
window.handleLogout = async function() {
    const success = await signOut();
    if (success) {
        state.currentUser = null;
        updateAuthUI();
        showToast('Logged out successfully', 'success');
    }
};

// Setup event listeners
function setupEventListeners() {
    // Close modals on outside click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query === '') {
                state.filteredProducts = state.products;
            } else {
                state.filteredProducts = state.products.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query)
                );
            }
            
            renderProducts();
        }, 300));
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStore);
} else {
    initStore();
}

console.log('✅ Store script loaded');
