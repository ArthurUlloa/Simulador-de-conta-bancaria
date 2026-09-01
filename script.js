// Dados Iniciais da Conta Fictícia
const account = {
  user: "Arthur",
  pixKey: "arthur@email.com",
  password: "1234",
  balance: 2450.00,
  transactions: [
    {
      type: "Entrada",
      description: "Depósito Inicial",
      amount: 500.00,
      date: "01/09/2026 10:15"
    },
    {
      type: "Saída",
      description: "PIX enviado - Maria Clara",
      amount: 150.00,
      date: "01/09/2026 11:40"
    },
    {
      type: "Saída",
      description: "Compra - Supermercado",
      amount: 80.00,
      date: "01/09/2026 14:05"
    }
  ]
};

// Elementos da DOM
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const loginForm = document.getElementById("loginForm");
const loginAlert = document.getElementById("loginAlert");

const balanceDisplay = document.getElementById("balanceDisplay");
const appAlert = document.getElementById("appAlert");
const historyBody = document.getElementById("transactionHistory");
const logoutBtn = document.getElementById("logoutBtn");

const depositForm = document.getElementById("depositForm");
const transferForm = document.getElementById("transferForm");

// Formatação Monetária (R$)
function formatCurrency(val) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Data e Hora Formatadas
function getDateTimeString() {
  const now = new Date();
  return now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
}

// Exibir Alertas Dinâmicos
function showAlert(element, message, type = "danger") {
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove("hidden");

  setTimeout(() => {
    element.classList.add("hidden");
  }, 4000);
}

// Autenticação / Login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputKey = document.getElementById("pixKey").value.trim();
  const inputPass = document.getElementById("password").value;

  if (inputKey === account.pixKey && inputPass === account.password) {
    loginPage.classList.remove("active");
    appPage.classList.add("active");
    updateUI();
  } else {
    showAlert(loginAlert, "Chave PIX ou senha inválidos! (Dica: use arthur@email.com / 1234)");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  appPage.classList.remove("active");
  loginPage.classList.add("active");
  loginForm.reset();
});

// Atualiza a Tela principal (Saldo + Extrato)
function updateUI() {
  balanceDisplay.textContent = formatCurrency(account.balance);
  renderHistory();
}

// Renderizar Histórico na Tabela
function renderHistory() {
  historyBody.innerHTML = "";

  // Exibe a partir da mais recente
  const reversedHistory = [...account.transactions].reverse();

  reversedHistory.forEach(trx => {
    const tr = document.createElement("tr");
    const isIncome = trx.type === "Entrada";
    
    tr.innerHTML = `
      <td>${trx.date}</td>
      <td><span class="${isIncome ? 'badge-income' : 'badge-expense'}">${trx.type}</span></td>
      <td>${escapeHtml(trx.description)}</td>
      <td class="${isIncome ? 'badge-income' : 'badge-expense'}">
        ${isIncome ? '+' : '-'} ${formatCurrency(trx.amount)}
      </td>
    `;
    historyBody.appendChild(tr);
  });
}

// Operação: Depósito
depositForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amountInput = document.getElementById("depositAmount");
  const value = parseFloat(amountInput.value);

  if (isNaN(value) || value <= 0) {
    showAlert(appAlert, "Informe um valor de depósito válido e maior que zero.");
    return;
  }

  account.balance += value;
  account.transactions.push({
    type: "Entrada",
    description: "Depósito em conta",
    amount: value,
    date: getDateTimeString()
  });

  updateUI();
  amountInput.value = "";
  showAlert(appAlert, `Depósito de ${formatCurrency(value)} realizado com sucesso!`, "success");
});

// Operação: Transferência PIX
transferForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const recipientInput = document.getElementById("transferRecipient");
  const amountInput = document.getElementById("transferAmount");

  const recipient = recipientInput.value.trim();
  const value = parseFloat(amountInput.value);

  // Validações
  if (!recipient) {
    showAlert(appAlert, "Por favor, digite o destinatário ou chave PIX.");
    return;
  }

  if (isNaN(value) || value <= 0) {
    showAlert(appAlert, "Informe um valor de transferência válido.");
    return;
  }

  if (value > account.balance) {
    showAlert(appAlert, "Saldo insuficiente para realizar esta transferência!");
    return;
  }

  // Efetuar transferência
  account.balance -= value;
  account.transactions.push({
    type: "Saída",
    description: `PIX enviado - ${recipient}`,
    amount: value,
    date: getDateTimeString()
  });

  updateUI();
  transferForm.reset();
  showAlert(appAlert, `PIX de ${formatCurrency(value)} enviado para ${recipient}!`, "success");
});

// Função para prevenção de XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}