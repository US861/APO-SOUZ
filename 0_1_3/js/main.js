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

let currentDeleteButton = null;
let deleteTimeout = null;
let productToDelete = null;

function showDeleteButton(card) {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.classList.remove('visible');
    });
    
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.classList.add('visible');
    
    clearTimeout(deleteTimeout);
    deleteTimeout = setTimeout(() => {
        deleteBtn.classList.remove('visible');
    }, 3000);
    
    currentDeleteButton = deleteBtn;
}

function confirmDelete(event, button) {
    event.stopPropagation();
    clearTimeout(deleteTimeout);
    
    productToDelete = button.closest('.product-card');
    document.getElementById('confirmationModal').classList.add('visible');
}

function closeConfirmation() {
    document.getElementById('confirmationModal').classList.remove('visible');
    productToDelete = null;
    
    if (currentDeleteButton) {
        currentDeleteButton.classList.remove('visible');
    }
}

function deleteProduct() {
    if (productToDelete) {
        productToDelete.remove();
        alert('Товар удален!');
    }
    closeConfirmation();
}

function initFormHandlers() {
    const loginForm = document.getElementById('login-form');
    const addProductForm = document.getElementById('add-product-form');
    const privacyCheckbox = document.getElementById('privacy-policy');
    const loginBtn = document.getElementById('login-btn');

    if (loginBtn) {
        loginBtn.disabled = true;
    }

    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', function() {
            if (loginBtn) {
                loginBtn.disabled = !this.checked;
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const privacyChecked = document.getElementById('privacy-policy').checked;
            if (!privacyChecked) {
                alert('Пожалуйста, согласитесь с обработкой персональных данных');
                return;
            }
            
            alert('Форма авторизации отправлена!');
        });
    }
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Товар добавлен!');
            window.location.href = 'categories.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initFormHandlers();

    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeConfirmation();
            }
        });
    }
});