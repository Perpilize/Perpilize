type Order = {
  trader: string
  market: string
  size: number
  price: number
  side: "buy" | "sell"
}

type Trade = {
  buyer: string
  seller: string
  price: number
  size: number
}

export class MatchingEngine {
  orderbook: Record<string, { bids: Order[]; asks: Order[] }> = {}

  match(order: Order): Trade[] {
    const book = this.getBook(order.market)
    const trades: Trade[] = []

    if (order.side === "buy") {
      while (book.asks.length && order.size > 0) {
        const bestAsk = book.asks[0]

        if (bestAsk.price > order.price) break

        const size = Math.min(order.size, bestAsk.size)

        trades.push({
          buyer: order.trader,
          seller: bestAsk.trader,
          price: bestAsk.price,
          size
        })

        order.size -= size
        bestAsk.size -= size

        if (bestAsk.size === 0) book.asks.shift()
      }

      if (order.size > 0) book.bids.push(order)
    }

    if (order.side === "sell") {
      while (book.bids.length && order.size > 0) {
        const bestBid = book.bids[0]

        if (bestBid.price < order.price) break

        const size = Math.min(order.size, bestBid.size)

        trades.push({
          buyer: bestBid.trader,
          seller: order.trader,
          price: bestBid.price,
          size
        })

        order.size -= size
        bestBid.size -= size

        if (bestBid.size === 0) book.bids.shift()
      }

      if (order.size > 0) book.asks.push(order)
    }

    return trades
  }

  getBook(market: string) {
    if (!this.orderbook[market]) {
      this.orderbook[market] = { bids: [], asks: [] }
    }
    return this.orderbook[market]
  }
}