<div align="center">

# 💰 Money Tracker

**Smart Personal Finance Management Web App for Students**

*Track income & expenses, set savings goals, analyze cash flow visually, and export professional reports — running 100% in the browser with zero backend required.*

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Chart.js_4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/LocalStorage-Offline_First-10B981?style=for-the-badge" alt="LocalStorage" />
</p>

<p>
  <a href="#-key-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-achievement-system">Achievements</a> •
  <a href="#-contributing">Contributing</a>
</p>

</div>

---

## 📖 Overview

**Money Tracker** is a modern personal finance web application designed with a **Glassmorphism** aesthetic and tailored for students. It helps you stay on top of your daily cash flow — from logging income and expenses to planning savings goals and gaining smart financial insights.

All data is stored securely in your browser via `localStorage` and **isolated per user account**, so you can start using it immediately without setting up any server or database.

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🏠 Landing Page & Local Auth</h3>
      <ul>
        <li>Modern landing page featuring animated gradient orbs and floating preview cards.</li>
        <li>Built-in local <strong>Sign Up / Sign In</strong> system with per-user isolated storage.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📊 Dashboard & Transactions</h3>
      <ul>
        <li>Real-time tracking of current balance, total income, and total expenses.</li>
        <li>Add, edit, and delete transactions effortlessly across <strong>13 categories</strong> (8 expense, 5 income).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>📈 Interactive Charts (Chart.js)</h3>
      <ul>
        <li><strong>Doughnut Chart:</strong> Expense breakdown by category.</li>
        <li><strong>Line Chart:</strong> Daily spending trends throughout the month.</li>
        <li><strong>Bar Chart:</strong> Monthly income vs. expense comparison.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📅 Expense Calendar & Advanced Filters</h3>
      <ul>
        <li>View daily transaction history directly on a monthly calendar layout.</li>
        <li>Search by note or category, and filter by type, month/year, or custom date range.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🎯 Savings Goals</h3>
      <ul>
        <li>Create financial goals with custom icons, target amounts, and deadlines.</li>
        <li>Visual progress bars to monitor completion percentage every day.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🧠 Smart Financial Analysis</h3>
      <ul>
        <li>Automatically highlights your top spending category, highest-spend day, and average savings.</li>
        <li>Generates <strong>personalized financial advice</strong> based on your actual spending data.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>📤 CSV & PDF Report Export</h3>
      <ul>
        <li><strong>CSV Export:</strong> Includes UTF-8 BOM for seamless Vietnamese character rendering in Excel.</li>
        <li><strong>PDF Export:</strong> Generates a clean, print-ready financial report in one click.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🌗 Light / Dark Mode & Settings</h3>
      <ul>
        <li>Smooth switching between <strong>Light Mode</strong> and <strong>Dark Mode</strong>.</li>
        <li>Update user profile details or reset all stored data anytime.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏆 Achievement System

Built-in **Gamification** makes managing money engaging with 6 unlockable badges:

| Badge | Achievement | Unlock Condition |
| :---: | :--- | :--- |
| 🏆 | **First Savings** (`Tiết kiệm đầu tiên`) | Reach a total balance of `1,000,000₫` |
| 💎 | **Smart Saver** (`Nhà tiết kiệm`) | Reach a total balance of `5,000,000₫` |
| 👑 | **Savings Master** (`Chuyên gia tiết kiệm`) | Reach a total balance of `10,000,000₫` |
| 🔥 | **Disciplined Spender** (`Chi tiêu có kỷ luật`) | Maintain a `7-day` streak without overspending |
| 🎯 | **First Goal Reached** (`Cán đích đầu tiên`) | Complete your first savings goal |
| 📊 | **Consistent Tracker** (`Theo dõi đều đặn`) | Log `30` or more transactions |

---

## 🛠 Tech Stack

- **Frontend Core:** HTML5, CSS3 (CSS Variables, Flexbox, Grid, Glassmorphism UI), Vanilla JavaScript (ES6+ Modular)
- **Data Visualization:** [Chart.js 4.4.0](https://www.chartjs.org/)
- **Icons & Typography:** [Font Awesome 6.5.0](https://fontawesome.com/) & [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)
- **Storage:** Browser `localStorage` with per-user namespaced keys (`mt_<username>_*`)

---

## 📂 Project Structure

```text
Money-Tracker/
├── index.html          # Main UI structure (Landing Page, 9 App Pages, Modals)
├── css/
│   └── style.css       # Design system, Light/Dark themes, animations & responsive layout
├── js/
│   ├── data.js         # LocalStorage data layer, categories & achievement logic
│   ├── charts.js       # Chart.js visualizations (Doughnut, Line, Bar)
│   ├── export.js       # CSV (UTF-8 BOM) & PDF report export module
│   ├── ui.js           # UI helpers (Modals, Toast notifications, currency formatting)
│   └── app.js          # App controller, page routing & local authentication
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

Built entirely with **Vanilla HTML / CSS / JavaScript**, this project requires no Node.js or build tools.

### Option 1: Run Directly
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/Money-Tracker.git
   ```
2. Open the project folder and double-click `index.html` to launch it in your browser.

### Option 2: Run with Live Server (Recommended)
1. Open the `Money-Tracker` folder in **VS Code**.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` → select **Open with Live Server**.

---

## 📸 Screenshots

> 💡 *Tip: Capture screenshots of your Dashboard, Charts, and Dark Mode, save them in an `assets/` folder, and embed them here to make your repository even more eye-catching!*

```markdown
<!-- Example:
![Dashboard Preview](assets/dashboard.png)
-->
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome!
1. **Fork** the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

---

<div align="center">

**If you find this project helpful, please consider giving it a ⭐ Star on GitHub!**

Made with ❤️ for Students

</div>
