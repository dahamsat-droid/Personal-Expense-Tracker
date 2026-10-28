const form = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const clearBtn = document.getElementById("clearBtn");
const filterInput = document.getElementById("filter");
const searchInput = document.getElementById("search");
const tableBody = document.getElementById("tableBody");
const emptyMessage = document.getElementById("emptyMessage");

// Get saved data, or start with an empty list
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function formatMoney(number) {
  return "LKR " + number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function setTodayDate() {
  // "en-CA" gives YYYY-MM-DD in local time
  dateInput.value = new Date().toLocaleDateString("en-CA");
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateTotals() {
  let income = 0;
  let expenses = 0;

  for (const t of transactions) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  }

  document.getElementById("totalIncome").textContent = formatMoney(income);
  document.getElementById("totalExpenses").textContent = formatMoney(expenses);
  document.getElementById("currentBalance").textContent = formatMoney(income - expenses);
}

function showTable() {
  const filter = filterInput.value;
  const search = searchInput.value.toLowerCase();

  tableBody.innerHTML = "";
  let count = 0;

  for (const t of transactions) {
    if (filter !== "all" && t.type !== filter) {
      continue;
    }

    const text = (t.description + " " + t.category).toLowerCase();
    if (!text.includes(search)) {
      continue;
    }

    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.textContent = t.date;

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = t.description;

    const typeCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge badge-" + t.type;
    badge.textContent = t.type === "income" ? "Income" : "Expense";
    typeCell.appendChild(badge);

    const categoryCell = document.createElement("td");
    categoryCell.textContent = t.category;

    const amountCell = document.createElement("td");
    amountCell.className = "right";
    const sign = t.type === "income" ? "+ " : "- ";
    amountCell.textContent = sign + formatMoney(t.amount);

    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      deleteTransaction(t.id);
    });
    actionCell.appendChild(deleteBtn);

    row.append(dateCell, descriptionCell, typeCell, categoryCell, amountCell, actionCell);
    tableBody.appendChild(row);
    count++;
  }

  emptyMessage.style.display = count === 0 ? "block" : "none";
}

function refresh() {
  updateTotals();
  showTable();
}

function clearForm() {
  form.reset();
  setTodayDate();
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });
  saveTransactions();
  refresh();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (description === "" || categoryInput.value === "" || dateInput.value === "") {
    alert("Please fill in all fields.");
    return;
  }

  if (amount <= 0) {
    alert("Amount must be greater than 0.");
    return;
  }

  transactions.push({
    id: Date.now(),
    type: typeInput.value,
    description: description,
    amount: amount,
    category: categoryInput.value,
    date: dateInput.value
  });

  saveTransactions();
  refresh();
  clearForm();
  alert("Transaction added successfully!");
});

clearBtn.addEventListener("click", clearForm);
filterInput.addEventListener("change", showTable);
searchInput.addEventListener("input", showTable);

setTodayDate();
refresh();