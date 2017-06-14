package main

import (
  "log"
  "fmt"
  "net/http"
  "net/url"
  "io/ioutil"
  "net/http/httputil"
  "github.com/yhat/wsutil"
  "regexp"
  "strconv"
  "crypto/tls"
  "golang.org/x/crypto/acme/autocert"
)

var html string

type Host struct {
  description string
  scheme string
  proxy interface{}
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

      hostReg, err := regexp.Compile(upstream.Pattern)
      if err != nil {
        log.Fatal("Invalid upstream pattern")
      }
      u, _ := url.Parse(upstream.Target)
      var proxy interface{}
      if upstream.Scheme == "" || upstream.Scheme == "http://" || upstream.Scheme == "https://" {
        proxy = httputil.NewSingleHostReverseProxy(u)
      } else {
        proxy = wsutil.NewSingleHostReverseProxy(u)
      }
      newHost := &Host{upstream.Description, upstream.Scheme, proxy, hostReg}
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

func serveTemplate(w http.ResponseWriter, req *http.Request) {
  w.Header().Set("Content-Type", "text/html; charset=utf-8")
  fmt.Fprint(w, html)
}

func redirect(w http.ResponseWriter, req *http.Request) {
  target := "https://" + req.Host + req.URL.Path
  if len(req.URL.RawQuery) > 0 {
    target += "?" + req.URL.RawQuery
  }
  log.Printf("redirect to: %s", target)
  http.Redirect(w, req, target, http.StatusTemporaryRedirect)
}

func (self *ProxyServer) Listen() {
  m := autocert.Manager{
    Prompt:     autocert.AcceptTOS,
    HostPolicy: autocert.HostWhitelist("www.letspaint.it", "letspaint.it"),
  }
  s := &http.Server{
    Addr:      ":https",
    TLSConfig: &tls.Config{
      GetCertificate: m.GetCertificate,
    },
  }
  if self.config.Default != "" {
    data, err := ioutil.ReadFile(self.config.Default)
    if err != nil {
      log.Fatal(err)
    }

    html = string(data)
  }
  http.HandleFunc("/", self.handleConnection)
  if self.config.Server == (&HTTPServer{}) || self.config.Server.Port == 0 {
    log.Fatal("Server or port not defined")
  }
  port := self.config.Server.Port
  log.Println("redirect server listening on port %d", port)
  go http.ListenAndServe(":" + strconv.Itoa(port),  http.HandlerFunc(redirect))
  http.ListenAndServeTLS("", "")
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
      log.Println(host)
      if host.pattern.MatchString(r.URL.Path) {
        matched = true
        log.Println(host.scheme)
        if host.scheme == "ws://" || host.scheme == "wss://" {
          host.proxy.(*wsutil.ReverseProxy).ServeHTTP(w, r)
        } else {
          host.proxy.(*httputil.ReverseProxy).ServeHTTP(w, r)
        }
      }
    }
    if self.config.Default != "" {
      serveTemplate(w, r)
    } else {
      log.Println("url pattern not matched")
    }
  }
}
