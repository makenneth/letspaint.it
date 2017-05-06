package token

import (
  "crypto/rand"
  "encoding/base64"
)

func GenerateRandomBytes(l int)([]byte, error) {
  b := make([]byte, l)

  _, err := rand.Read(b)

  if err != nil {
    return nil, err
  }

  return b, err
}

func GenerateRandomToken(l int)(string, error) {
  b, err := GenerateRandomBytes(l)
  return base64.URLEncoding.EncodeToString(b), err
}
