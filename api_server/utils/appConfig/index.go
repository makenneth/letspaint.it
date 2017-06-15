package appConfig

import "log"

var Config *AppConfig

type AppConfig struct {
  Domain string
}

func Initialize(domain string) {
  log.Println("domain", domain)
  Config = &AppConfig{Domain: domain}
}
