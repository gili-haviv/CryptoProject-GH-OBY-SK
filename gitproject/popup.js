// popup.js - 

let currentChart = null;
let currentRates = { BTC: 0, ETH: 0 };

document.addEventListener("DOMContentLoaded", async () => {
  await loadPrices();
  displayCurrentHoldings();
  setupEventListeners();
  setupValueUpdaters();
});

async function loadPrices() {
  const btcPriceEl = document.getElementById("btcPrice");
  const ethPriceEl = document.getElementById("ethPrice");

  try {
    const rates = await service.getRates();
    currentRates = rates;

    if (rates.BTC > 0 && rates.ETH > 0) {
      btcPriceEl.textContent = `Bitcoin: ${rates.BTC.toLocaleString()}`;
      ethPriceEl.textContent = `Ethereum: ${rates.ETH.toLocaleString()}`;
      btcPriceEl.style.color = "#28a745";
      ethPriceEl.style.color = "#28a745";
    } else {
      throw new Error("Invalid rates received");
    }
  } catch (err) {
    console.error("Error loading prices:", err);
    btcPriceEl.textContent = "Bitcoin: Failed to load";
    ethPriceEl.textContent = "Ethereum: Failed to load";
    btcPriceEl.style.color = "#dc3545";
    ethPriceEl.style.color = "#dc3545";
  }
}

function setupEventListeners() {
  document.getElementById("addBtn").addEventListener("click", handleAdd);
  document.getElementById("removeBtn").addEventListener("click", handleRemove);
  document.getElementById("totalBtn").addEventListener("click", handleTotal);
  document.getElementById("holdingsBtn").addEventListener("click", handleShowChart);
}

function setupValueUpdaters() {
  document.getElementById("btcInput").addEventListener("input", updateBtcValue);
  document.getElementById("ethInput").addEventListener("input", updateEthValue);
}

function updateBtcValue() {
  const amount = parseFloat(document.getElementById("btcInput").value) || 0;
  const value = amount * currentRates.BTC;
  document.getElementById("btcValue").textContent = `ערך: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateEthValue() {
  const amount = parseFloat(document.getElementById("ethInput").value) || 0;
  const value = amount * currentRates.ETH;
  document.getElementById("ethValue").textContent = `ערך: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function handleAdd() {
  const btcAmount = parseFloat(document.getElementById("btcInput").value) || 0;
  const ethAmount = parseFloat(document.getElementById("ethInput").value) || 0;

  if (btcAmount > 0) dao.add("BTC", btcAmount);
  if (ethAmount > 0) dao.add("ETH", ethAmount);

  document.getElementById("btcInput").value = "";
  document.getElementById("ethInput").value = "";
  updateBtcValue();
  updateEthValue();
  displayCurrentHoldings();
}

function handleRemove() {
  const btcAmount = parseFloat(document.getElementById("btcInput").value) || 0;
  const ethAmount = parseFloat(document.getElementById("ethInput").value) || 0;

  if (btcAmount > 0) dao.remove("BTC", btcAmount);
  if (ethAmount > 0) dao.remove("ETH", ethAmount);

  document.getElementById("btcInput").value = "";
  document.getElementById("ethInput").value = "";
  updateBtcValue();
  updateEthValue();
  displayCurrentHoldings();
}

async function handleTotal() {
  const el = document.getElementById("totalResult");
  el.textContent = "מחשב...";
  try {
    const total = await dao.total();
    el.textContent = `ערך כולל: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    el.style.color = "#28a745";
  } catch (e) {
    console.error(e);
    el.textContent = "שגיאה בחישוב הערך הכולל";
    el.style.color = "#dc3545";
  }
}

async function displayCurrentHoldings() {
  const el = document.getElementById("currentHoldings");
  const holdings = dao.getAllHoldings();
  const rates = await service.getRates();

  const btcValue = holdings.BTC * rates.BTC;
  const ethValue = holdings.ETH * rates.ETH;

  el.innerHTML = `
    <h3>החזקות נוכחיות:</h3>
    <div>BTC: ${holdings.BTC} (${btcValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} $)</div>
    <div>ETH: ${holdings.ETH} (${ethValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} $)</div>
  `;
}

async function handleShowChart() {
  const canvas = document.getElementById("holdingsChart");
  const holdings = dao.getAllHoldings();

  if (holdings.BTC === 0 && holdings.ETH === 0) {
    alert("אין החזקות להצגה בגרף");
    return;
  }

  try {
    const rates = await service.getRates();
    const btcValue = holdings.BTC * rates.BTC;
    const ethValue = holdings.ETH * rates.ETH;

    const chartData = [];
    const chartLabels = [];
    const chartColors = [];

    if (btcValue > 0) {
      chartData.push(btcValue);
      chartLabels.push(`Bitcoin: ${btcValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      chartColors.push("#f7931a");
    }

    if (ethValue > 0) {
      chartData.push(ethValue);
      chartLabels.push(`Ethereum: ${ethValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      chartColors.push("#627eea");
    }

    if (currentChart) {
      currentChart.destroy();
    }

    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");

    currentChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 2,
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                const total = chartData.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

  } catch (error) {
    console.error("Error creating chart:", error);
    alert("שגיאה ביצירת הגרף: " + error.message);
  }
}
