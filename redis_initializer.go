package main

import (
  "strconv"
  "github.com/go-redis/redis"
  "log"
)
func main() {
  redisCli := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "", // no password set
    DB:       0,  // use default DB
  })

  for i := 0; i < 10000; i++ {
    key := "grid:" + strconv.Itoa(i)
    err := redisCli.Set(key, 32, 0).Err()
    if err != nil {
      log.Fatal("Setting failed")
    }
  }
}
