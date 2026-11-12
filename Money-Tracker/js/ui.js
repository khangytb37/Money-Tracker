// ============================================
// MONEY TRACKER - UI Helpers
// Toast, Modal, Formatting utilities
// ============================================

const UI = {
  /** Format number as VND currency string */
  formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
  },

  /** Format date to locale string */
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  /** Format date short (no year) */
  formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  },

  /** Get today as YYYY-MM-DD */
  todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  /** Get current month name in Vietnamese */
  getMonthName(year, month) {
    const names = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return (year && year !== new Date().getFullYear()) 
      ? `${names[month]} ${year}` 
      : names[month];
  },

  /** Show a toast notification */
  showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    const titles = {
      success: 'Thành công',
      error: 'Lỗi',
      warning: 'Cảnh báo',
      info: 'Thông báo'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        <h4>${title || titles[type]}</h4>
        <p>${message}</p>
      </div>
      <button class="toast-close">&times;</button>
    `;

    // Auto-close after 3.5s
    const timeout = setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3500);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timeout);
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);
  },

  /** Open a modal */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  /** Close a modal */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  /** Close all modals */
  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  },

  /** Setup modal close handlers */
  setupModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });

      // Close on X button
      overlay.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    });
  },

  /** Animate number counting up */
  animateNumber(element, target, duration = 800) {
    const start = performance.now();
    const initial = 0;

    const update = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      element.textContent = this.formatCurrency(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = this.formatCurrency(target);
      }
    };

    requestAnimationFrame(update);
  },

  /** Generate a unique ID */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /** Get transaction icon class based on type */
  getTransactionIcon(type) {
    return type === 'income' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up';
  },

  /** Show loading skeleton, then render content */
  withSkeleton(containerId, renderFn) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show skeleton
    container.innerHTML = `
      <div class="skeleton skeleton-card mb-4"></div>
      <div class="skeleton skeleton-card mb-4"></div>
    `;

    // Delay then render
    setTimeout(() => {
      renderFn(container);
    }, 300);
  },

  /** Get greeting based on time of day */
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  },

  /** Debounce helper */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};
