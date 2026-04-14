class Expense {
  constructor(name, cost, priority) {
    this.name = name;
    this.cost = cost;
    this.priority = priority;
  }
}

class Subset {
  constructor() {
    this.items = [];
    this.totalCost = 0;
    this.totalPriority = 0;
  }

  add(expense) {
    this.items.push(expense);
    this.totalCost += expense.cost;
    this.totalPriority += expense.priority;
  }

  clone() {
    const clone = new Subset();
    this.items.forEach(item => clone.add(item));
    return clone;
  }
}

const expenses = [];
let chart;

function addExpense() {
  const name = document.getElementById("item").value.trim();
  const cost = parseInt(document.getElementById("cost").value);
  const priority = parseInt(document.getElementById("priority").value);

  if (!name || isNaN(cost) || isNaN(priority) || cost <= 0 || priority < 1 || priority > 5) {
    alert("Please enter valid name, cost, and priority (1–5).");
    return;
  }

  expenses.push({ name, cost, priority });

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${name}</td>
    <td>₹${cost}</td>
    <td>${priority}</td>
    <td><button onclick="removeExpense(this, '${name}')">🗑 Delete</button></td>
  `;
  document.getElementById("expense-list").appendChild(row);

  document.getElementById("item").value = "";
  document.getElementById("cost").value = "";
  document.getElementById("priority").value = "";
}

function removeExpense(button, name) {
  const row = button.parentElement.parentElement;
  row.remove();
  const index = expenses.findIndex(e => e.name === name);
  if (index !== -1) expenses.splice(index, 1);
}

function findOptimalSubsets(expenses, budget) {
  let bestSubsets = [];
  let maxPriority = -1;
  let maxSize = -1;

  function recurse(index, subset, costSum, prioritySum) {
    if (costSum <= budget) {
      if (prioritySum > maxPriority || (prioritySum === maxPriority && subset.items.length > maxSize)) {
        bestSubsets = [subset.clone()];
        maxPriority = prioritySum;
        maxSize = subset.items.length;
      } else if (prioritySum === maxPriority && subset.items.length === maxSize) {
        bestSubsets.push(subset.clone());
      }
    }

    if (index >= expenses.length || costSum > budget) return;

    subset.add(expenses[index]);
    recurse(index + 1, subset, costSum + expenses[index].cost, prioritySum + expenses[index].priority);

    subset.totalCost -= expenses[index].cost;
    subset.totalPriority -= expenses[index].priority;
    subset.items.pop();

    recurse(index + 1, subset, costSum, prioritySum);
  }

  recurse(0, new Subset(), 0, 0);
  return bestSubsets;
}

function optimize() {
  const budget = parseInt(document.getElementById("budget").value);
  if (isNaN(budget) || budget <= 0) {
    alert("Please enter a valid total budget.");
    return;
  }

  const all = expenses.map(e => new Expense(e.name, e.cost, e.priority));
  const best = findOptimalSubsets(all, budget);
  const result = document.getElementById("result");

  updateBars(budget, expenses);
  updatePieChart(budget, expenses);

  if (best.length === 0) {
    result.innerText = "No valid combinations found within the budget.";
    return;
  }

  let output = `=== Best Subsets for ₹${budget} ===\n\n`;
  best.forEach((set, i) => {
    output += `Subset ${i + 1} (₹${set.totalCost}, Priority: ${set.totalPriority}):\n`;
    set.items.forEach(e => {
      output += ` - ${e.name}: ₹${e.cost} (P${e.priority})\n`;
    });
    output += "\n";
  });

  result.innerText = output;
}

function updateBars(budget, list) {
  const totalExpense = list.reduce((sum, e) => sum + e.cost, 0);
  const totalPriority = list.reduce((sum, e) => sum + e.priority, 0);
  const maxPriority = list.length * 5;

  document.getElementById("budget-bar").style.width = "100%";
  document.getElementById("budget-bar").innerText = `₹${budget}`;

  const expensePercent = Math.min((totalExpense / budget) * 100, 100);
  document.getElementById("expense-bar").style.width = `${expensePercent}%`;
  document.getElementById("expense-bar").innerText = `₹${totalExpense}`;

  const priorityPercent = Math.min((totalPriority / maxPriority) * 100, 100);
  document.getElementById("priority-bar").style.width = `${priorityPercent}%`;
  document.getElementById("priority-bar").innerText = `${totalPriority}`;
}

function updatePieChart(budget, list) {
  const ctx = document.getElementById("budgetChart").getContext("2d");
  const totalExpense = list.reduce((sum, e) => sum + e.cost, 0);
  const totalPriority = list.reduce((sum, e) => sum + e.priority, 0);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Budget', 'Expenses', 'Priority Score'],
      datasets: [{
        data: [budget, totalExpense, totalPriority],
        backgroundColor: ['#2ecc71', '#e67e22', '#8e44ad'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 } }
        }
      }
    }
  });
}
