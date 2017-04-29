package websocket

import (
  "log"
  "strconv"
  "encoding/json"
  "github.com/go-redis/redis"
)

type GridData struct {
  Pos int `json:"pos"`
  Color int8 `json:"color"`
  Username string `json:"username"`
}

type RedisHandler struct {
  client *redis.Client
}

func (self *RedisHandler) GetBoard() []*RedisData {
  board := make([]*RedisData, 250000)
  done := make(chan bool)
  go func() {
    for i := range board[0:125000] {
      var posData RedisData
      key := "grid:" + strconv.Itoa(i)
      rawJSONString, err := self.client.Get(key).Result()
      data := []byte(rawJSONString)
      if err != nil {
        log.Println("Get board failed")
        continue
      }
      _ = json.Unmarshal(data, &posData)
      board[i] = &posData
    }
    done <- true
  }()
  go func() {
    for i := range board[125000:250000] {
      var posData RedisData
      key := "grid:" + strconv.Itoa(i + 125000)
      rawJSONString, err := self.client.Get(key).Result()
      data := []byte(rawJSONString)
      if err != nil {
        log.Println("Get board failed")
        continue
      }
      _ = json.Unmarshal(data, &posData)
      board[i + 125000] = &posData
    }
    done <- true
  }()

  for i := 0; i < 2; i++ {
    <-done
  }
  return board
}

func (self *RedisHandler) Update(msg *Message) {
  var data GridData
  err := json.Unmarshal(msg.Data, &data)
  if err != nil {
    log.Println("json unmarshalling error")
  }

  key := "grid:" + strconv.Itoa(data.Pos)
  err = self.client.Set(key, &RedisData{data.Color, data.Username}, 0).Err()

  if err != nil {
    log.Println("Redis update failed")
    return
  }
  log.Printf("successfully updated %s", key)
}
