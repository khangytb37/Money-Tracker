// ============================================
// MONEY TRACKER - Export Module
// CSV and PDF export functionality
// ============================================

const ExportModule = {
  /** Export transactions to CSV */
  exportCSV() {
    const transactions = DataManager.getTransactions();
    if (transactions.length === 0) {
      UI.showToast('Không có dữ liệu để xuất', 'warning');
      return;
    }

    // CSV header
    const headers = ['Ngày', 'Loại', 'Danh mục', 'Số tiền', 'Ghi chú'];
    const rows = [headers];

    transactions.forEach(t => {
      const cat = DataManager.getCategory(t.category);
      rows.push([
        UI.formatDate(t.date),
        t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        cat.name,
        (t.type === 'income' ? '+' : '-') + t.amount,
        t.note || ''
      ]);
    });

    // Convert to CSV string
    const csv = rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Add BOM for Excel to recognize UTF-8
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `money_tracker_${UI.todayStr()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    UI.showToast('Xuất CSV thành công!', 'success');
  },

  /** Export transactions to PDF */
  exportPDF() {
    const transactions = DataManager.getTransactions();
    if (transactions.length === 0) {
      UI.showToast('Không có dữ liệu để xuất', 'warning');
      return;
    }

    // We'll create an HTML document styled for printing, then print to PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      UI.showToast('Trình duyệt chặn cửa sổ mới. Vui lòng cho phép popup.', 'error');
      return;
    }

    const stats = DataManager.getMonthlyStats(
      new Date().getFullYear(),
      new Date().getMonth()
    );
    const user = DataManager.getUser();

    let rows = '';
    transactions.slice(0, 100).forEach(t => {
      const cat = DataManager.getCategory(t.category);
      const sign = t.type === 'income' ? '+' : '-';
      const color = t.type === 'income' ? '#10b981' : '#ef4444';
      rows += `
        <tr>
          <td>${UI.formatDate(t.date)}</td>
          <td>${t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</td>
          <td>${cat.icon} ${cat.name}</td>
          <td style="color:${color};font-weight:600">${sign}${UI.formatCurrency(t.amount)}</td>
          <td>${t.note || '-'}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Money Tracker - Báo cáo tài chính</title>
        <style>
          @page { margin: 20mm 15mm; }
          body {
            font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
            color: #1a1a2e;
            line-height: 1.6;
            padding: 0;
            margin: 0;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #6366f1;
            margin-bottom: 24px;
          }
          .header h1 {
            margin: 0;
            background: linear-gradient(135deg, #6366f1, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 24px;
          }
          .header p { color: #64748b; margin: 4px 0; }
          .stats {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 24px;
          }
          .stat-box {
            flex: 1;
            padding: 12px 16px;
            border-radius: 12px;
            background: #f8f9fa;
            text-align: center;
          }
          .stat-box h3 { font-size: 12px; color: #64748b; margin: 0 0 4px; }
          .stat-box .value { font-size: 18px; font-weight: 700; }
          .stat-box .value.green { color: #10b981; }
          .stat-box .value.red { color: #ef4444; }
          .stat-box .value.blue { color: #6366f1; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background: #f0f2f5;
            padding: 10px 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
          }
          td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 Money Tracker</h1>
          <p>Báo cáo tài chính - ${user.name}</p>
          <p>Ngày xuất: ${UI.formatDate(UI.todayStr())}</p>
        </div>
        <div class="stats">
          <div class="stat-box">
            <h3>Số dư hiện tại</h3>
            <div class="value blue">${UI.formatCurrency(DataManager.getBalance())}</div>
          </div>
          <div class="stat-box">
            <h3>Thu nhập tháng này</h3>
            <div class="value green">${UI.formatCurrency(stats.totalIncome)}</div>
          </div>
          <div class="stat-box">
            <h3>Chi tiêu tháng này</h3>
            <div class="value red">${UI.formatCurrency(stats.totalExpense)}</div>
          </div>
        </div>
        <h2 style="font-size:16px;margin-bottom:12px;">Lịch sử giao dịch</h2>
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Danh mục</th>
              <th>Số tiền</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        ${transactions.length > 100 ? `<p style="text-align:center;color:#94a3b8;margin-top:12px;">Hiển thị 100 giao dịch gần nhất</p>` : ''}
        <div class="footer">
          <p>Được tạo bởi Money Tracker - Ứng dụng quản lý tài chính cho sinh viên</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        <\\/script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    UI.showToast('Đang mở báo cáo PDF...', 'info');
  }
};
