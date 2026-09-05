const API_URL = "/api";

let authToken = localStorage.getItem("authToken");
let currentUser = null;
let transactions = [];
let currentTypeFilter = "all";
let currentCategoryFilter = "all";
let editingTransactionId = null;

const authSection =
  document.getElementById("authSection");

const dashboardSection =
  document.getElementById("dashboardSection");

const tabLogin =
  document.getElementById("tabLogin");

const tabRegister =
  document.getElementById("tabRegister");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const loginSubmitBtn =
  document.getElementById("loginSubmitBtn");

const registerSubmitBtn =
  document.getElementById("registerSubmitBtn");

const loginError =
  document.getElementById("loginError");

const userNav =
  document.getElementById("userNav");

const userGreeting =
  document.getElementById("userGreeting");

const logoutBtn =
  document.getElementById("logoutBtn");

const transactionForm =
  document.getElementById("transactionForm");

const formTitle =
  document.getElementById("formTitle");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");

const txSubmitBtn =
  document.getElementById("txSubmitBtn");

const txAmount =
  document.getElementById("txAmount");

const txCategory =
  document.getElementById("txCategory");

const txDescription =
  document.getElementById("txDescription");

const txDate =
  document.getElementById("txDate");

const totalBalance =
  document.getElementById("totalBalance");

const totalIncome =
  document.getElementById("totalIncome");

const totalExpenses =
  document.getElementById("totalExpenses");

const txList =
  document.getElementById("txList");

const emptyState =
  document.getElementById("emptyState");

const txCountBadge =
  document.getElementById("txCountBadge");

const categoryFilter =
  document.getElementById("categoryFilter");

const filterButtons =
  document.querySelectorAll(
    "[data-type-filter]"
  );

const toastContainer =
  document.getElementById("toastContainer");

const typeExpenseLabel =
  document.getElementById("typeExpenseLabel");

const typeIncomeLabel =
  document.getElementById("typeIncomeLabel");

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

const amountWrapper =
  txAmount.closest(
    ".input-prefix-wrapper"
  );

const amountClearButton =
  document.createElement("button");

amountClearButton.type =
  "button";

amountClearButton.className =
  "amount-clear-button";

amountClearButton.setAttribute(
  "aria-label",
  "Clear amount"
);

amountClearButton.textContent =
  "×";

if (amountWrapper) {
  amountWrapper.appendChild(
    amountClearButton
  );

  const updateAmountClearButton =
    () => {
      amountClearButton.classList.toggle(
        "visible",
        txAmount.value.trim() !== ""
      );
    };

  amountClearButton.addEventListener(
    "click",
    () => {
      txAmount.value = "";

      updateAmountClearButton();

      txAmount.focus();
    }
  );

  txAmount.addEventListener(
    "input",
    updateAmountClearButton
  );

  updateAmountClearButton();
}

function showToast(
  message,
  type = "success"
) {
  if (!toastContainer) {
    return;
  }

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
  if (!button) {
    return;
  }

  button.disabled =
    loading;

  if (loading) {
    button.dataset.originalText =
      button.textContent;

    button.textContent =
      text;
  } else {
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

  let data;

  try {
    data =
      await response.json();
  } catch {
    data = {
      success: false,
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
  tabLogin.classList.add(
    "active"
  );

  tabRegister.classList.remove(
    "active"
  );

  tabLogin.setAttribute(
    "aria-selected",
    "true"
  );

  tabRegister.setAttribute(
    "aria-selected",
    "false"
  );

  loginForm.classList.remove(
    "hidden"
  );

  registerForm.classList.add(
    "hidden"
  );
}

function showRegisterForm() {
  tabRegister.classList.add(
    "active"
  );

  tabLogin.classList.remove(
    "active"
  );

  tabRegister.setAttribute(
    "aria-selected",
    "true"
  );

  tabLogin.setAttribute(
    "aria-selected",
    "false"
  );

  registerForm.classList.remove(
    "hidden"
  );

  loginForm.classList.add(
    "hidden"
  );
}

function showDashboard() {
  authSection.classList.add(
    "hidden"
  );

  dashboardSection.classList.remove(
    "hidden"
  );

  userNav.classList.remove(
    "hidden"
  );

  authSection.style.display =
    "none";

  dashboardSection.style.display =
    "";

  userNav.style.display =
    "";

  if (currentUser) {
    userGreeting.textContent =
      `Welcome, ${currentUser.name}`;
  }
}

function showAuth() {
  authSection.classList.remove(
    "hidden"
  );

  dashboardSection.classList.add(
    "hidden"
  );

  userNav.classList.add(
    "hidden"
  );

  authSection.style.display =
    "";

  dashboardSection.style.display =
    "none";

  userNav.style.display =
    "none";
}

function getSelectedType() {
  const selected =
    document.querySelector(
      'input[name="txType"]:checked'
    );

  return selected
    ? selected.value
    : "expense";
}

function setSelectedType(
  type
) {
  const radio =
    document.querySelector(
      `input[name="txType"][value="${type}"]`
    );

  if (radio) {
    radio.checked =
      true;
  }

  updateTypeStyles();

  populateTransactionCategories();
}

function updateTypeStyles() {
  const type =
    getSelectedType();

  typeExpenseLabel.classList.toggle(
    "expense-active",
    type === "expense"
  );

  typeIncomeLabel.classList.toggle(
    "income-active",
    type === "income"
  );
}

function populateTransactionCategories(
  selectedCategory = ""
) {
  const type =
    getSelectedType();

  const categories =
    type === "income"
      ? incomeCategories
      : expenseCategories;

  txCategory.innerHTML =
    "";

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
        option.selected =
          true;
      }

      txCategory.appendChild(
        option
      );
    }
  );

  if (
    !selectedCategory &&
    categories.length > 0
  ) {
    txCategory.value =
      categories[0];
  }
}

function populateCategoryFilter() {
  const allCategories = [
    "Food",
    "Shopping",
    "Transport",
    "Bills",
    "Entertainment",
    "Salary",
    "Freelance",
    "Other"
  ];

  const currentValue =
    categoryFilter.value;

  categoryFilter.innerHTML =
    "";

  const allOption =
    document.createElement(
      "option"
    );

  allOption.value =
    "all";

  allOption.textContent =
    "All Categories";

  categoryFilter.appendChild(
    allOption
  );

  allCategories.forEach(
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

  if (
    allCategories.includes(
      currentValue
    )
  ) {
    categoryFilter.value =
      currentValue;
  } else {
    categoryFilter.value =
      "all";

    currentCategoryFilter =
      "all";
  }
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
  ).format(amount);
}

function formatDate(
  dateValue
) {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

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

function updateSummary() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(
    (transaction) => {
      const amount =
        Number(transaction.amount) ||
        0;

      if (
        transaction.type ===
        "income"
      ) {
        income +=
          amount;
      } else if (
        transaction.type ===
        "expense"
      ) {
        expenses +=
          amount;
      }
    }
  );

  const balance =
    income -
    expenses;

  totalIncome.textContent =
    `+${formatCurrency(income)}`;

  totalExpenses.textContent =
    `-${formatCurrency(expenses)}`;

  totalBalance.textContent =
    formatCurrency(balance);
}

function getFilteredTransactions() {
  return transactions.filter(
    (transaction) => {
      const matchesType =
        currentTypeFilter ===
          "all" ||
        transaction.type ===
          currentTypeFilter;

      const matchesCategory =
        currentCategoryFilter ===
          "all" ||
        transaction.category ===
          currentCategoryFilter;

      return (
        matchesType &&
        matchesCategory
      );
    }
  );
}

function renderTransactions() {
  const filteredTransactions =
    getFilteredTransactions();

  txList.innerHTML =
    "";

  emptyState.classList.toggle(
    "hidden",
    filteredTransactions.length >
      0
  );

  if (
    filteredTransactions.length ===
    0
  ) {
    txCountBadge.textContent =
      "0 records";

    return;
  }

  txCountBadge.textContent =
    `${filteredTransactions.length} ${
      filteredTransactions.length ===
      1
        ? "record"
        : "records"
    }`;

  filteredTransactions.forEach(
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

      const editButton =
        document.createElement(
          "button"
        );

      editButton.type =
        "button";

      editButton.textContent =
        "Edit";

      editButton.addEventListener(
        "click",
        () => {
          startEditingTransaction(
            transaction
          );
        }
      );

      const deleteButton =
        document.createElement(
          "button"
        );

      deleteButton.type =
        "button";

      deleteButton.className =
        "delete-btn";

      deleteButton.textContent =
        "Delete";

      deleteButton.addEventListener(
        "click",
        () => {
          deleteTransaction(
            transaction._id
          );
        }
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "transaction-actions";

      actions.append(
        editButton,
        deleteButton
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

function resetTransactionForm() {
  editingTransactionId =
    null;

  transactionForm.reset();

  formTitle.textContent =
    "Add Transaction";

  txSubmitBtn.textContent =
    "+ Add Transaction";

  cancelEditBtn.classList.add(
    "hidden"
  );

  setSelectedType(
    "expense"
  );

  txDate.value =
    new Date()
      .toISOString()
      .split("T")[0];
}

function startEditingTransaction(
  transaction
) {
  editingTransactionId =
    transaction._id;

  formTitle.textContent =
    "Edit Transaction";

  txSubmitBtn.textContent =
    "Save Changes";

  cancelEditBtn.classList.remove(
    "hidden"
  );

  setSelectedType(
    transaction.type
  );

  txAmount.value =
    transaction.amount;

  txAmount.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );

  populateTransactionCategories(
    transaction.category
  );

  txDescription.value =
    transaction.description;

  if (transaction.date) {
    const date =
      new Date(
        transaction.date
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      txDate.value =
        `${year}-${month}-${day}`;
    }
  }

  transactionForm.scrollIntoView(
    {
      behavior: "smooth",
      block: "start"
    }
  );
}

async function saveTransaction(
  event
) {
  event.preventDefault();

  const type =
    getSelectedType();

  const amount =
    Number(
      txAmount.value
    );

  const category =
    txCategory.value.trim();

  const description =
    txDescription.value.trim();

  const date =
    txDate.value;

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    showToast(
      "Amount must be greater than 0.",
      "error"
    );

    return;
  }

  if (
    !category ||
    !description ||
    !date
  ) {
    showToast(
      "Please fill in all transaction fields.",
      "error"
    );

    return;
  }

  const payload = {
    type,
    amount,
    category,
    description,
    date
  };

  const isEditing =
    Boolean(
      editingTransactionId
    );

  try {
    setLoading(
      txSubmitBtn,
      true,
      isEditing
        ? "Saving..."
        : "Adding..."
    );

    if (isEditing) {
      await apiRequest(
        `/transactions/${editingTransactionId}`,
        {
          method: "PUT",
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
          method: "POST",
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
  if (!id) {
    return;
  }

  const shouldDelete =
    window.confirm(
      "Are you sure you want to delete this transaction?"
    );

  if (!shouldDelete) {
    return;
  }

  try {
    await apiRequest(
      `/transactions/${id}`,
      {
        method: "DELETE"
      }
    );

    showToast(
      "Transaction deleted successfully."
    );

    if (
      editingTransactionId ===
      id
    ) {
      resetTransactionForm();
    }

    await loadTransactions();
  } catch (error) {
    showToast(
      error.message,
      "error"
    );
  }
}

async function registerUser(
  event
) {
  event.preventDefault();

  const name =
    document
      .getElementById(
        "registerName"
      )
      .value
      .trim();

  const email =
    document
      .getElementById(
        "registerEmail"
      )
      .value
      .trim();

  const password =
    document
      .getElementById(
        "registerPassword"
      )
      .value;

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
          method: "POST",
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
    document
      .getElementById(
        "loginEmail"
      )
      .value
      .trim();

  const password =
    document
      .getElementById(
        "loginPassword"
      )
      .value;

  loginError.textContent =
    "";

  loginError.classList.add(
    "hidden"
  );

  if (
    !email ||
    !password
  ) {
    loginError.textContent =
      "Please enter your email and password.";

    loginError.classList.remove(
      "hidden"
    );

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
          method: "POST",
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

    loginError.textContent =
      "";

    loginError.classList.add(
      "hidden"
    );

    showDashboard();

    resetTransactionForm();

    await loadTransactions();

    showToast(
      data.message ||
      "Login successful."
    );
  } catch (error) {
    loginError.textContent =
      error.message ||
      "Invalid email or password.";

    loginError.classList.remove(
      "hidden"
    );
  } finally {
    setLoading(
      loginSubmitBtn,
      false
    );
  }
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

  txList.innerHTML =
    "";

  loginForm.reset();

  registerForm.reset();

  updateSummary();

  currentTypeFilter =
    "all";

  currentCategoryFilter =
    "all";

  categoryFilter.value =
    "all";

  filterButtons.forEach(
    (button) => {
      button.classList.toggle(
        "active",
        button.dataset
          .typeFilter ===
          "all"
      );
    }
  );

  resetTransactionForm();

  showLoginForm();

  showAuth();

  showToast(
    "You have been logged out."
  );
}

tabLogin.addEventListener(
  "click",
  showLoginForm
);

tabRegister.addEventListener(
  "click",
  showRegisterForm
);

loginForm.addEventListener(
  "submit",
  loginUser
);

registerForm.addEventListener(
  "submit",
  registerUser
);

logoutBtn.addEventListener(
  "click",
  logout
);

transactionForm.addEventListener(
  "submit",
  saveTransaction
);

cancelEditBtn.addEventListener(
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

categoryFilter.addEventListener(
  "change",
  () => {
    currentCategoryFilter =
      categoryFilter.value;

    renderTransactions();
  }
);

updateTypeStyles();

populateTransactionCategories();

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

  function updateLabel() {
    const selected =
      select.options[
        select.selectedIndex
      ];

    label.textContent =
      selected
        ? selected.textContent
        : "";
  }

  function renderOptions() {
    menu.innerHTML =
      "";

    [
      ...select.options
    ].forEach(
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
          () => {
            select.value =
              option.value;

            select.dispatchEvent(
              new Event(
                "change",
                {
                  bubbles: true
                }
              )
            );

            updateLabel();

            renderOptions();

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

    updateLabel();
  }

  button.addEventListener(
    "click",
    () => {
      document
        .querySelectorAll(
          ".custom-select.open"
        )
        .forEach(
          (item) => {
            if (
              item !==
              wrapper
            ) {
              item.classList.remove(
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
    renderOptions
  );

  new MutationObserver(
    renderOptions
  ).observe(
    select,
    {
      childList: true,
      subtree: true
    }
  );

  renderOptions();
}

document.addEventListener(
  "click",
  (event) => {
    if (
      !event.target.closest(
        ".custom-select"
      )
    ) {
      document
        .querySelectorAll(
          ".custom-select.open"
        )
        .forEach(
          (item) => {
            item.classList.remove(
              "open"
            );
          }
        );
    }
  }
);

setupCustomSelect(
  txCategory
);

setupCustomSelect(
  categoryFilter
);

checkExistingSession();