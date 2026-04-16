import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 })

export function broadcast(data: any) {
  const msg = JSON.stringify(data)

  wss.clients.forEach(c => {
    c.send(msg)
  })
}