package connection

import (
  "fmt"
  "log"
  "database/sql"
  _ "github.com/lib/pq"
)

var postgres *sql.DB
var acceptedFields = [...]string{
  "dbname",
  "user",
  "password",
  "host",
  "port",
  "connect_timeout",
}

func contains(arr [6]string, s string) bool {
  for _, el := range arr {
    if el == s {
      return true
    }
  }

  return false
}

func getConnectString(config *map[string]string) string {
  var connectStr string
  for field, value := range *config {
    if contains(acceptedFields, field) {
      connectStr += fmt.Sprintf(" %s %s", field, value)
    }
  }

  return connectStr
}

func Connect(config *map[string]string) {
  connectStr := getConnectString(config)
  fmt.Println(connectStr)
  db, err := sql.Open("postgres", connectStr)
  if err != nil {
    log.Fatal("Fail to connect to postgres ---\n", err)
  }
  log.Println("Connection to postgres --- Success")
  postgres = db
}
