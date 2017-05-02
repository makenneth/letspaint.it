package main

import (
  "log"
  "io/ioutil"
  "path/filepath"
  "gopkg.in/yaml.v2"
)

type StaticServer struct {
  FileTypes string `yaml:"file_types"`
  Server string `yaml:"server"`
}

type HTTPServer struct {
  Port string `yaml:"port"`
  Target string `yaml:"target"`
}

type Config struct {
  Server *HTTPServer `yaml:"server"`
  Static *StaticServer `yaml:"static"`
}

func getConf() *Config {
  filename, _ := filepath.Abs("../conf.yaml")
  yamlFile, err := ioutil.ReadFile(filename)
  log.Println(string(yamlFile[:]))
  checkError(err)

  var config *Config
  err = yaml.Unmarshal(yamlFile, &config)
  checkError(err)

  return config
}

func checkError(err error) {
  if err != nil {
    log.Fatal(err)
  }
}

func main() {
  conf := getConf()
  proxy := NewProxyServer(conf)
  proxy.Listen()
}
