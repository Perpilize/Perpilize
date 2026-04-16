import express from "express";
import { cache } from "../state/global";

const app = express()

app.get("/position/:trader", (req, res) => {
  const pos = cache.getPosition(req.params.trader)
  res.json(pos || {})
})

app.get("/balance/:trader", (req, res) => {
  res.json({
    balance: cache.balances[req.params.trader] || 0
  })
})

app.get("/orderbook/:market", (req, res) => {
  res.json(cache.orderbook[req.params.market] || {})
})

app.listen(3000, () => {
  console.log("API running on 3000")
})