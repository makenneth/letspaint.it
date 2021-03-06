package oauth

import (
  "log"
  "fmt"
  "time"
  "errors"
  "net/http"
  "encoding/json"
  "github.com/makenneth/letspaint/api_server/utils/cookieJar"
  "golang.org/x/oauth2"
  "golang.org/x/oauth2/google"
  "golang.org/x/oauth2/facebook"
  "github.com/makenneth/letspaint/api_server/models"
  "github.com/makenneth/letspaint/api_server/utils/token"
  "github.com/makenneth/letspaint/api_server/utils/appConfig"
)

type OAuthCredential struct {
  ClientId string `yaml:"client_id"`
  ClientSecret string `yaml:"client_secret"`
}

var SessionTokens = make(map[string]string)
var oauthCredentials = make(map[string]map[string]*oauth2.Config)

func GetLoginURL(requestType, authType, state string) string {
  log.Println(requestType, authType, state)
  return oauthCredentials[authType][requestType].AuthCodeURL(state)
}

func Initialize(config map[string]*OAuthCredential) {
  if _, ok := oauthCredentials["google"]; !ok {
    oauthCredentials["google"] = make(map[string]*oauth2.Config)
  }
  if _, ok := oauthCredentials["facebook"]; !ok {
    oauthCredentials["facebook"] = make(map[string]*oauth2.Config)
  }
  oauthCredentials["google"]["login"] = googleConfig("login", config["google"])
  oauthCredentials["google"]["signup"] = googleConfig("signup", config["google"])
  oauthCredentials["facebook"]["login"] = facebookConfig("login", config["facebook"])
  oauthCredentials["facebook"]["signup"] = facebookConfig("signup", config["facebook"])
  log.Println("Initialized oauth settings")
}

func LogInHandler(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  oauthType := r.URL.Query().Get("type")
  if _, ok := oauthCredentials[oauthType]; !ok {
    next(404, errors.New("Type not supported"))
    return
  }
  done := make(chan bool)
  go func() {
    cookie := &http.Cookie{
      Name: "auth_success",
      Value: "true",
      HttpOnly: false,
      Path: "/",
      Domain: appConfig.Config.Domain,
      MaxAge: -1,
      Expires: time.Now().Add(-100 * time.Hour),
    }
    http.SetCookie(w, cookie)
    cookie = &http.Cookie{
      Name: "auth_error",
      Value: "true",
      HttpOnly: false,
      Path: "/",
      MaxAge: -1,
      Expires: time.Now().Add(-100 * time.Hour),
    }
    http.SetCookie(w, cookie)
    done <- true
  }()
  tok, _ := token.GenerateRandomToken(32)
  cookie := http.Cookie{
    Name: "oauth-tok",
    Value: tok,
    Expires: time.Now().Add(15 * time.Minute),
    HttpOnly: true,
    Domain: appConfig.Config.Domain,
  }
  <- done
  http.SetCookie(w, &cookie)
  url := map[string]string{"url": GetLoginURL("login", oauthType, tok)}
  data, _ := json.Marshal(url)
  w.Write(data)
}

func SignUpHandler(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  oauthType := r.URL.Query().Get("type")
  if _, ok := oauthCredentials[oauthType]; !ok {
    next(404, errors.New("Type not supported"))
    return
  }
  done := make(chan bool)
  go func() {
    cookie := &http.Cookie{
      Name: "auth_success",
      Value: "true",
      HttpOnly: false,
      Path: "/",
      Domain: appConfig.Config.Domain,
      MaxAge: -1,
      Expires: time.Now().Add(-100 * time.Hour),
    }
    http.SetCookie(w, cookie)
    cookie = &http.Cookie{
      Name: "auth_error",
      Value: "true",
      HttpOnly: false,
      Path: "/",
      Domain: appConfig.Config.Domain,
      MaxAge: -1,
      Expires: time.Now().Add(-100 * time.Hour),
    }
    http.SetCookie(w, cookie)
    done <- true
  }()
  tok, _ := token.GenerateRandomToken(32)
  cookie := http.Cookie{
    Name: "oauth-tok",
    Value: tok,
    Expires: time.Now().Add(15 * time.Minute),
    HttpOnly: true,
    Domain: appConfig.Config.Domain,
  }
  <- done
  http.SetCookie(w, &cookie)
  url := map[string]string{"url": GetLoginURL("signup", oauthType, tok)}
  data, _ := json.Marshal(url)
  w.Write(data)
}

func LogOutHandler(w http.ResponseWriter, r *http.Request, next func(int, error)) {
  if r.Method != "DELETE" {
    next(404, errors.New("Unknown method for the endpoint"))
    return
  }
  oldToken, err := cookieJar.GetSessionToken(r)
  cookieJar.SetSessionToken(w, "")

  if err == nil {
    _ = models.ResetSessionTokenWithToken(oldToken)
  }
  data, _ := json.Marshal(true)
  w.Write(data)
}

func googleConfig(requestType string, cred *OAuthCredential) *oauth2.Config {
  return &oauth2.Config{
    ClientID: cred.ClientId,
    ClientSecret: cred.ClientSecret,
    RedirectURL: fmt.Sprintf("%s/oauth/google/%s", appConfig.Config.Domain, requestType),
    Scopes: []string{
      "https://www.googleapis.com/auth/userinfo.email",
    },
    Endpoint: google.Endpoint,
  }
}

func facebookConfig(requestType string, cred *OAuthCredential) *oauth2.Config {
  return &oauth2.Config{
    ClientID: cred.ClientId,
    ClientSecret: cred.ClientSecret,
    RedirectURL: fmt.Sprintf("%s/oauth/facebook/%s", appConfig.Config.Domain, requestType),
    Scopes: []string{
      "public_profile",
      "email",
    },
    Endpoint: facebook.Endpoint,
  }
}

