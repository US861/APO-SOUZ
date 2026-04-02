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

document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.querySelector('.add-btn');
    if (addBtn && addBtn.classList.contains('disabled')) {
        addBtn.style.opacity = '0.6';
        addBtn.style.cursor = 'not-allowed';
    }

    const loginForm = document.getElementById('login-form');
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
            const privacyChecked = document.getElementById('privacy-policy').checked;
            if (!privacyChecked) {
                e.preventDefault();
                alert('Пожалуйста, согласитесь с обработкой персональных данных');
                return;
            }
        });
    }

    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeConfirmation();
            }
        });
    }
});