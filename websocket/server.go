package websocket

import (
  "net/http"
  "encoding/json"
  "golang.org/x/net/websocket"
  "log"
  "strconv"
)

type Message struct {
  MessageType string `json:"type"`
  Data json.RawMessage `json:"data"`
}

type Server struct {
  path string
  clients []*Client
  connect chan *Client
  done chan *Client
  broadcast chan *Message
}

func (self *Server) AddClient() chan<- *Client{
  return (chan <- *Client)(self.connect)
}

func (self *Server) RemoveClient() chan<- *Client {
  return (chan <- *Client)(self.done)
}

func (self *Server) Broadcast() chan<- *Message {
  return (chan <- *Message)(self.broadcast)
}

func NewServer(path string) *Server {
  clients := make([]*Client, 0)
  connect := make(chan *Client)
  done := make(chan *Client)
  broadcast := make(chan *Message)

  return &Server{path, clients, connect, done, broadcast}
}

func (self *Server) Listen() {
  onConnected := func(ws *websocket.Conn) {
    client := NewClient(ws, self)
    self.connect <- client
    client.Listen()
    defer ws.Close()
  }

  http.Handle(self.path, websocket.Handler(onConnected))
  for {
    select {
      case c := <-self.connect:
        c.Username += strconv.Itoa(len(self.clients) + 1)
        log.Printf("client %s connected", c.Username)
        self.clients = append(self.clients, c)
      case c := <-self.done:
        log.Printf("client %s disconnected", c.Username)
        for i := range self.clients {
          if self.clients[i] == c {
            self.clients = append(self.clients[:i], self.clients[i+1:]...)
            break
          }
        }
      case msg := <-self.broadcast:
        for _, c := range self.clients {
          c.Write() <- msg
        }
    }
  }
}
