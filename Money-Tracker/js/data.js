// ============================================
// MONEY TRACKER - Data Management Layer
// All LocalStorage operations
// ============================================

const DataManager = {
  _prefix: 'default',

  /** Set current user prefix (call after login) */
  setUser(username) {
    this._prefix = username || 'default';
  },

  // Storage keys
  get KEYS() {
    const p = this._prefix;
    return {
      TRANSACTIONS: `mt_${p}_transactions`,
      GOALS: `mt_${p}_goals`,
      THEME: `mt_${p}_theme`,
      USER: `mt_${p}_user`,
      ACHIEVEMENTS: `mt_${p}_achievements`
    };
  },

  // ========== CATEGORIES ==========
  EXPENSE_CATEGORIES: [
    { id: 'food', name: 'Ăn uống', icon: '🍔', color: '#ef4444' },
    { id: 'study', name: 'Học tập', icon: '📚', color: '#3b82f6' },
    { id: 'transport', name: 'Đi lại', icon: '🚌', color: '#f59e0b' },
    { id: 'entertainment', name: 'Giải trí', icon: '🎮', color: '#a855f7' },
    { id: 'shopping', name: 'Mua sắm', icon: '🛍️', color: '#ec4899' },
    { id: 'rent', name: 'Tiền phòng', icon: '🏠', color: '#6366f1' },
    { id: 'utilities', name: 'Điện nước', icon: '💡', color: '#14b8a6' },
    { id: 'other', name: 'Khác', icon: '📌', color: '#6b7280' }
  ],

  INCOME_CATEGORIES: [
    { id: 'salary', name: 'Lương', icon: '💰', color: '#10b981' },
    { id: 'parttime', name: 'Làm thêm', icon: '💼', color: '#06b6d4' },
    { id: 'allowance', name: 'Tiền tiêu vặt', icon: '🎁', color: '#8b5cf6' },
    { id: 'investment', name: 'Đầu tư', icon: '📈', color: '#f97316' },
    { id: 'other_income', name: 'Khác', icon: '📌', color: '#6b7280' }
  ],

  /** Get all categories (expense or income) */
  getCategories(type) {
    return type === 'income' ? this.INCOME_CATEGORIES : this.EXPENSE_CATEGORIES;
  },

  /** Find category by id */
  getCategory(id) {
    const all = [...this.EXPENSE_CATEGORIES, ...this.INCOME_CATEGORIES];
    return all.find(c => c.id === id) || all[all.length - 1];
  },

  // ========== TRANSACTIONS ==========

  /** Get all transactions */
  getTransactions() {
    try {
      const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Save transactions */
  saveTransactions(transactions) {
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  /** Add a transaction */
  addTransaction({ type, category, amount, date, note }) {
    const transactions = this.getTransactions();
    const transaction = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      type,
      category,
      amount: parseFloat(amount),
      date,
      note: note || '',
      createdAt: new Date().toISOString()
    };
    transactions.push(transaction);
    this.saveTransactions(transactions);
    return transaction;
  },

  /** Update a transaction */
  updateTransaction(id, updates) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    transactions[index] = { ...transactions[index], ...updates };
    this.saveTransactions(transactions);
    return transactions[index];
  },

  /** Delete a transaction */
  deleteTransaction(id) {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    this.saveTransactions(transactions);
  },

  /** Get transactions by month/year */
  getTransactionsByMonth(year, month) {
    return this.getTransactions().filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  /** Get filtered transactions */
  getFilteredTransactions({ search, category, type, month, year, startDate, endDate } = {}) {
    let transactions = this.getTransactions();

    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(t =>
        t.note.toLowerCase().includes(q) ||
        this.getCategory(t.category)?.name.toLowerCase().includes(q)
      );
    }

    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }

    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    if (month !== undefined && year !== undefined) {
      transactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    }

    if (startDate) {
      transactions = transactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter(t => t.date <= endDate);
    }

    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // ========== FINANCE CALCULATIONS ==========

  /** Get total balance */
  getBalance() {
    const transactions = this.getTransactions();
    return transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  },

  /** Get monthly stats */
  getMonthlyStats(year, month) {
    const transactions = this.getTransactionsByMonth(year, month);
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    return { totalIncome, totalExpense, savings: totalIncome - totalExpense };
  },

  /** Get category breakdown for a month */
  getCategoryBreakdown(year, month) {
    const transactions = this.getTransactionsByMonth(year, month);
    const breakdown = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!breakdown[t.category]) {
          breakdown[t.category] = 0;
        }
        breakdown[t.category] += t.amount;
      });

    return breakdown;
  },

  /** Get daily expense for line chart */
  getDailyExpenses(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const transactions = this.getTransactionsByMonth(year, month);
    const daily = Array(daysInMonth).fill(0);

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = new Date(t.date).getDate();
        daily[day - 1] += t.amount;
      });

    return daily;
  },

  /** Get monthly comparison (bar chart) for last 6 months */
  getMonthlyComparison(months = 6) {
    const now = new Date();
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const stats = this.getMonthlyStats(d.getFullYear(), d.getMonth());
      data.push({
        label: `Tháng ${d.getMonth() + 1}`,
        income: stats.totalIncome,
        expense: stats.totalExpense,
        savings: stats.savings
      });
    }

    return data;
  },

  /** Get top spending category */
  getTopCategory(year, month) {
    const breakdown = this.getCategoryBreakdown(year, month);
    let topCat = null;
    let topAmount = 0;

    Object.entries(breakdown).forEach(([cat, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCat = cat;
      }
    });

    return { category: topCat, amount: topAmount };
  },

  /** Get max spending day */
  getMaxSpendingDay(year, month) {
    const daily = this.getDailyExpenses(year, month);
    const max = Math.max(...daily, 0);
    const dayIndex = daily.indexOf(max);
    return { day: dayIndex + 1, amount: max };
  },

  /** Get average savings */
  getAverageSavings(months = 3) {
    const now = new Date();
    let totalSavings = 0;
    let count = 0;

    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const stats = this.getMonthlyStats(d.getFullYear(), d.getMonth());
      totalSavings += stats.savings;
      count++;
    }

    return count > 0 ? totalSavings / count : 0;
  },

  /** Generate financial advice */
  getAdvice(year, month) {
    const stats = this.getMonthlyStats(year, month);
    const top = this.getTopCategory(year, month);
    const advices = [];

    if (top.category && top.amount > 0) {
      const cat = this.getCategory(top.category);
      const totalExpense = stats.totalExpense;
      const pct = totalExpense > 0 ? (top.amount / totalExpense * 100) : 0;
      if (pct > 40) {
        advices.push(`⚠️ Bạn đã chi ${pct.toFixed(0)}% cho ${cat.name} tháng này. Hãy cân nhắc giảm bớt!`);
      }
    }

    if (stats.savings < 0) {
      advices.push(`⚠️ Tháng này bạn đã chi nhiều hơn thu ${Math.abs(stats.savings).toLocaleString()}₫. Hãy lên kế hoạch chi tiêu hợp lý hơn.`);
    } else if (stats.savings > 0 && stats.savings < stats.totalIncome * 0.1) {
      advices.push(`💡 Tỷ lệ tiết kiệm của bạn còn thấp. Hãy đặt mục tiêu tiết kiệm ít nhất 20% thu nhập.`);
    } else if (stats.savings > stats.totalIncome * 0.3) {
      advices.push(`🎉 Bạn đang tiết kiệm rất tốt! Hãy duy trì thói quen này.`);
    }

    if (advices.length === 0) {
      advices.push(`✅ Tháng này bạn quản lý tài chính tốt. Hãy tiếp tục duy trì!`);
    }

    return advices;
  },

  // ========== SAVINGS GOALS ==========

  /** Get all goals */
  getGoals() {
    try {
      const data = localStorage.getItem(this.KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Save goals */
  saveGoals(goals) {
    localStorage.setItem(this.KEYS.GOALS, JSON.stringify(goals));
  },

  /** Add a goal */
  addGoal({ name, targetAmount, icon, deadline }) {
    const goals = this.getGoals();
    const goal = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: 0,
      icon: icon || '🎯',
      deadline: deadline || null,
      createdAt: new Date().toISOString()
    };
    goals.push(goal);
    this.saveGoals(goals);
    return goal;
  },

  /** Update goal progress */
  updateGoal(id, updates) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    goals[idx] = { ...goals[idx], ...updates };
    this.saveGoals(goals);
    return goals[idx];
  },

  /** Delete a goal */
  deleteGoal(id) {
    const goals = this.getGoals().filter(g => g.id !== id);
    this.saveGoals(goals);
  },

  // ========== THEME ==========

  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
    return next;
  },

  // ========== USER ==========

  getUser() {
    const data = localStorage.getItem(this.KEYS.USER);
    return data ? JSON.parse(data) : { name: this._prefix, avatar: null };
  },

  saveUser(user) {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  },

  // ========== ACHIEVEMENTS ==========

  ACHIEVEMENT_DEFS: [
    { id: 'first_save', name: 'Tiết kiệm đầu tiên', desc: 'Tiết kiệm được 1.000.000₫', icon: '🏆', threshold: 1000000 },
    { id: 'save_5m', name: 'Nhà tiết kiệm', desc: 'Tiết kiệm được 5.000.000₫', icon: '💎', threshold: 5000000 },
    { id: 'save_10m', name: 'Chuyên gia tiết kiệm', desc: 'Tiết kiệm được 10.000.000₫', icon: '👑', threshold: 10000000 },
    { id: 'no_overspend_7', name: 'Chi tiêu có kỷ luật', desc: 'Không chi quá mức 7 ngày liên tiếp', icon: '🔥', threshold: 7 },
    { id: 'first_goal', name: 'Cán đích đầu tiên', desc: 'Hoàn thành mục tiêu tiết kiệm đầu tiên', icon: '🎯', threshold: 1 },
    { id: 'track_30', name: 'Theo dõi đều đặn', desc: 'Ghi nhật ký chi tiêu 30 ngày', icon: '📊', threshold: 30 }
  ],

  getAchievements() {
    try {
      const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : this.ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: false }));
    } catch {
      return [];
    }
  },

  saveAchievements(achs) {
    localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achs));
  },

  /** Check and update achievements */
  checkAchievements() {
    let achs = this.getAchievements();
    let newUnlocks = [];
    const transactions = this.getTransactions();
    const totalBalance = this.getBalance();
    const savingStreak = this._calcStreak();

    achs.forEach(ach => {
      if (ach.unlocked) return;

      let earned = false;
      if (ach.id === 'first_save' && totalBalance >= ach.threshold) earned = true;
      if (ach.id === 'save_5m' && totalBalance >= ach.threshold) earned = true;
      if (ach.id === 'save_10m' && totalBalance >= ach.threshold) earned = true;
      if (ach.id === 'no_overspend_7' && savingStreak >= ach.threshold) earned = true;
      if (ach.id === 'track_30' && transactions.length >= ach.threshold) earned = true;
      if (ach.id === 'first_goal') {
        const goals = this.getGoals();
        if (goals.some(g => g.savedAmount >= g.targetAmount)) earned = true;
      }

      if (earned) {
        ach.unlocked = true;
        newUnlocks.push(ach);
      }
    });

    this.saveAchievements(achs);
    return newUnlocks;
  },

  /** Calculate consecutive days without overspending */
  _calcStreak() {
    // Simplified: count consecutive days with transactions and positive balance
    const transactions = this.getTransactions();
    if (transactions.length === 0) return 0;

    const days = [...new Set(transactions.map(t => t.date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < days.length; i++) {
      const d = new Date(days[i]);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (d.toDateString() === expected.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
};
