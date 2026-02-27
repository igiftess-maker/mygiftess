/**
 * GIFTESS - Admin Panel JavaScript
 * Complete admin functionality
 */

// State
const adminState = {
    currentUser: null,
    categories: [],
    products: [],
    orders: [],
    storeSettings: null,
    heroSettings: null,
    editingCategory: null,
    editingProduct: null,
    currentView: 'dashboard'
};

// Initialize admin panel
async function initAdmin() {
    console.log('Initializing admin panel...');
    
    // Check admin authentication
    const authenticated = await checkAdminAuth();
    if (!authenticated) {
        window.location.href = '/admin-login.html';
        return;
    }
    
    // Load initial data
    await loadDashboardData();
    
    // Show dashboard by default
    showView('dashboard');
    
    // Setup event listeners
    setupAdminEventListeners();
    
    console.log('✅ Admin panel initialized');
}

// Check admin authentication
async function checkAdminAuth() {
    try {
        const user = await getCurrentUser();
        if (!user) return false;
        
        const admin = await isAdmin();
        if (!admin) {
            showToast('Access denied. Admin privileges required.', 'error');
            return false;
        }
        
        adminState.currentUser = user;
        updateAdminUI();
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Update admin UI
function updateAdminUI() {
    const userEmail = document.getElementById('admin-user-email');
    if (userEmail && adminState.currentUser) {
        userEmail.textContent = adminState.currentUser.email;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadCategories(),
            loadProducts(),
            loadOrders(),
            loadStoreSettings(),
            loadHeroSettings()
        ]);
        
        renderDashboard();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading data', 'error');
    }
}

// Load categories
async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        adminState.categories = data || [];
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

// Load products
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminState.products = data || [];
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

// Load orders
async function loadOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminState.orders = data || [];
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
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
        adminState.storeSettings = data;
    } catch (error) {
        console.error('Error loading store settings:', error);
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
        adminState.heroSettings = data;
    } catch (error) {
        console.error('Error loading hero settings:', error);
    }
}

// Show view
window.showView = function(viewName) {
    adminState.currentView = viewName;
    
    // Hide all views
    document.querySelectorAll('.admin-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const view = document.getElementById(`view-${viewName}`);
    if (view) {
        view.classList.add('active');
    }
    
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Render view content
    switch(viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'categories':
            renderCategories();
            break;
        case 'products':
            renderProducts();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'settings':
            renderSettings();
            break;
    }
};

// Render dashboard
function renderDashboard() {
    const totalOrders = adminState.orders.length;
    const totalRevenue = adminState.orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = adminState.orders.filter(o => o.status === 'pending').length;
    const totalProducts = adminState.products.length;
    
    const stats = [
        { label: 'Total Orders', value: totalOrders, icon: '📦' },
        { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: '💰' },
        { label: 'Pending Orders', value: pendingOrders, icon: '⏳' },
        { label: 'Total Products', value: totalProducts, icon: '🎁' }
    ];
    
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer) {
        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-info">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Render recent orders
    const recentOrders = adminState.orders.slice(0, 5);
    const ordersContainer = document.getElementById('dashboard-recent-orders');
    if (ordersContainer) {
        ordersContainer.innerHTML = recentOrders.map(order => `
            <div class="order-item">
                <div>
                    <strong>${order.order_id}</strong>
                    <p>${order.customer_name}</p>
                </div>
                <div>
                    <span class="badge badge-${order.status}">${order.status}</span>
                    <strong>${formatPrice(order.total)}</strong>
                </div>
            </div>
        `).join('');
    }
}

// Render categories
function renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;
    
    if (adminState.categories.length === 0) {
        container.innerHTML = '<p class="empty-state">No categories yet. Add your first category!</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${adminState.categories.map(cat => `
                    <tr>
                        <td>
                            <img src="${cat.photo || 'https://via.placeholder.com/50'}" 
                                 alt="${cat.name}" class="table-img"
                                 onerror="handleImageError(this)">
                        </td>
                        <td>
                            ${cat.emoji ? cat.emoji + ' ' : ''}${cat.name}
                        </td>
                        <td><code>${cat.slug}</code></td>
                        <td>${cat.display_order}</td>
                        <td>
                            <span class="badge badge-${cat.status}">${cat.status}</span>
                        </td>
                        <td>
                            <button class="btn-icon" onclick="editCategory('${cat.id}')" title="Edit">✏️</button>
                            <button class="btn-icon" onclick="deleteCategory('${cat.id}')" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Show category modal
window.showCategoryModal = function() {
    adminState.editingCategory = null;
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    
    if (form) form.reset();
    
    const modalTitle = document.getElementById('category-modal-title');
    if (modalTitle) modalTitle.textContent = 'Add Category';
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Edit category
window.editCategory = function(categoryId) {
    const category = adminState.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    adminState.editingCategory = category;
    
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    
    if (form) {
        form.querySelector('#category-name').value = category.name;
        form.querySelector('#category-slug').value = category.slug;
        form.querySelector('#category-emoji').value = category.emoji || '';
        form.querySelector('#category-photo').value = category.photo || '';
        form.querySelector('#category-order').value = category.display_order;
        form.querySelector('#category-status').value = category.status;
    }
    
    const modalTitle = document.getElementById('category-modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Category';
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Save category
window.saveCategoryForm = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    const categoryData = {
        name: form.querySelector('#category-name').value,
        slug: normalizeSlug(form.querySelector('#category-slug').value),
        emoji: form.querySelector('#category-emoji').value || null,
        photo: form.querySelector('#category-photo').value || null,
        display_order: parseInt(form.querySelector('#category-order').value) || 0,
        status: form.querySelector('#category-status').value
    };
    
    showLoading(btn);
    
    try {
        let result;
        
        if (adminState.editingCategory) {
            // Update
            result = await supabase
                .from('categories')
                .update(categoryData)
                .eq('id', adminState.editingCategory.id);
        } else {
            // Insert
            result = await supabase
                .from('categories')
                .insert([categoryData]);
        }
        
        if (result.error) throw result.error;
        
        showToast('Category saved successfully!', 'success');
        hideModal('category-modal');
        await loadCategories();
        renderCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        showToast(error.message || 'Failed to save category', 'error');
    } finally {
        hideLoading(btn);
    }
};

// Delete category
window.deleteCategory = async function(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) throw error;
        
        showToast('Category deleted successfully', 'success');
        await loadCategories();
        renderCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Failed to delete category', 'error');
    }
};

// Render products
function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;
    
    if (adminState.products.length === 0) {
        container.innerHTML = '<p class="empty-state">No products yet. Add your first product!</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${adminState.products.map(product => `
                    <tr>
                        <td>
                            <img src="${product.photos?.[0] || 'https://via.placeholder.com/50'}" 
                                 alt="${product.name}" class="table-img"
                                 onerror="handleImageError(this)">
                        </td>
                        <td>${product.name}</td>
                        <td><code>${product.category}</code></td>
                        <td>${formatPrice(product.price_sale)}</td>
                        <td>${product.featured ? '⭐' : '-'}</td>
                        <td>
                            <span class="badge badge-${product.status}">${product.status}</span>
                        </td>
                        <td>
                            <button class="btn-icon" onclick="editProduct('${product.id}')" title="Edit">✏️</button>
                            <button class="btn-icon" onclick="deleteProduct('${product.id}')" title="Delete">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Show product modal
window.showProductModal = function() {
    adminState.editingProduct = null;
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    
    if (form) form.reset();
    
    const modalTitle = document.getElementById('product-modal-title');
    if (modalTitle) modalTitle.textContent = 'Add Product';
    
    // Populate category select
    const categorySelect = form?.querySelector('#product-category');
    if (categorySelect) {
        categorySelect.innerHTML = adminState.categories.map(cat => 
            `<option value="${cat.slug}">${cat.name}</option>`
        ).join('');
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Edit product
window.editProduct = function(productId) {
    const product = adminState.products.find(p => p.id === productId);
    if (!product) return;
    
    adminState.editingProduct = product;
    
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    
    if (form) {
        form.querySelector('#product-name').value = product.name;
        form.querySelector('#product-description').value = product.description || '';
        form.querySelector('#product-category').value = product.category;
        form.querySelector('#product-price-sale').value = product.price_sale;
        form.querySelector('#product-price-old').value = product.price_old || '';
        form.querySelector('#product-photos').value = product.photos?.join('\n') || '';
        form.querySelector('#product-featured').checked = product.featured;
        form.querySelector('#product-status').value = product.status;
    }
    
    const modalTitle = document.getElementById('product-modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Product';
    
    // Populate category select
    const categorySelect = form?.querySelector('#product-category');
    if (categorySelect) {
        categorySelect.innerHTML = adminState.categories.map(cat => 
            `<option value="${cat.slug}" ${cat.slug === product.category ? 'selected' : ''}>${cat.name}</option>`
        ).join('');
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Save product
window.saveProductForm = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    const photosText = form.querySelector('#product-photos').value;
    const photos = photosText.split('\n').filter(url => url.trim()).map(url => url.trim());
    
    const productData = {
        name: form.querySelector('#product-name').value,
        description: form.querySelector('#product-description').value || null,
        category: normalizeSlug(form.querySelector('#product-category').value),
        price_sale: parseInt(form.querySelector('#product-price-sale').value),
        price_old: parseInt(form.querySelector('#product-price-old').value) || null,
        photos: photos,
        featured: form.querySelector('#product-featured').checked,
        status: form.querySelector('#product-status').value
    };
    
    showLoading(btn);
    
    try {
        let result;
        
        if (adminState.editingProduct) {
            // Update
            result = await supabase
                .from('products')
                .update(productData)
                .eq('id', adminState.editingProduct.id);
        } else {
            // Insert
            result = await supabase
                .from('products')
                .insert([productData]);
        }
        
        if (result.error) throw result.error;
        
        showToast('Product saved successfully!', 'success');
        hideModal('product-modal');
        await loadProducts();
        renderProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message || 'Failed to save product', 'error');
    } finally {
        hideLoading(btn);
    }
};

// Delete product
window.deleteProduct = async function(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        
        showToast('Product deleted successfully', 'success');
        await loadProducts();
        renderProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
    }
};

// Render orders
function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (adminState.orders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders yet.</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${adminState.orders.map(order => `
                    <tr>
                        <td><strong>${order.order_id}</strong></td>
                        <td>
                            <div>${order.customer_name}</div>
                            <small>${order.customer_phone}</small>
                        </td>
                        <td>${order.items?.length || 0} items</td>
                        <td>${formatPrice(order.total)}</td>
                        <td>
                            <select onchange="updateOrderStatus('${order.id}', this.value)" 
                                    class="status-select status-${order.status}">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-icon" onclick="viewOrder('${order.id}')" title="View">👁️</button>
                            <button class="btn-icon" onclick="contactCustomer('${order.customer_phone}')" title="WhatsApp">💬</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Update order status
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        
        if (error) throw error;
        
        showToast('Order status updated', 'success');
        await loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Failed to update status', 'error');
    }
};

// View order details
window.viewOrder = function(orderId) {
    const order = adminState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('order-details-modal');
    const container = document.getElementById('order-details-content');
    
    if (container) {
        container.innerHTML = `
            <div class="order-details">
                <h3>Order ${order.order_id}</h3>
                
                <div class="detail-section">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.customer_name}</p>
                    <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${order.customer_phone}</p>
                    <p><strong>Address:</strong> ${order.delivery_address}</p>
                    <p><strong>Pincode:</strong> ${order.pincode}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Order Items</h4>
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <span>${item.name} × ${item.quantity}</span>
                            <span>${formatPrice(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="detail-section">
                    <h4>Order Summary</h4>
                    <p>Subtotal: ${formatPrice(order.subtotal)}</p>
                    <p>Shipping: ${formatPrice(order.shipping_fee)}</p>
                    ${order.discount > 0 ? `<p>Discount: -${formatPrice(order.discount)}</p>` : ''}
                    ${order.tax_amount > 0 ? `<p>Tax: ${formatPrice(order.tax_amount)}</p>` : ''}
                    <p><strong>Total: ${formatPrice(order.total)}</strong></p>
                </div>
                
                <div class="detail-section">
                    <h4>Status</h4>
                    <p><span class="badge badge-${order.status}">${order.status}</span></p>
                    <p><small>Ordered on ${new Date(order.created_at).toLocaleString()}</small></p>
                </div>
            </div>
        `;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Contact customer via WhatsApp
window.contactCustomer = function(phone) {
    const message = 'Hello! This is Giftess team regarding your order.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// Render settings
function renderSettings() {
    const storeForm = document.getElementById('store-settings-form');
    const heroForm = document.getElementById('hero-settings-form');
    
    if (storeForm && adminState.storeSettings) {
        storeForm.querySelector('#store-wa-number').value = adminState.storeSettings.wa_number;
        storeForm.querySelector('#store-shipping-fee').value = adminState.storeSettings.shipping_fee;
        storeForm.querySelector('#store-free-shipping').value = adminState.storeSettings.free_shipping_min;
        storeForm.querySelector('#store-tax-enabled').checked = adminState.storeSettings.tax_enabled;
        storeForm.querySelector('#store-tax-percent').value = adminState.storeSettings.tax_percent;
    }
    
    if (heroForm && adminState.heroSettings) {
        heroForm.querySelector('#hero-title').value = adminState.heroSettings.title;
        heroForm.querySelector('#hero-subtitle').value = adminState.heroSettings.subtitle;
        heroForm.querySelector('#hero-btn1').value = adminState.heroSettings.btn1;
        heroForm.querySelector('#hero-btn2').value = adminState.heroSettings.btn2;
    }
}

// Save store settings
window.saveStoreSettings = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    const settings = {
        wa_number: form.querySelector('#store-wa-number').value,
        shipping_fee: parseInt(form.querySelector('#store-shipping-fee').value),
        free_shipping_min: parseInt(form.querySelector('#store-free-shipping').value),
        tax_enabled: form.querySelector('#store-tax-enabled').checked,
        tax_percent: parseInt(form.querySelector('#store-tax-percent').value)
    };
    
    showLoading(btn);
    
    try {
        const { error } = await supabase
            .from('store_settings')
            .update(settings)
            .eq('id', 1);
        
        if (error) throw error;
        
        showToast('Store settings saved!', 'success');
        await loadStoreSettings();
    } catch (error) {
        console.error('Error saving store settings:', error);
        showToast('Failed to save settings', 'error');
    } finally {
        hideLoading(btn);
    }
};

// Save hero settings
window.saveHeroSettings = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    const settings = {
        title: form.querySelector('#hero-title').value,
        subtitle: form.querySelector('#hero-subtitle').value,
        btn1: form.querySelector('#hero-btn1').value,
        btn2: form.querySelector('#hero-btn2').value
    };
    
    showLoading(btn);
    
    try {
        const { error } = await supabase
            .from('hero_settings')
            .update(settings)
            .eq('id', 1);
        
        if (error) throw error;
        
        showToast('Hero settings saved!', 'success');
        await loadHeroSettings();
    } catch (error) {
        console.error('Error saving hero settings:', error);
        showToast('Failed to save settings', 'error');
    } finally {
        hideLoading(btn);
    }
};

// Hide modal
window.hideModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Setup event listeners
function setupAdminEventListeners() {
    // Close modals on outside click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Logout
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut();
            window.location.href = '/admin-login.html';
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

console.log('✅ Admin script loaded');
