package main

import (
  "log"
  "net/http"
  "net/url"
  "net/http/httputil"
  "regexp"
  "strconv"
)

type Host struct {
  description string
  proxy *httputil.ReverseProxy
  pattern *regexp.Regexp
}

type ProxyServer struct {
  config *Config
  hosts []*Host
  staticFileTypes *regexp.Regexp
}

func getHosts(config *Config) []*Host {
  hosts := make([]*Host, 0)
  if len(config.Server.Upstreams) != 0 {
    for _, upstream := range config.Server.Upstreams {
      if upstream.Target == "" {
        log.Fatal("Target is required")
      }

      u, _ := url.Parse(upstream.Target)
      hostReg, err := regexp.Compile(upstream.Pattern)
      if err != nil {
        log.Fatal("Invalid upstream pattern")
      }
      newHost := &Host{upstream.Description, httputil.NewSingleHostReverseProxy(u), hostReg}
      hosts = append(hosts, newHost)
    }
  }

  return hosts
}

func NewProxyServer(config *Config) *ProxyServer {
  var reg *regexp.Regexp
  hosts := getHosts(config)
  if config.Static != (&StaticServer{}) {
    if config.Static.FileTypes == "" || config.Static.Server == "" {
      log.Fatal("Static fileTypes or server not defined in yaml")
    }
    reg, _ = regexp.Compile(config.Static.FileTypes)
  }

  if len(hosts) == 0 {
    if reg == nil {
      log.Fatal("Need to define either static or target server")
    }

    log.Println("Upstream server not defined..will treat as static type server")
  }

  return &ProxyServer{config: config, hosts: hosts, staticFileTypes: reg}
}

func (self *ProxyServer) Listen() {
  http.HandleFunc("/", self.handleConnection)
  if self.config.Server == (&HTTPServer{}) || self.config.Server.Port == 0 {
    log.Fatal("Server or port not defined")
  }
  port := self.config.Server.Port
  log.Println("server listening on port %d", port)
  http.ListenAndServe(":" + strconv.Itoa(port), nil)
}

func (self *ProxyServer) handleConnection(w http.ResponseWriter, r *http.Request) {
  if self.staticFileTypes != nil && self.staticFileTypes.MatchString(r.URL.Path) {
    if self.config.Static.Server != "" {
      http.Redirect(w, r, self.config.Static.Server + r.URL.Path, 302)
    } else {
      log.Println("Static Server not defined")
    }
  } else {
    matched := false
    for _, host := range self.hosts {
      log.Println(r.URL.Path)
      log.Println(host)
      log.Println(host.pattern)
      log.Println(host.pattern.MatchString(r.URL.Path))
      if host.pattern.MatchString(r.URL.Path) {
        matched = true
        host.proxy.ServeHTTP(w, r)
      }
    }
    if !matched {
      log.Println("url pattern not matched")
    }
  }
}