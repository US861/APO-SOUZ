// Плавная прокрутка к разделу "Достоинства компании"
function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = featuresSection.offsetTop - headerHeight + 18;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
}

// Защита от XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Управление плашкой согласия на cookie
function initCookieConsent() {
    const consentBanner = document.getElementById('cookieConsent');
    if (!consentBanner) return;

    const cookieConsent = localStorage.getItem('cookie_consent');
    if (!cookieConsent) {
        setTimeout(() => {
            consentBanner.classList.add('show');
        }, 500);
    }

    const acceptBtn = document.getElementById('cookieAccept');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'accepted');
            consentBanner.classList.remove('show');
        });
    }
}

// Функционал каталога (удаление, поиск)
let productIdToDelete = null;
let deleteTimeout = null;
let searchTimeout = null;

// Показ кнопки удаления
function showDeleteButton(card) {
    if (!window.loggedIn) return;
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.classList.remove('visible');
    });
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.classList.add('visible');
        clearTimeout(deleteTimeout);
        deleteTimeout = setTimeout(() => {
            deleteBtn.classList.remove('visible');
        }, 3000);
    }
}

// Подтверждение удаления
function confirmDelete(event, productId) {
    event.stopPropagation();
    clearTimeout(deleteTimeout);
    productIdToDelete = productId;
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.classList.add('visible');
}

// Закрыть модальное окно
function closeConfirmation() {
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.classList.remove('visible');
    productIdToDelete = null;
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.classList.remove('visible');
    });
}

// Выполнить удаление товара
async function deleteProduct() {
    if (!productIdToDelete) return;
    try {
        const response = await fetch(`/delete-product/${productIdToDelete}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const productCard = document.querySelector(`.product-card[data-id="${productIdToDelete}"]`);
            if (productCard) productCard.remove();
        } else {
            alert('Ошибка при удалении товара');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при удалении товара');
    }
    closeConfirmation();
}

// Живой поиск
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    const query = searchInput.value.trim();
    const url = `/api/products?search=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const products = await response.json();
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        let html = '';
        products.forEach(product => {
            const imageUrl = product.image_path
                ? `/static/${product.image_path}`
                : '/static/images/default-product.png';
            html += `
                <div class="product-card" data-id="${product.id}" ${window.loggedIn ? 'onclick="showDeleteButton(this)"' : ''}>
                    ${window.loggedIn ? `<button class="delete-btn" onclick="confirmDelete(event, ${product.id})">×</button>` : ''}
                    <div class="product-image" style="background-image: url('${imageUrl}');"></div>
                    <div class="product-info">
                        <h3>${escapeHtml(product.name)}</h3>
                        <p>${product.price == 0 ? 'Цена договорная' : Number(product.price).toFixed(2) + ' руб за 1 кг'}</p>
                    </div>
                </div>
            `;
        });
        productsGrid.innerHTML = html || '<p class="no-results">Товары не найдены</p>';
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Инициализация всех компонентов при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // --- Обработка формы авторизации (если есть на странице) ---
    const loginForm = document.getElementById('login-form');
    const privacyCheckbox = document.getElementById('privacy-policy');
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.disabled = true;
    }
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', function() {
            if (loginBtn) loginBtn.disabled = !this.checked;
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const privacyChecked = document.getElementById('privacy-policy');
            if (privacyChecked && !privacyChecked.checked) {
                e.preventDefault();
                alert('Пожалуйста, согласитесь с обработкой персональных данных');
                return;
            }
        });
    }

    // Кнопка добавления товара (отключение для неавторизованных)
    const addBtn = document.querySelector('.add-btn');
    if (addBtn && addBtn.classList.contains('disabled')) {
        addBtn.style.opacity = '0.6';
        addBtn.style.cursor = 'not-allowed';
    }

    // Модальное окно подтверждения удаления
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === this) closeConfirmation();
        });
    }

    // Живой поиск в каталоге
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedSearch = debounce(performSearch, 300);
        searchInput.addEventListener('input', debouncedSearch);
    }

    // Плашка cookie
    initCookieConsent();
});