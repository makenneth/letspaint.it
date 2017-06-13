package models

import (
  "sync"
  "log"
  "errors"
  "fmt"
  "github.com/lib/pq"
  "reflect"
  "github.com/makenneth/letspaint/api_server/utils/connection"
  "github.com/makenneth/letspaint/api_server/utils/token"
)

var mutex sync.Mutex
type User struct {
  Id int `json:"id"`
  ServiceId string `json:"-"`
  Name string `json:"username"`
  Email string `json:"-"`
}

func (self *User) Save() (string, error) {
  token, _ := token.GenerateRandomToken(32)

  tx, err := connection.DB.Begin()
  if err != nil {
    log.Println(err)
    return token, errors.New("Failed to begin transaction")
  }

  var id int64
  {
    stmt, _ := tx.Prepare(`
      WITH s AS (
        SELECT id FROM users WHERE email = $2
      ), i AS (
        INSERT INTO
        users (name, email, token)
        SELECT $1, $2, $3
        WHERE NOT EXISTS (SELECT 1 FROM s)
        returning id
      )
      SELECT id FROM i
      UNION ALL
      SELECT id FROM s;
    `)
    defer stmt.Close()

    log.Println(stmt)
    result, err := stmt.Exec(self.Name, self.Email, token)
    if err != nil {
      if err, ok := err.(*pq.Error); ok {
        fmt.Println("pq error:", err.Code.Name())
        tx.Rollback()
        return "", errors.New("Failed to save user")
      }
    } else {
      v := reflect.ValueOf(result)
      id = v.Field(1).Elem().Int()
    }
  }

  {
    stmt, _ := tx.Prepare(`INSERT INTO
      oauth_tokens (service_id, user_id)
      VALUES ($1, $2);`)
    defer stmt.Close()
    log.Println(stmt)

    _, err = stmt.Exec(self.ServiceId, id)

    if err != nil {
      if err, ok := err.(*pq.Error); ok {
        fmt.Println("pq error:", err.Code.Name())
        tx.Rollback()

        if err.Code.Name() == "unique_violation" {
          return "", errors.New("User has already been registered")
        } else {
          return "", errors.New("Failed to save auth token")
        }
      }
    }
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
    SELECT id, name from users
    WHERE token = $1;
  `, token).Scan(&id, &name)
  log.Printf(`SELECT u.id, o.name from users AS u
    INNER JOIN oauth_infos AS o
    ON u.id = o.user_id
    WHERE u.token = '%s';`, token)
  if err != nil {
    log.Println(err)
    return nil, err
  }
  log.Println(id, name)
  return &User{Id: id, Name: name}, nil
}


func (self *User) ResetSessionToken() (string, error) {
  tok, _ := token.GenerateRandomToken(32)
  _, err := connection.DB.Exec(`
    UPDATE users SET token = $1 WHERE id = $2
  `, tok, self.Id)

  return tok, err
}

func ResetSessionTokenWithToken(oldToken string) error {
  tok, _ := token.GenerateRandomToken(32)
  _, err := connection.DB.Exec(`
    UPDATE users SET token = $1 WHERE token = $2
  `, tok, oldToken)
  log.Println(`
    UPDATE users SET token = $1 WHERE token = $2
  `)
  return err
}

func FindByOAuthId(serviceId string) (*User, error) {
  var (
    id int
    name string
  )
  err := connection.DB.QueryRow(`
    SELECT u.id, u.name from users AS u
    INNER JOIN oauth_tokens AS ot
    ON ot.user_id = u.id
    WHERE ot.service_id = $1;
  `, serviceId).Scan(&id, &name)

  fmt.Printf(`SELECT u.id, u.name from users AS u
    INNER JOIN oauth_tokens AS ot
    ON ot.user_id = u.id
    WHERE ot.service_id = $1;
  `, serviceId)
  if err != nil {
    return nil, err
  }
  return &User{Id: id, Name: name}, nil
}
