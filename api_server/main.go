package main

import (
  "fmt"
  "log"
  "time"
  "net/http"
  "encoding/json"
  "path/filepath"
  "gopkg.in/yaml.v2"
  "golang.org/x/oauth2"
  "golang.org/x/oauth2/google"
  "io/ioutil"
  "./token"
)

type Config struct {
  OAuth map[string]*OAuthCredential `yaml:"oauth"`
}

type OAuthCredential struct {
  ClientId string `yaml:"client_id"`
  ClientSecret string `yaml:"client_secret"`
}

type ErrorMessage struct {
  Error struct {
    Message string `json:"message"`
  } `json:"error"`
}

var oauthCredentials = make(map[string]*oauth2.Config)

const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>letspaint.it</title>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
      body,html,#root{
        width:100%;
        height:100%;
      }

      body,html,div,ul,li {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
      }

      * {
        font-family: 'Open Sans', sans-serif;
      }

      .app-container {
        font-size: 24px;
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
      }

      .app-container h3 {
        margin: 0;
        font-weight: 400;
        bottom: 10px;
        right: 20px;
        position: absolute;
        color: #b5b9d6;
        letter-spacing: 2.5px;
      }

      .app-container:after {
        background: linear-gradient(to right, rgb(13, 102, 167) 15%,rgb(110, 152, 202)37.5%, rgb(181, 128, 255) 50%, rgb(181, 128, 255) 50%, rgb(255, 102, 204) 75%, rgb(254, 0, 191) 87.5%, rgb(254, 0, 191) 87.5%);
        position: absolute;
        content: '';
        height: 4px;
        right: 0;
        left: 0;
        top: 0;
      }
    </style>
    <script src="http://localhost:5000/bundle.js"></script>
  </head>
  <body>
    <div id="root">
      <div class="app-container">
        <h3>letspaint.it</h3>
      </div>
    </div>
  </body>
  </html>
`;

func templateHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  w.Header().Set("Content-Type", "text/html; charset=utf-8")
  fmt.Fprint(w, html)

  return 0, ""
}

func errorResponse(w http.ResponseWriter, code int, message string) {
  w.WriteHeader(code)
  err := &ErrorMessage{}
  err.Error.Message = message
  res, _ := json.Marshal(err)
  w.Write(res)
}

func httpHandler(w http.ResponseWriter, r *http.Request) {
  // w.Header().Set("Content-Type", "application/json")
  var code int
  var msg string
  switch r.URL.Path {
  case "/oauth/google":
    code, msg = googleOAuthHandler(w, r)
  case "/oauth/login":
    code, msg = loginHandler(w, r)
  default:
    code, msg = templateHandler(w, r)
  }
  if code != 0 {
    log.Println(msg)
    errorResponse(w, code, msg)
  }
}

func loginHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  oauthType := r.URL.Query().Get("type")
  log.Println(r.Cookies())
  log.Println(len(r.Cookies()))
  if _, ok := oauthCredentials[oauthType]; !ok {
    return 404, "Type not supported"
  }

  tok, _ := token.GenerateRandomToken(32)
  cookie := http.Cookie{
    Name: "oauth-tok",
    Value: tok,
    Expires: time.Now().Add(15 * time.Minute),
    // Secure: true,
    HttpOnly: true,
  }
  log.Println(tok)
  http.SetCookie(w, &cookie)
  // http.Redirect(w, r, getLoginURL(oauthType, tok), 302)
  url := map[string]string{"url": getLoginURL(oauthType, tok)}
  data, _ := json.Marshal(url)
  w.Write(data)
  return 0, ""
}

func getLoginURL(authType, state string) string {
  return oauthCredentials[authType].AuthCodeURL(state)
}

func googleOAuthHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  cookie, err := r.Cookie("oauth-tok")
  if _, ok := oauthCredentials["google"]; !ok {
    return 404, "OAuth Type not supported"
  }
  if err == nil && cookie.String() != "" {
    if r.URL.Query().Get("state") == cookie.Value {
      tok, err := oauthCredentials["google"].Exchange(oauth2.NoContext, r.URL.Query().Get("code"))
      if err == nil {
        client := oauthCredentials["google"].Client(oauth2.NoContext, tok)
        resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
        if err == nil {
          defer resp.Body.Close()
          data, _ := ioutil.ReadAll(resp.Body)
          log.Println("Resp body: ", string(data))
          return 0, ""
        }
      }
    }
  }

  return 403, "Invalid token"
}

func googleConfig(cred *OAuthCredential) *oauth2.Config {
  return &oauth2.Config{
    ClientID: cred.ClientId,
    ClientSecret: cred.ClientSecret,
    RedirectURL: "http://127.0.0.1:3000/oauth/google",
    Scopes: []string{
      "https://www.googleapis.com/auth/userinfo.email",
    },
    Endpoint: google.Endpoint,
  }
}

func main() {
  filename, _ := filepath.Abs("./config.yaml")
  yamlFile, err := ioutil.ReadFile(filename)
  checkError(err)
  log.Println(string(yamlFile[:]))
  var config Config
  err = yaml.Unmarshal(yamlFile, &config)
  checkError(err)

  oauthCredentials["google"] = googleConfig(config.OAuth["google"])
  log.Println(oauthCredentials)
  http.HandleFunc("/", httpHandler)
  log.Fatal(http.ListenAndServe(":3000", nil))
}

func checkError(err error) {
  if err != nil {
    log.Fatal(err)
  }
}
