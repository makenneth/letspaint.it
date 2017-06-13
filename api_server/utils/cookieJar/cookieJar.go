package cookieJar

import (
 "errors"
 "net/http"
)

func SetSessionToken(w http.ResponseWriter, sessionToken string) {
  cookie := http.Cookie{
    Name: "session_token",
    Value: sessionToken,
    HttpOnly: true,
    Path: "/",
    Domain: "127.0.0.1",
  }
  http.SetCookie(w, &cookie)
}

func GetSessionToken(r *http.Request) (string, error) {
  cookie, err := r.Cookie("session_token")
  if err != nil || cookie.String() == "" {
    return "", errors.New("Session token not found.")
  }

  return cookie.Value, nil
}
