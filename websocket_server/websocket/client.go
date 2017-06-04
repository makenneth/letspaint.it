package websocket

import (
  "log"
  "golang.org/x/net/websocket"
)

type Client struct {
  ws *websocket.Conn
  server *Server
  done chan bool
  Id int
  Username string
  send chan *Message
}

func (self *Client) Write() chan<- *Message {
  return (chan<- *Message)(self.send)
}

func NewClient(ws *websocket.Conn, server *Server) *Client {
  done := make(chan bool)
  send := make(chan *Message)

  return &Client{ws, server, done, "abc", send}
}

func (self *Client) Listen() {
  log.Println("Client connected")
  go self.ListenWrite()
  self.ListenRead()
}

func (self *Client) ListenWrite() {
  for {
    select {
    case msg, ok := <-self.send:
      if ok {
        log.Println("sending message to client %s", self.Username)
        websocket.JSON.Send(self.ws, msg)
      } else {
        self.server.RemoveClient() <-self
        self.done <- true
        break
      }
    case <-self.done:
      self.server.RemoveClient() <-self
      self.done <- true
      break
    }
  }
}

func (self *Client) ListenRead() {
  for {
    select {
    case <-self.done:
      self.server.RemoveClient() <- self
      self.done <- true
      break
    default:
      var msg Message
      err := websocket.JSON.Receive(self.ws, &msg)
      log.Println("received message", msg)
      if err != nil {
        log.Println("err in %s...", self.Username)
        self.done <- true
        break
      } else {
        self.server.Broadcast() <- &msg
      }
    }
  }
}

func (self *Client) HandleMessage(msg *Message) {
  switch(msg.MessageType) {
  case "PAINT_INPUT_MADE":
    self.server.Broadcast() <- &msg
    break
  case "SET_USER_INFO":
    if self.Username != "" {
      log.Println("Username is being changed by user id", self.Id)
      break
    }
    var u *User;
    _ = json.Unmarshal(msg.Data, &u)
    // probably check info across server
    // one way to do this is to flip a coin...1/7 chance when a request is made
    // we would check the token
    self.Username = u.Username
    self.Id = u.Id
    data, _ := json.Marshal(true)
    self.send <- &Message{"USER_INFO_SET", data}
    break
  default:
    log.Println("Unknown message type received", msg.MessageType)
  }
}

