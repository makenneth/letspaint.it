package main

import (
  "fmt"
  "log"
  "net/http"
  "encoding/json"
  "gopkg.in/yaml.v2"
  "io/ioutil"
  "path/filepath"
  "github.com/makenneth/letspaint/api_server/controllers/oauth"
  "github.com/makenneth/letspaint/api_server/controllers/users"
  "github.com/makenneth/letspaint/api_server/utils/connection"
)

type ServerConfig struct {
  Port int `yaml:"port"`
}

type Config struct {
  Server *ServerConfig `yaml:"server"`
  OAuth map[string]*oauth.OAuthCredential `yaml:"oauth"`
  DB map[string]string `yaml:"database"`
}

type ErrorMessage struct {
  Error struct {
    Message string `json:"message"`
  } `json:"error"`
}

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
  case "/oauth/google/signup":
    code, msg = oauth.GoogleOAuthHandler("signup", w, r)
  case "/oauth/google/login":
    code, msg = oauth.GoogleOAuthHandler("login", w, r)
  case "/oauth/login":
    code, msg = oauth.LogInHandler(w, r)
  case "/oauth/signup":
    code, msg = oauth.SignUpHandler(w, r)
  case "/user":
    code, msg = users.GetProfileInfo(w, r)
  default:
    code, msg = templateHandler(w, r)
  }

  if code != 0 {
    log.Println(msg)
    errorResponse(w, code, msg)
  }
}

func main() {
  filename, _ := filepath.Abs("./api_server/config.yaml")
  yamlFile, err := ioutil.ReadFile(filename)
  checkError(err)

  var config Config
  var port string
  err = yaml.Unmarshal(yamlFile, &config)
  checkError(err)
  oauth.Initialize(config.OAuth)
  connection.Connect(&config.DB)
  http.HandleFunc("/", httpHandler)

  if config.Server != nil && config.Server.Port != 0 {
    port = fmt.Sprintf(":%d", config.Server.Port)
  } else {
    port = ":3000"
  }
  log.Printf("http server listening at port %s", port)
  log.Fatal(http.ListenAndServe(port, nil))
}

func checkError(err error) {
  if err != nil {
    log.Fatal(err)
  }
}
