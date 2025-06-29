async function fetchPrices() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";

  try {
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("btc").innerText = `Bitcoin: $${data.bitcoin.usd}`;
    document.getElementById(
      "eth"
    ).innerText = `Ethereum: $${data.ethereum.usd}`;
  } catch (error) {
    document.getElementById("btc").innerText = "Error loading BTC";
    document.getElementById("eth").innerText = "Error loading ETH";
  }
}

fetchPrices();
