package users

import (
  "net/http"
  "log"
  "github.com/makenneth/letspaint/api_server/models/user"
)

func getProfileInfo(w http.ResponseWriter, r *http.Request) (int, string) {
  if r.Method != "GET" {
    return 404, "Method not supported"
  }

  token, err := r.Cookie("session_token")
  if err != nil || token == "" {
    return 404, "Session token not found."
  }
  u, err := user.GetBySessionToken(token)
  if err != nil {
    cookie := http.Cookie{
      Name: "session_token",
      Value: "",
      Path: "/",
      HttpOnly: true,
    }
    http.SetCookie(w, &cookie)
    return 404, "User Not Found. Session may have expired."
  }

  data, err := json.Marshal(u)
  w.WriteHeader(200)
  w.Write(data)

  return 0, ""
}

