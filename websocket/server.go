package websocket

import (
  "net/http"
  "encoding/json"
  "github.com/go-redis/redis"
  "golang.org/x/net/websocket"
  "log"
  "strconv"
)

type Message struct {
  MessageType string `json:"type"`
  Data json.RawMessage `json:"data"`
}

type InitialState struct {
  Board []int8 `json:"grid"`
}

type Server struct {
  path string
  clients []*Client
  connect chan *Client
  done chan *Client
  broadcast chan *Message
  board []int8
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
  redisCli := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "", // no password set
    DB:       0,  // use default DB
  })

  pong, err := client.Ping().Result()
  if err != nil {
    log.Fatal("Failed to connect to redis")
  }
  handler := RedisHandler{redisCli}
  defer redisCli.Close()

  http.Handle(self.path, websocket.Handler(onConnected))
  self.board = handler.GetBoard()
  for {
    select {
      case c := <-self.connect:
        c.Username += strconv.Itoa(len(self.clients) + 1)
        log.Printf("client %s connected", c.Username)
        self.clients = append(self.clients, c)

        data, _ := json.Marhsal(&{InitialState{self.board}})
        c.Write() <- &Message{"INITIAL_STATE", data}
      case c := <-self.done:
        log.Printf("client %s disconnected", c.Username)
        for i := range self.clients {
          if self.clients[i] == c {
            self.clients = append(self.clients[:i], self.clients[i+1:]...)
            break
          }
        }
      case m := <-self.broadcast:
        go self.updateBoard(&m)
        go handle.Update(&m)
        for _, c := range self.clients {
          c.Write() <- m
        }
    }
  }
}

func (self *Server) updateBoard(msg *Message) {
  var data GridData
  err := json.Unmarshal(&data)
  if err != nil {
    log.Println("json unmarshalling error")
  }

  self.board[data.Pos] = data.Color
}