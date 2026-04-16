import { parseEvent } from "./event_parser"

export class Indexer {
  state: any = {
    positions: {},
    balances: {},
    trades: []
  }

  processBlock(events: any[]) {
    for (const ev of events) {
      const parsed = parseEvent(ev)

      switch (parsed.type) {
        case "position_update":
          this.state.positions[parsed.trader] = parsed
          break

        case "pnl_settlement":
          this.state.balances[parsed.trader] =
            (this.state.balances[parsed.trader] || 0) + parsed.pnl
          break

        case "trade":
          this.state.trades.push(parsed)
          break
      }
    }
  }
}