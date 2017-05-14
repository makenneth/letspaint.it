package models

import (
  "sync"
  "log"
  "fmt"
  "github.com/lib/pq"
  "github.com/makenneth/letspaint/api_server/utils/connection"
  "github.com/makenneth/letspaint/api_server/utils/token"
)

var mutex sync.Mutex
type User struct {
  Id string `json:"id"`
  Name string  `json:"name"`
}

func (self *User) Save() (string, string) {
  token, _ := token.GenerateRandomToken(32)
  mutex.Lock()
  defer mutex.Unlock()

  tx, err := connection.DB.Begin()
  if err != nil {
    return "", "Failed to begin transaction"
  }

  var id int
  err = connection.DB.QueryRow(`
    INSERT INTO users (token) values ($1) returning id;
  `, token).Scan(&id)
  if err != nil {
    tx.Rollback()
    if err, ok := err.(*pq.Error); ok {
      log.Println("pq error:", err.Code.Name())
    }
    return "", "Failed to save user"
  }

  sqlStmt := fmt.Sprintf(`INSERT INTO
    oauth_info (user_id, name, service_id)
    VALUES (%d, '%s', '%s');`, id, self.Name, self.Id)

  _, err = connection.DB.Exec(sqlStmt)
  if err != nil {
    tx.Rollback()
    return "", "Failed to save auth info"
  }
  tx.Commit()

  return token, ""
}

func GetBySessionToken(token string) (string, error) {
  var name string
  err := connection.DB.QueryRow(`
    SELECT o.name from users AS u
    WHERE token = $1
    INNER JOIN oauth_info AS o
    ON u.id = o.user_id;
  `, token).Scan(&name)
  if err != nil {
    return "", err
  }
  return name, nil
}
