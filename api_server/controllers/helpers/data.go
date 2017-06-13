package helpers

import (
  "encoding/json"
  "reflect"
  "strings"
)

type Data struct {
  JsonData map[string]interface{} `json:"data"`
}

func lowercase(s string) string {
  return strings.ToLower(s[:1]) + s[1:]
}

func getType(d interface{}) string {
  if t := reflect.TypeOf(d); t.Kind() == reflect.Ptr {
    return t.Elem().Name()
  } else {
    return t.Name()
  }
}

func FormatData(d interface{}) json.RawMessage {
  t := lowercase(getType(d))
  jsonData := map[string]interface{}{
    t: d,
  }
  data, _ := json.Marshal(&Data{jsonData})
  return data
}
