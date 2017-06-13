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
  Username string `json:"username"`
  Name string `json:"name"`
  Email string `json:"-"`
}

func (self *User) Save() (string, error) {
  token, _ := token.GenerateRandomToken(32)

  tx, err := connection.DB.Begin()
  if err != nil {
    log.Println(err)
    return token, errors.New("Failed to begin transaction")
  }

  var (
    id int
    userId int
  )
  {
    stmt, err := tx.Prepare(`
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
    err = stmt.QueryRow(self.Name, self.Email, token).Scan(&id)
    if err != nil {
      if err, ok := err.(*pq.Error); ok {
        fmt.Println("pq error:", err.Code.Name())
        tx.Rollback()
        return "", errors.New("Failed to save user")
      }
    }
  }

  {
    stmt, _ := tx.Prepare(`INSERT INTO
      oauth_tokens (service_id, user_id)
      VALUES ($1, $2) returning id;`)
    defer stmt.Close()
    err = stmt.QueryRow(self.ServiceId, id).Scan(&userId)
    log.Println("after exec", err)
    if err != nil {
      log.Println("err before *pq.Error", err)
      if err, ok := err.(*pq.Error); ok {
        fmt.Println("pq error:", err.Code.Name())
        tx.Rollback()

        if err.Code.Name() == "unique_violation" {
          return "", errors.New("User has already been registered")
        } else {
          return "", errors.New("Failed to save auth token")
        }
      }
    } else {
      self.Id = userId
      log.Println(self)
    }
  }
  log.Println("before commit")
  tx.Commit()
  log.Println("commited")
  return token, nil
}

func FindBySessionToken(token string) (*User, error) {
  var (
    id int
    name string
    username string
  )
  err := connection.DB.QueryRow(`
    SELECT id, name, COALESCE(username, '') from users
    WHERE token = $1;
  `, token).Scan(&id, &name, &username)
  log.Printf(`
    SELECT id, name, COALESCE(username, '') from users
    WHERE token = '%s';`, token)
  if err != nil {
    log.Println(err)
    return nil, errors.New("User not found")
  }
  log.Println(id, name)
  return &User{Id: id, Name: name, Username: username}, nil
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
    username string
  )
  err := connection.DB.QueryRow(`
    SELECT u.id, u.name, COALESCE(u.username, '') from users AS u
    INNER JOIN oauth_tokens AS ot
    ON ot.user_id = u.id
    WHERE ot.service_id = $1;
  `, serviceId).Scan(&id, &name, &username)

  fmt.Printf(`SELECT u.id, u.name, COALESCE(u.username, '')  from users AS u
    INNER JOIN oauth_tokens AS ot
    ON ot.user_id = u.id
    WHERE ot.service_id = $1;
  `, serviceId)
  if err != nil {
    return nil, errors.New("User not found")
  }
  return &User{Id: id, Name: name, Username: username}, nil
}

func SetUsername(sessionToken, username string) (*User, error) {
  var (
    id int
    name string
  )

  err := connection.DB.QueryRow(`
    UPDATE users SET username = $1
    WHERE token = $2 AND COALESCE(username, '') = ''
    returning id, name;
  `, username, sessionToken).Scan(&id, &name)

  if err != nil {
    if err, ok := err.(*pq.Error); ok {
      fmt.Println("pq error:", err.Code.Name())

      if err.Code.Name() == "unique_violation" {
        return nil, errors.New("Username has been taken.")
      }
    }

    if err.Error() == "sql: no rows in result set" {
      return nil, errors.New("Username can only be set once")
    }
    return nil, err
  }

  return &User{Id: id, Name: name, Username: username}, nil
}

func IsUsernameAvailable(username string) bool {
  var count int
  err := connection.DB.QueryRow(`
    SELECT COUNT(*) FROM users WHERE username = $1;
  `, username).Scan(&count)
  if err != nil {
    log.Println("Query username error", err)
    return false
  }
  return count == 0
}
