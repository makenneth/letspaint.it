package users

import (
  "net/http"
  // "log"
  "encoding/json"
  "errors"
  "github.com/makenneth/letspaint/api_server/models"
  "github.com/makenneth/letspaint/api_server/utils/cookieJar"
)

func GetProfileInfo(w http.ResponseWriter, r *http.Request) (int, error) {
  if r.Method != "GET" {
    return 404, errors.New("Method not supported")
  }

  token, err := cookieJar.GetSessionToken(r)
  if err != nil {
    return 403, errors.New("Token not found.")
  }
  u, err := models.FindBySessionToken(token)
  if err != nil {
    cookieJar.SetSessionToken(w, "")
    return 404, errors.New("User Not Found. Session may have expired.")
  }
  sessionToken, err := u.ResetSessionToken()
  if err != nil {
    return 500, errors.New("Database error.")
  }
  cookieJar.SetSessionToken(w, sessionToken)
  data, err := json.Marshal(u)
  w.WriteHeader(200)
  w.Write(data)

  return 0, nil
}


