package websocket

import (
  "net/http"
  "encoding/json"
  "github.com/go-redis/redis"
  "golang.org/x/net/websocket"
  "log"
  "strconv"
)

type RedisData struct {
  Color int8 `json:"color"`
  Username string `json:"username"`
}

type Message struct {
  MessageType string `json:"type"`
  Data json.RawMessage `json:"data"`
}

type InitialState struct {
  Board []*RedisData `json:"grid"`
}

type Server struct {
  path string
  clients []*Client
  connect chan *Client
  done chan *Client
  broadcast chan *Message
  board []*RedisData
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
  board := make([]*RedisData, 0)
  return &Server{path, clients, connect, done, broadcast, board}
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

  _, err := redisCli.Ping().Result()
  if err != nil {
    log.Fatal("Failed to connect to redis")
  }
  log.Println("Successfully connected to redis")
  handler := RedisHandler{redisCli}
  defer redisCli.Close()

  http.Handle(self.path, websocket.Handler(onConnected))
  self.board = handler.GetBoard()
  log.Println("get board done")
  for {
    select {
      case c := <-self.connect:
        c.Username += strconv.Itoa(len(self.clients) + 1)
        log.Printf("client %s connected", c.Username)
        self.clients = append(self.clients, c)
        data, _ := json.Marshal(&InitialState{self.board})
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
        go self.updateBoard(m)
        go handler.Update(m)
        for _, c := range self.clients {
          c.Write() <- m
        }
    }
  }
}

func (self *Server) updateBoard(msg *Message) {
  // should also store username and timestamp
  var data GridData
  err := json.Unmarshal(msg.Data, &data)
  if err != nil {
    log.Println("json unmarshalling error")
  }
  self.board[data.Pos] = &RedisData{data.Color, data.Username}
}