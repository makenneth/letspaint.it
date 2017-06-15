package appConfig

import "log"

var Config *AppConfig

type AppConfig struct {
  Domain string
  Secure bool
}

func Initialize(domain string, secure bool) {
  log.Println("domain", domain)
  Config = &AppConfig{Domain: domain, Secure: secure}
}
