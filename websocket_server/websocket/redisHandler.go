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

func (self *RedisHandler) GetBoard() ([]int8, []string) {
  usernames := make([]string, 250000)
  colors := make([]int8, 250000)

  for i := 0; i < 250000; i++ {
    var posData RedisData
    key := "grid:" + strconv.Itoa(i)
    rawJSONString, err := self.client.Get(key).Result()
    data := []byte(rawJSONString)
    if err != nil {
      log.Fatal("Get board failed")
      continue
    }
    _ = json.Unmarshal(data, &posData)

    usernames[i] = posData.Username
    colors[i] = posData.Color
  }

  return colors, usernames
}

func (self *RedisHandler) Update(data *GridData) {
  key := "grid:" + strconv.Itoa(data.Pos)
  pointJson, err := json.Marshal(&RedisData{Color: data.Color, Username: data.Username})
  if err != nil {

    log.Println("marshalling", err)
    return
  }
  err = self.client.Set(key, pointJson, 0).Err()

  if err != nil {
    log.Println("Redis update failed", err)
    return
  }
  log.Printf("successfully updated %s", key)
}
