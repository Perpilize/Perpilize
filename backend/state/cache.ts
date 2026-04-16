export class StateCache {
  positions: Record<string, any> = {}
  balances: Record<string, number> = {}
  orderbook: Record<string, any> = {}

  updatePosition(trader: string, data: any) {
    this.positions[trader] = data
  }

  getPosition(trader: string) {
    return this.positions[trader]
  }
}