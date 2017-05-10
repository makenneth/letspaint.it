package main

import (
  "fmt"
  "log"
  "net/http"
  "encoding/json"
  "gopkg.in/yaml.v2"
  "io/ioutil"
  "path/filepath"
  "./oauth"
)

type Config struct {
  OAuth map[string]*oauth.OAuthCredential `yaml:"oauth"`
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
  case "/oauth/google":
    code, msg = oauth.GoogleOAuthHandler(w, r)
  case "/oauth/login":
    code, msg = oauth.LoginHandler(w, r)
  default:
    code, msg = templateHandler(w, r)
  }

  if code != 0 {
    log.Println(msg)
    errorResponse(w, code, msg)
  }
}

func main() {
  filename, _ := filepath.Abs("./config.yaml")
  yamlFile, err := ioutil.ReadFile(filename)
  checkError(err)

  var config Config
  err = yaml.Unmarshal(yamlFile, &config)
  checkError(err)
  oauth.Initialize(config.OAuth)

  http.HandleFunc("/", httpHandler)
  log.Fatal(http.ListenAndServe(":3000", nil))
}

func checkError(err error) {
  if err != nil {
    log.Fatal(err)
  }
}
