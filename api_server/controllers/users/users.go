package users

import (
  "net/http"
  "log"
  "fmt"
  "errors"
  "github.com/makenneth/letspaint/api_server/controllers/helpers"
  "github.com/makenneth/letspaint/api_server/models"
  "github.com/makenneth/letspaint/api_server/utils/cookieJar"
)

type IsAvailable struct {
  Available bool `json:"available"`
}

func GuestLoginHandler(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  if r.Method != "POST" {
    next(404, errors.New("Unknown method for the endpoint"))
    return
  }

  data := helpers.FormatData(&models.User{Id: 999, Username: "guest", Name: "guest"})
  w.Write(data)
}

func GetProfileInfo(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  if r.Method != "GET" {
    next(404, errors.New("Method not supported"))
    return
  }

  token, err := cookieJar.GetSessionToken(r)
  log.Println("profileinfo token", token)
  if err != nil {
    next(404, errors.New("Token not found."))
    return
  }
  u, err := models.FindBySessionToken(token)
  if err != nil {
    cookieJar.SetSessionToken(w, "")
    next(404, errors.New("User Not Found. Session may have expired."))
    return
  }

  data := helpers.FormatData(u)
  w.Write(data)
}

func UsernameHandler(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  log.Println("Username handler", r.Method)
  if r.Method == "GET" {
    username := r.URL.Query().Get("username")
    if len(username) < 5 {
      next(404, errors.New("Username too short"))
      return
    }
    bool := models.IsUsernameAvailable(username)
    data := helpers.FormatData(&IsAvailable{bool})
    w.Write(data)
  } else if r.Method == "POST" {
    username := r.URL.Query().Get("username")
    token, err := cookieJar.GetSessionToken(r)
    if token == "" || err != nil {
      next(403, errors.New("User is not authorized"))
      return
    }

    if len(username) < 5 {
      next(404, errors.New("Username too short"))
      return
    }
    user, err := models.SetUsername(token, username)
    if err != nil {
      next(422, err)
      return
    }
    data := helpers.FormatData(user)
    w.Write(data)
  } else {
    next(404, errors.New(fmt.Sprintf("Unknown method %s for %s", r.Method, r.URL)))
    return
  }
}
