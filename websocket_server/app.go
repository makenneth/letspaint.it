package main

import (
  "log"
  "net/http"
  "github.com/makenneth/letspaint/websocket_server/websocket"
  "crypto/tls"
  "golang.org/x/crypto/acme/autocert"
)

func main() {
  port := ":4000"
  webSocketServer := websocket.NewServer("/ws")
  go webSocketServer.Listen()
  m := autocert.Manager{
    Prompt:     autocert.AcceptTOS,
    Cache:      autocert.DirCache("certs"),
    HostPolicy: autocert.HostWhitelist("www.letspaint.it", "letspaint.it"),
  }
  s := &http.Server{
    Addr:      port,
    TLSConfig: &tls.Config{
      GetCertificate: m.GetCertificate,
      ClientSessionCache: tls.NewLRUClientSessionCache(50),
    },
  }

  log.Printf("http server listening at port %s", port)
  log.Fatal(s.ListenAndServeTLS("", ""))
}
