// Main JavaScript for Delyks Accounts - Mobile Optimized

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');

    // Initialize particles
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', particlesConfig);
        console.log('Particles initialized');
    }

    // Mobile menu elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const purchaseModal = document.getElementById('purchaseModal');
    const adminAccessModal = document.getElementById('adminAccessModal');
    const profileModal = document.getElementById('profileModal');
    const closeButtons = document.querySelectorAll('.close');

    // Button elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const heroBuyBtn = document.getElementById('heroBuyBtn');
    const heroBuyBtnMobile = document.getElementById('heroBuyBtnMobile');
    const buyButtons = document.querySelectorAll('.btn-buy-product');
    const adminAccessBtn = document.getElementById('admin-access');
    const channelLink = document.getElementById('channelLink');
    const copyReferralBtn = document.getElementById('copyReferralBtn');
    const copyProfileReferralBtn = document.getElementById('copyProfileReferralBtn');
    const applyPromoBtn = document.getElementById('applyPromoBtn');

    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const paymentForm = document.getElementById('paymentForm');
    const adminAccessForm = document.getElementById('adminAccessForm');
    const adminPasswordInput = document.getElementById('adminPasswordInput');

    // User management
    let currentUser = null;
    let users = [];
    let orders = [];
    let promoCodes = [];
    let referralSettings = { percent: 20 };
    
    // Admin password
    const ADMIN_PASSWORD = "2561Art";
    
    // Current purchase info
    let currentPurchase = {
        product: '',
        price: 0,
        originalPrice: 0,
        appliedPromo: null
    };

    // Mobile menu functionality
    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // File validation function
    function validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!file) {
            return 'Пожалуйста, выберите файл';
        }
        
        if (!allowedTypes.includes(file.type)) {
            return 'Разрешены только файлы JPEG, PNG, GIF и WebP';
        }
        
        if (file.size > maxSize) {
            return 'Размер файла не должен превышать 5MB';
        }
        
        return null;
    }

    // Initialize data from localStorage
    function initializeData() {
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
            users = JSON.parse(localStorage.getItem('users')) || [];
            orders = JSON.parse(localStorage.getItem('orders')) || [];
            promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];
            referralSettings = JSON.parse(localStorage.getItem('referralSettings')) || { percent: 20 };
            console.log('Data initialized from localStorage');
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            // Reset to defaults if there's an error
            users = [];
            orders = [];
            promoCodes = [];
            referralSettings = { percent: 20 };
        }
    }

    // Load settings
    function loadSettings() {
        // Load channel link
        const savedChannelLink = localStorage.getItem('channelLink');
        if (savedChannelLink && channelLink) {
            channelLink.href = savedChannelLink;
        } else if (channelLink) {
            channelLink.style.display = 'none';
        }

        // Load prices
        const prices = JSON.parse(localStorage.getItem('productPrices')) || {
            standard: 50,
            pro: 65,
            enterprise: 55
        };

        // Update prices on the page
        updatePrices(prices);
    }

    function updatePrices(prices) {
        // Update product cards
        const standardBtn = document.querySelector('[data-product="standard"]');
        const proBtn = document.querySelector('[data-product="pro"]');
        const enterpriseBtn = document.querySelector('[data-product="enterprise"]');
        
        if (standardBtn) {
            standardBtn.setAttribute('data-price', prices.standard);
            const standardCard = standardBtn.closest('.product-card');
            if (standardCard) {
                const priceTag = standardCard.querySelector('.price-tag');
                if (priceTag) priceTag.textContent = prices.standard + '₽';
            }
        }
        
        if (proBtn) {
            proBtn.setAttribute('data-price', prices.pro);
            const proCard = proBtn.closest('.product-card');
            if (proCard) {
                const priceTag = proCard.querySelector('.price-tag');
                if (priceTag) priceTag.textContent = prices.pro + '₽';
            }
        }
        
        if (enterpriseBtn) {
            enterpriseBtn.setAttribute('data-price', prices.enterprise);
            const enterpriseCard = enterpriseBtn.closest('.product-card');
            if (enterpriseCard) {
                const priceTag = enterpriseCard.querySelector('.price-tag');
                if (priceTag) priceTag.textContent = prices.enterprise + '₽';
            }
        }

        // Update hero section
        const heroPrice = document.querySelector('.floating-card .price');
        if (heroPrice) heroPrice.textContent = prices.pro + '₽';
    }

    function checkUrlReferral() {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        const referralInput = document.getElementById('referralCodeInput');
        if (refCode && referralInput) {
            referralInput.value = refCode;
        }
    }

    function openModal(modal) {
        if (!modal) return;
        closeAllModals();
        closeMobileMenu();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // If opening profile modal, update stats
        if (modal.id === 'profileModal' && currentUser) {
            updateProfileStats();
        }
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal) modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    function openPurchaseModal(productType, price) {
        if (!currentUser) {
            openModal(registerModal);
            return;
        }

        if (!purchaseModal) return;

        currentPurchase.product = productType;
        currentPurchase.price = price;
        currentPurchase.originalPrice = price;
        currentPurchase.appliedPromo = null;

        // Update modal content
        const productNames = {
            'standard': 'Delyks Standard',
            'pro': 'Delyks Pro',
            'enterprise': 'Delyks Enterprise'
        };

        const purchaseTitle = document.getElementById('purchaseTitle');
        const selectedProductName = document.getElementById('selectedProductName');
        const originalPrice = document.getElementById('originalPrice');
        const selectedProductPrice = document.getElementById('selectedProductPrice');
        const paymentAmount = document.getElementById('paymentAmount');

        if (purchaseTitle) purchaseTitle.textContent = `ОФОРМЛЕНИЕ: ${productNames[productType]}`;
        if (selectedProductName) selectedProductName.textContent = productNames[productType];
        if (originalPrice) originalPrice.textContent = price + '₽';
        if (selectedProductPrice) selectedProductPrice.textContent = price + '₽';
        if (paymentAmount) paymentAmount.textContent = price + '₽';

        // Reset promo code
        const promoCodeInput = document.getElementById('promoCodeInput');
        const promoMessage = document.getElementById('promoMessage');
        if (promoCodeInput) promoCodeInput.value = '';
        if (promoMessage) {
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }

        purchaseModal.style.display = 'block';
    }

    function applyPromoCode() {
        const promoCodeInput = document.getElementById('promoCodeInput');
        const promoMessage = document.getElementById('promoMessage');

        if (!promoCodeInput || !promoMessage) return;

        const promoCode = promoCodeInput.value.trim().toUpperCase();

        if (!promoCode) {
            promoMessage.textContent = 'Введите промокод';
            promoMessage.className = 'promo-message promo-error';
            return;
        }

        const promo = promoCodes.find(p => p.code === promoCode && p.active);
        
        if (!promo) {
            promoMessage.textContent = 'Промокод не найден или неактивен';
            promoMessage.className = 'promo-message promo-error';
            return;
        }

        if (promo.used >= promo.maxUses) {
            promoMessage.textContent = 'Промокод уже использован максимальное количество раз';
            promoMessage.className = 'promo-message promo-error';
            return;
        }

        // Apply discount
        const discount = promo.discount;
        const discountedPrice = Math.max(1, Math.floor(currentPurchase.originalPrice * (1 - discount / 100)));

        currentPurchase.price = discountedPrice;
        currentPurchase.appliedPromo = promo;

        // Update display
        const selectedProductPrice = document.getElementById('selectedProductPrice');
        const paymentAmount = document.getElementById('paymentAmount');
        if (selectedProductPrice) selectedProductPrice.textContent = discountedPrice + '₽';
        if (paymentAmount) paymentAmount.textContent = discountedPrice + '₽';
        
        promoMessage.textContent = `Промокод применен! Скидка ${discount}%`;
        promoMessage.className = 'promo-message promo-success';

        // Update promo code usage
        promo.used += 1;
        if (promo.used >= promo.maxUses) {
            promo.active = false;
        }
        localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
    }

    function handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            closeAllModals();
            showNotification('Успешный вход!', 'success');
        } else {
            showNotification('Неверный email или пароль', 'error');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const referralCodeInput = document.getElementById('referralCodeInput');
        const referralCode = referralCodeInput ? referralCodeInput.value.trim() : '';

        if (users.find(u => u.email === email)) {
            showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }

        // Generate referral code for new user
        const userReferralCode = generateReferralCode();

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            referralCode: userReferralCode,
            referredBy: null,
            referrals: [],
            earnings: 0,
            registrationDate: new Date().toISOString()
        };

        // Handle referral
        if (referralCode) {
            const referrer = users.find(u => u.referralCode === referralCode);
            if (referrer) {
                newUser.referredBy = referrer.id;
                referrer.referrals.push(newUser.id);
                
                // Update referrer in storage
                const referrerIndex = users.findIndex(u => u.id === referrer.id);
                if (referrerIndex !== -1) {
                    users[referrerIndex] = referrer;
                }
                
                showNotification('Реферальный код применен!', 'success');
            } else {
                showNotification('Реферальный код не найден', 'error');
            }
        }

        users.push(newUser);
        currentUser = newUser;
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateAuthUI();
        closeAllModals();
        showNotification('Регистрация успешна!', 'success');
        
        // Update referral stats
        updateReferralStats();
    }

    function handlePayment(e) {
        e.preventDefault();
        const screenshotInput = document.getElementById('screenshot');
        const telegramInput = document.getElementById('telegramUsername');
        
        if (!screenshotInput || !telegramInput) return;

        const screenshot = screenshotInput.files[0];
        const telegram = telegramInput.value;

        // Validate file
        const fileError = validateFile(screenshot);
        if (fileError) {
            showNotification(fileError, 'error');
            return;
        }

        if (!screenshot) {
            showNotification('Пожалуйста, прикрепите скриншот оплаты', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const productNames = {
                'standard': 'Delyks Standard',
                'pro': 'Delyks Pro',
                'enterprise': 'Delyks Enterprise'
            };

            const newOrder = {
                id: Date.now(),
                userId: currentUser.id,
                userName: currentUser.name,
                telegram: telegram,
                product: productNames[currentPurchase.product],
                productType: currentPurchase.product,
                amount: currentPurchase.price,
                originalAmount: currentPurchase.originalPrice,
                appliedPromo: currentPurchase.appliedPromo ? {
                    code: currentPurchase.appliedPromo.code,
                    discount: currentPurchase.appliedPromo.discount
                } : null,
                status: 'pending',
                date: new Date().toISOString(),
                isReferral: false,
                referralBonusApplied: false,
                screenshot: e.target.result  // Save screenshot as Data URL
            };

            // Handle referral bonus
            if (currentUser.referredBy) {
                const referrer = users.find(u => u.id === currentUser.referredBy);
                if (referrer) {
                    const bonus = Math.floor(currentPurchase.price * (referralSettings.percent / 100));
                    referrer.earnings += bonus;
                    newOrder.isReferral = true;
                    
                    // Update referrer in storage
                    const referrerIndex = users.findIndex(u => u.id === referrer.id);
                    if (referrerIndex !== -1) {
                        users[referrerIndex] = referrer;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    
                    showNotification(`Ваш реферер получил бонус ${bonus}₽!`, 'success');
                }
            }

            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            closeAllModals();
            showNotification('Заказ отправлен! Менеджер свяжется с вами в Telegram', 'success');
            
            // Reset form and purchase info
            if (paymentForm) paymentForm.reset();
            currentPurchase = { product: '', price: 0, originalPrice: 0, appliedPromo: null };
            
            // Update stats
            updateReferralStats();
        };
        reader.readAsDataURL(screenshot);
    }

    function handleAdminAccess(e) {
        e.preventDefault();
        
        if (!adminPasswordInput) {
            showNotification('Ошибка: поле пароля не найдено', 'error');
            return;
        }

        const enteredPassword = adminPasswordInput.value.trim();
        console.log('Введённый пароль:', enteredPassword);
        console.log('Ожидаемый пароль:', ADMIN_PASSWORD);
        console.log('Совпадение:', enteredPassword === ADMIN_PASSWORD);

        if (enteredPassword === ADMIN_PASSWORD) {
            localStorage.setItem('adminAuthenticated', 'true');
            showNotification('Доступ разрешен! Переход в админ-панель...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showNotification('Неверный код доступа. Попробуйте снова.', 'error');
            adminPasswordInput.value = '';
            adminPasswordInput.style.borderColor = '#ef476f';
            setTimeout(() => {
                if (adminPasswordInput) {
                    adminPasswordInput.style.borderColor = '';
                }
            }, 2000);
        }
    }

    function generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        if (!authButtons) return;

        if (currentUser) {
            authButtons.innerHTML = `
                <button class="btn-login" id="profileBtn">
                    <i class="fas fa-user"></i>
                    Профиль
                </button>
                <button class="btn-logout" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    Выйти
                </button>
            `;
            
            const logoutBtn = document.getElementById('logoutBtn');
            const profileBtn = document.getElementById('profileBtn');
            
            if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
            if (profileBtn) profileBtn.addEventListener('click', () => openModal(profileModal));
            
            const referralLink = `${window.location.origin}${window.location.pathname}?ref=${currentUser.referralCode}`;
            const referralLinkInput = document.getElementById('referralLink');
            const profileReferralLink = document.getElementById('profileReferralLink');
            
            if (referralLinkInput) referralLinkInput.value = referralLink;
            if (profileReferralLink) profileReferralLink.value = referralLink;
            
            updateReferralStats();
        } else {
            authButtons.innerHTML = `
                <button class="btn-login" id="loginBtn">Вход</button>
                <button class="btn-register" id="registerBtn">Регистрация</button>
            `;
            const newLoginBtn = document.getElementById('loginBtn');
            const newRegisterBtn = document.getElementById('registerBtn');
            
            if (newLoginBtn) newLoginBtn.addEventListener('click', () => openModal(loginModal));
            if (newRegisterBtn) newRegisterBtn.addEventListener('click', () => openModal(registerModal));
        }
    }

    function updateReferralStats() {
        if (!currentUser) return;
        
        const referralCount = currentUser.referrals ? currentUser.referrals.length : 0;
        const earnings = currentUser.earnings || 0;
        
        const profileReferrals = document.getElementById('profileReferrals');
        const profileEarnings = document.getElementById('profileEarnings');
        
        if (profileReferrals) profileReferrals.textContent = referralCount;
        if (profileEarnings) profileEarnings.textContent = earnings + '₽';
        
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) statNumbers[0].textContent = referralCount;
        if (statNumbers[1]) statNumbers[1].textContent = earnings + '₽';
    }

    function updateProfileStats() {
        if (!currentUser) return;
        updateReferralStats();
    }

    function copyReferralLink() {
        const referralLink = document.getElementById('referralLink');
        if (!referralLink) return;
        
        referralLink.select();
        referralLink.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(referralLink.value);
        showNotification('Реферальная ссылка скопирована!', 'success');
    }

    function copyProfileReferralLink() {
        const referralLink = document.getElementById('profileReferralLink');
        if (!referralLink) return;
        
        referralLink.select();
        referralLink.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(referralLink.value);
        showNotification('Реферальная ссылка скопирована!', 'success');
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        showNotification('Вы вышли из системы', 'info');
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(45deg, #4cc9f0, #4361ee)' : 
                         type === 'error' ? 'linear-gradient(45deg, #ef476f, #7209b7)' : 
                         'linear-gradient(45deg, #00f3ff, #9d4edd)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
    }

    // Smooth scrolling for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    closeMobileMenu();
                }
            });
        });
    }

    // Initialize the application
    function init() {
        console.log('Initializing application...');
        
        initializeData();
        loadSettings();
        checkUrlReferral();
        updateAuthUI();
        initSmoothScroll();

        // Mobile menu event listeners
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        if (mobileNavOverlay) {
            mobileNavOverlay.addEventListener('click', closeMobileMenu);
        }

        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Modal open handlers
        if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
        if (registerBtn) registerBtn.addEventListener('click', () => openModal(registerModal));
        if (adminAccessBtn) adminAccessBtn.addEventListener('click', () => openModal(adminAccessModal));
        if (heroBuyBtn) heroBuyBtn.addEventListener('click', () => openPurchaseModal('pro', 65));
        if (heroBuyBtnMobile) heroBuyBtnMobile.addEventListener('click', () => openPurchaseModal('pro', 65));

        // Buy buttons
        if (buyButtons.length > 0) {
            buyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const product = button.getAttribute('data-product');
                    const price = parseInt(button.getAttribute('data-price'));
                    openPurchaseModal(product, price);
                });
            });
        }

        // Promo code handler
        if (applyPromoBtn) applyPromoBtn.addEventListener('click', applyPromoCode);

        // Copy referral link handlers
        if (copyReferralBtn) copyReferralBtn.addEventListener('click', copyReferralLink);
        if (copyProfileReferralBtn) copyProfileReferralBtn.addEventListener('click', copyProfileReferralLink);

        // Close modal handlers
        if (closeButtons.length > 0) {
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    closeAllModals();
                });
            });
        }

        // Form submission handlers
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (registerForm) registerForm.addEventListener('submit', handleRegister);
        if (paymentForm) paymentForm.addEventListener('submit', handlePayment);
        if (adminAccessForm) adminAccessForm.addEventListener('submit', handleAdminAccess);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                closeAllModals();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
                closeMobileMenu();
            }
        });

        console.log('Application initialized successfully');
    }

    // Start the application
    init();
});

// Particles configuration
const particlesConfig = {
    particles: {
        number: { 
            value: 100, 
            density: { 
                enable: true, 
                value_area: 800 
            } 
        },
        color: { 
            value: ["#00f3ff", "#9d4edd", "#f72585"] 
        },
        shape: { 
            type: "circle" 
        },
        opacity: { 
            value: 0.6, 
            random: true 
        },
        size: { 
            value: 2, 
            random: true 
        },
        line_linked: {
            enable: true,
            distance: 120,
            color: "#9d4edd",
            opacity: 0.3,
            width: 1
        },
        move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            random: true,
            out_mode: "out"
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { 
                enable: true, 
                mode: "repulse" 
            },
            onclick: { 
                enable: true, 
                mode: "push" 
            }
        }
    }
};
