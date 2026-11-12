// ============================================
// MONEY TRACKER - Main Application
// Initialization, navigation, page rendering
// ============================================

const App = {
  currentPage: 'dashboard',
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  selectedGoal: null,
  editingTransaction: null,

  /** Initialize the app */
  init() {
    // Apply saved theme
    const theme = DataManager.getTheme();
    document.documentElement.setAttribute('data-theme', theme);

    // Render user info
    this.renderUserInfo();

    // Setup navigation
    this.setupNavigation();

    // Setup modal handlers
    UI.setupModals();

    // Setup theme toggle
    this.setupThemeToggle();

    // Setup mobile menu
    this.setupMobileMenu();

    // Setup transaction form
    this.setupTransactionForm();

    // Setup amount input formatting
    this.setupAmountInputs();

    // Setup goal form
    this.setupGoalForm();

    // Setup export buttons
    this.setupExportButtons();

    // Setup calendar navigation
    this.setupCalendarNav();

    // Setup history filters
    this.setupHistoryFilters();

    // Setup charts tab
    this.setupChartsTab();

    // Load default page
    this.navigateTo('dashboard');
  },

  /** Render user info in sidebar */
  renderUserInfo() {
    const user = DataManager.getUser();
    document.querySelectorAll('.user-avatar').forEach(el => {
      el.textContent = user.name.charAt(0).toUpperCase();
    });
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.name;
    });
    document.querySelectorAll('.user-status').forEach(el => {
      el.textContent = 'Sinh viên';
    });
    document.querySelectorAll('.greeting-text').forEach(el => {
      el.textContent = `${UI.getGreeting()}, ${user.name} 👋`;
    });
  },

  /** Setup sidebar navigation */
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
          this.navigateTo(page);
          // Close sidebar on mobile
          document.querySelector('.sidebar').classList.remove('open');
          document.querySelector('.sidebar-overlay').classList.remove('open');
        }
      });
    });
  },

  /** Navigate to a page */
  navigateTo(page) {
    this.currentPage = page;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page content visibility
    document.querySelectorAll('.page-content').forEach(el => {
      el.classList.remove('active');
    });

    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
    }

    // Update header title
    const titles = {
      dashboard: 'Tổng quan',
      transactions: 'Giao dịch',
      charts: 'Thống kê',
      calendar: 'Lịch',
      goals: 'Mục tiêu',
      history: 'Lịch sử',
      analysis: 'Phân tích',
      achievements: 'Thành tích',
      settings: 'Cài đặt'
    };
    document.querySelector('.header-title').textContent = titles[page] || 'Tổng quan';

    // Render page content
    switch (page) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'transactions':
        this.renderTransactions();
        break;
      case 'charts':
        this.renderCharts();
        break;
      case 'calendar':
        this.renderCalendar();
        break;
      case 'goals':
        this.renderGoals();
        break;
      case 'history':
        this.renderHistory();
        break;
      case 'analysis':
        this.renderAnalysis();
        break;
      case 'achievements':
        this.renderAchievements();
        break;
    }
  },

  /** Setup theme toggle */
  setupThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const theme = DataManager.toggleTheme();
        toggle.innerHTML = theme === 'dark'
          ? '<i class="fa-solid fa-sun"></i>'
          : '<i class="fa-solid fa-moon"></i>';
        if (this.currentPage === 'charts') {
          ChartsModule.renderAll(this.currentYear, this.currentMonth);
        }
      });

      const theme = DataManager.getTheme();
      toggle.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  },

  /** Setup mobile menu */
  setupMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      });
    }
  },

  // ==========================================
  // AMOUNT INPUT FORMATTING
  // ==========================================
  setupAmountInputs() {
    document.querySelectorAll('input[inputmode="numeric"]').forEach(input => {
      this._attachAmountFormat(input);
    });
  },

  _attachAmountFormat(input) {
    // Only allow digits
    input.addEventListener('keydown', (e) => {
      const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
      if (allowed.includes(e.key)) return;
      if ((e.ctrlKey || e.metaKey) && ['a','c','v','x'].includes(e.key.toLowerCase())) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    });

    // While typing: show raw digits only (no dots)
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
    });

    // On blur: format with dots
    input.addEventListener('blur', () => {
      const raw = input.value.replace(/\D/g, '');
      if (raw) input.value = parseInt(raw).toLocaleString('vi-VN');
    });

    // On focus: remove dots to allow clean editing
    input.addEventListener('focus', () => {
      input.value = input.value.replace(/\./g, '').replace(/,/g, '');
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if (pasted) input.value = pasted;
    });
  },

  /** Get raw number from formatted amount input */
  getRawAmount(id) {
    const val = document.getElementById(id)?.value || '';
    return parseFloat(val.replace(/\./g, '')) || 0;
  },

  // ==========================================
  // TRANSACTION FORM
  // ==========================================
  setupTransactionForm() {
    const form = document.getElementById('transactionForm');
    const typeSelect = document.getElementById('txnType');
    const categorySelect = document.getElementById('txnCategory');

    if (typeSelect && categorySelect) {
      typeSelect.addEventListener('change', () => {
        this.updateCategoryOptions(typeSelect.value, categorySelect);
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = typeSelect.value;
        const category = categorySelect.value;
        const amount = this.getRawAmount('txnAmount');
        const date = document.getElementById('txnDate').value;
        const note = document.getElementById('txnNote').value;

        if (!amount || !date) {
          UI.showToast('Vui lòng nhập đầy đủ thông tin', 'error');
          return;
        }

        if (this.editingTransaction) {
          DataManager.updateTransaction(this.editingTransaction.id, { type, category, amount, date, note });
          UI.showToast('Cập nhật giao dịch thành công!', 'success');
          this.editingTransaction = null;
        } else {
          DataManager.addTransaction({ type, category, amount, date, note });
          UI.showToast('Thêm giao dịch thành công!', 'success');
        }

        const newAchs = DataManager.checkAchievements();
        newAchs.forEach(ach => {
          UI.showToast(`Mở khóa thành tích: ${ach.name}!`, 'success', '🎉 Thành tích mới!');
        });

        form.reset();
        UI.closeModal('transactionModal');
        this.refreshCurrentPage();
      });
    }

    const dateInput = document.getElementById('txnDate');
    if (dateInput) dateInput.value = UI.todayStr();

    if (typeSelect && categorySelect) {
      this.updateCategoryOptions(typeSelect.value, categorySelect);
    }
  },

  /** Update category dropdown based on transaction type */
  updateCategoryOptions(type, selectEl) {
    const categories = DataManager.getCategories(type);
    selectEl.innerHTML = categories.map(c =>
      `<option value="${c.id}">${c.icon} ${c.name}</option>`
    ).join('');
  },

  /** Open transaction modal for editing */
  editTransaction(transaction) {
    this.editingTransaction = transaction;
    const typeSelect = document.getElementById('txnType');
    const categorySelect = document.getElementById('txnCategory');
    const amountInput = document.getElementById('txnAmount');
    const dateInput = document.getElementById('txnDate');
    const noteInput = document.getElementById('txnNote');
    const modalTitle = document.querySelector('#transactionModal .modal-header h3');

    if (modalTitle) modalTitle.textContent = 'Chỉnh sửa giao dịch';

    if (typeSelect) typeSelect.value = transaction.type;
    this.updateCategoryOptions(transaction.type, categorySelect);
    if (categorySelect) categorySelect.value = transaction.category;
    if (amountInput) amountInput.value = transaction.amount.toLocaleString('vi-VN');
    if (dateInput) dateInput.value = transaction.date;
    if (noteInput) noteInput.value = transaction.note;

    UI.openModal('transactionModal');
  },

  /** Reset transaction modal for adding */
  resetTransactionModal() {
    this.editingTransaction = null;
    const modalTitle = document.querySelector('#transactionModal .modal-header h3');
    if (modalTitle) modalTitle.textContent = 'Thêm giao dịch';
    document.getElementById('transactionForm')?.reset();
    const dateInput = document.getElementById('txnDate');
    if (dateInput) dateInput.value = UI.todayStr();
  },

  // ==========================================
  // GOAL FORM
  // ==========================================
  setupGoalForm() {
    const form = document.getElementById('goalForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('goalName').value;
        const targetAmount = this.getRawAmount('goalTarget');
        const icon = document.getElementById('goalIcon').value;
        const deadline = document.getElementById('goalDeadline').value;

        if (!name || !targetAmount) {
          UI.showToast('Vui lòng nhập đầy đủ thông tin', 'error');
          return;
        }

        DataManager.addGoal({ name, targetAmount, icon, deadline });
        UI.showToast('Thêm mục tiêu thành công!', 'success');
        form.reset();
        UI.closeModal('goalModal');
        this.renderGoals();
      });
    }
  },

  // ==========================================
  // EXPORT BUTTONS
  // ==========================================
  setupExportButtons() {
    document.querySelectorAll('.export-csv').forEach(btn => {
      btn.addEventListener('click', () => ExportModule.exportCSV());
    });
    document.querySelectorAll('.export-pdf').forEach(btn => {
      btn.addEventListener('click', () => ExportModule.exportPDF());
    });
  },

  // ==========================================
  // CALENDAR NAVIGATION
  // ==========================================
  setupCalendarNav() {
    document.getElementById('calendarPrev')?.addEventListener('click', () => {
      this.calendarMonth--;
      if (this.calendarMonth < 0) {
        this.calendarMonth = 11;
        this.calendarYear--;
      }
      this.renderCalendar();
    });

    document.getElementById('calendarNext')?.addEventListener('click', () => {
      this.calendarMonth++;
      if (this.calendarMonth > 11) {
        this.calendarMonth = 0;
        this.calendarYear++;
      }
      this.renderCalendar();
    });

    document.getElementById('calendarToday')?.addEventListener('click', () => {
      this.calendarMonth = new Date().getMonth();
      this.calendarYear = new Date().getFullYear();
      this.renderCalendar();
    });
  },

  // ==========================================
  // HISTORY FILTERS
  // ==========================================
  setupHistoryFilters() {
    const filterInputs = document.querySelectorAll('.history-filter');
    filterInputs.forEach(input => {
      input.addEventListener('change', UI.debounce(() => this.renderHistory(), 300));
    });

    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
      searchInput.addEventListener('input', UI.debounce(() => this.renderHistory(), 300));
    }
  },

  // ==========================================
  // CHARTS PAGE SETUP (one-time)
  // ==========================================
  _chartsReady: false,

  setupChartsTab() {
    if (this._chartsReady) return;
    this._chartsReady = true;

    const selector = document.getElementById('chartMonthSelector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        const [m, y] = e.target.value.split('-');
        this.currentMonth = parseInt(m);
        this.currentYear = parseInt(y);
        ChartsModule.renderAll(this.currentYear, this.currentMonth);
      });
    }
  },

  /** Refresh current page */
  refreshCurrentPage() {
    this.navigateTo(this.currentPage);
  },

  // ==========================================
  // SETTINGS
  // ==========================================

  /** Save user settings */
  saveSettings() {
    const nameInput = document.getElementById('settingsName');
    if (nameInput && nameInput.value.trim()) {
      DataManager.saveUser({ name: nameInput.value.trim() });
      this.renderUserInfo();
      UI.showToast('Đã lưu thông tin!', 'success');
    }
  },

  /** Reset all data (danger zone) */
  resetAllData() {
    if (confirm('Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
      if (confirm('Lần cuối: Xóa tất cả giao dịch, mục tiêu và thành tích?')) {
        localStorage.removeItem(DataManager.KEYS.TRANSACTIONS);
        localStorage.removeItem(DataManager.KEYS.GOALS);
        localStorage.removeItem(DataManager.KEYS.ACHIEVEMENTS);
        ChartsModule.destroyAll();
        UI.showToast('Đã xóa tất cả dữ liệu', 'info');
        location.reload();
      }
    }
  },

  // ==========================================
  // DASHBOARD RENDER
  // ==========================================
  renderDashboard() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const stats = DataManager.getMonthlyStats(year, month);
    const balance = DataManager.getBalance();
    const goals = DataManager.getGoals();
    const recentTransactions = DataManager.getFilteredTransactions({ month, year }).slice(0, 5);
    const advices = DataManager.getAdvice(year, month);
    const top = DataManager.getTopCategory(year, month);

    // Cards
    const balanceVal = document.getElementById('dashBalance');
    const incomeVal = document.getElementById('dashIncome');
    const expenseVal = document.getElementById('dashExpense');
    const savingsVal = document.getElementById('dashSavings');

    if (balanceVal) {
      balanceVal.textContent = '0₫';
      UI.animateNumber(balanceVal, Math.max(0, balance));
    }
    if (incomeVal) {
      incomeVal.textContent = '0₫';
      UI.animateNumber(incomeVal, stats.totalIncome);
    }
    if (expenseVal) {
      expenseVal.textContent = '0₫';
      UI.animateNumber(expenseVal, stats.totalExpense);
    }
    if (savingsVal) {
      savingsVal.textContent = '0₫';
      UI.animateNumber(savingsVal, Math.max(0, stats.savings));
    }

    // Recent transactions
    const recentContainer = document.getElementById('dashRecent');
    if (recentContainer) {
      if (recentTransactions.length === 0) {
        recentContainer.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-receipt"></i>
            <h3>Chưa có giao dịch</h3>
            <p>Bắt đầu thêm giao dịch đầu tiên của bạn</p>
            <button class="btn btn-primary" onclick="App.openAddTransaction()">
              <i class="fa-solid fa-plus"></i> Thêm giao dịch
            </button>
          </div>
        `;
      } else {
        recentContainer.innerHTML = recentTransactions.map(t => {
          const cat = DataManager.getCategory(t.category);
          const isIncome = t.type === 'income';
          return `
            <div class="transaction-item" onclick="App.editTransaction(DataManager.getTransactions().find(tx => tx.id === '${t.id}'));">
              <div class="transaction-icon ${t.type}">
                ${cat.icon}
              </div>
              <div class="transaction-info">
                <h4>${t.note || cat.name}</h4>
                <span class="category-tag">${cat.name} • ${UI.formatDateShort(t.date)}</span>
              </div>
              <div class="transaction-amount">
                <div class="amount ${isIncome ? 'positive' : 'negative'}">
                  ${isIncome ? '+' : '-'}${UI.formatCurrency(t.amount)}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Goals progress
    const goalsContainer = document.getElementById('dashGoals');
    if (goalsContainer) {
      if (goals.length === 0) {
        goalsContainer.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-bullseye"></i>
            <h3>Chưa có mục tiêu</h3>
            <p>Đặt mục tiêu tiết kiệm để theo dõi</p>
          </div>
        `;
      } else {
        goalsContainer.innerHTML = goals.slice(0, 3).map(g => {
          const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
          return `
            <div class="goal-card mb-2">
              <div class="goal-header">
                <span class="goal-title">${g.icon} ${g.name}</span>
              </div>
              <div class="goal-amount">${UI.formatCurrency(g.savedAmount)} / ${UI.formatCurrency(g.targetAmount)}</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${pct}%"></div>
              </div>
              <div class="goal-stats">
                <span>${pct}%</span>
                <span>${g.deadline ? 'Hạn: ' + UI.formatDate(g.deadline) : ''}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Financial advices
    const adviceContainer = document.getElementById('dashAdvice');
    if (adviceContainer) {
      if (advices.length > 0) {
        adviceContainer.innerHTML = advices.map(a => `
          <div class="advice-card animate-fade-up">
            <div class="advice-icon">
              <i class="fa-solid fa-lightbulb"></i>
            </div>
            <div class="advice-text">${a}</div>
          </div>
        `).join('');
      }
    }

    // Top category
    const topCatContainer = document.getElementById('dashTopCategory');
    if (topCatContainer && top.category) {
      const cat = DataManager.getCategory(top.category);
      topCatContainer.innerHTML = `
        <span style="display:flex;align-items:center;gap:8px">
          <span>${cat.icon}</span>
          <strong>${cat.name}</strong>
        </span>
        <span style="font-weight:700;color:var(--danger)">${UI.formatCurrency(top.amount)}</span>
      `;
    }
  },

  // ==========================================
  // TRANSACTIONS PAGE
  // ==========================================
  renderTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;

    const now = new Date();
    const year = this.currentYear || now.getFullYear();
    const month = this.currentMonth !== undefined ? this.currentMonth : now.getMonth();
    const transactions = DataManager.getFilteredTransactions({ month, year });

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <h3>Chưa có giao dịch tháng này</h3>
          <p>Nhấn "Thêm giao dịch" để bắt đầu</p>
          <button class="btn btn-primary" onclick="App.openAddTransaction()">
            <i class="fa-solid fa-plus"></i> Thêm giao dịch
          </button>
        </div>
      `;
      return;
    }

    // Group by date
    const grouped = {};
    transactions.forEach(t => {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    });

    const sortedDates = Object.keys(grouped).sort().reverse();

    container.innerHTML = sortedDates.map(date => `
      <div class="mb-4 animate-fade-up">
        <h4 style="font-size:13px;color:var(--text-muted);margin-bottom:8px;font-weight:600">
          <i class="fa-regular fa-calendar"></i> ${UI.formatDate(date)}
        </h4>
        <div class="transaction-list">
          ${grouped[date].map(t => {
            const cat = DataManager.getCategory(t.category);
            const isIncome = t.type === 'income';
            return `
              <div class="transaction-item" onclick="App.editTransaction(DataManager.getTransactions().find(tx => tx.id === '${t.id}'));">
                <div class="transaction-icon ${t.type}">
                  ${cat.icon}
                </div>
                <div class="transaction-info">
                  <h4>${t.note || cat.name}</h4>
                  <span class="category-tag">
                    <span class="category-dot" style="background:${cat.color}"></span>
                    ${cat.name}
                  </span>
                </div>
                <div class="transaction-amount">
                  <div class="amount ${isIncome ? 'positive' : 'negative'}">
                    ${isIncome ? '+' : '-'}${UI.formatCurrency(t.amount)}
                  </div>
                  <div class="date">${t.note ? cat.name : ''}</div>
                </div>
                <div class="transaction-actions">
                  <button class="btn-icon" onclick="event.stopPropagation();App.editTransaction(DataManager.getTransactions().find(tx => tx.id === '${t.id}'));">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn-icon" onclick="event.stopPropagation();App.confirmDeleteTransaction('${t.id}')" style="color:var(--danger)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  },

  /** Confirm and delete a transaction */
  confirmDeleteTransaction(id) {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      DataManager.deleteTransaction(id);
      UI.showToast('Đã xóa giao dịch', 'info');
      this.refreshCurrentPage();
    }
  },

  /** Open add transaction modal */
  openAddTransaction() {
    this.resetTransactionModal();
    UI.openModal('transactionModal');
  },

  // ==========================================
  // CHARTS PAGE
  // ==========================================
  renderCharts() {
    const now = new Date();
    const year = this.currentYear || now.getFullYear();
    const month = this.currentMonth !== undefined ? this.currentMonth : now.getMonth();

    // Update chart month selector
    const selector = document.getElementById('chartMonthSelector');
    if (selector) {
      const options = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = `${d.getMonth()}-${d.getFullYear()}`;
        const label = UI.getMonthName(d.getFullYear(), d.getMonth());
        const selected = d.getMonth() === month && d.getFullYear() === year;
        options.push(`<option value="${val}" ${selected ? 'selected' : ''}>${label}</option>`);
      }
      selector.innerHTML = options.join('');

      selector.addEventListener('change', (e) => {
        const [m, y] = e.target.value.split('-');
        this.currentMonth = parseInt(m);
        this.currentYear = parseInt(y);
        ChartsModule.renderAll(this.currentYear, this.currentMonth);
        UI.showToast(`Đã chuyển đến ${UI.getMonthName(this.currentYear, this.currentMonth)}`, 'info');
      });
    }

    // Render charts with slight delay for DOM
    setTimeout(() => {
      ChartsModule.renderAll(year, month);
    }, 100);
  },

  // ==========================================
  // CALENDAR RENDER
  // ==========================================
  renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');
    if (!grid || !title) return;

    const year = this.calendarYear;
    const month = this.calendarMonth;

    title.textContent = UI.getMonthName(year, month);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Get transactions for this month
    const transactions = DataManager.getTransactionsByMonth(year, month);
    const daysWithTransactions = new Set(transactions.map(t => new Date(t.date).getDate()));

    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let html = weekdays.map(d => `<div class="calendar-weekday">${d}</div>`).join('');

    // Previous month days
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Monday first
    for (let i = startDay - 1; i >= 0; i--) {
      html += `<button class="calendar-day other-month">${daysInPrevMonth - i}</button>`;
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const hasTx = daysWithTransactions.has(d);
      const classes = [
        'calendar-day',
        isToday ? 'today' : '',
        hasTx ? 'has-transactions' : ''
      ].filter(Boolean).join(' ');

      html += `<button class="${classes}" data-day="${d}">${d}</button>`;
    }

    // Next month days
    const totalCells = startDay + daysInMonth;
    const remaining = Math.ceil(totalCells / 7) * 7 - totalCells;
    for (let i = 1; i <= remaining; i++) {
      html += `<button class="calendar-day other-month">${i}</button>`;
    }

    grid.innerHTML = html;

    // Day click handler
    grid.querySelectorAll('.calendar-day:not(.other-month)').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day;
        this.showDayDetail(year, month, parseInt(day));
      });
    });
  },

  /** Show day detail */
  showDayDetail(year, month, day) {
    const container = document.getElementById('dayDetail');
    if (!container) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const transactions = DataManager.getFilteredTransactions({ startDate: dateStr, endDate: dateStr });

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="day-detail">
          <h4>📅 ${UI.formatDate(dateStr)}</h4>
          <p style="color:var(--text-muted);font-size:14px">Không có giao dịch</p>
        </div>
      `;
      return;
    }

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    container.innerHTML = `
      <div class="day-detail">
        <h4>📅 ${UI.formatDate(dateStr)}</h4>
        <div style="display:flex;gap:16px;margin-bottom:12px;font-size:13px">
          <span>Thu: <strong style="color:var(--success)">${UI.formatCurrency(totalIncome)}</strong></span>
          <span>Chi: <strong style="color:var(--danger)">${UI.formatCurrency(totalExpense)}</strong></span>
        </div>
        <div class="transaction-list">
          ${transactions.map(t => {
            const cat = DataManager.getCategory(t.category);
            return `
              <div class="transaction-item" style="background:var(--card-bg)">
                <div class="transaction-icon ${t.type}">${cat.icon}</div>
                <div class="transaction-info">
                  <h4>${t.note || cat.name}</h4>
                  <span class="category-tag">${cat.name}</span>
                </div>
                <div class="transaction-amount">
                  <div class="amount ${t.type === 'income' ? 'positive' : 'negative'}">
                    ${t.type === 'income' ? '+' : '-'}${UI.formatCurrency(t.amount)}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ==========================================
  // GOALS PAGE
  // ==========================================
  renderGoals() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;

    const goals = DataManager.getGoals();
    const savings = DataManager.getAverageSavings();

    if (goals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-bullseye"></i>
          <h3>Chưa có mục tiêu tiết kiệm</h3>
          <p>Đặt mục tiêu để bắt đầu hành trình tiết kiệm</p>
          <button class="btn btn-primary" onclick="UI.openModal('goalModal')">
            <i class="fa-solid fa-plus"></i> Thêm mục tiêu
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="goals-grid">
        ${goals.map(g => {
          const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
          const remaining = g.targetAmount - g.savedAmount;
          const monthsToGoal = savings > 0 ? Math.ceil(remaining / savings) : null;

          return `
            <div class="goal-card">
              <div class="goal-header">
                <div class="goal-icon" style="background:rgba(99,102,241,0.15)">
                  ${g.icon}
                </div>
                <button class="btn-icon" onclick="App.confirmDeleteGoal('${g.id}')" style="color:var(--danger)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <h3 class="goal-title">${g.name}</h3>
              <div class="goal-amount">${UI.formatCurrency(g.savedAmount)} / ${UI.formatCurrency(g.targetAmount)}</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${pct}%"></div>
              </div>
              <div class="goal-stats">
                <span>${pct}% hoàn thành</span>
                ${g.deadline ? `<span>📅 ${UI.formatDate(g.deadline)}</span>` : ''}
              </div>
              <div style="margin-top:8px;font-size:12px;color:var(--text-muted)">
                Còn ${UI.formatCurrency(remaining)} cần tiết kiệm
                ${monthsToGoal ? `· Dự kiến ${monthsToGoal} tháng` : ''}
              </div>
              <div style="margin-top:12px">
                <label style="font-size:12px;color:var(--text-secondary);font-weight:600">Cập nhật số tiền đã tiết kiệm</label>
                <div style="display:flex;gap:8px;margin-top:4px">
                  <input type="text" class="form-control" id="goalProgress_${g.id}" value="${g.savedAmount.toLocaleString('vi-VN')}" inputmode="numeric" style="padding:8px 12px;font-size:13px">
                  <button class="btn btn-primary btn-sm" onclick="App.updateGoalProgress('${g.id}')">
                    <i class="fa-solid fa-check"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Re-attach formatting for dynamically created inputs
    container.querySelectorAll('input[inputmode="numeric"]').forEach(input => {
      this._attachAmountFormat(input);
    });
  },

  /** Update goal progress */
  updateGoalProgress(id) {
    const input = document.getElementById(`goalProgress_${id}`);
    if (!input) return;
    const value = parseFloat(input.value.replace(/\./g, '').replace(/,/g, ''));
    if (isNaN(value) || value < 0) {
      UI.showToast('Số tiền không hợp lệ', 'error');
      return;
    }
    DataManager.updateGoal(id, { savedAmount: value });
    UI.showToast('Đã cập nhật tiến độ!', 'success');
    this.renderGoals();

    const newAchs = DataManager.checkAchievements();
    newAchs.forEach(ach => {
      UI.showToast(`Mở khóa thành tích: ${ach.name}!`, 'success', '🎉 Thành tích mới!');
    });
  },

  /** Confirm delete goal */
  confirmDeleteGoal(id) {
    if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
      DataManager.deleteGoal(id);
      UI.showToast('Đã xóa mục tiêu', 'info');
      this.renderGoals();
    }
  },

  // ==========================================
  // HISTORY PAGE
  // ==========================================
  renderHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) return;

    const search = document.getElementById('historySearch')?.value || '';
    const category = document.getElementById('historyCategory')?.value || '';
    const type = document.getElementById('historyType')?.value || '';
    const monthStr = document.getElementById('historyMonth')?.value || '';

    const filters = { search };
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (monthStr) {
      const parts = monthStr.split('-');
      filters.year = parseInt(parts[0]);
      filters.month = parseInt(parts[1]) - 1;
    }

    const transactions = DataManager.getFilteredTransactions(filters);

    // Populate category filter
    const catFilter = document.getElementById('historyCategory');
    if (catFilter && catFilter.options.length <= 1) {
      DataManager.EXPENSE_CATEGORIES.forEach(c => {
        catFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
      DataManager.INCOME_CATEGORIES.forEach(c => {
        catFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });
    }

    // Set month filter default
    const monthFilter = document.getElementById('historyMonth');
    if (monthFilter && !monthFilter.value) {
      const now = new Date();
      monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <h3>Không tìm thấy giao dịch</h3>
          <p>Thử thay đổi bộ lọc hoặc thêm giao dịch mới</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="timeline animate-fade-up">
        ${transactions.slice(0, 50).map(t => {
          const cat = DataManager.getCategory(t.category);
          return `
            <div class="timeline-item ${t.type}">
              <div class="timeline-date">${UI.formatDate(t.date)}</div>
              <div class="timeline-content">
                <div class="transaction-item" style="background:var(--card-bg);padding:12px 14px">
                  <div class="transaction-icon ${t.type}">${cat.icon}</div>
                  <div class="transaction-info">
                    <h4>${t.note || cat.name}</h4>
                    <span class="category-tag">
                      <span class="category-dot" style="background:${cat.color}"></span>
                      ${cat.name}
                    </span>
                  </div>
                  <div class="transaction-amount">
                    <div class="amount ${t.type === 'income' ? 'positive' : 'negative'}">
                      ${t.type === 'income' ? '+' : '-'}${UI.formatCurrency(t.amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${transactions.length > 50 ? '<p style="text-align:center;color:var(--text-muted);font-size:13px;margin-top:16px">Hiển thị 50 giao dịch gần nhất</p>' : ''}
    `;
  },

  // ==========================================
  // ANALYSIS PAGE
  // ==========================================
  renderAnalysis() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const stats = DataManager.getMonthlyStats(year, month);
    const top = DataManager.getTopCategory(year, month);
    const maxDay = DataManager.getMaxSpendingDay(year, month);
    const avgSavings = DataManager.getAverageSavings();
    const advices = DataManager.getAdvice(year, month);
    const breakdown = DataManager.getCategoryBreakdown(year, month);

    // Insights grid
    const topCatEl = document.getElementById('analysisTopCat');
    if (topCatEl && top.category) {
      const cat = DataManager.getCategory(top.category);
      topCatEl.innerHTML = `
        <div class="insight-card">
          <span style="font-size:32px">${cat.icon}</span>
          <div class="insight-value">${UI.formatCurrency(top.amount)}</div>
          <div class="insight-label">Danh mục chi nhiều nhất: ${cat.name}</div>
        </div>
      `;
    } else if (topCatEl) {
      topCatEl.innerHTML = `<div class="insight-card"><span style="font-size:32px">📊</span><div class="insight-value">0₫</div><div class="insight-label">Chưa có dữ liệu</div></div>`;
    }

    const maxDayEl = document.getElementById('analysisMaxDay');
    if (maxDayEl) {
      maxDayEl.innerHTML = `
        <div class="insight-card">
          <span style="font-size:32px">📅</span>
          <div class="insight-value">${maxDay.day > 0 ? `Ngày ${maxDay.day}` : '-'}</div>
          <div class="insight-label">Ngày chi nhiều nhất (${UI.formatCurrency(maxDay.amount)})</div>
        </div>
      `;
    }

    const avgSavingsEl = document.getElementById('analysisAvgSavings');
    if (avgSavingsEl) {
      avgSavingsEl.innerHTML = `
        <div class="insight-card">
          <span style="font-size:32px">💰</span>
          <div class="insight-value">${UI.formatCurrency(Math.max(0, avgSavings))}</div>
          <div class="insight-label">Tiết kiệm trung bình 3 tháng</div>
        </div>
      `;
    }

    const totalExpenseEl = document.getElementById('analysisTotalExpense');
    if (totalExpenseEl) {
      totalExpenseEl.innerHTML = `
        <div class="insight-card">
          <span style="font-size:32px">💳</span>
          <div class="insight-value">${UI.formatCurrency(stats.totalExpense)}</div>
          <div class="insight-label">Tổng chi tiêu tháng này</div>
        </div>
      `;
    }

    // Advices
    const adviceContainer = document.getElementById('analysisAdvice');
    if (adviceContainer) {
      adviceContainer.innerHTML = advices.map(a => `
        <div class="advice-card animate-fade-up">
          <div class="advice-icon">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div class="advice-text">${a}</div>
        </div>
      `).join('');
    }

    // Category breakdown list
    const breakdownContainer = document.getElementById('analysisBreakdown');
    if (breakdownContainer) {
      const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
      if (Object.keys(breakdown).length === 0) {
        breakdownContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center">Chưa có dữ liệu chi tiêu tháng này</p>';
      } else {
        breakdownContainer.innerHTML = Object.entries(breakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([catId, amount]) => {
            const cat = DataManager.getCategory(catId);
            const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:20px">${cat.icon}</span>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <span style="font-size:13px;font-weight:500">${cat.name}</span>
                    <span style="font-size:13px;font-weight:600">${UI.formatCurrency(amount)}</span>
                  </div>
                  <div class="progress-bar" style="height:6px">
                    <div class="progress-fill" style="width:${pct}%;background:${cat.color}"></div>
                  </div>
                  <span style="font-size:11px;color:var(--text-muted)">${pct}%</span>
                </div>
              </div>
            `;
          }).join('');
      }
    }
  },

  /** Logout */
  logout() {
    Auth.logout();
    location.reload();
  },

  // ==========================================
  // ACHIEVEMENTS PAGE
  // ==========================================
  renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;

    const achs = DataManager.getAchievements();
    const unlocked = achs.filter(a => a.unlocked).length;

    container.innerHTML = `
      <div style="text-align:center;padding:20px;margin-bottom:20px">
        <span style="font-size:48px">🏆</span>
        <h2 style="margin:8px 0 4px">${unlocked}/${achs.length} Thành tích</h2>
        <p style="color:var(--text-muted);font-size:14px">
          ${unlocked === achs.length ? '🎉 Bạn đã đạt được tất cả thành tích!' : `Còn ${achs.length - unlocked} thành tích để chinh phục`}
        </p>
        <div class="progress-bar" style="max-width:300px;margin:12px auto;height:10px">
          <div class="progress-fill" style="width:${(unlocked / achs.length) * 100}%"></div>
        </div>
      </div>
      <div class="achievements-grid">
        ${achs.map(a => `
          <div class="achievement-card" style="${a.unlocked ? 'border-color:rgba(245,158,11,0.3)' : ''}">
            <div class="ach-icon ${a.unlocked ? 'unlocked' : 'locked'}">${a.icon}</div>
            <h4>${a.name}</h4>
            <p>${a.desc}</p>
            <span class="ach-badge ${a.unlocked ? 'unlocked' : 'locked'}">
              ${a.unlocked ? '✓ Đã đạt' : '🔒 Khóa'}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// ============================================
// LOGIN / AUTH
// ============================================
const Auth = {
  USERS_KEY: 'mt_users',
  SESSION_KEY: 'mt_logged_in',

  _getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY)) || {};
    } catch { return {}; }
  },

  _saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  _ensureDefault() {
    const users = this._getUsers();
    if (!users['admin']) {
      users['admin'] = { password: '123456', name: 'Admin' };
      this._saveUsers(users);
    }
  },

  isLoggedIn() {
    return !!localStorage.getItem(this.SESSION_KEY);
  },

  currentUser() {
    return localStorage.getItem(this.SESSION_KEY) || null;
  },

  login(username, password) {
    this._ensureDefault();
    const users = this._getUsers();
    if (users[username] && users[username].password === password) {
      localStorage.setItem(this.SESSION_KEY, username);
      return true;
    }
    return false;
  },

  register(username, password, name) {
    this._ensureDefault();
    const users = this._getUsers();
    if (users[username]) return { ok: false, msg: 'Tên đăng nhập đã tồn tại' };
    if (username.length < 3) return { ok: false, msg: 'Tên đăng nhập tối thiểu 3 ký tự' };
    if (password.length < 6) return { ok: false, msg: 'Mật khẩu tối thiểu 6 ký tự' };
    users[username] = { password, name: name || username };
    this._saveUsers(users);
    localStorage.setItem(this.SESSION_KEY, username);
    return { ok: true };
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }
};

function openLoginModal() {
  UI.openModal('loginModal');
}

function clearLegacyData() {
  // Only clear old single-user keys (pre v2.0), not per-user keys
  const version = '3.0';
  if (localStorage.getItem('mt_version') !== version) {
    ['mt_transactions', 'mt_goals', 'mt_achievements'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('mt_version', version);
  }
}

function launchApp() {
  const username = Auth.currentUser();
  DataManager.setUser(username);
  document.getElementById('landingPage').style.display = 'none';
  document.querySelector('.sidebar').style.display = 'flex';
  document.querySelector('.main-content').style.display = 'block';
  App.init();
}

// ============================================
// Initialize when DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  clearLegacyData();
  // Hide app shell initially
  document.querySelector('.sidebar').style.display = 'none';
  document.querySelector('.main-content').style.display = 'none';

  if (Auth.isLoggedIn()) {
    document.getElementById('landingPage').style.display = 'none';
    launchApp();
    return;
  }

  // Landing page buttons
  ['openLoginBtn', 'heroLoginBtn', 'ctaLoginBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', openLoginModal);
  });

  // Login form
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    if (Auth.login(username, password)) {
      UI.closeModal('loginModal');
      launchApp();
    } else {
      loginError.textContent = '\u26a0\ufe0f T\u00ean \u0111\u0103ng nh\u1eadp ho\u1eb7c m\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u00fang';
      loginError.style.display = 'block';
    }
  });

  // Register form
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value.trim();
    const regError = document.getElementById('registerError');
    const result = Auth.register(username, password, name);
    if (result.ok) {
      UI.closeModal('loginModal');
      launchApp();
    } else {
      regError.textContent = '\u26a0\ufe0f ' + result.msg;
      regError.style.display = 'block';
    }
  });

  // Tab switching
  document.getElementById('showRegister')?.addEventListener('click', () => {
    document.getElementById('loginTab').style.display = 'none';
    document.getElementById('registerTab').style.display = 'block';
  });
  document.getElementById('showLogin')?.addEventListener('click', () => {
    document.getElementById('registerTab').style.display = 'none';
    document.getElementById('loginTab').style.display = 'block';
  });
});
