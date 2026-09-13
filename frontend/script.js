const API_URL = "/api";

let authToken = localStorage.getItem("authToken");
let currentUser = null;
let transactions = [];
let currentTypeFilter = "all";
let currentCategoryFilter = "all";
let editingTransactionId = null;
let monthlyChart = null;
let categoryChart = null;

const $ = (id) => document.getElementById(id);

const authSection = $("authSection");
const dashboardSection = $("dashboardSection");

const tabLogin = $("tabLogin");
const tabRegister = $("tabRegister");

const loginForm = $("loginForm");
const registerForm = $("registerForm");

const loginSubmitBtn = $("loginSubmitBtn");
const registerSubmitBtn = $("registerSubmitBtn");

const loginError = $("loginError");

const googleSignInButton =
  $("googleSignInButton");

const otpLoginToggle =
  $("otpLoginToggle");

const otpLoginForm =
  $("otpLoginForm");

const otpEmail =
  $("otpEmail");

const otpError =
  $("otpError");

const sendOtpBtn =
  $("sendOtpBtn");

const otpCodeGroup =
  $("otpCodeGroup");

const otpCode =
  $("otpCode");

const verifyOtpBtn =
  $("verifyOtpBtn");

const otpBackBtn =
  $("otpBackBtn");

const userNav =
  $("userNav");

const userGreeting =
  $("userGreeting");

const logoutBtn =
  $("logoutBtn");

const transactionForm =
  $("transactionForm");

const formTitle =
  $("formTitle");

const cancelEditBtn =
  $("cancelEditBtn");

const txSubmitBtn =
  $("txSubmitBtn");

const txAmount =
  $("txAmount");

const txCategory =
  $("txCategory");

const txDescription =
  $("txDescription");

const txDate =
  $("txDate");

const totalBalance =
  $("totalBalance");

const totalIncome =
  $("totalIncome");

const totalExpenses =
  $("totalExpenses");

const txList =
  $("txList");

const emptyState =
  $("emptyState");

const txCountBadge =
  $("txCountBadge");

const categoryFilter =
  $("categoryFilter");

const toastContainer =
  $("toastContainer");

const typeExpenseLabel =
  $("typeExpenseLabel");

const typeIncomeLabel =
  $("typeIncomeLabel");

const monthlyChartCanvas =
  $("monthlyChart");

const categoryChartCanvas =
  $("categoryChart");

const categoryChartSubtitle =
  $("categoryChartSubtitle");

const monthlyIncomeElement =
  $("monthlyIncome");

const monthlyExpensesElement =
  $("monthlyExpenses");

const monthlySavingsElement =
  $("monthlySavings");

const monthlySavingsRateElement =
  $("monthlySavingsRate");

const themeToggleInput =
  $("themeToggleInput");

const filterButtons =
  document.querySelectorAll(
    "[data-type-filter]"
  );

const expenseCategories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Other"
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Other"
];

function showToast(
  message,
  type = "success"
) {
  if (!toastContainer) return;

  const toast =
    document.createElement("div");

  toast.className =
    `toast ${type}`;

  toast.textContent =
    message;

  toastContainer.appendChild(
    toast
  );

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function setLoading(
  button,
  loading,
  text
) {
  if (!button) return;

  if (loading) {
    button.disabled = true;

    button.dataset.originalText =
      button.textContent;

    button.textContent =
      text;
  } else {
    button.disabled = false;

    button.textContent =
      button.dataset.originalText ||
      button.textContent;
  }
}

async function apiRequest(
  endpoint,
  options = {}
) {
  const headers = {
    "Content-Type":
      "application/json",
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization =
      `Bearer ${authToken}`;
  }

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {
      message:
        "The server returned an invalid response."
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Something went wrong."
    );
  }

  return data;
}

function showLoginForm() {
  tabLogin?.classList.add("active");
  tabRegister?.classList.remove("active");

  tabLogin?.setAttribute(
    "aria-selected",
    "true"
  );

  tabRegister?.setAttribute(
    "aria-selected",
    "false"
  );

  loginForm?.classList.remove(
    "hidden"
  );

  registerForm?.classList.add(
    "hidden"
  );

  otpLoginForm?.classList.add(
    "hidden"
  );
}

function showRegisterForm() {
  tabRegister?.classList.add(
    "active"
  );

  tabLogin?.classList.remove(
    "active"
  );

  tabRegister?.setAttribute(
    "aria-selected",
    "true"
  );

  tabLogin?.setAttribute(
    "aria-selected",
    "false"
  );

  registerForm?.classList.remove(
    "hidden"
  );

  loginForm?.classList.add(
    "hidden"
  );

  otpLoginForm?.classList.add(
    "hidden"
  );
}

function showOtpForm() {
  loginForm?.classList.add(
    "hidden"
  );

  otpLoginForm?.classList.remove(
    "hidden"
  );

  if (otpError) {
    otpError.textContent = "";

    otpError.classList.add(
      "hidden"
    );
  }

  otpCodeGroup?.classList.add(
    "hidden"
  );

  verifyOtpBtn?.classList.add(
    "hidden"
  );

  if (otpCode) {
    otpCode.value = "";
  }

  const loginEmail =
    $("loginEmail");

  if (
    loginEmail &&
    otpEmail &&
    loginEmail.value.trim()
  ) {
    otpEmail.value =
      loginEmail.value.trim();
  }

  otpEmail?.focus();
}

function showPasswordLoginForm() {
  otpLoginForm?.classList.add(
    "hidden"
  );

  loginForm?.classList.remove(
    "hidden"
  );

  if (otpError) {
    otpError.textContent = "";

    otpError.classList.add(
      "hidden"
    );
  }
}

function showDashboard() {
  authSection?.classList.add(
    "hidden"
  );

  dashboardSection?.classList.remove(
    "hidden"
  );

  userNav?.classList.remove(
    "hidden"
  );

  if (authSection) {
    authSection.style.display =
      "none";
  }

  if (dashboardSection) {
    dashboardSection.style.display =
      "";
  }

  if (userNav) {
    userNav.style.display =
      "";
  }

  if (
    currentUser &&
    userGreeting
  ) {
    userGreeting.textContent =
      `Welcome, ${currentUser.name}`;
  }
}

function showAuth() {
  authSection?.classList.remove(
    "hidden"
  );

  dashboardSection?.classList.add(
    "hidden"
  );

  userNav?.classList.add(
    "hidden"
  );

  if (authSection) {
    authSection.style.display =
      "";
  }

  if (dashboardSection) {
    dashboardSection.style.display =
      "none";
  }

  if (userNav) {
    userNav.style.display =
      "none";
  }
}

function getSelectedType() {
  const selected =
    document.querySelector(
      'input[name="txType"]:checked'
    );

  return selected?.value ||
    "expense";
}

function updateTypeStyles() {
  const type =
    getSelectedType();

  typeExpenseLabel?.classList.toggle(
    "expense-active",
    type === "expense"
  );

  typeIncomeLabel?.classList.toggle(
    "income-active",
    type === "income"
  );
}

function populateTransactionCategories(
  selectedCategory = ""
) {
  if (!txCategory) return;

  const categories =
    getSelectedType() === "income"
      ? incomeCategories
      : expenseCategories;

  txCategory.innerHTML = "";

  categories.forEach(
    (category) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        category;

      option.textContent =
        category;

      if (
        category ===
        selectedCategory
      ) {
        option.selected = true;
      }

      txCategory.appendChild(
        option
      );
    }
  );

  if (
    !selectedCategory &&
    categories.length
  ) {
    txCategory.value =
      categories[0];
  }

  refreshCustomSelect(
    txCategory
  );
}

function formatCurrency(
  amount
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }
  ).format(
    Number(amount) || 0
  );
}

function formatDate(
  value
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function getMonthKey(
  value
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(
  value
) {
  const [year, month] =
    value
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "2-digit"
    }
  );
}

function getLastSixMonths() {
  const result = [];

  const now =
    new Date();

  now.setDate(1);

  for (
    let i = 5;
    i >= 0;
    i--
  ) {
    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

    result.push(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`
    );
  }

  return result;
}

function calculateMonthlyData() {
  const months =
    getLastSixMonths();

  const result =
    months.map(
      (month) => ({
        month,
        income: 0,
        expense: 0
      })
    );

  transactions.forEach(
    (transaction) => {
      const month =
        getMonthKey(
          transaction.date
        );

      const item =
        result.find(
          (entry) =>
            entry.month ===
            month
        );

      if (!item) {
        return;
      }

      const amount =
        Number(
          transaction.amount
        ) || 0;

      if (
        transaction.type ===
        "income"
      ) {
        item.income +=
          amount;
      }

      if (
        transaction.type ===
        "expense"
      ) {
        item.expense +=
          amount;
      }
    }
  );

  return result;
}

function updateMonthlySummary() {
  const currentMonth =
    getMonthKey(
      new Date()
    );

  let income = 0;
  let expense = 0;

  transactions.forEach(
    (transaction) => {
      if (
        getMonthKey(
          transaction.date
        ) !== currentMonth
      ) {
        return;
      }

      const amount =
        Number(
          transaction.amount
        ) || 0;

      if (
        transaction.type ===
        "income"
      ) {
        income += amount;
      }

      if (
        transaction.type ===
        "expense"
      ) {
        expense += amount;
      }
    }
  );

  const savings =
    income - expense;

  const rate =
    income > 0
      ? (savings / income) *
        100
      : 0;

  if (
    monthlyIncomeElement
  ) {
    monthlyIncomeElement.textContent =
      formatCurrency(
        income
      );
  }

  if (
    monthlyExpensesElement
  ) {
    monthlyExpensesElement.textContent =
      formatCurrency(
        expense
      );
  }

  if (
    monthlySavingsElement
  ) {
    monthlySavingsElement.textContent =
      formatCurrency(
        savings
      );
  }

  if (
    monthlySavingsRateElement
  ) {
    monthlySavingsRateElement.textContent =
      `${rate.toFixed(1)}%`;
  }
}

function getChartColors() {
  const isLight =
    themeToggleInput &&
    themeToggleInput.checked;

  return {
    text:
      isLight
        ? "#334155"
        : "#f2f5fa",

    muted:
      isLight
        ? "#64748b"
        : "#8d96a8",

    grid:
      isLight
        ? "rgba(15,23,42,.07)"
        : "rgba(255,255,255,.055)",

    border:
      isLight
        ? "rgba(15,23,42,.12)"
        : "rgba(255,255,255,.10)",

    tooltip:
      isLight
        ? "rgba(255,255,255,.98)"
        : "rgba(15,23,42,.98)"
  };
}

function renderMonthlyChart() {
  if (
    !monthlyChartCanvas ||
    typeof Chart ===
      "undefined"
  ) {
    return;
  }

  monthlyChart?.destroy();

  const colors =
    getChartColors();

  const data =
    calculateMonthlyData();

  const currentMonth =
    getMonthKey(
      new Date()
    );

  const ctx =
    monthlyChartCanvas.getContext(
      "2d"
    );

  const incomeGradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      360
    );

  incomeGradient.addColorStop(
    0,
    "rgba(52,211,153,1)"
  );

  incomeGradient.addColorStop(
    0.45,
    "rgba(52,211,153,.82)"
  );

  incomeGradient.addColorStop(
    1,
    "rgba(52,211,153,.30)"
  );

  const expenseGradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      360
    );

  expenseGradient.addColorStop(
    0,
    "rgba(251,113,102,1)"
  );

  expenseGradient.addColorStop(
    0.45,
    "rgba(251,113,102,.82)"
  );

  expenseGradient.addColorStop(
    1,
    "rgba(251,113,102,.30)"
  );

  const incomeBorders =
    data.map(
      (item) =>
        item.month ===
        currentMonth
          ? "rgba(52,211,153,1)"
          : "rgba(52,211,153,.72)"
    );

  const expenseBorders =
    data.map(
      (item) =>
        item.month ===
        currentMonth
          ? "rgba(251,113,102,1)"
          : "rgba(251,113,102,.72)"
    );

  monthlyChart =
    new Chart(
      monthlyChartCanvas,
      {
        type: "bar",

        data: {
          labels:
            data.map(
              (item) =>
                getMonthLabel(
                  item.month
                )
            ),

          datasets: [
            {
              label:
                "Income",

              data:
                data.map(
                  (item) =>
                    item.income
                ),

              backgroundColor:
                incomeGradient,

              borderColor:
                incomeBorders,

              borderWidth:
                data.map(
                  (item) =>
                    item.month ===
                    currentMonth
                      ? 2
                      : 1
                ),

              borderRadius: {
                topLeft: 11,
                topRight: 11,
                bottomLeft: 5,
                bottomRight: 5
              },

              borderSkipped:
                false,

              barPercentage:
                0.78,

              categoryPercentage:
                0.62,

              maxBarThickness:
                30
            },

            {
              label:
                "Expense",

              data:
                data.map(
                  (item) =>
                    item.expense
                ),

              backgroundColor:
                expenseGradient,

              borderColor:
                expenseBorders,

              borderWidth:
                data.map(
                  (item) =>
                    item.month ===
                    currentMonth
                      ? 2
                      : 1
                ),

              borderRadius: {
                topLeft: 11,
                topRight: 11,
                bottomLeft: 5,
                bottomRight: 5
              },

              borderSkipped:
                false,

              barPercentage:
                0.78,

              categoryPercentage:
                0.62,

              maxBarThickness:
                30
            }
          ]
        },

        options: {
          responsive:
            true,

          maintainAspectRatio:
            false,

          animation: {
            duration:
              850,

            easing:
              "easeOutQuart"
          },

          interaction: {
            mode:
              "nearest",

            intersect:
              true
          },

          layout: {
            padding: {
              top: 8,
              left: 4,
              right: 8,
              bottom: 2
            }
          },

          plugins: {
            legend: {
              position:
                "top",

              align:
                "center",

              labels: {
                color:
                  colors.text,

                usePointStyle:
                  true,

                pointStyle:
                  "circle",

                boxWidth:
                  9,

                boxHeight:
                  9,

                padding:
                  18,

                font: {
                  size:
                    12,

                  weight:
                    "600"
                }
              }
            },

            tooltip: {
              enabled:
                true,

              backgroundColor:
                colors.tooltip,

              titleColor:
                colors.text,

              bodyColor:
                colors.text,

              borderColor:
                colors.border,

              borderWidth:
                1,

              cornerRadius:
                12,

              padding:
                12,

              displayColors:
                true,

              caretPadding:
                8,

              callbacks: {
                title(
                  tooltipItems
                ) {
                  return (
                    tooltipItems[0]?.label ||
                    ""
                  );
                },

                label(context) {
                  return ` ${
                    context.dataset.label
                  }: ${formatCurrency(
                    context.parsed.y
                  )}`;
                }
              }
            }
          },

          scales: {
            x: {
              offset:
                true,

              grid: {
                display:
                  false
              },

              border: {
                display:
                  false
              },

              ticks: {
                color:
                  colors.muted,

                padding:
                  10,

                font: {
                  size:
                    11,

                  weight:
                    "500"
                },

                callback(
                  value,
                  index
                ) {
                  const month =
                    data[index];

                  const label =
                    getMonthLabel(
                      month.month
                    );

                  return label;
                }
              }
            },

            y: {
              beginAtZero:
                true,

              grace:
                "14%",

              grid: {
                color:
                  colors.grid,

                drawTicks:
                  false,

                lineWidth:
                  1
              },

              border: {
                display:
                  false
              },

              ticks: {
                color:
                  colors.muted,

                padding:
                  10,

                maxTicksLimit:
                  6,

                font: {
                  size:
                    10,

                  weight:
                    "500"
                },

                callback(value) {
                  const amount =
                    Number(
                      value
                    ) || 0;

                  if (
                    amount >=
                    100000
                  ) {
                    return `₹${(
                      amount /
                      100000
                    ).toFixed(1)}L`;
                  }

                  if (
                    amount >=
                    1000
                  ) {
                    return `₹${(
                      amount /
                      1000
                    ).toFixed(0)}K`;
                  }

                  return `₹${amount}`;
                }
              }
            }
          }
        }
      }
    );
}

function createCategoryTooltip(
  chart,
  transaction,
  value,
  percentage,
  colors
) {
  let tooltipEl =
    chart.canvas.parentNode.querySelector(
      ".expense-chart-tooltip"
    );

  if (!tooltipEl) {
    tooltipEl =
      document.createElement(
        "div"
      );

    tooltipEl.className =
      "expense-chart-tooltip";

    chart.canvas.parentNode.style.position =
      "relative";

    chart.canvas.parentNode.appendChild(
      tooltipEl
    );
  }

  Object.assign(
    tooltipEl.style,
    {
      position:
        "absolute",

      pointerEvents:
        "none",

      zIndex:
        "100",

      minWidth:
        "165px",

      maxWidth:
        "205px",

      padding:
        "10px 12px",

      borderRadius:
        "12px",

      opacity:
        "0",

      background:
        colors.tooltip,

      color:
        colors.text,

      border:
        `1px solid ${colors.border}`,

      boxShadow:
        themeToggleInput?.checked
          ? "0 12px 30px rgba(15,23,42,.14)"
          : "0 12px 30px rgba(0,0,0,.32)",

      fontFamily:
        "inherit"
    }
  );

  tooltipEl.innerHTML =
    `
    <div style="
      font-size:12px;
      font-weight:700;
      color:${colors.text};
      margin-bottom:6px;
    ">
      ${
        transaction.description ||
        "Expense"
      }
    </div>

    <div style="
      font-size:12px;
      line-height:1.6;
      color:${colors.muted};
    ">
      <div>
        <strong style="color:${colors.text}">
          Amount:
        </strong>
        ${formatCurrency(value)}
      </div>

      <div>
        <strong style="color:${colors.text}">
          Category:
        </strong>
        ${
          transaction.category ||
          "Other"
        }
      </div>

      <div>
        <strong style="color:${colors.text}">
          Share:
        </strong>
        ${percentage}%
      </div>
    </div>
  `;

  return tooltipEl;
}

function renderCategoryChart() {
  if (
    !categoryChartCanvas ||
    typeof Chart ===
      "undefined"
  ) {
    return;
  }

  categoryChart?.destroy();

  const currentMonth =
    getMonthKey(
      new Date()
    );

  const expenseTransactions =
    transactions.filter(
      (transaction) =>
        transaction.type ===
          "expense" &&
        getMonthKey(
          transaction.date
        ) === currentMonth
    );

  const colors =
    getChartColors();

  const isLight =
    themeToggleInput &&
    themeToggleInput.checked;

  if (
    !expenseTransactions.length
  ) {
    categoryChart =
      new Chart(
        categoryChartCanvas,
        {
          type:
            "doughnut",

          data: {
            labels: [
              "No expenses"
            ],

            datasets: [
              {
                data: [1],

                backgroundColor: [
                  isLight
                    ? "rgba(100,116,139,.12)"
                    : "rgba(148,163,184,.12)"
                ],

                borderWidth:
                  0
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            cutout:
              "68%",

            plugins: {
              legend: {
                display:
                  false
              },

              tooltip: {
                enabled:
                  false
              }
            }
          }
        }
      );

    if (
      categoryChartSubtitle
    ) {
      categoryChartSubtitle.textContent =
        "No expenses this month";
    }

    return;
  }

  const labels =
    expenseTransactions.map(
      (transaction) =>
        transaction.description ||
        transaction.category ||
        "Expense"
    );

  const values =
    expenseTransactions.map(
      (transaction) =>
        Number(
          transaction.amount
        ) || 0
    );

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const palette = [
    "#22c7e6",
    "#3b82f6",
    "#34d399",
    "#d9b26a",
    "#fb7166",
    "#a78bfa",
    "#f472b6",
    "#f59e0b",
    "#14b8a6",
    "#8b5cf6"
  ];

  const backgroundColors =
    labels.map(
      (_, index) =>
        palette[
          index %
            palette.length
        ]
    );

  const centerTextPlugin = {
    id:
      "expenseCenterText",

    afterDraw(chart) {
      const area =
        chart.chartArea;

      if (!area) return;

      const ctx =
        chart.ctx;

      const x =
        (area.left +
          area.right) /
        2;

      const y =
        (area.top +
          area.bottom) /
        2;

      ctx.save();

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillStyle =
        colors.text;

      ctx.font =
        "600 20px 'Space Grotesk', sans-serif";

      ctx.fillText(
        formatCurrency(total),
        x,
        y - 10
      );

      ctx.fillStyle =
        colors.muted;

      ctx.font =
        "500 11px Inter, sans-serif";

      ctx.fillText(
        `${expenseTransactions.length} ${
          expenseTransactions.length ===
          1
            ? "Expense"
            : "Expenses"
        }`,
        x,
        y + 17
      );

      ctx.restore();
    }
  };

  categoryChart =
    new Chart(
      categoryChartCanvas,
      {
        type:
          "doughnut",

        plugins: [
          centerTextPlugin
        ],

        data: {
          labels,

          datasets: [
            {
              data:
                values,

              backgroundColor:
                backgroundColors,

              borderColor:
                isLight
                  ? "rgba(15,23,42,.10)"
                  : "rgba(3,10,18,.60)",

              borderWidth:
                2,

              borderRadius:
                12,

              spacing:
                5,

              offset:
                labels.map(
                  () => 5
                ),

              hoverOffset:
                9,

              hoverBorderWidth:
                3,

              hoverBorderColor:
                isLight
                  ? "#ffffff"
                  : "#111827"
            }
          ]
        },

        options: {
          responsive:
            true,

          maintainAspectRatio:
            false,

          cutout:
            "62%",

          rotation:
            -90,

          animation: {
            animateRotate:
              true,

            animateScale:
              true,

            duration:
              850,

            easing:
              "easeOutQuart"
          },

          layout: {
            padding:
              8
          },

          plugins: {
            legend: {
              position:
                "bottom",

              labels: {
                color:
                  colors.text,

                usePointStyle:
                  true,

                pointStyle:
                  "circle",

                boxWidth:
                  9,

                boxHeight:
                  9,

                padding:
                  10,

                font: {
                  size:
                    10,

                  weight:
                    "600"
                }
              }
            },

            tooltip: {
              enabled:
                false,

              external(context) {
                const {
                  chart,
                  tooltip
                } = context;

                let tooltipEl =
                  chart.canvas.parentNode.querySelector(
                    ".expense-chart-tooltip"
                  );

                if (
                  tooltip.opacity ===
                  0
                ) {
                  if (tooltipEl) {
                    tooltipEl.style.opacity =
                      "0";
                  }

                  return;
                }

                const point =
                  tooltip.dataPoints?.[0];

                if (!point) return;

                const index =
                  point.dataIndex;

                const transaction =
                  expenseTransactions[
                    index
                  ];

                if (!transaction) {
                  return;
                }

                const value =
                  Number(
                    transaction.amount
                  ) || 0;

                const percentage =
                  total > 0
                    ? (
                        (value /
                          total) *
                        100
                      ).toFixed(1)
                    : "0.0";

                tooltipEl =
                  createCategoryTooltip(
                    chart,
                    transaction,
                    value,
                    percentage,
                    colors
                  );

                const canvasWidth =
                  chart.canvas
                    .offsetWidth;

                const canvasHeight =
                  chart.canvas
                    .offsetHeight;

                const tooltipWidth =
                  tooltipEl
                    .offsetWidth ||
                  185;

                const tooltipHeight =
                  tooltipEl
                    .offsetHeight ||
                  90;

                const centerX =
                  canvasWidth / 2;

                const centerY =
                  canvasHeight / 2;

                let left;
                let top;

                const isLeft =
                  tooltip.caretX <
                  centerX;

                const nearCenter =
                  Math.abs(
                    tooltip.caretY -
                      centerY
                  ) <
                  tooltipHeight;

                if (isLeft) {
                  left = 10;
                } else {
                  left =
                    canvasWidth -
                    tooltipWidth -
                    10;
                }

                if (nearCenter) {
                  top =
                    tooltip.caretY <
                    centerY
                      ? 10
                      : canvasHeight -
                        tooltipHeight -
                        10;
                } else {
                  top =
                    tooltip.caretY -
                    tooltipHeight / 2;
                }

                left =
                  Math.max(
                    10,
                    Math.min(
                      left,
                      canvasWidth -
                        tooltipWidth -
                        10
                    )
                  );

                top =
                  Math.max(
                    10,
                    Math.min(
                      top,
                      canvasHeight -
                        tooltipHeight -
                        10
                    )
                  );

                tooltipEl.style.left =
                  `${left}px`;

                tooltipEl.style.top =
                  `${top}px`;

                tooltipEl.style.opacity =
                  "1";
              }
            }
          }
        }
      }
    );

  if (
    categoryChartSubtitle
  ) {
    categoryChartSubtitle.textContent =
      `${formatCurrency(total)} spent across ${
        expenseTransactions.length
      } ${
        expenseTransactions.length ===
        1
          ? "expense"
          : "expenses"
      } this month`;
  }
}

function updateChartTheme() {
  renderMonthlyChart();
  renderCategoryChart();
}

function updateSummary() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(
    (transaction) => {
      const amount =
        Number(
          transaction.amount
        ) || 0;

      if (
        transaction.type ===
        "income"
      ) {
        income += amount;
      }

      if (
        transaction.type ===
        "expense"
      ) {
        expenses += amount;
      }
    }
  );

  if (totalIncome) {
    totalIncome.textContent =
      `+${formatCurrency(
        income
      )}`;
  }

  if (totalExpenses) {
    totalExpenses.textContent =
      `-${formatCurrency(
        expenses
      )}`;
  }

  if (totalBalance) {
    totalBalance.textContent =
      formatCurrency(
        income -
          expenses
      );
  }

  updateMonthlySummary();
  renderMonthlyChart();
  renderCategoryChart();
}

function getFilteredTransactions() {
  return transactions.filter(
    (transaction) => {
      const typeMatch =
        currentTypeFilter ===
          "all" ||
        transaction.type ===
          currentTypeFilter;

      const categoryMatch =
        currentCategoryFilter ===
          "all" ||
        transaction.category ===
          currentCategoryFilter;

      return (
        typeMatch &&
        categoryMatch
      );
    }
  );
}

function renderTransactions() {
  if (!txList) return;

  const filtered =
    getFilteredTransactions();

  txList.innerHTML =
    "";

  emptyState?.classList.toggle(
    "hidden",
    filtered.length > 0
  );

  if (txCountBadge) {
    txCountBadge.textContent =
      `${filtered.length} ${
        filtered.length ===
        1
          ? "record"
          : "records"
      }`;
  }

  filtered.forEach(
    (transaction) => {
      const item =
        document.createElement(
          "li"
        );

      item.className =
        "transaction-item";

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "transaction-info";

      const description =
        document.createElement(
          "div"
        );

      description.className =
        "transaction-description";

      description.textContent =
        transaction.description;

      const meta =
        document.createElement(
          "div"
        );

      meta.className =
        "transaction-meta";

      const category =
        document.createElement(
          "span"
        );

      category.textContent =
        transaction.category;

      const date =
        document.createElement(
          "span"
        );

      date.textContent =
        formatDate(
          transaction.date
        );

      meta.append(
        category,
        date
      );

      info.append(
        description,
        meta
      );

      const amount =
        document.createElement(
          "span"
        );

      amount.className =
        `transaction-amount ${transaction.type}`;

      amount.textContent =
        transaction.type ===
        "income"
          ? `+${formatCurrency(
              transaction.amount
            )}`
          : `-${formatCurrency(
              transaction.amount
            )}`;

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "transaction-actions";

      const editBtn =
        document.createElement(
          "button"
        );

      editBtn.type =
        "button";

      editBtn.textContent =
        "Edit";

      editBtn.addEventListener(
        "click",
        () =>
          startEditingTransaction(
            transaction
          )
      );

      const deleteBtn =
        document.createElement(
          "button"
        );

      deleteBtn.type =
        "button";

      deleteBtn.className =
        "delete-btn";

      deleteBtn.textContent =
        "Delete";

      deleteBtn.addEventListener(
        "click",
        () =>
          deleteTransaction(
            transaction._id
          )
      );

      actions.append(
        editBtn,
        deleteBtn
      );

      item.append(
        info,
        amount,
        actions
      );

      txList.appendChild(
        item
      );
    }
  );
}

function resetTransactionForm() {
  editingTransactionId =
    null;

  transactionForm?.reset();

  if (formTitle) {
    formTitle.textContent =
      "Add Transaction";
  }

  if (txSubmitBtn) {
    txSubmitBtn.textContent =
      "+ Add Transaction";
  }

  cancelEditBtn?.classList.add(
    "hidden"
  );

  const expenseRadio =
    document.querySelector(
      'input[name="txType"][value="expense"]'
    );

  if (expenseRadio) {
    expenseRadio.checked =
      true;
  }

  updateTypeStyles();

  populateTransactionCategories();

  if (txDate) {
    txDate.value =
      new Date()
        .toISOString()
        .split("T")[0];
  }
}

function startEditingTransaction(
  transaction
) {
  editingTransactionId =
    transaction._id;

  if (formTitle) {
    formTitle.textContent =
      "Edit Transaction";
  }

  if (txSubmitBtn) {
    txSubmitBtn.textContent =
      "Save Changes";
  }

  cancelEditBtn?.classList.remove(
    "hidden"
  );

  const radio =
    document.querySelector(
      `input[name="txType"][value="${transaction.type}"]`
    );

  if (radio) {
    radio.checked =
      true;
  }

  updateTypeStyles();

  populateTransactionCategories(
    transaction.category
  );

  if (txAmount) {
    txAmount.value =
      transaction.amount;
  }

  if (txDescription) {
    txDescription.value =
      transaction.description;
  }

  if (transaction.date) {
    const date =
      new Date(
        transaction.date
      );

    if (
      !Number.isNaN(
        date.getTime()
      ) &&
      txDate
    ) {
      txDate.value =
        date
          .toISOString()
          .split("T")[0];
    }
  }

  transactionForm?.scrollIntoView({
    behavior:
      "smooth",

    block:
      "start"
  });
}

async function saveTransaction(
  event
) {
  event.preventDefault();

  const payload = {
    type:
      getSelectedType(),

    amount:
      Number(
        txAmount.value
      ),

    category:
      txCategory.value.trim(),

    description:
      txDescription.value.trim(),

    date:
      txDate.value
  };

  if (
    !Number.isFinite(
      payload.amount
    ) ||
    payload.amount <= 0
  ) {
    showToast(
      "Amount must be greater than 0.",
      "error"
    );

    return;
  }

  if (
    !payload.category ||
    !payload.description ||
    !payload.date
  ) {
    showToast(
      "Please fill in all transaction fields.",
      "error"
    );

    return;
  }

  try {
    setLoading(
      txSubmitBtn,
      true,
      editingTransactionId
        ? "Saving..."
        : "Adding..."
    );

    if (
      editingTransactionId
    ) {
      await apiRequest(
        `/transactions/${editingTransactionId}`,
        {
          method:
            "PUT",

          body:
            JSON.stringify(
              payload
            )
        }
      );

      showToast(
        "Transaction updated successfully."
      );
    } else {
      await apiRequest(
        "/transactions",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      );

      showToast(
        "Transaction added successfully."
      );
    }

    resetTransactionForm();

    await loadTransactions();
  } catch (error) {
    showToast(
      error.message,
      "error"
    );
  } finally {
    setLoading(
      txSubmitBtn,
      false
    );
  }
}

async function deleteTransaction(
  id
) {
  if (!id) return;

  if (
    !confirm(
      "Are you sure you want to delete this transaction?"
    )
  ) {
    return;
  }

  try {
    await apiRequest(
      `/transactions/${id}`,
      {
        method:
          "DELETE"
      }
    );

    if (
      editingTransactionId ===
      id
    ) {
      resetTransactionForm();
    }

    showToast(
      "Transaction deleted successfully."
    );

    await loadTransactions();
  } catch (error) {
    showToast(
      error.message,
      "error"
    );
  }
}

async function loadTransactions() {
  try {
    const data =
      await apiRequest(
        "/transactions"
      );

    transactions =
      Array.isArray(
        data.transactions
      )
        ? data.transactions
        : [];

    populateCategoryFilter();

    updateSummary();

    renderTransactions();
  } catch (error) {
    showToast(
      error.message,
      "error"
    );
  }
}

function populateCategoryFilter() {
  if (!categoryFilter) {
    return;
  }

  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Bills",
    "Entertainment",
    "Salary",
    "Freelance",
    "Other"
  ];

  categoryFilter.innerHTML =
    "";

  const all =
    document.createElement(
      "option"
    );

  all.value =
    "all";

  all.textContent =
    "All Categories";

  categoryFilter.appendChild(
    all
  );

  categories.forEach(
    (category) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        category;

      option.textContent =
        category;

      categoryFilter.appendChild(
        option
      );
    }
  );

  categoryFilter.value =
    currentCategoryFilter;

  refreshCustomSelect(
    categoryFilter
  );
}

function setupCustomSelect(
  select
) {
  if (
    !select ||
    select.dataset.customReady ===
      "true"
  ) {
    return;
  }

  select.dataset.customReady =
    "true";

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "custom-select";

  select.parentNode.insertBefore(
    wrapper,
    select
  );

  wrapper.appendChild(
    select
  );

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "custom-select-button";

  const label =
    document.createElement(
      "span"
    );

  const arrow =
    document.createElement(
      "span"
    );

  arrow.className =
    "custom-select-arrow";

  button.append(
    label,
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "custom-select-menu";

  wrapper.append(
    button,
    menu
  );

  button.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      document
        .querySelectorAll(
          ".custom-select.open"
        )
        .forEach(
          (other) => {
            if (
              other !==
              wrapper
            ) {
              other.classList.remove(
                "open"
              );
            }
          }
        );

      wrapper.classList.toggle(
        "open"
      );
    }
  );

  select.addEventListener(
    "change",
    () => {
      refreshCustomSelect(
        select
      );
    }
  );

  select._customRefresh =
    () => {
      menu.innerHTML =
        "";

      Array.from(
        select.options
      ).forEach(
        (option) => {
          const item =
            document.createElement(
              "button"
            );

          item.type =
            "button";

          item.className =
            "custom-select-option";

          item.textContent =
            option.textContent;

          if (
            option.value ===
            select.value
          ) {
            item.classList.add(
              "selected"
            );
          }

          item.addEventListener(
            "click",
            (event) => {
              event.stopPropagation();

              select.value =
                option.value;

              select.dispatchEvent(
                new Event(
                  "change",
                  {
                    bubbles:
                      true
                  }
                )
              );

              wrapper.classList.remove(
                "open"
              );
            }
          );

          menu.appendChild(
            item
          );
        }
      );

      const selected =
        select.options[
          select.selectedIndex
        ];

      label.textContent =
        selected
          ? selected.textContent
          : "";
    };

  select._customRefresh();
}

function refreshCustomSelect(
  select
) {
  if (
    select &&
    typeof select._customRefresh ===
      "function"
  ) {
    select._customRefresh();
  }
}

document.addEventListener(
  "click",
  () => {
    document
      .querySelectorAll(
        ".custom-select.open"
      )
      .forEach(
        (select) => {
          select.classList.remove(
            "open"
          );
        }
      );
  }
);

async function registerUser(
  event
) {
  event.preventDefault();

  const name =
    $("registerName")
      ?.value
      .trim();

  const email =
    $("registerEmail")
      ?.value
      .trim();

  const password =
    $("registerPassword")
      ?.value;

  if (
    !name ||
    !email ||
    !password
  ) {
    showToast(
      "Please fill in all fields.",
      "error"
    );

    return;
  }

  if (
    password.length < 6
  ) {
    showToast(
      "Password must be at least 6 characters.",
      "error"
    );

    return;
  }

  try {
    setLoading(
      registerSubmitBtn,
      true,
      "Creating Account..."
    );

    const data =
      await apiRequest(
        "/auth/register",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              name,
              email,
              password
            })
        }
      );

    authToken =
      data.token;

    currentUser =
      data.user;

    localStorage.setItem(
      "authToken",
      authToken
    );

    registerForm.reset();

    showDashboard();

    resetTransactionForm();

    await loadTransactions();

    showToast(
      data.message ||
      "Registration successful."
    );
  } catch (error) {
    showToast(
      error.message,
      "error"
    );
  } finally {
    setLoading(
      registerSubmitBtn,
      false
    );
  }
}

async function loginUser(
  event
) {
  event.preventDefault();

  const email =
    $("loginEmail")
      ?.value
      .trim();

  const password =
    $("loginPassword")
      ?.value;

  if (loginError) {
    loginError.textContent =
      "";

    loginError.classList.add(
      "hidden"
    );
  }

  if (
    !email ||
    !password
  ) {
    if (loginError) {
      loginError.textContent =
        "Please enter your email and password.";

      loginError.classList.remove(
        "hidden"
      );
    }

    return;
  }

  try {
    setLoading(
      loginSubmitBtn,
      true,
      "Signing In..."
    );

    const data =
      await apiRequest(
        "/auth/login",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              email,
              password
            })
        }
      );

    authToken =
      data.token;

    currentUser =
      data.user;

    localStorage.setItem(
      "authToken",
      authToken
    );

    loginForm.reset();

    showDashboard();

    resetTransactionForm();

    await loadTransactions();

    showToast(
      data.message ||
      "Login successful."
    );
  } catch (error) {
    if (loginError) {
      loginError.textContent =
        error.message ||
        "Invalid email or password.";

      loginError.classList.remove(
        "hidden"
      );
    }
  } finally {
    setLoading(
      loginSubmitBtn,
      false
    );
  }
}

async function sendOtp() {
  const email =
    otpEmail?.value.trim();

  if (otpError) {
    otpError.textContent =
      "";

    otpError.classList.add(
      "hidden"
    );
  }

  if (!email) {
    if (otpError) {
      otpError.textContent =
        "Please enter your email address.";

      otpError.classList.remove(
        "hidden"
      );
    }

    return;
  }

  try {
    setLoading(
      sendOtpBtn,
      true,
      "Sending OTP..."
    );

    const data =
      await apiRequest(
        "/auth/send-otp",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              email
            })
        }
      );

    otpCodeGroup?.classList.remove(
      "hidden"
    );

    verifyOtpBtn?.classList.remove(
      "hidden"
    );

    if (otpCode) {
      otpCode.value =
        "";

      otpCode.focus();
    }

    showToast(
      data.message ||
      "OTP sent successfully."
    );
  } catch (error) {
    if (otpError) {
      otpError.textContent =
        error.message ||
        "Unable to send OTP.";

      otpError.classList.remove(
        "hidden"
      );
    }
  } finally {
    setLoading(
      sendOtpBtn,
      false
    );
  }
}

async function verifyOtp() {
  const email =
    otpEmail?.value.trim();

  const otp =
    otpCode?.value.trim();

  if (otpError) {
    otpError.textContent =
      "";

    otpError.classList.add(
      "hidden"
    );
  }

  if (
    !email ||
    !otp
  ) {
    if (otpError) {
      otpError.textContent =
        "Please enter your email and OTP.";

      otpError.classList.remove(
        "hidden"
      );
    }

    return;
  }

  if (
    !/^\d{6}$/.test(
      otp
    )
  ) {
    if (otpError) {
      otpError.textContent =
        "Please enter a valid 6-digit OTP.";

      otpError.classList.remove(
        "hidden"
      );
    }

    return;
  }

  try {
    setLoading(
      verifyOtpBtn,
      true,
      "Verifying..."
    );

    const data =
      await apiRequest(
        "/auth/verify-otp",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              email,
              otp
            })
        }
      );

    authToken =
      data.token;

    currentUser =
      data.user;

    localStorage.setItem(
      "authToken",
      authToken
    );

    otpLoginForm.reset();

    otpCodeGroup?.classList.add(
      "hidden"
    );

    verifyOtpBtn?.classList.add(
      "hidden"
    );

    showDashboard();

    resetTransactionForm();

    await loadTransactions();

    showToast(
      data.message ||
      "OTP login successful."
    );
  } catch (error) {
    if (otpError) {
      otpError.textContent =
        error.message ||
        "Invalid OTP.";

      otpError.classList.remove(
        "hidden"
      );
    }
  } finally {
    setLoading(
      verifyOtpBtn,
      false
    );
  }
}

function handleGoogleCredentialResponse(
  response
) {
  apiRequest(
    "/auth/google",
    {
      method:
        "POST",

      body:
        JSON.stringify({
          credential:
            response.credential
        })
    }
  )
    .then(
      (data) => {
        authToken =
          data.token;

        currentUser =
          data.user;

        localStorage.setItem(
          "authToken",
          authToken
        );

        showDashboard();

        resetTransactionForm();

        return loadTransactions();
      }
    )
    .then(() => {
      showToast(
        "Google login successful."
      );
    })
    .catch((error) => {
      if (loginError) {
        loginError.textContent =
          error.message ||
          "Google login failed.";

        loginError.classList.remove(
          "hidden"
        );
      }
    });
}

function initializeGoogleSignIn() {
  if (
    !googleSignInButton ||
    !window.google ||
    !google.accounts ||
    !google.accounts.id
  ) {
    return false;
  }

  google.accounts.id.initialize({
    client_id:
      "448499935087-ee77v8eoka98h5k0hojiiev41fsjilsv.apps.googleusercontent.com",

    callback:
      handleGoogleCredentialResponse
  });

  google.accounts.id.renderButton(
    googleSignInButton,
    {
      theme:
        "outline",

      size:
        "large",

      text:
        "continue_with",

      shape:
        "rectangular",

      width:
        355
    }
  );

  return true;
}

function logout() {
  authToken =
    null;

  currentUser =
    null;

  transactions =
    [];

  editingTransactionId =
    null;

  localStorage.removeItem(
    "authToken"
  );

  monthlyChart?.destroy();
  categoryChart?.destroy();

  monthlyChart =
    null;

  categoryChart =
    null;

  showAuth();

  showLoginForm();

  if (txList) {
    txList.innerHTML =
      "";
  }

  resetTransactionForm();

  showToast(
    "You have been logged out."
  );
}

async function checkExistingSession() {
  if (!authToken) {
    showAuth();

    return;
  }

  try {
    const data =
      await apiRequest(
        "/auth/me"
      );

    currentUser =
      data.user;

    showDashboard();

    resetTransactionForm();

    await loadTransactions();
  } catch {
    authToken =
      null;

    currentUser =
      null;

    localStorage.removeItem(
      "authToken"
    );

    showAuth();
  }
}

tabLogin?.addEventListener(
  "click",
  showLoginForm
);

tabRegister?.addEventListener(
  "click",
  showRegisterForm
);

loginForm?.addEventListener(
  "submit",
  loginUser
);

registerForm?.addEventListener(
  "submit",
  registerUser
);

otpLoginToggle?.addEventListener(
  "click",
  showOtpForm
);

otpBackBtn?.addEventListener(
  "click",
  showPasswordLoginForm
);

sendOtpBtn?.addEventListener(
  "click",
  sendOtp
);

verifyOtpBtn?.addEventListener(
  "click",
  verifyOtp
);

logoutBtn?.addEventListener(
  "click",
  logout
);

transactionForm?.addEventListener(
  "submit",
  saveTransaction
);

cancelEditBtn?.addEventListener(
  "click",
  resetTransactionForm
);

document
  .querySelectorAll(
    'input[name="txType"]'
  )
  .forEach(
    (radio) => {
      radio.addEventListener(
        "change",
        () => {
          updateTypeStyles();

          populateTransactionCategories();
        }
      );
    }
  );

filterButtons.forEach(
  (button) => {
    button.addEventListener(
      "click",
      () => {
        currentTypeFilter =
          button.dataset.typeFilter;

        filterButtons.forEach(
          (item) => {
            item.classList.toggle(
              "active",
              item === button
            );
          }
        );

        renderTransactions();
      }
    );
  }
);

categoryFilter?.addEventListener(
  "change",
  () => {
    currentCategoryFilter =
      categoryFilter.value;

    renderTransactions();
  }
);

themeToggleInput?.addEventListener(
  "change",
  () => {
    setTimeout(() => {
      updateChartTheme();
      initializeGoogleSignIn();
    }, 50);
  }
);

updateTypeStyles();

populateTransactionCategories();

setupCustomSelect(
  txCategory
);

setupCustomSelect(
  categoryFilter
);

checkExistingSession();

const googleInterval =
  setInterval(
    () => {
      if (
        initializeGoogleSignIn()
      ) {
        clearInterval(
          googleInterval
        );
      }
    },
    100
  );
