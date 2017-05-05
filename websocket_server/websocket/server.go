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

type BoardData struct {
  Colors []int8 `json:"colors"`
  Usernames []string `json:"usernames"`
}

type InitialState struct {
  Board *BoardData `json:"grid"`
}

type Server struct {
  path string
  clients []*Client
  connect chan *Client
  done chan *Client
  broadcast chan *Message
  usernames []string
  colors []int8
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
  usernames := make([]string, 0)
  colors := make([]int8, 0)
  return &Server{path, clients, connect, done, broadcast, usernames, colors}
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
  self.colors, self.usernames = handler.GetBoard()
  log.Println("get board done")
  for {
    select {
      case c := <-self.connect:
        c.Username += strconv.Itoa(len(self.clients) + 1)
        log.Printf("client %s connected", c.Username)
        self.clients = append(self.clients, c)
        go self.sendInitialState(c)
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

func (self *Server) sendInitialState(c *Client) {
  usernames := make([]string, 10000)
  colors := make([]int8, 10000)
  for i := 0; i < 100; i++ {
    for j := 0; j < 100; j++ {
      usernames[i * 100 + j] = self.usernames[i * 500 + j]
      colors[i * 100 + j] = self.colors[i * 500 + j]
    }
  }
  state := &InitialState{&BoardData{colors, usernames}}
  data, _ := json.Marshal(state)
  c.Write() <- &Message{"INITIAL_STATE", data}
  state = &InitialState{&BoardData{self.colors, self.usernames}}
  data, _ = json.Marshal(state)
  c.Write() <- &Message{"FULL_INITIAL_STATE", data}
}

func (self *Server) updateBoard(msg *Message) {
  // should also store timestamp
  var data GridData
  err := json.Unmarshal(msg.Data, &data)
  if err != nil {
    log.Println("json unmarshalling error")
  }
  self.usernames[data.Pos] = data.Username
  self.colors[data.Pos] = data.Color
}
