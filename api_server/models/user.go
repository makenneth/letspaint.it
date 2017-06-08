package models

import (
  "sync"
  "log"
  "errors"
  "fmt"
  "github.com/lib/pq"
  "github.com/makenneth/letspaint/api_server/utils/connection"
  "github.com/makenneth/letspaint/api_server/utils/token"
)

var mutex sync.Mutex
type User struct {
  Id int `json:"id"`
  ServiceId string `json:"-"`
  Name string  `json:"name"`
}

func (self *User) Save() (string, error) {
  token, _ := token.GenerateRandomToken(32)

  tx, err := connection.DB.Begin()
  if err != nil {
    log.Println(err)
    return token, errors.New("Failed to begin transaction")
  }

  var id int
  log.Println(token)
  err = connection.DB.QueryRow(`
    INSERT INTO users (token) VALUES ($1) returning id;
  `, token).Scan(&id)
  if err != nil {
    tx.Rollback()
    if err, ok := err.(*pq.Error); ok {
      log.Println("pq error:", err.Code.Name())
    }
    return token, errors.New("Failed to save user")
  }

  sqlStmt := fmt.Sprintf(`INSERT INTO
    oauth_infos (user_id, name, service_id)
    VALUES (%d, '%s', '%s');`, id, self.Name, self.ServiceId)
  log.Println(sqlStmt)
  _, err = connection.DB.Exec(sqlStmt)
  if err != nil {
    log.Println(err)
    tx.Rollback()
    return "", errors.New("Failed to save auth info")
  }
  tx.Commit()

  return token, nil
}

func FindBySessionToken(token string) (*User, error) {
  var (
    id int
    name string
  )
  err := connection.DB.QueryRow(`
    SELECT u.id, o.name from users AS u
    WHERE token = $1
    INNER JOIN oauth_infos AS o
    ON u.id = o.user_id;
  `, token).Scan(&id, &name)
  if err != nil {
    return nil, err
  }
  return &User{Id: id, Name: name}, nil
}

func (self *User) ResetSessionToken() (string, error) {
  tok, _ := token.GenerateRandomToken(32)
  _, err := connection.DB.Exec(`
    UPDATE users SET token = $1 WHERE id = $2
  `, tok, self.Id)

  return tok, err
}

func FindByOAuthId(serviceId string) (*User, error) {
  var (
    id int
    name string
  )
  err := connection.DB.QueryRow(`
    SELECT u.id, o.name from users AS u
    INNER JOIN oauth_infos AS o
    ON u.id = o.user_id
    WHERE o.service_id = $1;
  `, serviceId).Scan(&id, &name)

  fmt.Printf(`SELECT u.id, o.name from users AS u
    INNER JOIN oauth_infos AS o
    ON u.id = o.user_id
    WHERE o.service_id = '%s';
  `, serviceId)
  if err != nil {
    return nil, err
  }
  return &User{Id: id, Name: name}, nil
}
