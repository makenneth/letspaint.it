package cookieJar

import (
 "errors"
 "net/http"
 "github.com/makenneth/letspaint/api_server/utils/appConfig"
)

func SetSessionToken(w http.ResponseWriter, sessionToken string) {
  cookie := http.Cookie{
    Name: "session_token",
    Value: sessionToken,
    HttpOnly: true,
    Path: "/",
    Domain: appConfig.Config.Domain,
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
