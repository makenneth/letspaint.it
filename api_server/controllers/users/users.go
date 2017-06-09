package users

import (
  "net/http"
  // "log"
  "encoding/json"
  "errors"
  "github.com/makenneth/letspaint/api_server/models"
  "github.com/makenneth/letspaint/api_server/utils/cookieJar"
)

func GetProfileInfo(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  if r.Method != "GET" {
    next(404, errors.New("Method not supported"))
    return
  }

  token, err := cookieJar.GetSessionToken(r)
  if err != nil {
    next(403, errors.New("Token not found."))
    return
  }
  u, err := models.FindBySessionToken(token)
  if err != nil {
    cookieJar.SetSessionToken(w, "")
    next(404, errors.New("User Not Found. Session may have expired."))
    return
  }
  sessionToken, err := u.ResetSessionToken()
  if err != nil {
    next(500, errors.New("Database error."))
    return
  }
  cookieJar.SetSessionToken(w, sessionToken)
  data, err := json.Marshal(u)
  w.WriteHeader(200)
  w.Write(data)
}


