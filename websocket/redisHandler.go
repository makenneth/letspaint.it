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
}

type RedisHandler struct {
  client *redis.Client
}

func (self *RedisHandler) GetBoard() []int8{
  board := make([]int8, 10000)

  for i := range board {
    key := "grid:" + strconv.Itoa(i)
    val, err := self.client.Get(key).Result()
    if err != nil {
      log.Println("Get board failed")
      continue
    }
    color, _ := strconv.Atoi(val)
    board[i] = int8(color)
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
  err = self.client.Set(key, data.Color, 0).Err()
  if err != nil {
    log.Println("Redis update failed")
    return
  }
  log.Printf("successfully updated %s", key)
}
