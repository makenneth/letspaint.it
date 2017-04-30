package main

import (
  "strconv"
  "encoding/json"
  "github.com/go-redis/redis"
  "log"
)

type dataToStore struct {
  Color int8 `json:"color"`
  Username string `json:"username"`
}

func main() {
  redisCli := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "", // no password set
    DB:       0,  // use default DB
  })

  for i := 0; i < 250000; i++ {
    key := "grid:" + strconv.Itoa(i)
    value := &dataToStore{32, ""}
    data, _ := json.Marshal(value)
    err := redisCli.Set(key, data, 0).Err()
    if err != nil {
      log.Fatal("Setting failed")
    }
  }
}
