package main

import (
  "fmt"
  "log"
  "net/http"
  "encoding/json"
)

type ErrorMessage struct {
  Error struct {
    Message string `json:"message"`
  } `json:"error"`
}

const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>???</title>
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
    <script src="/bundle.js"></script>
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

func templateHandler(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "text/html; charset=utf-8")
  fmt.Fprint(w, html)
}

func errorResponse(w http.ResponseWriter, code int, message string) {
  w.WriteHeader(code)
  w.Header().Set("Content-Type", "application/json")
  err := &ErrorMessage{}
  err.Error.Message = message
  res, _ := json.Marshal(err)
  w.Write(res)
}

func httpHandler(w http.ResponseWriter, r *http.Request) {
  log.Println("/")
  if r.URL.Path == "/" {
    templateHandler(w, r)
  } else {
    log.Println("not found")
    errorResponse(w, 404, "Not Found")
  }
}
func main() {
  http.HandleFunc("/", httpHandler)
  log.Fatal(http.ListenAndServe(":3000", nil))
}