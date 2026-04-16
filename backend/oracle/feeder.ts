async function fetchPrice(symbol: string): Promise<number> {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
  const data = await res.json()
  return parseFloat(data.price)
}

export async function publishPrices() {
  const btc = await fetchPrice("BTCUSDT")

  // send to chain
  await postToOracleModule("BTC-PERP", btc)
}