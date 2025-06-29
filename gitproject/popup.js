document.addEventListener("DOMContentLoaded", async () => {
  const btcPriceEl = document.getElementById("btcPrice");
  const ethPriceEl = document.getElementById("ethPrice");
  const saveBtn = document.getElementById("saveBtn");

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
    );
    const data = await res.json();

    btcPriceEl.textContent = `Bitcoin: $${data.bitcoin.usd.toLocaleString()}`;
    ethPriceEl.textContent = `Ethereum: $${data.ethereum.usd.toLocaleString()}`;
  } catch (err) {
    btcPriceEl.textContent = "Failed to load Bitcoin price.";
    ethPriceEl.textContent = "Failed to load Ethereum price.";
  }

  saveBtn.addEventListener("click", () => {
    const binance =
      parseFloat(document.getElementById("binanceBtc").value) || 0;
    const coinbase =
      parseFloat(document.getElementById("coinbaseBtc").value) || 0;
    const total = binance + coinbase;

    document.getElementById(
      "btcPlatformTotal"
    ).textContent = `סך הכל BTC: ${total}`;
    localStorage.setItem(
      "btc_holdings",
      JSON.stringify({ binance, coinbase, total })
    );
  });
});
