package websocket

import (
  "golang.org/x/net/websocket"
)

type Client struct {
  ws *websocket.Conn
  server *Server
  done chan bool
  username string
  send chan *Message
}

func (self *Client) Write() chan<- *Message {
  return (chan<- *Message)(self.send)
}

func NewClient(ws, server) *Client {
  done := make(chan bool)
  send := make(chan *Message)

  return &{ws, server, done, "", send}
}

func (self *Client) Listen() {
  go self.ListenWrite()
  self.ListenRead()
}

func (self *Client) ListenWrite() {
  for {
    select {
    case msg <-self.send:
      websocket.JSON.Send(self.ws, msg)
    case <-self.done:
      self.server.RemoveClient() <-self
      self.done <- true
      return
    }
  }
}

func (self *Client) ListenRead() {
  for {
    select {
    case <-self.done:
      self.server.RemoveClient() <- self
      self.done <- true
      return
    default:
      var msg Message
      err := websocket.JSON.Receive(self.ws, &msg)
      if err != nil {
        self.done <- true
      } else {
        self.Server.SendMessage <- &msg
      }
    }
  }
}
