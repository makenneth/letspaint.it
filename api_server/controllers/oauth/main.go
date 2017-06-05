package oauth

import (
  "log"
  "time"
  "net/http"
  "encoding/json"
  "golang.org/x/oauth2"
  "golang.org/x/oauth2/google"
  "github.com/makenneth/letspaint/api_server/utils/token"
)

type OAuthCredential struct {
  ClientId string `yaml:"client_id"`
  ClientSecret string `yaml:"client_secret"`
}

var SessionTokens = make(map[string]string)
var oauthCredentials = make(map[string]map[string]*oauth2.Config)

func Initialize(config map[string]*OAuthCredential) {
  if _, ok := oauthCredentials["google"]; !ok {
    oauthCredentials["google"] = make(map[string]*oauth2.Config)
  }
  oauthCredentials["google"]["login"] = googleConfig("login", config["google"])
  oauthCredentials["google"]["signup"] = googleConfig("signup", config["google"])
  log.Println(oauthCredentials)
}

func LogInHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  oauthType := r.URL.Query().Get("type")
  if _, ok := oauthCredentials[oauthType]; !ok {
    return 404, "Type not supported"
  }

  tok, _ := token.GenerateRandomToken(32)
  cookie := http.Cookie{
    Name: "oauth-tok",
    Value: tok,
    Expires: time.Now().Add(15 * time.Minute),
    HttpOnly: true,
    Domain: "127.0.0.1",
  }

  http.SetCookie(w, &cookie)
  url := map[string]string{"url": GetLoginURL("login", oauthType, tok)}
  data, _ := json.Marshal(url)
  w.Write(data)
  return 0, ""
}

func SignUpHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  oauthType := r.URL.Query().Get("type")
  if _, ok := oauthCredentials[oauthType]; !ok {
    return 404, "Type not supported"
  }

  tok, _ := token.GenerateRandomToken(32)
  cookie := http.Cookie{
    Name: "oauth-tok",
    Value: tok,
    Expires: time.Now().Add(15 * time.Minute),
    HttpOnly: true,
    Domain: "127.0.0.1",
  }

  http.SetCookie(w, &cookie)
  url := map[string]string{"url": GetLoginURL("signup", oauthType, tok)}
  data, _ := json.Marshal(url)
  w.Write(data)
  return 0, ""
}

func googleConfig(requestType string, cred *OAuthCredential) *oauth2.Config {
  return &oauth2.Config{
    ClientID: cred.ClientId,
    ClientSecret: cred.ClientSecret,
    RedirectURL: "http://127.0.0.1:3000/oauth/google/" + requestType,
    Scopes: []string{
      "https://www.googleapis.com/auth/userinfo.email",
    },
    Endpoint: google.Endpoint,
  }
}

