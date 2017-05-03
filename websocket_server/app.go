package main

import (
  "log"
  "net/http"
  "github.com/makenneth/letspaint.it/websocket_server/websocket"
)

func main() {
  port := ":4001"
  webSocketServer := websocket.NewServer("/ws")
  go webSocketServer.Listen()
  log.Printf("http server listening at port %s", port)
  log.Fatal(http.ListenAndServe(port, nil))
}
