// ============================================
// MONEY TRACKER - Charts Module
// Chart.js based visualizations
// ============================================

const ChartsModule = {
  pieChart: null,
  lineChart: null,
  barChart: null,

  /** Colors palette */
  colors: [
    '#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f59e0b',
    '#10b981', '#3b82f6', '#14b8a6', '#8b5cf6', '#f97316',
    '#6b7280', '#d946ef'
  ],

  /** Render all charts for a given month */
  renderAll(year, month) {
    this.renderPieChart(year, month);
    this.renderLineChart(year, month);
    this.renderBarChart();
  },

  /** Pie chart: category breakdown */
  renderPieChart(year, month) {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;

    const breakdown = DataManager.getCategoryBreakdown(year, month);
    const labels = [];
    const data = [];
    const bgColors = [];
    const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

    Object.entries(breakdown).forEach(([catId, amount], idx) => {
      const cat = DataManager.getCategory(catId);
      labels.push(cat.name);
      data.push(amount);
      bgColors.push(cat.color || this.colors[idx % this.colors.length]);
    });

    if (this.pieChart) this.pieChart.destroy();

    if (data.length === 0) {
      ctx.parentElement.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-chart-pie"></i>
          <h3>Chưa có dữ liệu</h3>
          <p>Thêm giao dịch để xem thống kê</p>
        </div>
      `;
      return;
    }

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: 'transparent',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              font: { size: 12, family: 'Inter' },
              color: getComputedStyle(document.documentElement)
                .getPropertyValue('--text-secondary').trim()
            }
          },
          tooltip: {
            backgroundColor: getComputedStyle(document.documentElement)
              .getPropertyValue('--bg-secondary').trim(),
            titleColor: getComputedStyle(document.documentElement)
              .getPropertyValue('--text-primary').trim(),
            bodyColor: getComputedStyle(document.documentElement)
              .getPropertyValue('--text-secondary').trim(),
            borderColor: getComputedStyle(document.documentElement)
              .getPropertyValue('--border-color').trim(),
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (context) => {
                const val = context.raw;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${UI.formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  /** Line chart: daily expenses */
  renderLineChart(year, month) {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;

    const daily = DataManager.getDailyExpenses(year, month);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`);

    if (this.lineChart) this.lineChart.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#a0a0b8' : '#64748b';
    const gridColor = isDark ? '#2a2a40' : '#e2e8f0';

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Chi tiêu',
          data: daily,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderColor: '#6366f1',
          borderWidth: 2.5,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1a1a2e' : '#fff',
            titleColor: isDark ? '#e8e8f0' : '#1a1a2e',
            bodyColor: isDark ? '#a0a0b8' : '#64748b',
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (context) => ` ${UI.formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 11, family: 'Inter' },
              maxTicksLimit: 10,
              maxRotation: 0
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 11, family: 'Inter' },
              callback: (value) => {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'tr';
                if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                return value;
              }
            }
          }
        }
      }
    });
  },

  /** Bar chart: monthly income vs expense comparison */
  renderBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    const data = DataManager.getMonthlyComparison(6);
    const labels = data.map(d => d.label);

    if (this.barChart) this.barChart.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#a0a0b8' : '#64748b';
    const gridColor = isDark ? '#2a2a40' : '#e2e8f0';

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Thu nhập',
            data: data.map(d => d.income),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.4
          },
          {
            label: 'Chi tiêu',
            data: data.map(d => d.expense),
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 16,
              font: { size: 12, family: 'Inter' },
              color: textColor
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1a1a2e' : '#fff',
            titleColor: isDark ? '#e8e8f0' : '#1a1a2e',
            bodyColor: isDark ? '#a0a0b8' : '#64748b',
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${UI.formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 11, family: 'Inter' }
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 11, family: 'Inter' },
              callback: (value) => {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'tr';
                if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                return value;
              }
            }
          }
        }
      }
    });
  },

  /** Destroy all charts */
  destroyAll() {
    if (this.pieChart) { this.pieChart.destroy(); this.pieChart = null; }
    if (this.lineChart) { this.lineChart.destroy(); this.lineChart = null; }
    if (this.barChart) { this.barChart.destroy(); this.barChart = null; }
  }
};
