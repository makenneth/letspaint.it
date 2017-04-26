package websocket

import (
  "golang.org/x/net/websocket"
)

type Message {
  messageType string
  message string
}

type Server struct {
  path string
  clients []*Client
  connect chan *Client
  done chan *Client
  send chan *Message
}

func (self *Server) AddClient() chan<- *Client{
  return (chan <- *Client)(self.connect)
}

func (self *Server) RemoveClient() chan<- *Client {
  return (chan <- *Client)(self.done)
}

func (self *Server) SendMessage() chan<- *Message {
  return (chan <- *Message)(self.send)
}

func newServer(path) *Server {
  clients := make([]*Client, 0)
  connect := make(chan *Client)
  done := make(chan *Client)
  send := make(chan *Message)

  return &Server{path, clients, connect, done, send}
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
        log.Printf("client %s connected", c.Username)
        self.clients = append(self.clients, c)
      case c := <-self.done:
        log.Printf("client %s disconnected", c.Username)
        var clientIdx int
        for i := range self.clients {
          if self.clients[i] == c {
            self.clients = append(self.clients[:i], self.clients[i+1:]...)
            break
          }
        }
      case msg := <-self.send:
        log.Printf("client %s send %s", c.Username, msg)
        for _, c := range self.clients {
          c.Write() <- msg
        }
      default:
        log.Println('unrecognize message')
    }
}