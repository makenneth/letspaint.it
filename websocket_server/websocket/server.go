package websocket

import (
  "net/http"
  "encoding/json"
  "github.com/go-redis/redis"
  "golang.org/x/net/websocket"
  "log"
  "time"
  "sync"
  "compress/gzip"
  "bytes"
)

const Rate = 500
var mutex sync.Mutex
type RedisData struct {
  Id int `json:"id"`
  Color int8 `json:"color"`
  Username string `json:"username"`
}

type Ranking struct {
  Data []*RankingStats `json:"ranking"`
}

type RankingStats struct {
  Username string `json:"username"`
  Count int `json:"count"`
}

type User struct {
  Id int `json:"id"`
  Username string `json:"username"`
}

type Message struct {
  MessageType string `json:"type"`
  Data json.RawMessage `json:"data"`
  Username string `json:"-"`
}

type Count struct {
  Value int `json:"count"`
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
  ranking json.RawMessage
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
  return &Server{path, clients, connect, done, broadcast, nil, usernames, colors}
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
  go self.updateRanking()
  for {
    select {
      case c := <-self.connect:
        mutex.Lock()
        self.clients = append(self.clients, c)
        mutex.Unlock()
        go self.sendInitialState(c)
        go self.sendCountUpdate()

        data, _ := json.Marshal(Rate)
        c.Write() <- &Message{MessageType: "SET_INPUT_RATE", Data: data}
        if self.ranking != nil {
          c.Write() <- &Message{MessageType: "RANKING_UPDATE", Data: self.ranking}
        }
      case c := <-self.done:
        log.Printf("client %s disconnected", c.Username)
        mutex.Lock()
        for i := range self.clients {
          if self.clients[i] == c {
            self.clients = append(self.clients[:i], self.clients[i+1:]...)
            break
          }
        }
        mutex.Unlock()
        go self.sendCountUpdate()
      case m := <-self.broadcast:
        switch m.MessageType {
        case "PAINT_INPUT_MADE":
          var data *GridData
          err := json.Unmarshal(m.Data, &data)
          if err != nil {
            log.Println("Unmarshal error", err)
            break
          }
          data.Username = m.Username
          log.Println("server data", data)
          go self.updateBoard(data)
          go handler.Update(data)

          d, _ := json.Marshal(data)
          m = &Message{MessageType: m.MessageType, Data: d}
        }

        for _, c := range self.clients {
          c.Write() <- m
        }
    }
  }
}

func (self *Server) sendErrorMessage(c *Client, message string) {
  msg, err := formatErrorMessage(message)
  if err == nil {
    c.Write() <- msg
  } else {
    log.Println("formatError", err)
  }
}

func (self *Server) sendCountUpdate() {
  data, _ := json.Marshal(&Count{len(self.clients)})
  self.broadcast <- &Message{MessageType: "USER_COUNT_UPDATE", Data: data}
}

func (self *Server) sendInitialState(c *Client) {
  go func() {
    state := &InitialState{&BoardData{self.colors, self.usernames}}
    data, _ := json.Marshal(state)
    j, _ := json.Marshal(&Message{MessageType: "FULL_INITIAL_STATE", Data: data})
    var b bytes.Buffer
    w := gzip.NewWriter(&b)
    w.Write(j)
    w.Close()
    gzipped := b.Bytes()
    c.WriteGZIP() <- gzipped
  }()
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
  c.Write() <- &Message{MessageType: "INITIAL_STATE", Data: data}
}

func (self *Server) updateBoard(data *GridData) {
  mutex.Lock()
  self.usernames[data.Pos] = data.Username
  self.colors[data.Pos] = data.Color
  mutex.Unlock()
}

func (self *Server) updateRanking() {
  for {
    usernames := make([][]*RankingStats, 250000)
    counts := make(map[string]int)
    for _, username := range self.usernames {
      if _, ok := counts[username]; ok {
        counts[username]++
      } else {
        counts[username] = 1
      }
    }

    for username, count := range counts {
      usernames[count] = append(usernames[count], &RankingStats{username, count})
    }

    ranking := make([]*RankingStats, 0)
    for i, j := 0, len(usernames) - 1; i < 10 && j >= 0; j-- {
      if len(usernames[j]) > 0 && usernames[j][0].Username != "" {
        ranking = append(ranking, usernames[j]...)
        i += len(usernames[j])
      }
    }
    data, _ := json.Marshal(&Ranking{ranking})
    self.ranking = data
    self.broadcast <- &Message{MessageType: "RANKING_UPDATE", Data: data}
    time.Sleep(10 * time.Second)
  }
}
