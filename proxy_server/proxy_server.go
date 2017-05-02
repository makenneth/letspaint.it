package main

import (
  "log"
  "net/http"
  "net/url"
  "net/http/httputil"
  "regexp"
)

type ProxyServer struct {
  config *Config
  proxy *httputil.ReverseProxy
  whitelists []*regexp.Regexp
  staticFileTypes *regexp.Regexp
}

func NewProxyServer(config *Config) *ProxyServer {
  var reg *regexp.Regexp
  if config.Static != (&StaticServer{}) {
    if config.Static.FileTypes == "" || config.Static.Server == "" {
      log.Fatal("Static fileTypes or server not defined in yaml")
    }
    reg, _ = regexp.Compile(config.Static.FileTypes)
  }

  if config.Server.Target == "" {
    log.Fatal("Target not defined in yaml")
  }
  u, _ := url.Parse(config.Server.Target)
  return &ProxyServer{config: config, proxy: httputil.NewSingleHostReverseProxy(u), staticFileTypes: reg}
}

func (self *ProxyServer) Listen() {
  http.HandleFunc("/", self.handleConnection)
  if self.config.Server == (&HTTPServer{}) || self.config.Server.Port == "" {
    log.Fatal("Server or port not defined")
  }
  port := self.config.Server.Port
  log.Println("server listening on port %s", port)
  http.ListenAndServe(":" + port, nil)
}

func (self *ProxyServer) handleConnection(w http.ResponseWriter, r *http.Request) {
  log.Println(self.config.Static.Server + r.URL.Path)
  log.Println(self.staticFileTypes)
  log.Println(self.staticFileTypes.MatchString(r.URL.Path))
  if self.staticFileTypes != nil && self.staticFileTypes.MatchString(r.URL.Path) {
    log.Println(r.URL.Path)
    if self.config.Static.Server != "" {
      http.Redirect(w, r, self.config.Static.Server + r.URL.Path, 302)
    } else {
      log.Println("Static Server NOT FOUND")
    }
  } else if self.whitelists == nil {
    go self.proxy.ServeHTTP(w, r)
  }
}

