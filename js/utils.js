/**
 * GIFTESS - Utility Functions
 * Reusable helper functions
 */

// Format price in INR
function formatPrice(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

// Calculate discount percentage
function calculateDiscountPercent(salePrice, oldPrice) {
    if (!oldPrice || oldPrice <= salePrice) return 0;
    return Math.round(((oldPrice - salePrice) / oldPrice) * 100);
}

// Normalize slug (lowercase, trim)
function normalizeSlug(slug) {
    return slug.toLowerCase().trim();
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `GFT${timestamp}${random}`.toUpperCase();
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Show loading state
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.disabled = true;
    }
}

// Hide loading state
function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Format WhatsApp message for order
function formatWhatsAppMessage(orderData) {
    let message = `*New Order from Giftess*\n\n`;
    message += `📦 *Order ID:* ${orderData.order_id}\n`;
    message += `👤 *Customer:* ${orderData.customer_name}\n`;
    message += `📧 *Email:* ${orderData.customer_email || 'N/A'}\n`;
    message += `📞 *Phone:* ${orderData.customer_phone}\n`;
    message += `📍 *Address:* ${orderData.delivery_address}\n`;
    message += `📮 *Pincode:* ${orderData.pincode}\n\n`;
    
    message += `*Items:*\n`;
    orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name} × ${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    message += `\n*Order Summary:*\n`;
    message += `Subtotal: ${formatPrice(orderData.subtotal)}\n`;
    message += `Shipping: ${formatPrice(orderData.shipping_fee)}\n`;
    if (orderData.discount > 0) {
        message += `Discount: -${formatPrice(orderData.discount)}\n`;
    }
    if (orderData.tax_amount > 0) {
        message += `Tax: ${formatPrice(orderData.tax_amount)}\n`;
    }
    message += `*Total: ${formatPrice(orderData.total)}*\n\n`;
    
    message += `Please confirm this order. Thank you! 🎁`;
    
    return encodeURIComponent(message);
}

// Validate email
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate phone (Indian format)
function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

// Validate pincode (Indian format)
function isValidPincode(pincode) {
    const cleaned = pincode.replace(/\D/g, '');
    return cleaned.length === 6;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Cart management
const Cart = {
    KEY: 'giftess_cart',
    
    get() {
        return Storage.get(this.KEY, []);
    },
    
    set(cart) {
        return Storage.set(this.KEY, cart);
    },
    
    add(product, quantity = 1) {
        const cart = this.get();
        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price_sale,
                photo: product.photos?.[0] || '',
                quantity: quantity
            });
        }
        
        this.set(cart);
        this.updateBadge();
        return cart;
    },
    
    remove(productId) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== productId);
        this.set(cart);
        this.updateBadge();
        return cart;
    },
    
    updateQuantity(productId, quantity) {
        const cart = this.get();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.set(cart);
            this.updateBadge();
        }
        return cart;
    },
    
    clear() {
        this.set([]);
        this.updateBadge();
    },
    
    getCount() {
        const cart = this.get();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    getTotal() {
        const cart = this.get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    updateBadge() {
        const count = this.getCount();
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }
};

// Image fallback handler
function handleImageError(img) {
    img.onerror = null; // Prevent infinite loop
    img.src = 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop';
    img.alt = 'Product image';
}

// Skeleton loader
function createSkeleton(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="product-card skeleton">
                <div class="skeleton-img"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
        `;
    }
    return html;
}

// Initialize toast container on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
});

// Export to window
window.formatPrice = formatPrice;
window.calculateDiscountPercent = calculateDiscountPercent;
window.normalizeSlug = normalizeSlug;
window.generateOrderId = generateOrderId;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatWhatsAppMessage = formatWhatsAppMessage;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.isValidPincode = isValidPincode;
window.debounce = debounce;
window.Storage = Storage;
window.Cart = Cart;
window.handleImageError = handleImageError;
window.createSkeleton = createSkeleton;

console.log('✅ Utils initialized');
