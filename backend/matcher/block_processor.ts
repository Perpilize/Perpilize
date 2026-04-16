import { MatchingEngine } from "./engine";

const engine = new MatchingEngine()

export function processBlock(orders: Order[]) {
  const allTrades = []

  for (const order of orders) {
    const trades = engine.match(order)
    allTrades.push(...trades)
  }

  return allTrades
}