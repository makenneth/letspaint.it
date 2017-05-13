package oauth

import (
  "log"
  "io/ioutil"
  "net/http"
  "encoding/json"
  "golang.org/x/oauth2"
  "github.com/makenneth/letspaint/api_server/utils/token"
  "github.com/makenneth/letspaint/api_server/models"
)

type GoogleOAuthData struct {
  ServiceId string `json:"sub"`
  Verified  bool `json:"email_verified"`
  Name string `json:"name"`
}

func GetLoginURL(authType, state string) string {
  return oauthCredentials[authType].AuthCodeURL(state)
}

func GoogleOAuthHandler(w http.ResponseWriter, r *http.Request) (int, string) {
  cookie, err := r.Cookie("oauth-tok")
  if _, ok := oauthCredentials["google"]; !ok {
    return 404, "OAuth Type not supported"
  }
  if err == nil && cookie.String() != "" {
    if r.URL.Query().Get("state") == cookie.Value {
      tok, err := oauthCredentials["google"].Exchange(oauth2.NoContext, r.URL.Query().Get("code"))
      if err == nil {
        client := oauthCredentials["google"].Client(oauth2.NoContext, tok)
        resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
        if err == nil {
          defer resp.Body.Close()
          responseData, _ := ioutil.ReadAll(resp.Body)
          log.Println(string(responseData[:]))

          var data *GoogleOAuthData
          err = json.Unmarshal(responseData, &data)
          log.Println(err)
          log.Println("data", data)
          if !data.Verified {
            // set error in cookie
          }
          // cookie := http.Cookie{
          //   Name: "oauth-tok",
          //   Value: "",
          //   HttpOnly: true,
          // }
          // http.SetCookie(w, &cookie)

          user, err := json.Marshal(&models.User{Username: data.Name, Id: data.ServiceId})
          log.Println(string(user[:]))
          log.Println(err)
          pid, _ := token.GenerateRandomToken(32)
          cookie := http.Cookie{
            Name: "pid",
            Value: pid,
            Path: "/",
            HttpOnly: false,
          }
          http.SetCookie(w, &cookie)
          http.Redirect(w, r, "/login/success", 302)
          return 0, ""
        }
      }
    }
  }

  return 403, "Invalid token"
}
